import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/eventos/[id]/pagos - List payments for an event
export async function GET(request: Request, { params }: RouteParams) {
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

    const { id } = await params;

    const [pagos] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM pagos_evento WHERE evento_id = ? ORDER BY fecha DESC`,
      [id]
    );

    return NextResponse.json(pagos);
  } catch (error) {
    console.error('Error fetching pagos:', error);
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 });
  }
}

// POST /api/eventos/[id]/pagos - Add payment to event
export async function POST(request: Request, { params }: RouteParams) {
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

    if (payload.role === 'viewer') {
      return NextResponse.json({ error: 'Sin permisos para registrar pagos' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify event exists
    const [eventos] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM eventos WHERE id = ?',
      [id]
    );

    if (eventos.length === 0) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO pagos_evento (evento_id, fecha, monto, concepto, observaciones)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        body.fecha,
        body.monto,
        body.concepto || 'pago',
        body.observaciones || null
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating pago:', error);
    return NextResponse.json({ error: 'Error al registrar pago' }, { status: 500 });
  }
}
