import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 1. Insere na tabela 'vendas'
    const { data: venda, error } = await supabaseAdmin!
      .from('vendas')
      .insert({
        pizza_id: body.items[0]?.pizza?.id,
        quantidade: body.items[0]?.quantidade,
      })
      .select('*, pizzas:pizza_id(sabor, modelo)')
      .single()

    if (error) throw error

    // 2. Busca dados da pizza (já retornado acima com select)
    const sabor = venda.pizzas?.sabor
    const modelo = venda.pizzas?.modelo
    const hora = new Date(venda.vendido_em).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })

    // 3. Chama /api/notificacao para WhatsApp
    await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/notificacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sabor,
        modelo,
        quantidade: body.items[0]?.quantidade,
        hora,
        total: body.items[0]?.quantidade,
      }),
    })

    // 4. Retorna { success: true, venda }
    return NextResponse.json({ success: true, venda })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
