import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    // Check for auth_token only
    const token = cookieStore.get('auth_token')?.value;
    const username = cookieStore.get('username')?.value;

    if (!token) {
      return NextResponse.json({
        isAuthenticated: false,
        username: null,
      });
    }

    // Decode JWT payload to get real username
    let displayUsername = username;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        // checks common claims: sub | email | preferred_username | name
        displayUsername = payload.sub || payload.email || payload.preferred_username || payload.name || username;
      }
    } catch (e) {
      // If decode fails, fallback to cookie or default
    }

    return NextResponse.json({
      isAuthenticated: true,
      username: displayUsername,
    });
  } catch (error) {
    return NextResponse.json({
      isAuthenticated: false,
      username: null,
    });
  }
}
