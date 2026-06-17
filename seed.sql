-- Seed real Tutti Pizzeria menu
delete from pizzas;

insert into pizzas (modelo, sabor) values
  -- Clássicas
  ('classica', 'Margherita'),
  ('classica', 'Pepperoni'),
  ('classica', 'Quatro Queijos'),
  ('classica', 'Napolitana'),

  -- Especiais
  ('especial', 'Capriciosa Algarvia'),
  ('especial', 'Quattro Formaggi'),
  ('especial', 'Portuguesa'),
  ('especial', 'Vegan'),
  ('especial', 'Fotezza'),

  -- Sabores do Mar
  ('sabores_do_mar', 'Mediterrânea'),
  ('sabores_do_mar', 'Di Faro'),
  ('sabores_do_mar', 'Napoli Lusitana'),

  -- Premium
  ('premium', 'Pesto di Faro'),
  ('premium', 'Delizia di Bufala'),
  ('premium', 'Presunto Defumado'),
  ('premium', 'A Moda Tutti');
