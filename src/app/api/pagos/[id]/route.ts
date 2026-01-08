import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { ResultSetHeader } from 'mysql2';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/pagos/[id] - Delete a payment
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalido' }, { status: 401 });
    }

    // Only admin can delete payments
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin puede eliminar pagos' }, { status: 403 });
    }

    const { id } = await params;

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM pagos_evento WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pago:', error);
    return NextResponse.json({ error: 'Error al eliminar pago' }, { status: 500 });
  }
}
