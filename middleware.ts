import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle OAuth2 and login proxying
  if (pathname.startsWith('/oauth2/') || pathname.startsWith('/login/oauth2/')) {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return new NextResponse('Backend URL not configured', { status: 500 });
    }

    try {
      const targetUrl = `${backendUrl}${pathname}${request.nextUrl.search}`;

      // Forward the request to the backend
      // NODE_TLS_REJECT_UNAUTHORIZED=0 in .env handles self-signed cert acceptance
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
          // If the redirect is to the backend, convert it to a relative URL
          const backendHost = new URL(backendUrl).host;
          const redirectUrl = new URL(location, backendUrl);

          if (redirectUrl.host === backendHost) {
            // Convert backend URL to our frontend URL
            return NextResponse.redirect(
              new URL(redirectUrl.pathname + redirectUrl.search, request.url)
            );
          }
          // External redirect (like OAuth provider)
          return NextResponse.redirect(location);
        }
      }

      // Forward the response
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      console.error('Proxy error:', error);
      return new NextResponse('Proxy error', { status: 502 });
    }
  }

  // Get authentication status from cookies
  const authToken = request.cookies.get('auth_token');

  // --------------------------------------------------------------------------
  // CSRF Protection (Origin Check)
  // Ensure mutation requests (POST/PUT/DELETE) come from our own origin
  // --------------------------------------------------------------------------
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // Only block if Origin is present and does not match Host
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
}

export const config = {
  // Match OAuth routes, page routes, exclude API routes and auth callback page
  matcher: ['/oauth2/:path*', '/login/oauth2/:path*', '/', '/dashboard/:path*'],
};
