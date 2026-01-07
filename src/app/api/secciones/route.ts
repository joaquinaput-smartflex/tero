import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { SeccionCarta, ApiResponse } from '@/types';

// GET /api/secciones - List all menu sections
export async function GET() {
  try {
    const secciones = await query<SeccionCarta[]>(
      'SELECT * FROM secciones_carta ORDER BY orden'
    );

    return NextResponse.json<ApiResponse<SeccionCarta[]>>({
      success: true,
      data: secciones,
    });
  } catch (error) {
    console.error('Error fetching secciones:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener secciones',
    }, { status: 500 });
  }
}
