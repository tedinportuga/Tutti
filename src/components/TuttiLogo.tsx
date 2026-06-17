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
