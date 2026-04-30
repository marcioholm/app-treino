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
import { generateWorkoutWithAI } from '../ai/openrouter';

interface GenerateParams {
    studentId: string;
}
export async function generateWorkout({ studentId }: GenerateParams) {
    // Fetch student with user, goals, assessments and RECENT anamnesis
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            user: { select: { name: true, gender: true } },
            goals: { orderBy: { createdAt: 'desc' }, take: 1 },
            anamnesisAnswers: {
                orderBy: { createdAt: 'desc' },
                include: { question: true }
            },
            physicalAssessments: { orderBy: { date: 'desc' }, take: 1 },
            tenant: true
        }
    });

    if (!student) {
        throw new Error('Aluno não encontrado.');
    }

    const goal = student.goals[0];
    const physicalAssessment = student.physicalAssessments[0];

    // Filter anamnesis to only use the most recent template's answers
    let anamnesisContext = 'Nenhum dado de anamnese encontrado.';
    if (student.anamnesisAnswers.length > 0) {
        const latestTemplateId = student.anamnesisAnswers[0].templateId;
        const relevantAnswers = student.anamnesisAnswers.filter(a => a.templateId === latestTemplateId);
        
        anamnesisContext = relevantAnswers.map(ans => {
            return `${ans.question.text}: ${ans.answerText || ans.answerArray.join(', ')}`;
        }).join('\n');
    }

    if (!physicalAssessment) {
        throw new Error('Avaliação física ausente. O treino personalizado exige uma avaliação física prévia.');
    }

    if (!goal) {
        throw new Error('Objetivos do aluno não definidos.');
    }

    const weight = physicalAssessment.weight;
    const fatPercent = physicalAssessment.fatPercent;

    // Fetch exercises available for this tenant
    const rawExercises = await prisma.exercise.findMany({
        where: {
            OR: [
                { tenantId: null },
                { tenantId: student.tenantId }
            ]
        },
        include: {
            tenantExercises: {
                where: { tenantId: student.tenantId }
            }
        }
    });

    // Filter by active status
    const activeExercises = rawExercises.filter(ex => {
        const tenantStatus = ex.tenantExercises[0];
        return tenantStatus ? tenantStatus.isActive : true;
    });

    // Filter exercises by equipment/modality and restrictions
    const validExercises = activeExercises.filter(ex => {
        if (!goal.hasGymAccess && ex.modality === 'GYM') return false;
        for (const tag of ex.tags) {
            if (goal.restrictions.includes(tag)) return false;
        }
        return true;
    });

    const exerciseNames = validExercises.map(ex => ex.name);

    // Call AI for generation
    const aiResult = await generateWorkoutWithAI({
        studentName: student.user.name,
        gender: student.user.gender as string,
        goal: goal.objective,
        level: goal.level,
        daysPerWeek: goal.daysPerWeek,
        exercises: exerciseNames,
        weight: weight || undefined,
        fatPercent: fatPercent || undefined,
        restrictions: goal.restrictions,
        anamnesisContext
    });

    let createdWorkout;
    try {
        createdWorkout = await prisma.$transaction(async (tx) => {
            // 1. Create Workout
            const workout = await tx.workout.create({
                data: {
                    tenantId: student.tenantId,
                    studentId: student.id,
                    name: aiResult.name ? `M&K: ${aiResult.name}` : `M&K: Treino Personalizado - ${student.user.name}`,
                    notes: `Gerado via Engine M&K Fitness v2. Foco: ${goal.objective}.`,
                    published: false
                }
            });

            // 2. Create Sessions and Exercises
            let sessionOrder = 0;
            for (const sessionData of aiResult.sessions) {
                const session = await tx.workoutSession.create({
                    data: {
                        workoutId: workout.id,
                        name: sessionData.name,
                        order: sessionOrder,
                    }
                });
                sessionOrder++;

                let exerciseOrder = 0;
                for (const exData of sessionData.exercises) {
                    const matchedExercise = validExercises.find(e => e.name.toLowerCase() === exData.name.toLowerCase());
                    if (!matchedExercise) continue;

                    await tx.workoutExercise.create({
                        data: {
                            sessionId: session.id,
                            exerciseId: matchedExercise.id,
                            order: exerciseOrder,
                            sets: exData.sets || 3,
                            reps: exData.reps || "12",
                            restTime: exData.restTime || 60,
                        }
                    });
                    exerciseOrder++;
                }
            }

            return workout;
        });
    } catch (e) {
        console.error('Database transaction failed:', e);
        throw new Error("Falha ao salvar o treino gerado pela IA no banco de dados.");
    }

    return createdWorkout;
}
