import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sabor, modelo, qty } = body

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const agora = new Date()
    const diaSemana = agora.getDay()
    const hora = agora.getHours()

    const { data, error } = await supabase
      .from('vendas')
      .insert({
        sabor,
        modelo,
        quantidade: qty,
        vendido_em: agora.toISOString(),
        dia_semana: diaSemana,
        hora: hora
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
