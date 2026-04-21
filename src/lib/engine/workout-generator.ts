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

    // --- ENHANCED ANAMNESIS PARSING ---
    let dynamicDays = goal.daysPerWeek;
    let dynamicObjective = goal.objective;
    let specialNotes: string[] = [];

    // 1. Parse Objective from Anamnesis
    const objectiveQuestion = answers.find(a => 
        a.question.text.toLowerCase().includes('principal objetivo')
    );
    if (objectiveQuestion && objectiveQuestion.answerArray.length > 0) {
        const sel = objectiveQuestion.answerArray[0].toLowerCase();
        if (sel.includes('emagrecimento')) dynamicObjective = Objective.EMAGRECIMENTO;
        else if (sel.includes('hipertrofia')) dynamicObjective = Objective.HIPERTROFIA;
        else if (sel.includes('condicionamento')) dynamicObjective = Objective.DEFINICAO;
    }

    // 2. Parse Frequency
    const daysQuestion = answers.find(a => 
        a.question.text.toLowerCase().includes('quantos dias por semana')
    );
    if (daysQuestion && daysQuestion.answerText) {
        const parsed = parseInt(daysQuestion.answerText, 10);
        if (!isNaN(parsed)) dynamicDays = parsed;
    }

    // 3. Parse Health Restrictions
    const injuryQuestion = answers.find(a => 
        a.question.text.toLowerCase().includes('lesão articular') && a.question.type === 'BOOLEAN'
    );
    const hasInjuries = injuryQuestion?.answerText === 'true';
    if (hasInjuries) specialNotes.push("Atenção: Relato de lesão articular.");

    const heartQuestion = answers.find(a => 
        a.question.text.toLowerCase().includes('problema cardíaco') && a.question.type === 'BOOLEAN'
    );
    const hasHeartIssue = heartQuestion?.answerText === 'true';
    if (hasHeartIssue) specialNotes.push("Atenção: Condição cardíaca relatada.");

    // 4. Parse Medications
    const medQuestion = answers.find(a => a.question.text.toLowerCase().includes('medicamento de uso contínuo'));
    if (medQuestion?.answerText === 'true') {
        const medDetail = answers.find(a => a.question.text.toLowerCase().includes('se sim, qual?'));
        if (medDetail?.answerText) specialNotes.push(`Medicação: ${medDetail.answerText}`);
    }

    // --- GENERATION LOGIC ---

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
        
        // Static restrictions
        for (const tag of ex.tags) {
            if (goal.restrictions.includes(tag)) return false;
        }

        // Dynamic restrictions from anamnesis
        if (hasInjuries && ex.tags.includes('impacto')) return false;
        if (hasHeartIssue && ex.tags.includes('alta_intensidade')) return false;

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
    const days = Math.min(Math.max(dynamicDays, 1), 6); // Cap 1-6
    let splits: { name: string, groups: string[] }[] = [];

    if (days <= 3) {
        splits = [
            { name: 'Full Body A', groups: ['Peito', 'Costas', 'Pernas', 'Ombros', 'Core'] },
            { name: 'Full Body B', groups: ['Pernas', 'Peito', 'Costas', 'Braços', 'Cardio'] },
            { name: 'Full Body C', groups: ['Costas', 'Pernas', 'Ombros', 'Core', 'Cardio'] }
        ].slice(0, days);
    } else if (days === 4) {
        splits = [
            { name: 'Upper A', groups: ['Peito', 'Costas', 'Ombros', 'Braços'] },
            { name: 'Lower A', groups: ['Pernas', 'Core', 'Cardio'] },
            { name: 'Upper B', groups: ['Costas', 'Peito', 'Ombros', 'Braços'] },
            { name: 'Lower B', groups: ['Pernas', 'Core', 'Cardio'] },
        ];
    } else {
        splits = [
            { name: 'Push', groups: ['Peito', 'Ombros', 'Braços'] },
            { name: 'Pull', groups: ['Costas', 'Braços'] },
            { name: 'Legs', groups: ['Pernas', 'Core'] },
            { name: 'Upper', groups: ['Peito', 'Costas', 'Ombros', 'Braços'] },
            { name: 'Lower', groups: ['Pernas', 'Core', 'Cardio'] },
            { name: 'Full Focus', groups: ['Cardio', 'Core', 'Pernas'] },
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
                    notes: `Gerado auto via IA. Objetivo: ${dynamicObjective}. IMC: ${bmi.toFixed(1)}.\n${specialNotes.join('\n')}`,
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
                    const groupExercises = validExercises.filter(ex => ex.group === group && !usedExerciseIds.has(ex.id));
                    if (groupExercises.length === 0) continue;

                    const compounds = groupExercises.filter(ex => ex.tags.includes('composto'));
                    const accessories = groupExercises.filter(ex => !ex.tags.includes('composto'));

                    const toAdd = [];
                    if (compounds.length > 0) {
                        toAdd.push(compounds[Math.floor(Math.random() * compounds.length)]);
                    } else if (groupExercises.length > 0) {
                        toAdd.push(groupExercises[Math.floor(Math.random() * groupExercises.length)]);
                    }

                    const numAccessories = Math.max(1, Math.floor(2 * volumeMultiplier));
                    for (let a = 0; a < numAccessories; a++) {
                        if (accessories.length > a) {
                            toAdd.push(accessories[a]);
                        }
                    }

                    for (const ex of toAdd) {
                        if (!ex) continue;
                        usedExerciseIds.add(ex.id);

                        let sets = goal.level === Level.INICIANTE ? 2 : 3;
                        if (dynamicObjective === Objective.HIPERTROFIA && goal.level !== Level.INICIANTE) sets = 4;

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
        console.error(e);
        throw new Error("Failed to create workout in database.");
    }

    return currentTransactionReturn;
}
