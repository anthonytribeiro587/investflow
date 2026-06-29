-- InvestFlow Demo - sincronizar dashboard, telas do fluxo e relatórios
-- Rode SOMENTE no projeto Supabase DEMO.
-- Objetivo: liberar leitura/escrita da demo, distribuir registros por etapa
-- e garantir que itens orçados apareçam nos Relatórios.

begin;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

alter table if exists public.diretorias disable row level security;
alter table if exists public.setores disable row level security;
alter table if exists public.filiais disable row level security;
alter table if exists public.itens_catalogo disable row level security;
alter table if exists public.projetos disable row level security;
alter table if exists public.usuarios disable row level security;
alter table if exists public.solicitacoes disable row level security;
alter table if exists public.itens_projeto disable row level security;
alter table if exists public.historico_solicitacoes disable row level security;
alter table if exists public.anexos disable row level security;
alter table if exists public.logs_auditoria disable row level security;
alter table if exists public.lotes_compra disable row level security;
alter table if exists public.plano_investimentos disable row level security;
alter table if exists public.realizado_sap disable row level security;
alter table if exists public.transferencias disable row level security;

alter table public.solicitacoes add column if not exists projeto_orcamento text;
alter table public.solicitacoes add column if not exists responsavel_orcamento text;
alter table public.solicitacoes add column if not exists observacao_orcamento text;
alter table public.solicitacoes add column if not exists data_encaminhamento_orcamento timestamptz;
alter table public.solicitacoes add column if not exists fornecedor_orcamento text;
alter table public.solicitacoes add column if not exists valor_orcado numeric;
alter table public.solicitacoes add column if not exists prazo_orcamento text;
alter table public.solicitacoes add column if not exists condicao_pagamento text;
alter table public.solicitacoes add column if not exists observacao_cotacao text;
alter table public.solicitacoes add column if not exists data_orcamento_concluido timestamptz;

-- Distribuição visual da demo por etapas do fluxo.
-- Isso mantém o sistema vivo na apresentação: solicitações, diretoria, patrimônio,
-- projetos, orçamentos e relatórios passam a ler a mesma base.
with ordenada as (
  select id, row_number() over (order by coalesce(codigo, ''), created_at, id) as rn
  from public.solicitacoes
)
update public.solicitacoes s
set
  status = case
    when o.rn <= 5 then 'enviada'
    when o.rn <= 9 then 'aprovada_diretoria'
    when o.rn <= 13 then 'pendente_orcamento'
    when o.rn <= 17 then 'aguardando_cotacao'
    when o.rn <= 22 then 'orcamento_concluido'
    when o.rn = 23 then 'ajuste_solicitado'
    else 'rejeitada_diretoria'
  end,
  prioridade = case
    when o.rn in (2, 6, 10, 15, 19) then 'alta'
    when o.rn in (4, 12, 17, 21) then 'critica'
    when o.rn in (8, 14, 20) then 'baixa'
    else 'media'
  end,
  tipo = coalesce(s.tipo, 'planejamento_anual'),
  ano = coalesce(s.ano, 2026),
  semestre_sugerido = coalesce(s.semestre_sugerido, '2º semestre'),
  semestre_aprovado = case when o.rn > 5 then coalesce(s.semestre_aprovado, '2º semestre') else s.semestre_aprovado end,
  projeto_orcamento = case
    when o.rn between 10 and 22 then coalesce(s.projeto_orcamento, 'Projeto Demo ' || lpad(o.rn::text, 2, '0'))
    else s.projeto_orcamento
  end,
  responsavel_orcamento = case
    when o.rn between 10 and 22 then coalesce(s.responsavel_orcamento, 'Responsável Demo ' || ((o.rn % 4) + 1)::text)
    else s.responsavel_orcamento
  end,
  observacao_orcamento = case
    when o.rn between 10 and 22 then coalesce(s.observacao_orcamento, 'Encaminhamento fictício para orçamento e validação gerencial.')
    else s.observacao_orcamento
  end,
  data_encaminhamento_orcamento = case
    when o.rn between 14 and 22 then coalesce(s.data_encaminhamento_orcamento, now() - ((24 - o.rn) || ' days')::interval)
    else s.data_encaminhamento_orcamento
  end,
  fornecedor_orcamento = case
    when o.rn between 18 and 22 then 'Fornecedor Demo ' || lpad((o.rn - 17)::text, 2, '0')
    when o.rn between 14 and 17 then null
    else s.fornecedor_orcamento
  end,
  valor_orcado = case
    when o.rn between 18 and 22 then (18000 + (o.rn * 3750))::numeric
    when o.rn between 10 and 17 then coalesce(s.valor_orcado, (9000 + (o.rn * 2100))::numeric)
    else coalesce(s.valor_orcado, 0)
  end,
  prazo_orcamento = case
    when o.rn between 18 and 22 then (15 + (o.rn % 4) * 10)::text || ' dias'
    else s.prazo_orcamento
  end,
  condicao_pagamento = case
    when o.rn between 18 and 22 then 'Condição demo - faturado'
    else s.condicao_pagamento
  end,
  observacao_cotacao = case
    when o.rn between 18 and 22 then 'Cotação fictícia concluída para apresentação.'
    else s.observacao_cotacao
  end,
  data_orcamento_concluido = case
    when o.rn between 18 and 22 then coalesce(s.data_orcamento_concluido, now() - ((24 - o.rn) || ' days')::interval)
    else null
  end,
  updated_at = now()
from ordenada o
where s.id = o.id;

-- Recriar a central usada pelo Dashboard e pelos Relatórios.
create or replace view public.vw_central_investimentos as
select
  s.id as solicitacao_id,
  s.codigo,
  s.ano,
  s.status,
  s.tipo,
  s.prioridade,
  s.semestre_sugerido,
  s.semestre_aprovado,
  coalesce(ip.item_nome, ic.nome_item, s.descricao_item_manual, 'Item demo') as item_nome,
  s.descricao_item_manual,
  f.id as filial_id,
  f.codigo_filial,
  f.nome_filial,
  f.cidade,
  d.nome as diretoria_nome,
  st.nome as setor_nome,
  coalesce(p.nome_projeto, s.projeto_orcamento, 'Projeto ainda não definido') as nome_projeto,
  coalesce(ip.tipo_movimento, 'demo') as tipo_movimento,
  case
    when s.status in ('enviada', 'ajuste_solicitado') then 'diretoria'
    when s.status = 'aprovada_diretoria' then 'patrimonio'
    when s.status = 'pendente_orcamento' then 'projetos'
    when s.status in ('aguardando_cotacao', 'orcamento_concluido') then 'orcamento'
    when s.status in ('rejeitada_diretoria', 'rejeitada_patrimonio') then 'cancelado'
    else coalesce(ip.situacao, 'em_analise')
  end as situacao,
  coalesce(nullif(s.valor_orcado, 0), ip.valor_total_investimento, ip.valor_orcado, 0) as valor_total_investimento,
  coalesce(s.valor_orcado, ip.valor_orcado, 0) as valor_orcado,
  coalesce(ip.valor_aprovado, 0) as valor_aprovado,
  coalesce(ip.valor_realizado, 0) as valor_realizado,
  s.created_at,
  s.updated_at
from public.solicitacoes s
left join public.filiais f on f.id = s.filial_id
left join public.diretorias d on d.id = f.diretoria_id
left join public.setores st on st.id = s.setor_id
left join public.itens_catalogo ic on ic.id = s.item_catalogo_id
left join public.itens_projeto ip on ip.solicitacao_id = s.id
left join public.projetos p on p.id = ip.projeto_id;

create or replace view public.vw_dashboard_investimentos as
select
  ano,
  coalesce(tipo_movimento, 'sem_movimento') as tipo_movimento,
  status,
  count(*) as quantidade,
  sum(valor_total_investimento) as valor_total_investimento,
  sum(valor_orcado) as valor_orcado,
  sum(valor_aprovado) as valor_aprovado,
  sum(valor_realizado) as valor_realizado
from public.vw_central_investimentos
group by ano, coalesce(tipo_movimento, 'sem_movimento'), status;

grant select on public.vw_central_investimentos to anon, authenticated;
grant select on public.vw_dashboard_investimentos to anon, authenticated;

notify pgrst, 'reload schema';

commit;

-- Conferência: deve mostrar registros em todas as etapas e pelo menos alguns orçamentos concluídos.
select status, count(*) quantidade, sum(valor_orcado) valor_orcado
from public.solicitacoes
group by status
order by status;
