import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sabor, modelo, qty, hora, totalDia } = body

    const instanceId = process.env.ZAPI_INSTANCE_ID
    const token = process.env.ZAPI_TOKEN
    const gerente = process.env.GERENTE_WHATSAPP

    if (!instanceId || !token || !gerente) {
      return NextResponse.json({ error: 'WhatsApp não configurado' }, { status: 500 })
    }

    const mensagem = `🍕 *Tutti Pizzaria · ${hora}*\n\nNova saída registada\n*${sabor}* — ${modelo}\nQuantidade: ×${qty}\n\nTotal do dia: *${totalDia} pizzas*`

    const response = await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: gerente, message: mensagem })
      }
    )

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
