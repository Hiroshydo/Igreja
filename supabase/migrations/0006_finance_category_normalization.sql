update public.finance_categories
set
  type = 'receita',
  description = coalesce(description, 'Dízimos e ofertas recebidas')
where code = 'dizimos'
  and type <> 'receita';