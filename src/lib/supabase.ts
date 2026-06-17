import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client for browser/authenticated requests
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (use only on server)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Types for database tables
export type Pizza = {
  id: string;
  modelo: 'classica' | 'sabores_do_mar' | 'especial' | 'premium';
  sabor: string;
  ativo: boolean;
  created_at: string;
};

export type Venda = {
  id: string;
  pizza_id: string;
  quantidade: number;
  vendido_em: string;
  dia_semana: number;
  hora: number;
  tamanho?: string;
  obs?: string;
};

export type Notificacao = {
  id: string;
  venda_id: string;
  tipo: string;
  enviado_em: string;
  sucesso: boolean;
};

// Helper: Fetch all pizzas
export async function fetchPizzas(): Promise<Pizza[]> {
  const { data, error } = await supabase
    .from('pizzas')
    .select('*')
    .eq('ativo', true)
    .order('modelo', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Helper: Fetch pizzas by model
export async function fetchPizzasByModelo(
  modelo: Pizza['modelo']
): Promise<Pizza[]> {
  const { data, error } = await supabase
    .from('pizzas')
    .select('*')
    .eq('modelo', modelo)
    .eq('ativo', true);

  if (error) throw error;
  return data || [];
}

// Helper: Create a sale
export async function createVenda(venda: Omit<Venda, 'id' | 'dia_semana' | 'hora' | 'vendido_em'> & { vendido_em?: string }): Promise<Venda> {
  const { data, error } = await supabase
    .from('vendas')
    .insert([venda])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper: Fetch sales for heatmap (day of week + hour)
export async function fetchHeatmapData(): Promise<
  Array<{ dia_semana: number; hora: number; count: number }>
> {
  const { data, error } = await supabase
    .rpc('get_vendas_heatmap'); // Will need to create this RPC function

  if (error) throw error;
  return data || [];
}

// Helper: Subscribe to real-time sales
export function subscribeToPizzas(
  callback: (payload: { new: Venda; old: Venda | null; eventType: string }) => void
) {
  return supabase
    .channel('public:vendas')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, callback)
    .subscribe();
}
