import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/landingPage/guest`, {
      method: 'GET',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch guest data' },
        { status: response.status }
      );
    }

    const data = await response.text();
    
    return NextResponse.json({ message: data }, { status: 200 });
  } catch (error) {
    console.error('Guest API error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend server' }, 
      { status: 500 }
    );
  }
}
