import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { uploadFile } from '@/lib/engine/storage';

export async function POST(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || (payload.role !== 'OWNER_PERSONAL' && payload.role !== 'TRAINER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'general';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const publicUrl = await uploadFile(buffer, file.name, folder);

        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Error uploading file' }, { status: 500 });
    }
}
