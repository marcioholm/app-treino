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
    date: z.string().optional(),
    label: z.string().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    age: z.number().optional(),
    bioimpedanceDevice: z.string().optional(),
    conditions: z.string().optional(),
    fatPercent: z.number().optional(),
    fatMassKg: z.number().optional(),
    leanMassKg: z.number().optional(),
    muscleMassKg: z.number().optional(),
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

export async function GET(req: Request, { params }: { params: Promise<{ id: string; assessmentId: string }> }) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { assessmentId } = await params;
        
        const assessment = await prisma.physicalAssessment.findUnique({
            where: { id: assessmentId },
            include: {
                bodyMeasurements: true,
                photos: true,
            },
        });

        if (!assessment || assessment.tenantId !== payload.tenantId) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        return NextResponse.json({ assessment });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; assessmentId: string }> }) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { assessmentId } = await params;
        
        const existing = await prisma.physicalAssessment.findUnique({
            where: { id: assessmentId },
        });

        if (!existing || existing.tenantId !== payload.tenantId) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        const body = await req.json();
        const data = assessmentSchema.parse(body);

        const bmi = calculateBMI(
            data.weight ?? existing.weight ?? null,
            data.height ?? existing.height ?? null
        );

        const assessment = await prisma.physicalAssessment.update({
            where: { id: assessmentId },
            data: {
                ...(data.date && { date: new Date(data.date) }),
                ...(data.label && { label: data.label }),
                ...(data.weight !== undefined && { weight: data.weight }),
                ...(data.height !== undefined && { height: data.height }),
                ...(data.age !== undefined && { age: data.age }),
                ...(bmi !== null && { bmi }),
                ...(data.bioimpedanceDevice !== undefined && { bioimpedanceDevice: data.bioimpedanceDevice }),
                ...(data.conditions !== undefined && { conditions: data.conditions }),
                ...(data.fatPercent !== undefined && { fatPercent: data.fatPercent }),
                ...(data.fatMassKg !== undefined && { fatMassKg: data.fatMassKg }),
                ...(data.leanMassKg !== undefined && { leanMassKg: data.leanMassKg }),
                ...(data.muscleMassKg !== undefined && { muscleMassKg: data.muscleMassKg }),
                ...(data.waterPercent !== undefined && { waterPercent: data.waterPercent }),
                ...(data.boneMassKg !== undefined && { boneMassKg: data.boneMassKg }),
                ...(data.basalMetabolism !== undefined && { basalMetabolism: data.basalMetabolism }),
                ...(data.metabolicAge !== undefined && { metabolicAge: data.metabolicAge }),
                ...(data.fatGoalPercent !== undefined && { fatGoalPercent: data.fatGoalPercent }),
                ...(data.muscleGoalKg !== undefined && { muscleGoalKg: data.muscleGoalKg }),
                ...(data.weightGoalKg !== undefined && { weightGoalKg: data.weightGoalKg }),
                ...(data.notes !== undefined && { notes: data.notes }),
            },
            include: {
                bodyMeasurements: true,
                photos: true,
            },
        });

        if (data.measurements) {
            const existingMeasurements = await prisma.bodyMeasurement.findFirst({
                where: { physicalAssessmentId: assessmentId },
            });

            if (existingMeasurements) {
                await prisma.bodyMeasurement.update({
                    where: { id: existingMeasurements.id },
                    data: data.measurements,
                });
            } else {
                await prisma.bodyMeasurement.create({
                    data: {
                        ...data.measurements,
                        physicalAssessmentId: assessmentId,
                    },
                });
            }
        }

        const updated = await prisma.physicalAssessment.findUnique({
            where: { id: assessmentId },
            include: {
                bodyMeasurements: true,
                photos: true,
            },
        });

        return NextResponse.json({ assessment: updated });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; assessmentId: string }> }) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { assessmentId } = await params;
        console.log('Deleting assessment:', assessmentId);
        
        const existing = await prisma.physicalAssessment.findUnique({
            where: { id: assessmentId },
        });

        console.log('Found assessment:', existing?.id);

        if (!existing || existing.tenantId !== payload.tenantId) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        await prisma.physicalAssessment.delete({
            where: { id: assessmentId },
        });

        console.log('Deleted successfully');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}