import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import type { ApiResponse, User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No autenticado',
      }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Token inválido',
      }, { status: 401 });
    }

    // Get fresh user data
    const users = await query<User[]>(
      'SELECT id, username, email, nombre, role, activo, last_login, created_at FROM users WHERE id = ?',
      [payload.userId]
    );

    if (users.length === 0 || !users[0].activo) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Usuario no encontrado o desactivado',
      }, { status: 401 });
    }

    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error en el servidor',
    }, { status: 500 });
  }
}
