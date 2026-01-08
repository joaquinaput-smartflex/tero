import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/eventos/[id] - Get single event with payments
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

    // Get event with menu info
    const [eventos] = await pool.execute<RowDataPacket[]>(
      `SELECT
        e.*,
        m.nombre as menu_nombre,
        m.categorias as menu_categorias,
        m.extras as menu_extras
      FROM eventos e
      LEFT JOIN menus_evento m ON e.menu_id = m.id
      WHERE e.id = ?`,
      [id]
    );

    if (eventos.length === 0) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Get payments
    const [pagos] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM pagos_evento WHERE evento_id = ? ORDER BY fecha DESC`,
      [id]
    );

    // Calculate totals
    const totalPagado = pagos
      .filter((p: RowDataPacket) => p.concepto === 'pago' || p.concepto === 'sena')
      .reduce((sum: number, p: RowDataPacket) => sum + Number(p.monto), 0);

    const totalSenas = pagos
      .filter((p: RowDataPacket) => p.concepto === 'sena')
      .reduce((sum: number, p: RowDataPacket) => sum + Number(p.monto), 0);

    const ajusteIpc = pagos
      .filter((p: RowDataPacket) => p.concepto === 'ajuste_ipc')
      .reduce((sum: number, p: RowDataPacket) => sum + Number(p.monto), 0);

    const evento = {
      ...eventos[0],
      pagos,
      total_pagado: totalPagado,
      total_senas: totalSenas,
      ajuste_ipc: ajusteIpc,
      saldo_pendiente: Number(eventos[0].total_evento) + ajusteIpc - totalPagado
    };

    return NextResponse.json(evento);
  } catch (error) {
    console.error('Error fetching evento:', error);
    return NextResponse.json({ error: 'Error al obtener evento' }, { status: 500 });
  }
}

// PUT /api/eventos/[id] - Update event
export async function PUT(request: Request, { params }: RouteParams) {
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
      return NextResponse.json({ error: 'Sin permisos para editar eventos' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Recalculate total
    let total = 0;
    total += (body.adultos || 0) * (body.precio_adulto || 0);
    total += (body.menores || 0) * (body.precio_menor || 0);

    if (body.extra1_valor) {
      total += body.extra1_tipo === 'por_persona'
        ? body.extra1_valor * ((body.adultos || 0) + (body.menores || 0))
        : body.extra1_valor;
    }
    if (body.extra2_valor) {
      total += body.extra2_tipo === 'por_persona'
        ? body.extra2_valor * ((body.adultos || 0) + (body.menores || 0))
        : body.extra2_valor;
    }
    if (body.extra3_valor) {
      total += body.extra3_tipo === 'por_persona'
        ? body.extra3_valor * ((body.adultos || 0) + (body.menores || 0))
        : body.extra3_valor;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE eventos SET
        fecha = ?, cliente = ?, telefono = ?, turno = ?,
        hora_inicio = ?, hora_fin = ?, vendedor = ?,
        tipo_evento = ?, salon = ?, menu_id = ?, menu_detalle = ?,
        tecnica = ?, dj = ?, tecnica_superior = ?, otros = ?,
        adultos = ?, precio_adulto = ?, menores = ?, precio_menor = ?,
        extra1_descripcion = ?, extra1_valor = ?, extra1_tipo = ?,
        extra2_descripcion = ?, extra2_valor = ?, extra2_tipo = ?,
        extra3_descripcion = ?, extra3_valor = ?, extra3_tipo = ?,
        total_evento = ?, confirmado = ?
      WHERE id = ?`,
      [
        body.fecha,
        body.cliente,
        body.telefono || null,
        body.turno || 'noche',
        body.hora_inicio || null,
        body.hora_fin || null,
        body.vendedor || null,
        body.tipo_evento || null,
        body.salon || null,
        body.menu_id || null,
        body.menu_detalle ? JSON.stringify(body.menu_detalle) : null,
        body.tecnica ? 1 : 0,
        body.dj ? 1 : 0,
        body.tecnica_superior ? 1 : 0,
        body.otros || null,
        body.adultos || 0,
        body.precio_adulto || 0,
        body.menores || 0,
        body.precio_menor || 0,
        body.extra1_descripcion || null,
        body.extra1_valor || null,
        body.extra1_tipo || 'fijo',
        body.extra2_descripcion || null,
        body.extra2_valor || null,
        body.extra2_tipo || 'fijo',
        body.extra3_descripcion || null,
        body.extra3_valor || null,
        body.extra3_tipo || 'fijo',
        total,
        body.confirmado ? 1 : 0,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, total_evento: total });
  } catch (error) {
    console.error('Error updating evento:', error);
    return NextResponse.json({ error: 'Error al actualizar evento' }, { status: 500 });
  }
}

// DELETE /api/eventos/[id] - Delete event
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

    // Only admin can delete
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin puede eliminar eventos' }, { status: 403 });
    }

    const { id } = await params;

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM eventos WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting evento:', error);
    return NextResponse.json({ error: 'Error al eliminar evento' }, { status: 500 });
  }
}
