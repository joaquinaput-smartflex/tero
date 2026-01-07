import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export async function POST() {
  const response = NextResponse.json<ApiResponse<null>>({
    success: true,
    message: 'Sesión cerrada',
  });

  // Clear the auth cookie
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
