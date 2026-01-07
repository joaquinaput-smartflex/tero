import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, hashPassword } from '@/lib/auth';
import type { User, ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id] - Get single user
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No autenticado',
      }, { status: 401 });
    }

    const { id } = await params;

    // Non-admin can only view their own profile
    if (payload.role !== 'admin' && payload.userId !== parseInt(id)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No autorizado',
      }, { status: 403 });
    }

    const users = await query<User[]>(
      'SELECT id, username, email, nombre, role, activo, last_login, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Usuario no encontrado',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error al obtener usuario',
    }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No autenticado',
      }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    // Non-admin can only update their own profile (limited fields)
    const isOwnProfile = payload.userId === userId;
    const isAdmin = payload.role === 'admin';

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No autorizado',
      }, { status: 403 });
    }

    const body = await request.json();
    const { email, nombre, password, role, activo } = body;

    // Build update query
    const updates: string[] = [];
    const values: (string | boolean | null)[] = [];

    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email || null);
    }

    if (nombre !== undefined) {
      updates.push('nombre = ?');
      values.push(nombre || null);
    }

    if (password) {
      const password_hash = await hashPassword(password);
      updates.push('password_hash = ?');
      values.push(password_hash);
    }

    // Only admin can change role and activo
    if (isAdmin) {
      if (role !== undefined) {
        updates.push('role = ?');
        values.push(role);
      }

      if (activo !== undefined) {
        updates.push('activo = ?');
        values.push(activo);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No hay campos para actualizar',
      }, { status: 400 });
    }

    values.push(id);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Usuario actualizado correctamente',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error al actualizar usuario',
    }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No autorizado',
      }, { status: 403 });
    }

    const { id } = await params;

    // Prevent self-deletion
    if (payload.userId === parseInt(id)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No podés eliminar tu propio usuario',
      }, { status: 400 });
    }

    await query('DELETE FROM users WHERE id = ?', [id]);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Usuario eliminado correctamente',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error al eliminar usuario',
    }, { status: 500 });
  }
}
