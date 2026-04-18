import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
    try {
        const count = await prisma.user.count();
        return NextResponse.json({ status: 'ok', users: count });
    } catch (error: any) {
        console.error('DB Error:', error.message);
        return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
    }
}