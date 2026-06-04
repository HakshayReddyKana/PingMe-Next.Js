import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Fast-path early return for routes we don't care about
    if (!pathname.startsWith('/oauth2/') && 
        !pathname.startsWith('/login/oauth2/') && 
        pathname !== '/' && 
        !pathname.startsWith('/dashboard')) {
      return NextResponse.next();
    }

    // Handle OAuth2 and login proxying
    if (pathname.startsWith('/oauth2/') || pathname.startsWith('/login/oauth2/')) {
      const backendUrl = process.env.BACKEND_URL;
      if (!backendUrl) {
        return new NextResponse('Backend URL not configured', { status: 500 });
      }

      const targetUrl = `${backendUrl}${pathname}${request.nextUrl.search}`;

      // Forward the request to the backend
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers),
          host: new URL(backendUrl).host,
        },
        body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
        redirect: 'manual',
      });

      // If it's a redirect, update the location header
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
          const backendHost = new URL(backendUrl).host;
          const redirectUrl = new URL(location, backendUrl);

          if (redirectUrl.host === backendHost) {
            return NextResponse.redirect(
              new URL(redirectUrl.pathname + redirectUrl.search, request.url)
            );
          }
          return NextResponse.redirect(location);
        }
      }

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    // Get authentication status from cookies
    const authToken = request.cookies.get('auth_token');

    // CSRF Protection (Origin Check)
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');

      if (origin && host && !origin.includes(host)) {
        return new NextResponse('Cross-Site Request Forbidden', { status: 403 });
      }
    }

    // Redirect to dashboard if already authenticated and trying to access login page
    if (authToken && pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect to login if not authenticated and trying to access protected routes
    if (!authToken && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Fatal Middleware Error:', error);
    // Fail open so the page still loads instead of returning a 500
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
