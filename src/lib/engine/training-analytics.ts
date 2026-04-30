import { prisma } from '@/lib/db/prisma';
import { InsightType, InsightStatus, SkipReason, WebhookStatus } from '@prisma/client';

interface StudentData {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface TrainerData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface WorkoutData {
  id: string;
  name: string;
}

export async function createWorkoutSessionTracking(params: {
  tenantId: string;
  studentId: string;
  trainerId: string;
  workoutId: string;
  workoutSessionId?: string;
}) {
  return prisma.workoutSessionTracking.create({
    data: {
      tenantId: params.tenantId,
      studentId: params.studentId,
      trainerId: params.trainerId,
      workoutId: params.workoutId,
      workoutSessionId: params.workoutSessionId,
      startedAt: new Date(),
      status: 'STARTED'
    }
  });
}

export async function completeWorkoutSessionTracking(params: {
  trackingId: string;
  completedPercentage: number;
}) {
  const tracking = await prisma.workoutSessionTracking.update({
    where: { id: params.trackingId },
    data: {
      completedAt: new Date(),
      status: params.completedPercentage >= 80 ? 'COMPLETED' : 
              params.completedPercentage > 0 ? 'INCOMPLETE' : 'ABANDONED',
      completedPercentage: params.completedPercentage
    },
    include: {
      exerciseLogs: true,
      skippedExercises: true
    }
  });

  const score = await calculatePerformanceScore(tracking.studentId);
  
  const aiSummary = await generateAiSummary(tracking);
  const aiStatus = determineInsightStatus(score);

  await prisma.workoutSessionTracking.update({
    where: { id: params.trackingId },
    data: {
      performanceScore: score,
      aiSummary,
      aiStatus
    }
  });

  await generateWorkoutInsights(tracking, score, aiStatus);

  return tracking;
}

export async function logExercisePerformance(params: {
  tenantId: string;
  studentId: string;
  trainerId: string;
  workoutSessionTrackingId: string;
  exerciseId: string;
  exerciseName: string;
  plannedSets: number;
  completedSets: number;
  plannedReps: number;
  completedReps: number;
  plannedLoad?: number;
  usedLoad?: number;
  notes?: string;
}) {
  const log = await prisma.exercisePerformanceLog.create({
    data: params
  });

  if (params.usedLoad && params.plannedLoad) {
    await detectAndCreateLoadInsight(params);
  }

  if (params.completedReps < params.plannedReps) {
    await createExerciseRepsFailedInsight(params);
  }

  return log;
}

export async function skipExercise(params: {
  tenantId: string;
  studentId: string;
  trainerId: string;
  workoutSessionTrackingId: string;
  exerciseId: string;
  exerciseName: string;
  skipReason: SkipReason;
  skipNote?: string;
}) {
  const skipped = await prisma.skippedExercise.create({
    data: {
      ...params,
      skippedAt: new Date()
    }
  });

  await createExerciseSkippedInsight(params);

  const skipCount = await prisma.skippedExercise.count({
    where: {
      studentId: params.studentId,
      exerciseId: params.exerciseId,
      skippedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  });

  if (skipCount >= 3) {
    await createSkippedRecurrentlyInsight(params, skipCount);
  }

  return skipped;
}

async function calculatePerformanceScore(studentId: string): Promise<number> {
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const sessions7days = await prisma.workoutSessionTracking.findMany({
    where: {
      studentId,
      startedAt: { gte: last7Days }
    }
  });

  const sessions30days = await prisma.workoutSessionTracking.findMany({
    where: {
      studentId,
      startedAt: { gte: last30Days }
    }
  });

  const goal = await prisma.goal.findFirst({
    where: { studentId },
    orderBy: { createdAt: 'desc' }
  });

  const expectedWorkouts7Days = goal ? Math.ceil(goal.daysPerWeek * 1) : 3;
  const expectedWorkouts30Days = goal ? Math.ceil(goal.daysPerWeek * 4) : 12;

  const completedWorkouts7Days = sessions7days.filter(s => s.status === 'COMPLETED').length;
  const completedWorkouts30Days = sessions30days.filter(s => s.status === 'COMPLETED').length;

  const skipped7days = await prisma.skippedExercise.count({
    where: {
      studentId,
      skippedAt: { gte: last7Days }
    }
  });

  const failedReps7days = await prisma.exercisePerformanceLog.count({
    where: {
      studentId,
      completedReps: { lt: prisma.exercisePerformanceLog.fields.plannedReps as any },
      createdAt: { gte: last7Days }
    }
  });

  const loadIncreased7days = await prisma.exercisePerformanceLog.count({
    where: {
      studentId,
      loadVariation: { gt: 0 },
      createdAt: { gte: last7Days }
    }
  });

  const loadDecreased7days = await prisma.exercisePerformanceLog.count({
    where: {
      studentId,
      loadVariation: { lt: 0 },
      createdAt: { gte: last7Days }
    }
  });

  const frequencyScore = expectedWorkouts7Days > 0 
    ? Math.min(100, (completedWorkouts7Days / expectedWorkouts7Days) * 100) 
    : 50;

  const skippedPenalty = Math.min(20, skipped7days * 4);
  const failurePenalty = Math.min(15, failedReps7days * 3);
  const increaseBonus = Math.min(10, loadIncreased7days * 2);
  const decreasePenalty = Math.min(10, loadDecreased7days * 2);

  const baseScore = (frequencyScore * 0.4) + 50;
  const finalScore = Math.max(0, Math.min(10, baseScore - skippedPenalty - failurePenalty + increaseBonus - decreasePenalty));

  return Math.round(finalScore * 10) / 10;
}

function determineInsightStatus(score: number): InsightStatus {
  if (score >= 7.5) return 'GREEN';
  if (score >= 5) return 'YELLOW';
  return 'RED';
}

async function generateAiSummary(tracking: any): Promise<string> {
  const completedSets = tracking.exerciseLogs.reduce((acc: number, log: any) => acc + log.completedSets, 0);
  const plannedSets = tracking.exerciseLogs.reduce((acc: number, log: any) => acc + log.plannedSets, 0);
  const skippedCount = tracking.skippedExercises.length;

  const percentage = tracking.completedPercentage;
  const loadIncreased = tracking.exerciseLogs.filter((l: any) => (l.loadVariation || 0) > 0).length;
  const loadDecreased = tracking.exerciseLogs.filter((l: any) => (l.loadVariation || 0) < 0).length;

  let summary = '';
  if (percentage >= 90) {
    summary = `Excelente! Concluiu ${percentage}% do treino.`;
  } else if (percentage >= 70) {
    summary = `Bom treino. Concluiu ${percentage}%.`;
  } else {
    summary = `Treino incompleto. Concluiu apenas ${percentage}%.`;
  }

  if (skippedCount > 0) {
    summary += ` ${skippedCount} exercício(s) pulado(s).`;
  }

  if (loadIncreased > 0) {
    summary += ` Aumentou carga em ${loadIncreased} exercício(s).`;
  }

  if (loadDecreased > 0) {
    summary += ` Reduziu carga em ${loadDecreased} exercício(s).`;
  }

  return summary;
}

async function generateWorkoutInsights(tracking: any, score: number, status: InsightStatus) {
  const type = tracking.completedPercentage >= 80 ? 'WORKOUT_COMPLETED' : 'WORKOUT_INCOMPLETE';
  
  const title = type === 'WORKOUT_COMPLETED' 
    ? 'Treino concluído com sucesso' 
    : 'Treino incompleto';

  const summary = tracking.aiSummary || '';

  let suggestion = '';
  if (tracking.completedPercentage < 80) {
    const skippedExercises = tracking.skippedExercises.map((s: any) => s.exerciseName).join(', ');
    suggestion = `Verificar se houve falta de tempo, dor, fadiga ou dificuldade técnica.`;
  }

  await prisma.aiTrainingInsight.create({
    data: {
      tenantId: tracking.tenantId,
      studentId: tracking.studentId,
      trainerId: tracking.trainerId,
      workoutSessionTrackingId: tracking.id,
      type,
      status,
      title,
      summary,
      suggestion,
      score
    }
  });
}

async function detectAndCreateLoadInsight(params: {
  tenantId: string;
  studentId: string;
  trainerId: string;
  workoutSessionTrackingId: string;
  exerciseId: string;
  exerciseName: string;
  usedLoad: number;
  plannedLoad: number;
}) {
  const previousLog = await prisma.exercisePerformanceLog.findFirst({
    where: {
      studentId: params.studentId,
      exerciseId: params.exerciseId,
      id: { not: params.workoutSessionTrackingId }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (previousLog && previousLog.usedLoad) {
    const variation = params.usedLoad - previousLog.usedLoad;
    
    if (variation > 0) {
      await prisma.aiTrainingInsight.create({
        data: {
          tenantId: params.tenantId,
          studentId: params.studentId,
          trainerId: params.trainerId,
          workoutSessionTrackingId: params.workoutSessionTrackingId,
          type: 'EXERCISE_LOAD_INCREASED',
          status: 'GREEN',
          title: `Evolução de carga em ${params.exerciseName}`,
          summary: `Aumentou carga de ${previousLog.usedLoad}kg para ${params.usedLoad}kg.`,
          suggestion: 'Manter progressão gradual.'
        }
      });
    } else if (variation < -5) {
      await prisma.aiTrainingInsight.create({
        data: {
          tenantId: params.tenantId,
          studentId: params.studentId,
          trainerId: params.trainerId,
          workoutSessionTrackingId: params.workoutSessionTrackingId,
          type: 'EXERCISE_LOAD_DECREASED',
          status: 'YELLOW',
          title: `Regressão de carga em ${params.exerciseName}`,
          summary: `Reduziu carga de ${previousLog.usedLoad}kg para ${params.usedLoad}kg.`,
          suggestion: 'Verificar insegurança, dor, fadiga ou dificuldade técnica.'
        }
      });
    }
  }
}

async function createExerciseRepsFailedInsight(params: {
  tenantId: string;
  studentId: string;
  trainerId: string;
  workoutSessionTrackingId: string;
  exerciseName: string;
  completedReps: number;
  plannedReps: number;
}) {
  await prisma.aiTrainingInsight.create({
    data: {
      tenantId: params.tenantId,
      studentId: params.studentId,
      trainerId: params.trainerId,
      workoutSessionTrackingId: params.workoutSessionTrackingId,
      type: 'EXERCISE_REPS_FAILED',
      status: 'YELLOW',
      title: `Falha em repetições - ${params.exerciseName}`,
      summary: `Realizou ${params.completedReps}/${params.plannedReps} repetições.`,
      suggestion: 'Avaliar se a carga está excessiva ou se houve fadiga acumulada.'
    }
  });
}

async function createExerciseSkippedInsight(params: {
  tenantId: string;
  studentId: string;
  trainerId: string;
  workoutSessionTrackingId: string;
  exerciseName: string;
  skipReason: SkipReason;
  skipNote?: string;
}) {
  const reasonLabels: Record<SkipReason, string> = {
    SEM_TEMPO: 'Sem tempo',
    NAO_GOSTO: 'Não gosto desse exercício',
    SENTI_DOR: 'Senti dor/desconforto',
    NAO_SEI_EXECUTAR: 'Não sei executar',
    EQUIPAMENTO_OCUPADO: 'Equipamento ocupado',
    MUITO_DIFICIL: 'Muito difícil',
    OUTRO: 'Outro motivo'
  };

  await prisma.aiTrainingInsight.create({
    data: {
      tenantId: params.tenantId,
      studentId: params.studentId,
      trainerId: params.trainerId,
      workoutSessionTrackingId: params.workoutSessionTrackingId,
      type: 'EXERCISE_SKIPPED',
      status: 'YELLOW',
      title: `Exercício pulado - ${params.exerciseName}`,
      summary: `Informou: "${reasonLabels[params.skipReason]}"${params.skipNote ? `. Nota: ${params.skipNote}` : ''}`,
      suggestion: params.skipReason === 'MUITO_DIFICIL' 
        ? 'Avaliar necessidade de regressão ou orientação técnica.'
        : params.skipReason === 'NAO_SEI_EXECUTAR'
        ? 'Agendar breve orientação sobre técnica do exercício.'
        : params.skipReason === 'SENTI_DOR'
        ? 'Verificar se há necessidade de adaptação ou substituição.'
        : undefined
    }
  });
}

async function createSkippedRecurrentlyInsight(params: {
  tenantId: string;
  studentId: string;
  trainerId: string;
  workoutSessionTrackingId: string;
  exerciseName: string;
  skipReason: SkipReason;
}, skipCount: number) {
  const isDor = params.skipReason === 'SENTI_DOR';

  await prisma.aiTrainingInsight.create({
    data: {
      tenantId: params.tenantId,
      studentId: params.studentId,
      trainerId: params.trainerId,
      workoutSessionTrackingId: params.workoutSessionTrackingId,
      type: 'EXERCISE_SKIPPED_RECURRENTLY',
      status: isDor ? 'RED' : 'YELLOW',
      title: `Atenção: ${params.exerciseName} frequentemente pulado`,
      summary: `Exercício pulado ${skipCount} vezes nos últimos 30 dias.`,
      suggestion: 'Conversar com a aluna para entender o motivo e avaliar substituição ou regressão.'
    }
  });
}

export async function detectLowAdherence(studentId: string, trainerId: string, tenantId: string) {
  const goal = await prisma.goal.findFirst({
    where: { studentId },
    orderBy: { createdAt: 'desc' }
  });

  if (!goal) return;

  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const workoutsLast7Days = await prisma.workoutSessionTracking.findMany({
    where: {
      studentId,
      startedAt: { gte: last7Days },
      status: { in: ['COMPLETED', 'INCOMPLETE'] }
    }
  });

  const expectedPerWeek = goal.daysPerWeek;
  const actualPerWeek = workoutsLast7Days.length;
  const percentage = (actualPerWeek / expectedPerWeek) * 100;

  if (percentage < 50) {
    const last14Days = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const workoutsLast14Days = await prisma.workoutSessionTracking.count({
      where: {
        studentId,
        startedAt: { gte: last14Days },
        status: { in: ['COMPLETED', 'INCOMPLETE'] }
      }
    });

    const status = workoutsLast14Days < 3 ? 'RED' : 'YELLOW';

    await prisma.aiTrainingInsight.create({
      data: {
        tenantId,
        studentId,
        trainerId,
        type: 'STUDENT_LOW_ADHERENCE',
        status,
        title: 'Baixa aderência ao treino',
        summary: `Treinou ${actualPerWeek} vez(es) esta semana, abaixo da frequência planejada de ${expectedPerWeek}/semana.`,
        suggestion: status === 'RED' 
          ? 'Entrar em contato para entender possíveis dificuldades.'
          : 'Enviar mensagem de incentivo e verificar como ajudar.'
      }
    });
  }
}

export interface N8nPayload {
  event: string;
  tenant: { id: string };
  student: { id: string; name: string };
  trainer: { id: string; name: string; phone?: string; email?: string };
  workout?: { id: string; name: string; completedPercentage?: number; date?: string };
  exercise?: { id: string; name: string; skip_count_last_30_days?: number; last_skip_reason?: string };
  diagnosis: { status: string; title: string; summary: string; suggestion?: string };
  metrics?: { performance_score: number; adherence_score?: number; load_progression?: string };
}

export async function prepareN8nPayload(insightId: string): Promise<N8nPayload | null> {
  const insight = await prisma.aiTrainingInsight.findUnique({
    where: { id: insightId },
    include: {
      workoutSession: {
        include: {
          exerciseLogs: true,
          skippedExercises: true
        }
      }
    }
  });

  if (!insight) return null;

  const student = await prisma.user.findUnique({
    where: { id: insight.studentId },
    select: { name: true }
  });

  const trainer = await prisma.user.findUnique({
    where: { id: insight.trainerId },
    select: { name: true, phone: true, email: true }
  });

  const workout = insight.workoutSession ? await prisma.workout.findUnique({
    where: { id: insight.workoutSession.workoutId },
    select: { name: true }
  }) : null;

  const eventMap: Record<string, string> = {
    WORKOUT_COMPLETED: 'workout_completed',
    WORKOUT_INCOMPLETE: 'workout_incomplete',
    EXERCISE_SKIPPED: 'exercise_skipped',
    EXERCISE_SKIPPED_RECURRENTLY: 'exercise_skipped_recurrently',
    EXERCISE_REPS_FAILED: 'exercise_reps_failed',
    EXERCISE_LOAD_INCREASED: 'exercise_load_increased',
    EXERCISE_LOAD_DECREASED: 'exercise_load_decreased',
    STUDENT_LOW_ADHERENCE: 'student_low_adherence',
    STUDENT_PERFORMANCE_DROP: 'student_performance_drop',
    STUDENT_NEEDS_ATTENTION: 'student_needs_attention',
    STUDENT_PROGRESS_DETECTED: 'student_progress_detected'
  };

  return {
    event: eventMap[insight.type] || insight.type,
    tenant: { id: insight.tenantId },
    student: { id: insight.studentId, name: student?.name || '' },
    trainer: { 
      id: insight.trainerId, 
      name: trainer?.name || '', 
      phone: trainer?.phone || undefined,
      email: trainer?.email || undefined 
    },
    workout: workout ? {
      id: insight.workoutSession!.workoutId,
      name: workout.name,
      completedPercentage: insight.workoutSession!.completedPercentage || undefined,
      date: insight.workoutSession!.startedAt?.toISOString().split('T')[0]
    } : undefined,
    diagnosis: {
      status: insight.status.toLowerCase(),
      title: insight.title,
      summary: insight.summary,
      suggestion: insight.suggestion || undefined
    },
    metrics: insight.score ? {
      performance_score: insight.score
    } : undefined
  };
}

export async function createN8nWebhookLog(params: {
  tenantId: string;
  eventType: string;
  studentId?: string;
  trainerId?: string;
  workoutSessionTrackingId?: string;
  aiTrainingInsightId?: string;
  webhookUrl?: string;
  payload: Json;
  status?: WebhookStatus;
}) {
  return prisma.n8nWebhookLog.create({
    data: {
      tenantId: params.tenantId,
      eventType: params.eventType,
      studentId: params.studentId,
      trainerId: params.trainerId,
      workoutSessionTrackingId: params.workoutSessionTrackingId,
      aiTrainingInsightId: params.aiTrainingInsightId,
      webhookUrl: params.webhookUrl,
      payload: params.payload,
      status: params.status || 'DISABLED'
    }
  });
}

export async function getInsightsByTenant(tenantId: string, filters?: {
  status?: InsightStatus;
  type?: InsightType;
  studentId?: string;
}) {
  return prisma.aiTrainingInsight.findMany({
    where: {
      tenantId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.studentId && { studentId: filters.studentId })
    },
    include: {
      workoutSession: {
        include: {
          exerciseLogs: true,
          skippedExercises: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}