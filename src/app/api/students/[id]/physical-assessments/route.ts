import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { calculateBMI } from '@/lib/body-calculator';
import { z } from 'zod';

const measurementSchema = z.object({
    neckCm: z.number().optional(),
    shoulderCm: z.number().optional(),
    chestCm: z.number().optional(),
    waistCm: z.number().optional(),
    abdomenCm: z.number().optional(),
    hipCm: z.number().optional(),
    rightArmCm: z.number().optional(),
    leftArmCm: z.number().optional(),
    rightArmContractedCm: z.number().optional(),
    leftArmContractedCm: z.number().optional(),
    rightForearmCm: z.number().optional(),
    leftForearmCm: z.number().optional(),
    rightThighCm: z.number().optional(),
    leftThighCm: z.number().optional(),
    rightCalfCm: z.number().optional(),
    leftCalfCm: z.number().optional(),
    notes: z.string().optional(),
});

const assessmentSchema = z.object({
    date: z.string(),
    label: z.string().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    age: z.number().optional(),
    bioimpedanceDevice: z.string().optional(),
    conditions: z.string().optional(),
    fatPercent: z.number().optional(),
    fatMassKg: z.number().optional(),
    leanMassKg: z.number().optional(),
    muscleMassPercent: z.number().optional(),
    waterPercent: z.number().optional(),
    boneMassKg: z.number().optional(),
    basalMetabolism: z.number().optional(),
    metabolicAge: z.number().optional(),
    fatGoalPercent: z.number().optional(),
    muscleGoalKg: z.number().optional(),
    weightGoalKg: z.number().optional(),
    notes: z.string().optional(),
    measurements: measurementSchema.optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const studentId = (await params).id;
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');

        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student || student.tenantId !== payload.tenantId) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        const assessments = await prisma.physicalAssessment.findMany({
            where: { studentId },
            include: {
                bodyMeasurements: true,
                photos: true,
            },
            orderBy: { date: 'desc' },
            take: limit,
            skip: offset,
        });

        return NextResponse.json({ assessments });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const studentId = (await params).id;
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student || student.tenantId !== payload.tenantId) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        const body = await req.json();
        const data = assessmentSchema.parse(body);

        const bmi = calculateBMI(data.weight || null, data.height || null);

        const assessment = await prisma.physicalAssessment.create({
            data: {
                studentId,
                tenantId: payload.tenantId,
                date: new Date(data.date),
                label: data.label || 'Avaliação Inicial',
                weight: data.weight,
                height: data.height,
                bmi,
                age: data.age,
                bioimpedanceDevice: data.bioimpedanceDevice,
                conditions: data.conditions,
                fatPercent: data.fatPercent,
                fatMassKg: data.fatMassKg,
                leanMassKg: data.leanMassKg,
                muscleMassPercent: data.muscleMassPercent,
                waterPercent: data.waterPercent,
                boneMassKg: data.boneMassKg,
                basalMetabolism: data.basalMetabolism,
                metabolicAge: data.metabolicAge,
                fatGoalPercent: data.fatGoalPercent,
                muscleGoalKg: data.muscleGoalKg,
                weightGoalKg: data.weightGoalKg,
                notes: data.notes,
                bodyMeasurements: data.measurements ? {
                    create: data.measurements
                } : undefined,
            },
            include: {
                bodyMeasurements: true,
                photos: true,
            },
        });

        return NextResponse.json({ assessment }, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}