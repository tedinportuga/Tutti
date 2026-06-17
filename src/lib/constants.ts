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
