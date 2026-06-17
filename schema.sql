-- Pizza models enum
create type modelo_pizza as enum (
  'classica', 'sabores_do_mar', 'especial', 'premium'
);

-- Pizzas catalog
create table pizzas (
  id uuid primary key default gen_random_uuid(),
  modelo modelo_pizza not null,
  sabor text not null,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Sales transactions
create table vendas (
  id uuid primary key default gen_random_uuid(),
  pizza_id uuid references pizzas(id),
  quantidade integer default 1,
  vendido_em timestamptz default now(),
  dia_semana integer generated always as (extract(dow from vendido_em)::int) stored,
  hora integer generated always as (extract(hour from vendido_em)::int) stored,
  tamanho text,
  obs text
);

-- Notification tracking (WhatsApp)
create table notificacoes (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid references vendas(id),
  tipo text,
  enviado_em timestamptz default now(),
  sucesso boolean default false
);

-- Performance indexes for heatmap & KPIs
create index on vendas (dia_semana, hora);
create index on vendas (vendido_em);
create index on vendas (pizza_id);

-- Enable real-time for live manager dashboard
alter publication supabase_realtime add table vendas;
