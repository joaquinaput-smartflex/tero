import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET /api/menus-evento - List all event menus
export async function GET() {
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

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM menus_evento WHERE activo = 1 ORDER BY nombre`
    );

    // Parse JSON fields
    const menus = rows.map(row => ({
      ...row,
      categorias: typeof row.categorias === 'string' ? JSON.parse(row.categorias) : row.categorias,
      extras: typeof row.extras === 'string' ? JSON.parse(row.extras) : row.extras
    }));

    return NextResponse.json(menus);
  } catch (error) {
    console.error('Error fetching menus:', error);
    return NextResponse.json({ error: 'Error al obtener menus' }, { status: 500 });
  }
}

// POST /api/menus-evento - Create new menu template
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

    // Only admin can create menus
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin puede crear menus' }, { status: 403 });
    }

    const body = await request.json();

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO menus_evento (nombre, tipo, categorias, extras)
       VALUES (?, ?, ?, ?)`,
      [
        body.nombre,
        body.tipo || 'standard',
        JSON.stringify(body.categorias || []),
        JSON.stringify(body.extras || [])
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu:', error);
    return NextResponse.json({ error: 'Error al crear menu' }, { status: 500 });
  }
}
