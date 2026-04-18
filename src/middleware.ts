import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Paths that do not require authentication
    if (
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api/test-db') ||
        pathname.startsWith('/_next') ||
        pathname === '/' ||
        pathname.startsWith('/login') ||
        pathname.includes('.') // Static files
    ) {
        return NextResponse.next();
    }

    // Get token from cookies
    const token = request.cookies.get('mk_app_token')?.value;
    // Fallback to Authorization header API requests
    const authHeader = request.headers.get('authorization');
    const finalToken = token || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

    if (!finalToken) {
        return redirectToLogin(request);
    }

    const payload = await verifyToken(finalToken);

    if (!payload) {
        return redirectToLogin(request);
    }

    // Route based Role-Based Access Control
    if (pathname.startsWith('/personal') && payload.role === 'STUDENT') {
        return NextResponse.redirect(new URL('/student/today', request.url));
    }

    if (pathname.startsWith('/student') && payload.role !== 'STUDENT') {
        return NextResponse.redirect(new URL('/personal/dashboard', request.url));
    }

    // Inject user info into headers so API routes can easily access without re-verifying
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-tenant-id', payload.tenantId);
    response.headers.set('x-user-role', payload.role);
    if (payload.studentId) {
        response.headers.set('x-student-id', payload.studentId);
    }

    return response;
}

function redirectToLogin(request: NextRequest) {
    // If it's an API request, return 401
    if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Otherwise redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
