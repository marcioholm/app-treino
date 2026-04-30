import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { getAllTenantInsights } from '@/lib/engine/performance';

// This endpoint can be called by N8N or a Cron Job to push alerts
export async function POST(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        // Optionally allow a secret key for N8N/Cron triggers
        const apiKey = req.headers.get('x-api-key');
        const isCronTrigger = apiKey === process.env.CRON_SECRET;

        if (!isCronTrigger && (!payload || (payload.role !== 'TRAINER' && payload.role !== 'OWNER_PERSONAL'))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tenantId = isCronTrigger ? req.headers.get('x-tenant-id') : payload?.tenantId;
        if (!tenantId) return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 });

        const insights = await getAllTenantInsights(tenantId);
        
        // Filter only important insights (Attention or Warnings) for webhook
        const alerts = insights.filter(i => i.type === 'ATTENTION' || i.type === 'WARNING');

        // IF N8N_WEBHOOK_URL is set, we push there
        const webhookUrl = process.env.N8N_PERFORMANCE_WEBHOOK_URL;
        if (webhookUrl && alerts.length > 0) {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    alerts,
                    timestamp: new Date().toISOString()
                })
            });
        }

        return NextResponse.json({ 
            success: true, 
            totalInsights: insights.length, 
            alertsSent: alerts.length,
            webhookTriggered: !!webhookUrl 
        });
    } catch (err) {
        console.error('Webhook error', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
