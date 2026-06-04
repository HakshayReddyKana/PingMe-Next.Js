import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    return NextResponse.json({ token: null }, { status: 401 });
  }
  
  return NextResponse.json({ token });
}
