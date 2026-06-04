import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, (await params).path);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, (await params).path);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, (await params).path);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, (await params).path);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, (await params).path);
}

async function proxyRequest(request: NextRequest, pathArray: string[]) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
  }

  const path = pathArray.join('/');
  const targetUrl = `${backendUrl}/api/${path}${request.nextUrl.search}`;

  try {
    const headers = new Headers();
    // Forward the auth token as BOTH a Cookie and an Authorization header!
    // Some Spring Boot boilerplates look for the cookie, others look for "Authorization: Bearer <token>"
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      headers.set('Cookie', `auth_token=${token}`);
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Forward Content-Type
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      redirect: 'manual',
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const bodyText = await request.text();
      if (bodyText) {
        fetchOptions.body = bodyText;
      }
    }

    const response = await fetch(targetUrl, fetchOptions);

    const responseBody = await response.text();
    
    const responseHeaders = new Headers(response.headers);
    // Don't leak backend server info
    responseHeaders.delete('server');
    // Prevent Spring Security from triggering the browser's native Basic Auth popup
    responseHeaders.delete('www-authenticate');

    return new NextResponse(responseBody || null, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('API Proxy error:', error);
    return NextResponse.json({ error: 'Failed to proxy to backend' }, { status: 502 });
  }
}
