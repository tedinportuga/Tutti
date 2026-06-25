import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const modeloLabels: Record<string, string> = {
  classica: 'Classica',
  sabores_do_mar: 'Sabores do Mar',
  especial: 'Especial',
  premium: 'Premium'
}

// Escapa caracteres especiais de strings PDF
function pdfEscape(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

// Gera um PDF mínimo (1 página) a partir de uma lista de linhas
function gerarPDF(linhas: { texto: string; tamanho: number; gap: number }[]) {
  let content = 'BT\n'
  let primeiro = true
  for (const l of linhas) {
    if (primeiro) {
      content += `/F1 ${l.tamanho} Tf\n70 780 Td\n(${pdfEscape(l.texto)}) Tj\n`
      primeiro = false
    } else {
      content += `/F1 ${l.tamanho} Tf\n0 -${l.gap} Td\n(${pdfEscape(l.texto)}) Tj\n`
    }
  }
  content += 'ET'

  const stream = Buffer.from(content, 'latin1')
  const objs: Buffer[] = []
  objs.push(Buffer.from('<< /Type /Catalog /Pages 2 0 R >>'))
  objs.push(Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'))
  objs.push(Buffer.from('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>'))
  objs.push(Buffer.concat([Buffer.from(`<< /Length ${stream.length} >>\nstream\n`), stream, Buffer.from('\nendstream')]))
  objs.push(Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'))

  let pdf = Buffer.from('%PDF-1.4\n')
  const offsets: number[] = []
  objs.forEach((o, i) => {
    offsets.push(pdf.length)
    pdf = Buffer.concat([pdf, Buffer.from(`${i + 1} 0 obj\n`), o, Buffer.from('\nendobj\n')])
  })
  const xrefPos = pdf.length
  let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`
  offsets.forEach(off => { xref += `${String(off).padStart(10, '0')} 00000 n \n` })
  xref += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`
  pdf = Buffer.concat([pdf, Buffer.from(xref)])
  return pdf
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const { data: vendas, error } = await supabase
      .from('vendas')
      .select('*')
      .gte('vendido_em', hoje.toISOString())
      .order('vendido_em', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const lista = vendas || []
    const total = lista.reduce((s, v) => s + v.quantidade, 0)

    // Mais vendida (por sabor)
    const porSabor: Record<string, number> = {}
    lista.forEach(v => { porSabor[v.sabor] = (porSabor[v.sabor] || 0) + v.quantidade })
    const topSabor = Object.entries(porSabor).sort((a, b) => b[1] - a[1])[0]

    // Por modelo
    const porModelo: Record<string, number> = {}
    lista.forEach(v => { porModelo[v.modelo] = (porModelo[v.modelo] || 0) + v.quantidade })

    // Pico de hora
    const porHora: Record<number, number> = {}
    lista.forEach(v => { porHora[v.hora] = (porHora[v.hora] || 0) + v.quantidade })
    const picoEntry = Object.entries(porHora).sort((a, b) => b[1] - a[1])[0]
    const picoHora = picoEntry ? `${picoEntry[0]}h` : '—'

    const dataStr = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    // Monta linhas do PDF
    const linhas: { texto: string; tamanho: number; gap: number }[] = [
      { texto: 'Tutti Pizzaria', tamanho: 24, gap: 0 },
      { texto: 'Relatorio do dia', tamanho: 14, gap: 30 },
      { texto: dataStr, tamanho: 11, gap: 22 },
      { texto: '', tamanho: 11, gap: 20 },
      { texto: `Total de pizzas: ${total}`, tamanho: 14, gap: 24 },
      { texto: `Mais vendida: ${topSabor ? `${topSabor[0]} (${topSabor[1]})` : '—'}`, tamanho: 12, gap: 22 },
      { texto: `Pico de hora: ${picoHora}`, tamanho: 12, gap: 22 },
      { texto: '', tamanho: 11, gap: 18 },
      { texto: 'Por modelo:', tamanho: 13, gap: 24 },
    ]
    for (const [modelo, qtd] of Object.entries(porModelo).sort((a, b) => b[1] - a[1])) {
      linhas.push({ texto: `   ${modeloLabels[modelo] || modelo}: ${qtd}`, tamanho: 11, gap: 20 })
    }

    const pdf = gerarPDF(linhas)
    const base64 = pdf.toString('base64')

    // Envia o PDF por WhatsApp
    const apiUrl = process.env.EVOLUTION_API_URL
    const apiKey = process.env.EVOLUTION_API_KEY
    const instance = process.env.EVOLUTION_INSTANCE
    const gerente = process.env.GERENTE_WHATSAPP

    if (!apiUrl || !apiKey || !instance || !gerente) {
      return NextResponse.json({ error: 'WhatsApp não configurado', total }, { status: 500 })
    }

    const resumo = `📊 *Tutti Pizzaria — Relatório do dia*\n\n📅 ${dataStr}\n\n🍕 Total: *${total} pizzas*\n⭐ Mais vendida: *${topSabor ? topSabor[0] : '—'}*\n🕐 Pico de hora: *${picoHora}*\n\nRelatório completo em PDF em anexo 👇`

    // 1. Mensagem de texto com o resumo
    await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
      body: JSON.stringify({ number: gerente, text: resumo })
    }).catch(() => {})

    // 2. PDF em anexo
    const dataFicheiro = new Date().toISOString().slice(0, 10)
    const envio = await fetch(`${apiUrl}/message/sendMedia/${instance}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
      body: JSON.stringify({
        number: gerente,
        mediatype: 'document',
        mimetype: 'application/pdf',
        fileName: `relatorio-tutti-${dataFicheiro}.pdf`,
        caption: `📄 Relatório ${dataFicheiro}`,
        media: base64
      })
    })

    const envioData = await envio.json()
    return NextResponse.json({ success: true, total, picoHora, topSabor: topSabor?.[0] || null, envio: envioData })
  } catch (err) {
    console.error('Erro no export:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
