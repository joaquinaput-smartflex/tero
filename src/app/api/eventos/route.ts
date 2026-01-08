import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET /api/eventos - List events with filters
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const mes = searchParams.get('mes');
    const anio = searchParams.get('anio');
    const confirmado = searchParams.get('confirmado');
    const vendedor = searchParams.get('vendedor');
    const search = searchParams.get('search');

    let query = `
      SELECT
        e.*,
        m.nombre as menu_nombre,
        COALESCE(SUM(CASE WHEN p.concepto IN ('pago', 'sena') THEN p.monto ELSE 0 END), 0) as total_pagado,
        COALESCE(SUM(CASE WHEN p.concepto = 'sena' THEN p.monto ELSE 0 END), 0) as total_senas,
        COALESCE(SUM(CASE WHEN p.concepto = 'ajuste_ipc' THEN p.monto ELSE 0 END), 0) as ajuste_ipc,
        e.total_evento - COALESCE(SUM(CASE WHEN p.concepto IN ('pago', 'sena') THEN p.monto ELSE 0 END), 0) as saldo_pendiente
      FROM eventos e
      LEFT JOIN menus_evento m ON e.menu_id = m.id
      LEFT JOIN pagos_evento p ON p.evento_id = e.id
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (mes && anio) {
      query += ' AND MONTH(e.fecha) = ? AND YEAR(e.fecha) = ?';
      params.push(parseInt(mes), parseInt(anio));
    } else if (anio) {
      query += ' AND YEAR(e.fecha) = ?';
      params.push(parseInt(anio));
    }

    if (confirmado !== null && confirmado !== '') {
      query += ' AND e.confirmado = ?';
      params.push(confirmado === 'true' ? 1 : 0);
    }

    if (vendedor) {
      query += ' AND e.vendedor = ?';
      params.push(vendedor);
    }

    if (search) {
      query += ' AND (e.cliente LIKE ? OR e.telefono LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY e.id ORDER BY e.fecha DESC, e.hora_inicio ASC';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching eventos:', error);
    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 });
  }
}

// POST /api/eventos - Create new event
export async function POST(request: Request) {
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

    // Only admin and chef can create events
    if (payload.role === 'viewer') {
      return NextResponse.json({ error: 'Sin permisos para crear eventos' }, { status: 403 });
    }

    const body = await request.json();

    // Calculate total
    let total = 0;
    total += (body.adultos || 0) * (body.precio_adulto || 0);
    total += (body.menores || 0) * (body.precio_menor || 0);

    // Extras
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
      `INSERT INTO eventos (
        fecha, cliente, telefono, turno, hora_inicio, hora_fin,
        vendedor, tipo_evento, salon, menu_id, menu_detalle,
        tecnica, dj, tecnica_superior, otros,
        adultos, precio_adulto, menores, precio_menor,
        extra1_descripcion, extra1_valor, extra1_tipo,
        extra2_descripcion, extra2_valor, extra2_tipo,
        extra3_descripcion, extra3_valor, extra3_tipo,
        total_evento, confirmado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        body.confirmado ? 1 : 0
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      total_evento: total
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating evento:', error);
    return NextResponse.json({ error: 'Error al crear evento' }, { status: 500 });
  }
}
