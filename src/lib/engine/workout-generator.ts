import { prisma } from '../db/prisma';
import { Objective, Level, Modality, ExerciseType } from '@prisma/client';

interface GenerateParams {
    studentId: string;
}

// Temporary type to bypass Prisma include error until next 'npx prisma generate' or restart
type AnamnesisAnswerPayload = {
    question: { text: string; type: string };
    answerText: string | null;
    answerArray: string[];
};

export async function generateWorkout({ studentId }: GenerateParams) {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            goals: { orderBy: { createdAt: 'desc' }, take: 1 },
            assessments: { orderBy: { createdAt: 'desc' }, take: 1 },
            anamnesisAnswers: {
                include: { question: true }
            },
            physicalAssessments: { orderBy: { date: 'desc' }, take: 1 },
            tenant: true
        }
    } as any);

    if (!student || !(student as any).goals.length) {
        throw new Error('Student or Goal missing.');
    }

    const goal = (student as any).goals[0];
    const simpleAssessment = (student as any).assessments[0];
    const physicalAssessment = (student as any).physicalAssessments[0];

    if (!simpleAssessment && !physicalAssessment) {
        throw new Error('Student assessment missing. Please record at least one weight/height measurement.');
    }

    const weight = physicalAssessment?.weight || simpleAssessment?.weight;
    const height = physicalAssessment?.height || simpleAssessment?.height;

    if (!weight || !height) {
        throw new Error('Weight or Height missing in latest assessment.');
    }

    const answers = (student as any).anamnesisAnswers as AnamnesisAnswerPayload[] || [];

    // Extract key metrics from Anamnesis if available
    let dynamicDays = goal.daysPerWeek;
    let dynamicObjective = goal.objective;

    // Find objective answer
    const objAnswer = answers.find(a => a.question.text.includes('objetivo'));
    if (objAnswer && objAnswer.answerArray.length > 0) {
        const sel = objAnswer.answerArray[0].toLowerCase();
        if (sel.includes('emagrecimento')) dynamicObjective = Objective.EMAGRECIMENTO;
        if (sel.includes('hipertrofia')) dynamicObjective = Objective.HIPERTROFIA;
        if (sel.includes('condicionamento')) dynamicObjective = Objective.DEFINICAO;
    }

    const daysAnswer = answers.find(a => a.question.text.includes('dias por semana'));
    if (daysAnswer && daysAnswer.answerText) {
        dynamicDays = parseInt(daysAnswer.answerText, 10) || dynamicDays;
    }

    const injuries = answers.find(a => a.question.text.includes('lesão') && a.question.type === 'BOOLEAN');
    const hasInjuries = injuries?.answerText === 'true';

    // BMI Math (peso / altura^2)
    const heightM = height > 3 ? height / 100 : height; // handle cm or m
    const bmi = weight / (heightM * heightM);

    // Fetch all exercises available for this tenant (and globals)
    const allExercises = await prisma.exercise.findMany({
        where: {
            OR: [
                { tenantId: null },
                { tenantId: student.tenantId }
            ]
        }
    });

    // Filter out restricted tags
    const validExercises = allExercises.filter(ex => {
        if (!goal.hasGymAccess && ex.modality === Modality.GYM) return false;
        // Check static restrictions
        for (const tag of ex.tags) {
            if (goal.restrictions.includes(tag)) return false;
        }

        // Dynamic restrictions from anamnesis (Simplified: if injuries, avoid high impact/composto if severe)
        if (hasInjuries && ex.tags.includes('impacto')) return false;

        return true;
    });

    // Basic Heuristics
    let reps = "8-12";
    let restTime = 60; // seconds
    let volumeMultiplier = 1;

    if (dynamicObjective === Objective.EMAGRECIMENTO) {
        reps = goal.level === Level.INICIANTE ? "12-15" : "10-15";
        restTime = 45;
    } else if (dynamicObjective === Objective.HIPERTROFIA) {
        reps = "8-12";
        restTime = 90;
        volumeMultiplier = goal.level === Level.AVANCADO ? 1.5 : (goal.level === Level.INTERMEDIARIO ? 1.2 : 1);
    } else if (dynamicObjective === Objective.DEFINICAO) {
        reps = "10-12";
        restTime = 60;
    }

    // Distribution
    const days = dynamicDays;
    let splits: { name: string, groups: string[] }[] = [];

    if (days <= 3) {
        // Full Body or Upper/Lower (if 3 days we can do Full A/B/C)
        splits = [
            { name: 'Full Body A', groups: ['Peito', 'Costas', 'Pernas', 'Ombros', 'Core'] },
            { name: 'Full Body B', groups: ['Pernas', 'Peito', 'Costas', 'Braços', 'Cardio'] },
            { name: 'Full Body C', groups: ['Costas', 'Pernas', 'Ombros', 'Core', 'Cardio'] }
        ].slice(0, days);
    } else if (days === 4) {
        // Upper / Lower A/B
        splits = [
            { name: 'Upper A', groups: ['Peito', 'Costas', 'Ombros', 'Braços'] },
            { name: 'Lower A', groups: ['Pernas', 'Core', 'Cardio'] },
            { name: 'Upper B', groups: ['Costas', 'Peito', 'Ombros', 'Braços'] },
            { name: 'Lower B', groups: ['Pernas', 'Core', 'Cardio'] },
        ];
    } else {
        // 5 or 6 days -> PPL + UL
        splits = [
            { name: 'Push', groups: ['Peito', 'Ombros', 'Braços'] }, // Triceps inferred later
            { name: 'Pull', groups: ['Costas', 'Braços'] }, // Biceps
            { name: 'Legs', groups: ['Pernas', 'Core'] },
            { name: 'Upper', groups: ['Peito', 'Costas', 'Ombros', 'Braços'] },
            { name: 'Lower', groups: ['Pernas', 'Core', 'Cardio'] },
            { name: 'Full/Cardio', groups: ['Cardio', 'Core'] },
        ].slice(0, days);
    }

    // Generate Workout Name
    const workoutName = `Treino Automático - IA (${days}x)`;

    let currentTransactionReturn;
    try {
        currentTransactionReturn = await prisma.$transaction(async (tx) => {
            // 1. Create Workout
            const workout = await tx.workout.create({
                data: {
                    tenantId: student.tenantId,
                    studentId: student.id,
                    name: workoutName,
                    notes: `Gerado auto via IA (IMC: ${bmi.toFixed(1)})`,
                    published: false
                }
            });

            // 2. Create Sessions and Exercises
            let sessionOrder = 0;

            for (const split of splits) {
                const session = await tx.workoutSession.create({
                    data: {
                        workoutId: workout.id,
                        name: split.name,
                        order: sessionOrder,
                    }
                });
                sessionOrder++;

                let exerciseOrder = 0;
                const usedExerciseIds = new Set<string>();

                for (const group of split.groups) {
                    // Pick 1 compound and a few accessories based on volume multiplier
                    const groupExercises = validExercises.filter(ex => ex.group === group && !usedExerciseIds.has(ex.id));

                    if (groupExercises.length === 0) continue;

                    // Simplified logic: Pick random or specific ones
                    // Usually, `composto` tag decides.
                    const compounds = groupExercises.filter(ex => ex.tags.includes('composto'));
                    const accessories = groupExercises.filter(ex => !ex.tags.includes('composto'));

                    const toAdd = [];
                    if (compounds.length > 0) {
                        toAdd.push(compounds[Math.floor(Math.random() * compounds.length)]);
                    } else if (groupExercises.length > 0) {
                        toAdd.push(groupExercises[Math.floor(Math.random() * groupExercises.length)]); // fallback
                    }

                    const numAccessories = Math.max(1, Math.floor(2 * volumeMultiplier));
                    for (let a = 0; a < numAccessories; a++) {
                        if (accessories.length > a) {
                            toAdd.push(accessories[a]); // Randomize in real world, just picking sequentially here
                        }
                    }

                    for (const ex of toAdd) {
                        if (!ex) continue;
                        usedExerciseIds.add(ex.id);

                        let sets = goal.level === Level.INICIANTE ? 2 : 3;
                        if (goal.objective === Objective.HIPERTROFIA && goal.level !== Level.INICIANTE) sets = 4;

                        await tx.workoutExercise.create({
                            data: {
                                sessionId: session.id,
                                exerciseId: ex.id,
                                order: exerciseOrder,
                                sets,
                                reps,
                                restTime,
                            }
                        });
                        exerciseOrder++;
                    }
                }
            }

            return workout;
        });
    } catch (e) {
        throw new Error("Failed to create workout in database.");
    }

    return currentTransactionReturn;
}
