import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sabor, modelo, qty, hora, totalDia } = body

    const instanceId = process.env.ZAPI_INSTANCE_ID
    const token = process.env.ZAPI_TOKEN
    const gerente = process.env.GERENTE_WHATSAPP

    console.log('WhatsApp config:', { instanceId: !!instanceId, token: !!token, gerente })

    if (!instanceId || !token || !gerente) {
      console.log('Variáveis em falta!')
      return NextResponse.json({ error: 'WhatsApp não configurado' }, { status: 500 })
    }

    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`
    const mensagem = `🍕 *Tutti Pizzaria · ${hora}*\n\nNova saída registada\n*${sabor}* — ${modelo}\nQuantidade: ×${qty}\n\nTotal do dia: *${totalDia} pizzas*`

    console.log('Enviando para:', gerente)
    console.log('URL:', url)
    console.log('Mensagem:', mensagem)

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: gerente, message: mensagem })
    })

    console.log('Status da resposta:', response.status)
    const data = await response.json()
    console.log('Resposta da Z-API:', data)

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Erro ao enviar WhatsApp:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
