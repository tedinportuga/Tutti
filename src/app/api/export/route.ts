import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const html = `
      <html>
      <body style="font-family: Arial; padding: 40px;">
        <h1>Tutti Pizzaria - Relatório do Dia</h1>
        <p><strong>Data:</strong> ${today.toLocaleDateString('pt-PT')}</p>
        <p><strong>Total Vendas:</strong> 0</p>
        <p><strong>Total Pizzas:</strong> 0</p>
        <p style="color: #666; margin-top: 20px;">Nenhum dado disponível no momento.</p>
      </body>
      </html>
    `

    const buffer = Buffer.from(html)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="vendas_${today.toISOString().split('T')[0]}.pdf"`
      }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
