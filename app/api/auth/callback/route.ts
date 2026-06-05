import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET endpoint - receives token from OAuth redirect
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
    }

    if (!token) {
      return NextResponse.redirect(new URL('/?error=no_token', request.url));
    }

    // Store JWT in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // Extract username from JWT
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const username = payload.sub || payload.email;
      
      cookieStore.set('username', username, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    } catch (e) {
      console.error('Failed to decode JWT:', e);
    }

    return NextResponse.redirect(new URL('/home', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
  }
}

// POST endpoint - if backend can't do code exchange, use this as fallback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const username = payload.sub || payload.email;
      
      cookieStore.set('username', username, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    } catch (e) {
      console.error('Failed to decode JWT:', e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json({ error: 'Callback failed' }, { status: 500 });
  }
}
