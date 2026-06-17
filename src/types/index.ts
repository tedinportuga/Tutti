// Pizza models
export type ModeloPizza = 'classica' | 'sabores_do_mar' | 'especial' | 'premium';

export const MODELO_PIZZA_LABELS: Record<ModeloPizza, string> = {
  classica: 'Clássicas',
  sabores_do_mar: 'Sabores do Mar',
  especial: 'Especiais',
  premium: 'Premium',
};

// Pizza in catalog
export interface Pizza {
  id: string;
  modelo: ModeloPizza;
  sabor: string;
  ativo: boolean;
  created_at: string;
}

// Cart item (with size/observations)
export interface CartItem {
  pizza: Pizza;
  quantidade: number;
  tamanho?: string;
  obs?: string;
}

// Complete cart
export interface Cart {
  items: CartItem[];
  customerName?: string;
  customerPhone?: string;
}

// Sale/Order
export interface Venda {
  id: string;
  pizza_id: string;
  quantidade: number;
  vendido_em: string;
  dia_semana: number; // 0-6, where 0 is Sunday
  hora: number; // 0-23
  tamanho?: string;
  obs?: string;
}

// Notification
export interface Notificacao {
  id: string;
  venda_id: string;
  tipo: string;
  enviado_em: string;
  sucesso: boolean;
}

// Heatmap data point (day_of_week, hour, count)
export interface HeatmapCell {
  dia_semana: number;
  hora: number;
  count: number;
}

// KPI metrics
export interface KPIs {
  totalVendas: number;
  totalPizzas: number;
  pizzaMaisVendida: {
    sabor: string;
    quantidade: number;
  };
  modeloMaisVendido: {
    modelo: ModeloPizza;
    quantidade: number;
  };
  melhorHora: {
    hora: number;
    quantidade: number;
  };
  melhorDia: {
    dia: number;
    quantidade: number;
  };
}

// Day names for heatmap labels
export const DAY_NAMES = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

// Hour labels for heatmap
export const HOUR_LABELS = Array.from({ length: 24 }, (_, i) =>
  `${i}h`
);

// API Response wrappers
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Order submission payload
export interface CreateOrderPayload {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  observations?: string;
}

// Order confirmation response
export interface OrderConfirmation {
  orderId: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  items: CartItem[];
}
