import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/events
 * Retorna lista de eventos/cultos
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Conectar com banco de dados
    const events = [
      {
        id: 1,
        title: 'Culto Domingo',
        date: '2024-08-11',
        time: '18:00',
        location: 'Templo Principal',
      },
      {
        id: 2,
        title: 'Estudo Bíblico',
        date: '2024-08-14',
        time: '19:30',
        location: 'Sala de Reuniões',
      },
    ];

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar eventos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Cria novo evento
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Validar e salvar no banco de dados
    const newEvent = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, data: newEvent, message: 'Evento criado com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao criar evento' },
      { status: 400 }
    );
  }
}
