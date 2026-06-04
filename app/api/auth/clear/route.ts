import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  // Clear the cookie securely from the server side, which works even if it's HttpOnly
  response.cookies.delete('auth_token');
  return response;
}
