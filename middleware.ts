import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request: NextRequest) {
  // Skip middleware processing for static files and Next.js internals
  const skipPaths = [
    '/_next/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/.well-known/',
    '/api/auth/providers',
    '/api/auth/session',
    '/api/auth/csrf',
    '/manifest.json'
  ];
  
  const shouldSkip = skipPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (shouldSkip) {
    return NextResponse.next();
  }

  try {
    // Get user session for auth context
    const session = await auth();
    
    // Continue with the request
    const response = NextResponse.next();
    
    // Add request metadata to headers for potential logging by API routes
    if (session?.user?.id) {
      response.headers.set('x-user-id', session.user.id);
    }
    response.headers.set('x-request-start-time', Date.now().toString());
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - we'll handle these separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
