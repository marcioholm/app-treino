import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Create tenant
        const tenant = await prisma.tenant.upsert({
            where: { id: 'demo-tenant' },
            update: {},
            create: {
                id: 'demo-tenant',
                name: 'M&K Fitness Center',
            },
        });

        // Create admin user
        const hashedPassword = await bcrypt.hash('testpassword', 10);
        
        const user = await prisma.user.upsert({
            where: { email: 'admin@traineros.com' },
            update: {},
            create: {
                id: 'admin-user',
                tenantId: tenant.id,
                name: 'Admin',
                email: 'admin@traineros.com',
                password: hashedPassword,
                role: 'OWNER_PERSONAL',
            },
        });

        return NextResponse.json({ 
            success: true, 
            tenant: tenant.name,
            user: user.email,
            message: 'Seed executado com sucesso!' 
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}