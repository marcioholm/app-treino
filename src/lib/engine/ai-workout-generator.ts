import { prisma } from '../db/prisma';
import { generateWorkoutWithAI } from '../ai/openrouter';

interface GenerateParams {
    studentId: string;
    useAI?: boolean;
}

export async function generateWorkout({ studentId, useAI = false }: GenerateParams) {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            goals: { orderBy: { createdAt: 'desc' }, take: 1 },
            assessments: { orderBy: { createdAt: 'desc' }, take: 1 },
            user: { select: { name: true } },
            tenant: true
        }
    });

    if (!student || !student.goals.length || !student.assessments.length) {
        throw new Error('Student, Goal or Assessment missing.');
    }

    const goal = student.goals[0];

    if (useAI) {
        try {
            const exercises = await prisma.exercise.findMany({
                where: { OR: [{ tenantId: null }, { tenantId: student.tenantId }] },
                select: { name: true },
                take: 30
            });
            const exerciseNames = exercises.map(e => e.name);

            const aiResult = await generateWorkoutWithAI({
                studentName: student.user.name,
                goal: goal.objective,
                level: goal.level,
                daysPerWeek: goal.daysPerWeek,
                exercises: exerciseNames,
                restrictions: goal.restrictions
            });

            return await createWorkoutFromAI({
                tenantId: student.tenantId,
                studentId,
                aiResult
            });
        } catch (e) {
            console.error('AI generation failed, falling back to heuristic:', e);
        }
    }

    return { useAI: false };
}

async function createWorkoutFromAI({ tenantId, studentId, aiResult }: {
    tenantId: string;
    studentId: string;
    aiResult: { name: string; sessions: { name: string; exercises: { name: string; sets: number; reps: string }[] }[] };
}) {
    const workout = await prisma.workout.create({
        data: {
            tenantId,
            studentId,
            name: aiResult.name,
            published: false
        }
    });

    const exercises = await prisma.exercise.findMany({
        where: { OR: [{ tenantId: null }, { tenantId }] }
    });
    const exerciseMap = new Map(exercises.map(e => [e.name.toLowerCase(), e.id]));

    for (const [sessionIndex, session] of aiResult.sessions.entries()) {
        const workoutSession = await prisma.workoutSession.create({
            data: {
                workoutId: workout.id,
                name: session.name,
                order: sessionIndex
            }
        });

        for (const [exerciseIndex, ex] of session.exercises.entries()) {
            const exerciseId = exerciseMap.get(ex.name.toLowerCase());
            
            await prisma.workoutExercise.create({
                data: {
                    sessionId: workoutSession.id,
                    exerciseId: exerciseId || exercises[0]?.id,
                    order: exerciseIndex,
                    sets: ex.sets,
                    reps: ex.reps,
                    restTime: 60
                }
            });
        }
    }

    return workout;
}