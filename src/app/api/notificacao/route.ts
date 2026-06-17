import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { sabor, modelo, quantidade, hora, total } = await req.json()

    // Formato da mensagem para WhatsApp
    const message = `🍕 Tutti Pizzaria · ${hora}
Nova saída registada
${sabor} — ${modelo}
Quantidade: ×${quantidade}
Total do dia: ${total} pizzas`

    // Envia via Evolution API
    const response = await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EVOLUTION_API_KEY}`,
      },
      body: JSON.stringify({
        number: process.env.GERENTE_WHATSAPP,
        text: message,
      }),
    })

    if (!response.ok) {
      throw new Error('Falha ao enviar mensagem WhatsApp')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
