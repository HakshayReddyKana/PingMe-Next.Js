import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error('BACKEND_URL is not defined in environment variables');
}

export async function GET() {
  try {
    // Get JWT token from HTTP-only cookie (server-side only)
    const cookieStore = await cookies();
    // Check for auth_token only
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated. Please login first.' },
        { status: 401 }
      );
    }

    // Forward the request to the backend with JWT token
    const response = await fetch(`${BACKEND_URL}/hello`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch protected data' },
        { status: response.status }
      );
    }

    const data = await response.text();
    
    return NextResponse.json({ message: data }, { status: 200 });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend server. Make sure it is running on port 8080.' }, 
      { status: 500 }
    );
  }
}
