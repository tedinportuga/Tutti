# Tutti Pizzaria — Implementação Next.js
## INSTRUÇÃO PRINCIPAL
Replica EXACTAMENTE o protótipo aprovado. Não tomar nenhuma decisão de design.
Não adicionar nada. Não remover nada. Copiar o comportamento exacto.

---

## STACK
- Next.js 14 (App Router, já criado)
- Tailwind CSS
- TypeScript
- Supabase (já configurado)
- Evolution API (WhatsApp)

---

## PASSO 1 — Instalar fontes no layout

`src/app/layout.tsx`:
```tsx
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${playfair.variable} ${inter.variable}`}>
      <body style={{ margin: 0, padding: 0, height: '100%' }}>
        {children}
      </body>
    </html>
  )
}
```

---

## PASSO 2 — CSS global

`src/app/globals.css`:
```css
* { box-sizing: border-box; margin: 0; padding: 0; }
html { height: 100%; }
body { height: 100%; font-family: var(--font-sans), 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }

.font-display { font-family: var(--font-display), 'Playfair Display', serif; }

.app-layout { display: flex; height: 100vh; overflow: hidden; }
.app-sidebar { width: 272px; flex-shrink: 0; height: 100vh; overflow-y: auto; display: flex; flex-direction: column; justify-content: space-between; padding: 40px 28px; background: #1B3A2D; }
.app-main { flex: 1; height: 100vh; overflow-y: auto; -webkit-overflow-scrolling: touch; background: #F2EDE4; }
.home-layout { display: flex; height: 100vh; overflow: hidden; }
.home-sidebar { width: 300px; flex-shrink: 0; height: 100vh; display: flex; flex-direction: column; justify-content: space-between; padding: 48px 36px; background: #1B3A2D; }
.home-main { flex: 1; height: 100vh; overflow-y: auto; -webkit-overflow-scrolling: touch; position: relative; }

@keyframes logoAppear {
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes logoSub {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes lineDraw {
  from { width: 0; opacity: 0; }
  to   { width: 32px; opacity: 1; }
}
@keyframes cardsFadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .app-sidebar { display: none !important; }
  .home-sidebar { display: none !important; }
}
```

---

## PASSO 3 — Logo

Copia o ficheiro `logo.jpg` para `public/logo.jpg`.

Cria `src/components/TuttiLogo.tsx`:
```tsx
export function TuttiLogo({ size = 140, animate = false }: { size?: number; animate?: boolean }) {
  return (
    <img
      src="/logo.jpg"
      alt="Tutti Pizzaria"
      style={{
        width: size, height: size, objectFit: 'contain',
        borderRadius: 16, display: 'block',
        animation: animate ? 'logoAppear 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both' : undefined,
      }}
    />
  )
}

export function TuttiLogoSmall({ animate = false }: { animate?: boolean }) {
  return (
    <img
      src="/logo.jpg"
      alt="Tutti Pizzaria"
      style={{
        width: 72, height: 72, objectFit: 'contain',
        borderRadius: 10, display: 'block', marginBottom: 16,
        animation: animate ? 'logoAppear 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both' : undefined,
      }}
    />
  )
}
```

---

## PASSO 4 — Constantes e tipos

Cria `src/lib/constants.ts`:
```ts
export const CORES = {
  V: '#1B3A2D',
  VM: '#2E5E45',
  O: '#D4751A',
  C: '#F5E6C8',
  F: '#F2EDE4',
}

export const IMGS = {
  heroBg:   'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1400&q=80',
  classica: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80',
  mar:      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
  especial: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
  premium:  'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600&q=80',
}

export const PIZZAS: Record<string, { label: string; img: string; sabores: string[] }> = {
  classica: { label: 'Clássica',       img: IMGS.classica, sabores: ['Margherita', 'Serrano', 'Diavola', 'Buon Tutti', 'La Tetta'] },
  mar:      { label: 'Sabores do Mar', img: IMGS.mar,      sabores: ['Mediterrânea', 'Di Faro', 'Napoli Lusitana'] },
  especial: { label: 'Especial',       img: IMGS.especial, sabores: ['Capriciosa Algarvia', 'Quattro Formaggi', 'Portuguesa', 'Vegan', 'Fotezza'] },
  premium:  { label: 'Premium',        img: IMGS.premium,  sabores: ['Pesto di Faro', 'Delizia di Bufala', 'Presunto Defumado', 'A Moda Tutti'] },
}
```

---

## PASSO 5 — Páginas

### Home: `src/app/page.tsx`
- Layout: `home-layout` (classe CSS)
- Sidebar esquerda verde #1B3A2D com TuttiLogoSmall + texto + linha laranja animada
- Conteúdo: foto hero Unsplash como background absoluto + overlay verde gradient + logo grande centrado + 2 cards (Loja → /loja, Gestão → /gestao)
- Cards: glass morphism com backdrop-filter blur(8px), hover scale(1.015)
- Animação: logo com `logoAppear`, cards com `cardsFadeUp` delayed 0.5s

### Loja: `src/app/loja/page.tsx`
- Layout: `app-layout`
- Sidebar: TuttiLogoSmall + texto + contador "Ao vivo hoje" em tempo real (Supabase realtime)
- Conteúdo (scrollável): 3 fases — form → confirmar → sucesso
- **form**: grid 2x2 de modelos com foto real + overlay + nome em Playfair. Lista de sabores. Contador qty com botões circulares. Botão laranja "Registar"
- **confirmar**: card branco com resumo. Botões Cancelar + Confirmar
- **sucesso**: card verde escuro + check + nome da pizza. Depois de 0.9s aparece preview do WhatsApp

### Gestão: `src/app/gestao/page.tsx`
- Layout: `app-layout`
- Sidebar: TuttiLogoSmall + KPIs em tempo real (Supabase)
- Conteúdo: heatmap hora×dia, barras de modelo, histórico do dia, botão PDF
- Botão PDF: abre pré-visualização com logo + dados reais do Supabase

---

## PASSO 6 — API Routes

### `src/app/api/vendas/route.ts`
```ts
// POST /api/vendas
// 1. Insere na tabela 'vendas' do Supabase
// 2. Busca dados da pizza (sabor, modelo)
// 3. Chama /api/notificacao para WhatsApp
// 4. Retorna { success: true, venda }
```

### `src/app/api/notificacao/route.ts`
```ts
// POST /api/notificacao
// Envia via Evolution API:
// Mensagem formato:
// "🍕 Tutti Pizzaria · {hora}
// Nova saída registada
// {sabor} — {modelo}
// Quantidade: ×{qty}
// Total do dia: {total} pizzas"
// Para: process.env.GERENTE_WHATSAPP
```

### `src/app/api/export/route.ts`
```ts
// GET /api/export?data=YYYY-MM-DD
// Busca todas as vendas do dia no Supabase
// Gera PDF com @react-pdf/renderer
// Inclui: logo, KPIs, por modelo, detalhe hora a hora
// Retorna: application/pdf
```

---

## CORES E VALORES EXACTOS (não alterar)

| Nome | Hex |
|------|-----|
| Verde Tutti | #1B3A2D |
| Verde médio | #2E5E45 |
| Verde escuro cards | #142D22 |
| Laranja acção | #D4751A |
| Creme texto | #F5E6C8 |
| Fundo app | #F2EDE4 |
| Texto secundário verde | #6B9E7A |
| Texto muted verde | #9FC4A8 |
| Borda cards | #D8D0C4 |
| Sabor seleccionado bg | #FEF0E0 |

---

## REGRA PRINCIPAL
Não inventar nada. Se tiveres dúvida sobre algum detalhe, deixa como está no código original. O design está aprovado — a tua função é converter React puro → Next.js App Router mantendo comportamento e visual 100% idênticos.
