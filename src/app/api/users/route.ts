import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, hashPassword } from '@/lib/auth';
import type { User, ApiResponse } from '@/types';

// GET /api/users - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify auth
    const token = request.cookies.get('auth_token')?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No autorizado',
      }, { status: 403 });
    }

    const users = await query<User[]>(
      'SELECT id, username, email, nombre, role, activo, last_login, created_at FROM users ORDER BY created_at DESC'
    );

    return NextResponse.json<ApiResponse<User[]>>({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error al obtener usuarios',
    }, { status: 500 });
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const token = request.cookies.get('auth_token')?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No autorizado',
      }, { status: 403 });
    }

    const body = await request.json();
    const { username, email, password, nombre, role } = body;

    if (!username || !password) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Usuario y contraseña son requeridos',
      }, { status: 400 });
    }

    // Check if username exists
    const existing = await query<{ id: number }[]>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'El usuario ya existe',
      }, { status: 400 });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const result = await query<{ insertId: number }>(
      'INSERT INTO users (username, email, password_hash, nombre, role) VALUES (?, ?, ?, ?, ?)',
      [username, email || null, password_hash, nombre || null, role || 'viewer']
    );

    return NextResponse.json<ApiResponse<{ id: number }>>({
      success: true,
      data: { id: (result as unknown as { insertId: number }).insertId },
      message: 'Usuario creado correctamente',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error al crear usuario',
    }, { status: 500 });
  }
}
