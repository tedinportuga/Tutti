'use client'
import Link from 'next/link'
import { TuttiLogo, TuttiLogoSmall } from '@/components/TuttiLogo'
import { CORES, IMGS } from '@/lib/constants'

export default function HomePage() {
  return (
    <div className="home-layout">
      {/* Sidebar */}
      <aside className="home-sidebar">
        <div>
          <TuttiLogoSmall animate />
          <div style={{fontSize: 10, letterSpacing: '0.14em', color: '#6B9E7A'}}>ALGARVE · PORTUGAL</div>
          <div style={{
            width: 32, height: 1.5, backgroundColor: CORES.O,
            animation: 'lineDraw 0.8s ease-out 0.3s both'
          }} />
          <p style={{fontSize: 12, lineHeight: 1.8, color: '#4A7A5A', fontStyle: 'italic'}}>
            Sistema de gestão interno
          </p>
        </div>
        <p style={{ fontSize: 12, color: '#9FC4A8' }}>© 2024</p>
      </aside>

      {/* Main */}
      <main className="home-main" style={{
        backgroundImage: `url(${IMGS.heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(27,58,45,0.85) 0%, rgba(46,94,69,0.75) 100%)',
          zIndex: 1
        }} />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 2,
          height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 40
        }}>
          {/* Logo */}
          <TuttiLogo size={200} animate />

          {/* Cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24, marginTop: 60, width: '100%', maxWidth: 600,
            animation: 'cardsFadeUp 0.8s ease-out 0.5s both'
          }}>
            {/* Card Loja */}
            <Link href="/loja" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: 32, borderRadius: 12,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                color: CORES.C, textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.015)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
              >
                <img src="/icon-loja.png" width={40} height={40} style={{filter: 'invert(1)', opacity: 0.9, margin: '0 auto 16px', display: 'block'}} alt="Loja" />
                <h2 style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'var(--font-display)', marginBottom: 12 }}>Loja</h2>
                <div style={{ width: 24, height: 2, backgroundColor: CORES.O, margin: '0 auto' }} />
              </div>
            </Link>

            {/* Card Gestão */}
            <Link href="/gestao" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: 32, borderRadius: 12,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                color: CORES.C, textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.015)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
              >
                <img src="/icon-gestao.png" width={40} height={40} style={{filter: 'invert(1)', opacity: 0.9, margin: '0 auto 16px', display: 'block'}} alt="Gestão" />
                <h2 style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'var(--font-display)', marginBottom: 12 }}>Gestão</h2>
                <div style={{ width: 24, height: 2, backgroundColor: CORES.O, margin: '0 auto' }} />
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
