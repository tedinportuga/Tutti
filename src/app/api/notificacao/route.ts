import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sabor, modelo, qty, hora, totalDia } = body

    const apiUrl = process.env.EVOLUTION_API_URL
    const apiKey = process.env.EVOLUTION_API_KEY
    const instance = process.env.EVOLUTION_INSTANCE
    const gerente = process.env.GERENTE_WHATSAPP

    if (!apiUrl || !apiKey || !instance || !gerente) {
      return NextResponse.json({ error: 'WhatsApp não configurado' }, { status: 500 })
    }

    const mensagem = `🍕 *Tutti Pizzaria · ${hora}*\n\nNova saída registada\n*${sabor}* — ${modelo}\nQuantidade: ×${qty}\n\nTotal do dia: *${totalDia} pizzas*`

    const response = await fetch(
      `${apiUrl}/message/sendText/${instance}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          number: gerente,
          text: mensagem
        })
      }
    )

    const data = await response.json()
    console.log('Evolution API response:', JSON.stringify(data))
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Erro:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
