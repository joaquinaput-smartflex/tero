import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Proveedor, ApiResponse } from '@/types';

// GET /api/proveedores - List all providers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activo = searchParams.get('activo');

    let sql = 'SELECT * FROM proveedores';
    const params: boolean[] = [];

    if (activo !== null) {
      sql += ' WHERE activo = ?';
      params.push(activo === 'true');
    }

    sql += ' ORDER BY nombre';

    const proveedores = await query<Proveedor[]>(sql, params);

    return NextResponse.json<ApiResponse<Proveedor[]>>({
      success: true,
      data: proveedores,
    });
  } catch (error) {
    console.error('Error fetching proveedores:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener proveedores',
    }, { status: 500 });
  }
}

// POST /api/proveedores - Create new provider
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, contacto, telefono } = body;

    if (!nombre) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'El nombre es requerido',
      }, { status: 400 });
    }

    const result = await query<{ insertId: number }>(
      'INSERT INTO proveedores (nombre, contacto, telefono) VALUES (?, ?, ?)',
      [nombre, contacto || null, telefono || null]
    );

    return NextResponse.json<ApiResponse<{ id: number }>>({
      success: true,
      data: { id: (result as unknown as { insertId: number }).insertId },
      message: 'Proveedor creado correctamente',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating proveedor:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear proveedor',
    }, { status: 500 });
  }
}
