import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the token from cookies
  const token = request.cookies.get('smartbio_token')?.value;
  
  // Define public routes that don't require authentication
  const isPublicRoute = request.nextUrl.pathname === '/login';

  // If user is trying to access a protected route and doesn't have a token
  if (!token && !isPublicRoute) {
    // Redirect them to the login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is already logged in and tries to access the login page
  if (token && isPublicRoute) {
    // Redirect them to the dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  // Apply middleware to all routes except API routes, static files, Next.js internals, and images
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
