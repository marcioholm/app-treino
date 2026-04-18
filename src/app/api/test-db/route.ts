import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
    try {
        const prisma = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        });
        
        const count = await prisma.user.count();
        await prisma.$disconnect();
        
        return NextResponse.json({ 
            status: 'ok', 
            users: count,
            dbUrl: process.env.DATABASE_URL ? 'exists' : 'missing'
        });
    } catch (error: any) {
        return NextResponse.json({ 
            status: 'error', 
            error: error.message 
        }, { status: 500 });
    }
}