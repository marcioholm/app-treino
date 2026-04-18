import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    // Clear cookies
    const cookieStore = await cookies();
    cookieStore.delete('token');

    // Redirect to login
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'));
}
