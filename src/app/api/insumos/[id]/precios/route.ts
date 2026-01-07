import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/insumos/[id]/precios - Add new price for insumo
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { precio, fecha } = body;

    if (!precio) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'El precio es requerido',
      }, { status: 400 });
    }

    // Get insumo details for cost calculation
    const insumos = await query<{ iva_porcentaje: number; merma_porcentaje: number }[]>(
      'SELECT iva_porcentaje, merma_porcentaje FROM insumos WHERE id = ?',
      [id]
    );

    if (insumos.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Insumo no encontrado',
      }, { status: 404 });
    }

    const { iva_porcentaje, merma_porcentaje } = insumos[0];

    // Calculate costs
    const precio_num = parseFloat(precio);
    const costo_con_iva = precio_num * (1 + iva_porcentaje / 100);
    const costo_final = costo_con_iva * (1 + merma_porcentaje / 100);

    const result = await query<{ insertId: number }>(
      `INSERT INTO precios (insumo_id, precio, fecha, precio_unitario, costo_con_iva, costo_final)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, precio_num, fecha || new Date(), precio_num, costo_con_iva, costo_final]
    );

    // Update insumo's updated_at
    await query('UPDATE insumos SET updated_at = NOW() WHERE id = ?', [id]);

    return NextResponse.json<ApiResponse<{ id: number; costo_final: number }>>({
      success: true,
      data: {
        id: (result as unknown as { insertId: number }).insertId,
        costo_final,
      },
      message: 'Precio registrado correctamente',
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding price:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al registrar precio',
    }, { status: 500 });
  }
}
