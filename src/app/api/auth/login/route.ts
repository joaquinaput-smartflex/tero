import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import type { ApiResponse } from '@/types';

interface LoginRequest {
  username: string;
  password: string;
}

interface UserRow {
  id: number;
  username: string;
  email: string | null;
  password_hash: string;
  nombre: string | null;
  role: 'admin' | 'chef' | 'viewer';
  activo: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Usuario y contraseña son requeridos',
      }, { status: 400 });
    }

    // Find user
    const users = await query<UserRow[]>(
      'SELECT id, username, email, password_hash, nombre, role, activo FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Usuario o contraseña incorrectos',
      }, { status: 401 });
    }

    const user = users[0];

    if (!user.activo) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Usuario desactivado',
      }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Usuario o contraseña incorrectos',
      }, { status: 401 });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    // Update last_login
    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Create response with cookie
    const response = NextResponse.json<ApiResponse<{
      user: { id: number; username: string; nombre: string | null; role: string };
      token: string;
    }>>({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          nombre: user.nombre,
          role: user.role,
        },
        token,
      },
      message: 'Login exitoso',
    });

    // Set HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error en el servidor',
    }, { status: 500 });
  }
}
