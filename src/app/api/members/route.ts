import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/members
 * Retorna lista de membros da igreja
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Conectar com banco de dados
    const members = [
      { id: 1, name: 'João Silva', email: 'joao@email.com', joinDate: '2023-01-15' },
      { id: 2, name: 'Maria Santos', email: 'maria@email.com', joinDate: '2023-03-20' },
    ];

    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar membros' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/members
 * Cria novo membro
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Validar e salvar no banco de dados
    const newMember = {
      id: Date.now(),
      ...body,
      joinDate: new Date().toISOString().split('T')[0],
    };

    return NextResponse.json(
      { success: true, data: newMember, message: 'Membro criado com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao criar membro' },
      { status: 400 }
    );
  }
}
