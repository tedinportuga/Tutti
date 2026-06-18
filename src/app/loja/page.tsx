'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { TuttiLogo, TuttiLogoSmall } from '@/components/TuttiLogo'
import { PIZZAS, CORES } from '@/lib/constants'

const { V, VM, O, C, F } = CORES

type Modelo = 'classica' | 'mar' | 'especial' | 'premium' | null
type ItemCarrinho = { modelo: string; modeloLabel: string; sabor: string; qty: number }

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
)
const CheckIcon = ({ size = 18, color = O }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
)
const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={O} stroke="none">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)
const LiveDot = () => (
  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', flexShrink: 0 }}/>
)

export default function LojaPage() {
  const router = useRouter()
  const [modelo, setModelo] = useState<Modelo>(null)
  const [sabor, setSabor] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [fase, setFase] = useState<'form' | 'carrinho' | 'sucesso'>('form')
  const [showWpp, setShowWpp] = useState(false)
  const [totalHoje, setTotalHoje] = useState(0)

  useEffect(() => {
    async function fetchTotal() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const hoje = new Date()
      hoje.setHours(0,0,0,0)

      const { data } = await supabase
        .from('vendas')
        .select('quantidade')
        .gte('vendido_em', hoje.toISOString())

      if (data) {
        const total = data.reduce((s, v) => s + v.quantidade, 0)
        setTotalHoje(total)
      }
    }
    fetchTotal()
  }, [])

  const agora = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
  const totalCarrinho = carrinho.reduce((s, i) => s + i.qty, 0)

  function adicionarAoCarrinho() {
    if (!modelo || !sabor) return
    const existing = carrinho.findIndex(i => i.sabor === sabor && i.modelo === modelo)
    if (existing >= 0) {
      const novo = [...carrinho]
      novo[existing].qty += qty
      setCarrinho(novo)
    } else {
      setCarrinho(prev => [...prev, {
        modelo,
        modeloLabel: PIZZAS[modelo].label,
        sabor,
        qty
      }])
    }
    setModelo(null)
    setSabor(null)
    setQty(1)
  }

  function removerDoCarrinho(index: number) {
    setCarrinho(prev => prev.filter((_, i) => i !== index))
  }

  function alterarQty(index: number, delta: number) {
    const novo = [...carrinho]
    novo[index].qty = Math.max(1, novo[index].qty + delta)
    setCarrinho(novo)
  }

  async function confirmarCarrinho() {
    if (carrinho.length === 0) return
    setFase('sucesso')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    for (const item of carrinho) {
      await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sabor: item.sabor, modelo: item.modelo, qty: item.qty })
      }).catch(() => {})
    }

    const hoje = new Date()
    hoje.setHours(0,0,0,0)
    const { data } = await supabase
      .from('vendas')
      .select('quantidade')
      .gte('vendido_em', hoje.toISOString())
    if (data) setTotalHoje(data.reduce((s, v) => s + v.quantidade, 0))

    setTimeout(() => setShowWpp(true), 900)
    setTimeout(() => {
      setFase('form')
      setCarrinho([])
      setShowWpp(false)
    }, 6000)
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="app-sidebar">
        <div>
          <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9FC4A8', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 28, padding: 0 }}>
            <BackIcon /> Voltar
          </button>
          <TuttiLogoSmall />
          <div style={{ width: 28, height: 1, background: O, marginBottom: 16 }} />
          <p style={{ fontSize: 12, lineHeight: 1.7, color: '#6B9E7A' }}>
            Adiciona pizzas ao carrinho e confirma tudo de uma vez.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ borderRadius: 14, padding: 16, background: '#142D22' }}>
            <div style={{ fontSize: 11, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, color: '#6B9E7A' }}>
              <LiveDot /> Ao vivo hoje
            </div>
            <div className="font-display" style={{ fontSize: 38, color: C }}>{totalHoje}</div>
            <div style={{ fontSize: 11, marginTop: 2, color: '#6B9E7A' }}>pizzas saídas</div>
          </div>
          {carrinho.length > 0 && (
            <div style={{ borderRadius: 14, padding: 14, background: '#142D22' }}>
              <div style={{ fontSize: 11, marginBottom: 8, color: '#6B9E7A' }}>No carrinho</div>
              {carrinho.map((item, i) => (
                <div key={i} style={{ fontSize: 12, color: C, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.sabor}</span>
                  <span style={{ color: O }}>×{item.qty}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #2E5E45', marginTop: 8, paddingTop: 8, fontSize: 12, color: '#9FC4A8', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total</span>
                <span style={{ color: C, fontWeight: 500 }}>×{totalCarrinho}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="app-main">
        <div style={{ maxWidth: 580, margin: '0 auto', padding: '32px 24px 80px' }}>

          {/* Mobile header */}
          <div style={{ marginBottom: 28 }} className="md:hidden">
            <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: VM, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
              <BackIcon /> Voltar
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <TuttiLogo size={52} />
              <div style={{ textAlign: 'right' }}>
                <div className="font-display" style={{ fontSize: 22, color: V }}>{totalHoje}</div>
                <div style={{ fontSize: 10, color: '#9FC4A8' }}>hoje</div>
              </div>
            </div>
          </div>

          {/* SUCESSO */}
          {fase === 'sucesso' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ borderRadius: 22, padding: 28, background: V, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: VM, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <CheckIcon size={26} color={C} />
                </div>
                <h2 className="font-display" style={{ fontSize: 28, color: C, marginBottom: 6 }}>Registado!</h2>
                <p style={{ fontSize: 13, color: '#9FC4A8', marginBottom: 12 }}>{totalCarrinho} pizzas registadas às {agora}</p>
                <div style={{ background: '#142D22', borderRadius: 12, padding: 12 }}>
                  {carrinho.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C, marginBottom: i < carrinho.length - 1 ? 6 : 0 }}>
                      <span>{item.sabor}</span>
                      <span style={{ color: O }}>×{item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ transition: 'opacity 0.4s, transform 0.4s', opacity: showWpp ? 1 : 0, transform: showWpp ? 'translateY(0)' : 'translateY(14px)' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.08em', color: VM, marginBottom: 10, textAlign: 'center' }}>MENSAGEM ENVIADA À GERENTE</div>
                <div style={{ background: '#ECE5DD', borderRadius: 16, padding: 16, maxWidth: 300, margin: '0 auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #D5CEC7' }}>
                    <img src="/logo.jpg" alt="Tutti" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', flexShrink: 0, background: V }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: V }}>Tutti Pizzaria</div>
                      <div style={{ fontSize: 11, color: '#667781' }}>sistema interno</div>
                    </div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: '4px 14px 14px 14px', padding: '10px 14px' }}>
                    <div style={{ fontSize: 12, color: '#667781', marginBottom: 6 }}>🍕 Tutti · {agora}</div>
                    <div style={{ fontSize: 13, color: '#111', lineHeight: 1.6 }}>
                      {carrinho.map((item, i) => (
                        <div key={i}><strong>{item.sabor}</strong> ×{item.qty}</div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid #F0EAE0', fontSize: 12, color: '#667781' }}>
                      Total do dia: <strong style={{ color: V }}>{totalHoje + totalCarrinho} pizzas</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FORMULÁRIO */}
          {fase === 'form' && (
            <>
              {/* Modelos */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', color: VM, marginBottom: 12 }}>MODELO</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {Object.entries(PIZZAS).map(([key, p]) => {
                    const sel = modelo === key
                    return (
                      <button key={key} onClick={() => { setModelo(key as Modelo); setSabor(null) }}
                        style={{ borderRadius: 16, overflow: 'hidden', border: sel ? `2px solid ${O}` : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s', transform: sel ? 'scale(1.03)' : 'scale(1)', padding: 0, background: 'none', position: 'relative', minHeight: 120 }}>
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${p.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        <div style={{ position: 'absolute', inset: 0, background: sel ? 'rgba(27,58,45,0.78)' : 'rgba(20,40,28,0.55)', transition: 'background 0.2s' }} />
                        <div style={{ position: 'relative', zIndex: 1, padding: '16px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: 120 }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{sel && <StarIcon />}</div>
                          <span className="font-display" style={{ fontSize: 17, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{p.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sabores */}
              {modelo ? (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', color: VM, marginBottom: 12 }}>SABOR</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {PIZZAS[modelo].sabores.map(sb => {
                      const sel = sabor === sb
                      return (
                        <button key={sb} onClick={() => setSabor(sb)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, padding: '14px 16px', background: sel ? '#FEF0E0' : '#fff', border: sel ? `2px solid ${O}` : '1.5px solid #D8D0C4', cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s' }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: V }}>{sb}</span>
                          {sel && <CheckIcon />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 28, borderRadius: 14, padding: 22, textAlign: 'center', border: '1.5px dashed #D8D0C4' }}>
                  <p style={{ fontSize: 13, color: '#B0A89E', margin: 0 }}>Seleciona um modelo para ver os sabores</p>
                </div>
              )}

              {/* Quantidade */}
              {sabor && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', color: VM, marginBottom: 12 }}>QUANTIDADE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 46, height: 46, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: V, color: C, border: 'none', cursor: 'pointer' }}>−</button>
                    <span className="font-display" style={{ fontSize: 46, color: V, minWidth: 46, textAlign: 'center' }}>{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} style={{ width: 46, height: 46, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: V, color: C, border: 'none', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              )}

              {/* Botão adicionar */}
              {sabor && (
                <button onClick={adicionarAoCarrinho} className="font-display"
                  style={{ width: '100%', padding: 16, borderRadius: 14, fontSize: 18, background: VM, color: C, border: 'none', cursor: 'pointer', marginBottom: 12, transition: 'all 0.15s' }}>
                  + Adicionar ao carrinho
                </button>
              )}

              {/* Carrinho */}
              {carrinho.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', color: VM, marginBottom: 12 }}>CARRINHO ({totalCarrinho} pizzas)</div>
                  <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1.5px solid #D8D0C4' }}>
                    {carrinho.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < carrinho.length - 1 ? '1px solid #F0EAE0' : 'none' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: V }}>{item.sabor}</div>
                          <div style={{ fontSize: 11, color: '#9FC4A8' }}>{item.modeloLabel}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button onClick={() => alterarQty(i, -1)} style={{ width: 28, height: 28, borderRadius: '50%', background: '#F2EDE4', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                          <span style={{ fontSize: 16, fontWeight: 500, color: V, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                          <button onClick={() => alterarQty(i, 1)} style={{ width: 28, height: 28, borderRadius: '50%', background: '#F2EDE4', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                          <button onClick={() => removerDoCarrinho(i)} style={{ width: 28, height: 28, borderRadius: '50%', background: '#FEF0E0', border: 'none', cursor: 'pointer', color: O, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão confirmar */}
              <button onClick={confirmarCarrinho} disabled={carrinho.length === 0} className="font-display"
                style={{ width: '100%', padding: 18, borderRadius: 14, fontSize: 21, background: carrinho.length > 0 ? O : '#D8D0C4', color: carrinho.length > 0 ? '#fff' : '#b0a89e', border: 'none', cursor: carrinho.length > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
                {carrinho.length > 0 ? `Confirmar ${totalCarrinho} pizza${totalCarrinho > 1 ? 's' : ''}` : 'Carrinho vazio'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
