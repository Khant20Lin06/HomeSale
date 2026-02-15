import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Exclude static files and api routes from middleware
    if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.startsWith('/api') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // Redirect root to dashboard (which will then check auth)
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Redirect login to dashboard if already authenticated
    if (pathname.startsWith('/login')) {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/dashboard/:path*', '/login'],
};
