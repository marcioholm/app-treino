import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function logout(req: Request) {
    // Clear cookies
    const cookieStore = await cookies();
    cookieStore.delete('mk_app_token');

    // Redirect to login using a relative URL or constructing from current request
    const url = new URL('/login', req.url);
    return NextResponse.redirect(url);
}

export const GET = logout;
export const POST = logout;
