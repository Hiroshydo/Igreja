import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ministries
 * Retorna lista de ministérios
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Conectar com banco de dados
    const ministries = [
      {
        id: 1,
        name: 'Ministério de Louvor',
        description: 'Responsável pela música durante os cultos',
        leader: 'Pedro Costa',
        members: 12,
      },
      {
        id: 2,
        name: 'Ministério de Crianças',
        description: 'Acompanhamento e educação de crianças',
        leader: 'Ana Silva',
        members: 8,
      },
      {
        id: 3,
        name: 'Ministério de Visitação',
        description: 'Visitas a membros e necessitados',
        leader: 'Carlos Santos',
        members: 15,
      },
    ];

    return NextResponse.json({ success: true, data: ministries });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar ministérios' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ministries
 * Cria novo ministério
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Validar e salvar no banco de dados
    const newMinistry = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, data: newMinistry, message: 'Ministério criado com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao criar ministério' },
      { status: 400 }
    );
  }
}
