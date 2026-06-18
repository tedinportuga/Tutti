'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { TuttiLogo, TuttiLogoSmall } from '@/components/TuttiLogo'
import { CORES } from '@/lib/constants'

const { V, VM, O, C, F } = CORES

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
)
const LiveDot = () => (
  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', flexShrink: 0 }}/>
)

export default function GestaoPage() {
  const router = useRouter()
  const [showPdf, setShowPdf] = useState(false)
  const [vendas, setVendas] = useState<any[]>([])
  const [showReset, setShowReset] = useState(false)
  const [senhaInput, setSenhaInput] = useState('')
  const [resetErro, setResetErro] = useState(false)
  const [resetOk, setResetOk] = useState(false)
  const [heatmapData, setHeatmapData] = useState(
    Array(7).fill(null).map(() => Array(10).fill(0))
  )

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function fetchVendas() {
      const hoje = new Date()
      hoje.setHours(0,0,0,0)
      console.log('Fetching vendas desde:', hoje.toISOString())

      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .gte('vendido_em', hoje.toISOString())
        .order('vendido_em', { ascending: false })

      console.log('Vendas:', data, 'Erro:', error)
      if (data) setVendas(data)
    }

    // Calcula heatmap dos últimos 30 dias
    async function fetchHeatmap() {
      const { data } = await supabase
        .from('vendas')
        .select('dia_semana, hora, quantidade')

      const matriz = Array(7).fill(null).map(() => Array(10).fill(0))

      if (data) {
        data.forEach(v => {
          const diaIndex = v.dia_semana === 0 ? 6 : v.dia_semana - 1
          const horaIndex = v.hora - 14
          if (horaIndex >= 0 && horaIndex < 10 && diaIndex >= 0 && diaIndex < 7) {
            matriz[diaIndex][horaIndex] += v.quantidade
          }
        })
      }

      setHeatmapData(matriz)
    }

    fetchVendas()
    fetchHeatmap()

    // Real-time
    const channel = supabase
      .channel('vendas')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vendas' },
        () => fetchVendas())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function handleReset() {
    if (senhaInput !== 'Carol123') {
      setResetErro(true)
      setTimeout(() => setResetErro(false), 2000)
      return
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.from('vendas').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    setVendas([])
    setResetOk(true)
    setShowReset(false)
    setSenhaInput('')
    setTimeout(() => setResetOk(false), 3000)
  }

  const agora = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
  const hoje = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
  const total = vendas.reduce((s, v) => s + v.quantidade, 0)
  const topSabor = vendas.length > 0 ? [...vendas].sort((a,b) => b.quantidade - a.quantidade)[0].sabor : '—'

  const dias = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']
  const horas = ['14','15','16','17','18','19','20','21','22','23']
  const mx = 16
  const cel = (v: number) => v===0?'#EDE8DF':v/mx<0.25?'#B8D4C0':v/mx<0.5?'#5A9970':v/mx<0.75?VM:V

  const picoHora = vendas.length > 0
    ? (() => {
        const contagem: Record<number,number> = {}
        vendas.forEach(v => {
          const h = new Date(v.vendido_em).getHours()
          contagem[h] = (contagem[h]||0) + v.quantidade
        })
        const pico = Object.entries(contagem).sort((a,b)=>b[1]-a[1])[0]
        return pico ? pico[0]+'h' : '—'
      })()
    : '—'

  console.log('Modelos nas vendas:', vendas.map(v => v.modelo))

  const modelosData = [
    { m: 'Sabores do Mar', c: vendas.filter(v=>v.modelo==='Sabores do Mar').reduce((s,v)=>s+v.quantidade,0), p: 0 },
    { m: 'Clássica', c: vendas.filter(v=>v.modelo==='Clássica').reduce((s,v)=>s+v.quantidade,0), p: 0 },
    { m: 'Especial', c: vendas.filter(v=>v.modelo==='Especial').reduce((s,v)=>s+v.quantidade,0), p: 0 },
    { m: 'Premium', c: vendas.filter(v=>v.modelo==='Premium').reduce((s,v)=>s+v.quantidade,0), p: 0 },
  ].map(m => ({ ...m, p: total > 0 ? Math.round(m.c / total * 100) : 0 }))
  const barColors = [V, VM, '#5A9970', '#9FC4A8']

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="app-sidebar">
        <div>
          <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9FC4A8', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, padding: 0 }}>
            <BackIcon /> Voltar
          </button>
          <TuttiLogoSmall />
          <div style={{ fontSize: 10, letterSpacing: '0.1em', color: '#6B9E7A', marginBottom: 6 }}>DASHBOARD</div>
          <div style={{ width: 28, height: 1, background: O, marginBottom: 12 }} />
          <p style={{ fontSize: 12, textTransform: 'capitalize', lineHeight: 1.8, color: '#6B9E7A' }}>{hoje}<br />{agora}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Pizzas hoje', value: String(total), live: true },
            { label: 'Pico de hora', value: picoHora, live: false },
            { label: 'Mais vendida', value: topSabor, live: false },
          ].map(k => (
            <div key={k.label} style={{ borderRadius: 13, padding: '12px 14px', background: '#142D22' }}>
              <div style={{ fontSize: 11, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, color: '#6B9E7A' }}>
                {k.live && <LiveDot />} {k.label}
              </div>
              <div className="font-display" style={{ fontSize: 19, color: C }}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Conteúdo com scroll */}
      <div className="app-main">
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px 80px' }}>

          {showPdf ? (
            <>
              <button onClick={() => setShowPdf(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: VM, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 18, padding: 0 }}>
                <BackIcon /> Voltar ao dashboard
              </button>
              <div style={{ fontSize: 10, letterSpacing: '0.08em', color: VM, marginBottom: 14, textAlign: 'center' }}>PRÉ-VISUALIZAÇÃO DO PDF</div>
              {/* PDF Preview */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', border: '1px solid #D8D0C4' }}>
                <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: `2px solid ${V}` }}>
                  <img src="/logo.jpg" alt="Tutti Pizzaria" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 12, margin: '0 auto 10px', display: 'block', background: V }} />
                  <div style={{ fontSize: 9, color: '#9FC4A8', textTransform: 'uppercase', letterSpacing: 2 }}>Relatório de vendas do dia</div>
                  <div style={{ fontSize: 11, color: '#6B9E7A', marginTop: 3, textTransform: 'capitalize' }}>{hoje}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                  {[{ label: 'Total', value: String(total) }, { label: 'Registos', value: String(vendas.length) }, { label: 'Pico', value: '20h' }].map(k => (
                    <div key={k.label} style={{ background: F, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#9FC4A8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{k.label}</div>
                      <div className="font-display" style={{ fontSize: 20, color: V }}>{k.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, color: '#9FC4A8', marginBottom: 8 }}>Por modelo</div>
                  {modelosData.map(m => (
                    <div key={m.m} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #F0EAE0', fontSize: 12 }}>
                      <span style={{ color: V }}>{m.m}</span>
                      <span style={{ color: O, fontWeight: 600 }}>{m.c} un.</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, color: '#9FC4A8', marginBottom: 8 }}>Detalhe</div>
                  {vendas.map((v, i) => {
                    const hora = new Date(v.vendido_em).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #F5F0EA', fontSize: 11 }}>
                        <span style={{ color: '#9FC4A8', minWidth: 40 }}>{hora}</span>
                        <span style={{ color: V, flex: 1, paddingLeft: 8 }}>{v.sabor}</span>
                        <span style={{ color: O, fontWeight: 600 }}>×{v.quantidade}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid #D8D0C4', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#C8C0B8', textTransform: 'uppercase', letterSpacing: 2 }}>Tutti Pizzaria · Algarve · +351 925 748 282</div>
                </div>
              </div>
              <button onClick={() => setShowPdf(false)} className="font-display" style={{ width: '100%', marginTop: 18, padding: 18, borderRadius: 14, fontSize: 20, background: O, color: '#fff', border: 'none', cursor: 'pointer' }}>
                Descarregar PDF
              </button>
            </>
          ) : (
            <>
              {/* Mobile header */}
              <div style={{ marginBottom: 22 }} className="md:hidden">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: VM, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <BackIcon /> Voltar
                  </button>
                  <TuttiLogo size={44} />
                </div>
                <h1 className="font-display" style={{ fontSize: 28, color: V }}>Dashboard</h1>
                <p style={{ fontSize: 12, textTransform: 'capitalize', marginTop: 4, color: '#6B9E7A' }}>{hoje} · {agora}</p>
              </div>

              {/* Heatmap */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', color: VM, marginBottom: 12 }}>HEATMAP — HORA × DIA</div>
                <div style={{ borderRadius: 18, padding: 18, background: '#fff', border: '1.5px solid #D8D0C4' }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 6, paddingLeft: 34 }}>
                    {horas.map(h => <div key={h} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: '#9FC4A8' }}>{h}h</div>)}
                  </div>
                  {heatmapData.map((row, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 3 }}>
                      <div style={{ width: 30, textAlign: 'right', paddingRight: 5, fontSize: 9, color: '#9FC4A8', flexShrink: 0 }}>{dias[i]}</div>
                      {row.map((v, j) => <div key={j} style={{ flex: 1, borderRadius: 3, background: cel(v), height: 20 }} />)}
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, marginTop: 10 }}>
                    {['#EDE8DF','#B8D4C0','#5A9970',VM,V].map((c, i) => <div key={i} style={{ width: 13, height: 13, borderRadius: 3, background: c }} />)}
                    <span style={{ fontSize: 9, marginLeft: 4, color: '#9FC4A8' }}>menos → mais</span>
                  </div>
                </div>
              </div>

              {/* Modelos */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', color: VM, marginBottom: 12 }}>MODELO MAIS POPULAR</div>
                <div style={{ borderRadius: 18, padding: 18, background: '#fff', border: '1.5px solid #D8D0C4' }}>
                  {modelosData.map((m, i) => (
                    <div key={m.m} style={{ marginBottom: i < modelosData.length - 1 ? 14 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: V }}>{m.m}</span>
                        <span style={{ fontSize: 12, color: '#9FC4A8' }}>{m.c} pizzas</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: F }}>
                        <div style={{ height: 6, borderRadius: 999, width: `${m.p}%`, background: barColors[i] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Histórico */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', color: VM, marginBottom: 12 }}>HISTÓRICO DE HOJE</div>
                <div style={{ borderRadius: 18, overflow: 'hidden', background: '#fff', border: '1.5px solid #D8D0C4' }}>
                  {vendas.map((v, i) => {
                    const hora = new Date(v.vendido_em).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderBottom: i < vendas.length - 1 ? '1px solid #F0EAE0' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: V, fontVariantNumeric: 'tabular-nums' }}>{hora}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: V }}>{v.sabor}</div>
                            <div style={{ fontSize: 11, color: '#9FC4A8' }}>{v.modelo}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: O }}>×{v.quantidade}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={() => setShowReset(true)}
                style={{ width: '100%', padding: 18, borderRadius: 14, fontSize: 16,
                  background: '#fff', color: '#1B3A2D', border: '1.5px solid #D8D0C4',
                  cursor: 'pointer', marginBottom: 12 }}>
                Resetar vendas do dia
              </button>

              <button onClick={() => setShowPdf(true)} className="font-display"
                style={{ width: '100%', padding: 18, borderRadius: 14, fontSize: 21, background: O, color: '#fff', border: 'none', cursor: 'pointer' }}>
                Exportar PDF do dia
              </button>
            </>
          )}
        </div>
      </div>

      {showReset && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: 320 }}>
            <h3 className="font-display" style={{ fontSize: 22, color: '#1B3A2D', marginBottom: 8 }}>
              Confirmar reset
            </h3>
            <p style={{ fontSize: 13, color: '#9FC4A8', marginBottom: 20 }}>
              Insere a senha para apagar todas as vendas de hoje.
            </p>
            <input
              type="password"
              placeholder="Senha"
              value={senhaInput}
              onChange={e => setSenhaInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10,
                border: resetErro ? '2px solid #D4751A' : '1.5px solid #D8D0C4',
                fontSize: 15, marginBottom: 8, outline: 'none', boxSizing: 'border-box' }}
            />
            {resetErro && (
              <p style={{ fontSize: 12, color: '#D4751A', marginBottom: 8 }}>Senha incorrecta</p>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => { setShowReset(false); setSenhaInput('') }}
                style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 14,
                  background: '#fff', border: '1.5px solid #D8D0C4', color: '#1B3A2D', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleReset}
                style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 14,
                  background: '#D4751A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {resetOk && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#1B3A2D', color: '#F5E6C8', padding: '12px 24px', borderRadius: 12, fontSize: 14 }}>
          ✓ Vendas resetadas com sucesso
        </div>
      )}
    </div>
  )
}
