'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TuttiLogo, TuttiLogoSmall } from '@/components/TuttiLogo'
import { PIZZAS, CORES } from '@/lib/constants'

const { V, VM, O, C, F } = CORES

type Modelo = 'classica' | 'mar' | 'especial' | 'premium' | null
type Fase = 'form' | 'confirmar' | 'sucesso'

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
const LiveDot = () => (
  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', flexShrink: 0 }}/>
)

export default function LojaPage() {
  const router = useRouter()
  const [modelo, setModelo] = useState<Modelo>(null)
  const [sabor, setSabor] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [fase, setFase] = useState<Fase>('form')
  const [ultimaVenda, setUltimaVenda] = useState<{ sabor: string; modelo: string; qty: number; hora: string } | null>(null)
  const [showWpp, setShowWpp] = useState(false)
  const [totalHoje, setTotalHoje] = useState(0)

  const agora = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })

  function confirmar() {
    if (modelo && sabor) setFase('confirmar')
  }

  async function registar() {
    if (!modelo || !sabor) return
    const venda = { sabor, modelo: PIZZAS[modelo].label, qty, hora: agora }
    setUltimaVenda(venda)
    setTotalHoje(t => t + qty)
    setFase('sucesso')
    setTimeout(() => setShowWpp(true), 900)
    setTimeout(() => {
      setFase('form'); setModelo(null); setSabor(null); setQty(1)
      setUltimaVenda(null); setShowWpp(false)
    }, 6000)
    // POST to API (non-blocking)
    fetch('/api/vendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sabor, modelo, qty })
    }).catch(() => {})
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="app-sidebar">
        <div>
          <button
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9FC4A8', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 28, padding: 0 }}>
            <BackIcon /> Voltar
          </button>
          <TuttiLogoSmall />
          <div style={{ width: 28, height: 1, background: O, marginBottom: 16 }} />
          <p style={{ fontSize: 12, lineHeight: 1.7, color: '#6B9E7A' }}>
            Seleciona o modelo e o sabor. A gerente é notificada automaticamente via WhatsApp.
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
          {sabor && modelo && fase === 'form' && (
            <div style={{ borderRadius: 14, padding: 14, background: '#142D22' }}>
              <div style={{ fontSize: 11, marginBottom: 4, color: '#6B9E7A' }}>A preparar</div>
              <div className="font-display" style={{ fontSize: 16, color: C }}>{sabor}</div>
              <div style={{ fontSize: 11, marginTop: 2, color: '#9FC4A8' }}>{PIZZAS[modelo].label} · ×{qty}</div>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo com scroll */}
      <div className="app-main">
        <div style={{ maxWidth: 580, margin: '0 auto', padding: '32px 24px 80px' }}>

          {/* Mobile header */}
          <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column' }} className="md:hidden">
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

          {/* ── SUCESSO ── */}
          {fase === 'sucesso' && ultimaVenda && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ borderRadius: 22, padding: 28, background: V, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: VM, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <CheckIcon size={26} color={C} />
                </div>
                <h2 className="font-display" style={{ fontSize: 28, color: C, marginBottom: 6 }}>Registado!</h2>
                <p className="font-display" style={{ fontSize: 18, fontStyle: 'italic', color: '#9FC4A8', marginBottom: 3 }}>{ultimaVenda.sabor}</p>
                <p style={{ fontSize: 12, color: '#6B9E7A' }}>{ultimaVenda.modelo} · ×{ultimaVenda.qty}</p>
              </div>
              <div style={{ transition: 'opacity 0.4s, transform 0.4s', opacity: showWpp ? 1 : 0, transform: showWpp ? 'translateY(0)' : 'translateY(14px)' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.08em', color: VM, marginBottom: 10, textAlign: 'center' }}>MENSAGEM ENVIADA À GERENTE</div>
                {/* WhatsApp Preview */}
                <div style={{ background: '#ECE5DD', borderRadius: 16, padding: 16, maxWidth: 300, margin: '0 auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #D5CEC7' }}>
                    <img src="/logo.jpg" alt="Tutti" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', flexShrink: 0, background: V }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: V }}>Tutti Pizzaria</div>
                      <div style={{ fontSize: 11, color: '#667781' }}>sistema interno</div>
                    </div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: '4px 14px 14px 14px', padding: '10px 14px', maxWidth: 260 }}>
                    <div style={{ fontSize: 12, color: '#667781', marginBottom: 6 }}>🍕 Tutti · {ultimaVenda.hora}</div>
                    <div style={{ fontSize: 13, color: '#111', lineHeight: 1.6 }}>
                      Nova saída registada<br />
                      <strong>{ultimaVenda.sabor}</strong> — {ultimaVenda.modelo}<br />
                      Quantidade: ×{ultimaVenda.qty}
                    </div>
                    <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid #F0EAE0', fontSize: 12, color: '#667781' }}>
                      Total do dia: <strong style={{ color: V }}>{totalHoje} pizzas</strong>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 10, color: '#8696A0', marginTop: 4 }}>{ultimaVenda.hora} ✓✓</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CONFIRMAÇÃO ── */}
          {fase === 'confirmar' && modelo && sabor && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.08em', color: VM, marginBottom: 18 }}>CONFIRMAR VENDA</div>
              <div style={{ borderRadius: 20, padding: 22, background: '#fff', border: '1.5px solid #D8D0C4', marginBottom: 14 }}>
                {[
                  { label: 'Modelo', value: PIZZAS[modelo].label, big: false, orange: false },
                  { label: 'Sabor', value: sabor, big: true, orange: false },
                  { label: 'Qtd.', value: `×${qty}`, big: false, orange: true },
                  { label: 'Hora', value: agora, big: false, orange: false },
                ].map((row, i, arr) => (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid #F0EAE0' : 'none' }}>
                    <span style={{ fontSize: 13, color: '#9FC4A8' }}>{row.label}</span>
                    <span className={row.big ? 'font-display' : ''} style={{ fontSize: row.big ? 17 : row.orange ? 20 : 13, fontWeight: 500, color: row.orange ? O : V }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setFase('form')} style={{ flex: 1, padding: 15, borderRadius: 14, fontSize: 14, fontWeight: 500, background: '#fff', border: '1.5px solid #D8D0C4', color: V, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={registar} className="font-display" style={{ flex: 2, padding: 15, borderRadius: 14, cursor: 'pointer', background: O, color: '#fff', border: 'none', fontSize: 19 }}>
                  Confirmar
                </button>
              </div>
            </div>
          )}

          {/* ── FORMULÁRIO ── */}
          {fase === 'form' && (
            <>
              {/* Modelos com foto */}
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

              <button onClick={confirmar} disabled={!modelo || !sabor} className="font-display"
                style={{ width: '100%', padding: 18, borderRadius: 14, fontSize: 21, background: modelo && sabor ? O : '#D8D0C4', color: modelo && sabor ? '#fff' : '#b0a89e', border: 'none', cursor: modelo && sabor ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
                Registar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
