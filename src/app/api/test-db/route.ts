import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
    const results: any = {
        env DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
        env length: process.env.DATABASE_URL?.length || 0,
    };
    
    try {
        // Test 1: Default PrismaClient (uses env)
        const prisma1 = new PrismaClient();
        await prisma1.$connect();
        results.test1 = 'SUCCESS - default client';
        await prisma1.$disconnect();
    } catch (e: any) {
        results.test1 = 'FAILED: ' + e.message;
    }

    try {
        // Test 2: With explicit URL
        const prisma2 = new PrismaClient({
            datasources: {
                db: {
                    url: 'postgresql://postgres:hI494IxoEtu4a00Z@db.vlpbichjuuttxhfepjil.supabase.co:5432/postgres'
                }
            }
        });
        await prisma2.$connect();
        results.test2 = 'SUCCESS - explicit URL';
        await prisma2.$disconnect();
    } catch (e: any) {
        results.test2 = 'FAILED: ' + e.message;
    }

    return NextResponse.json(results);
}