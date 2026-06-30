-- InvestFlow - correções urgentes para apresentação ao diretor
-- Versão com login REAL pelo Supabase Auth. Não existe login sem senha neste pacote.
-- Rode no Supabase DEMO correto: investflow-demo.

begin;

create extension if not exists pgcrypto;

-- Evita o erro: null value in column "id" of relation "solicitacoes".
alter table if exists public.solicitacoes
  alter column id set default gen_random_uuid();

alter table if exists public.historico_solicitacoes
  alter column id set default gen_random_uuid();

alter table if exists public.itens_projeto
  alter column id set default gen_random_uuid();

-- Garante colunas usadas nas telas atuais.
alter table if exists public.solicitacoes add column if not exists projeto_orcamento text;
alter table if exists public.solicitacoes add column if not exists responsavel_orcamento text;
alter table if exists public.solicitacoes add column if not exists observacao_orcamento text;
alter table if exists public.solicitacoes add column if not exists data_encaminhamento_orcamento timestamptz;
alter table if exists public.solicitacoes add column if not exists fornecedor_orcamento text;
alter table if exists public.solicitacoes add column if not exists valor_orcado numeric;
alter table if exists public.solicitacoes add column if not exists prazo_orcamento text;
alter table if exists public.solicitacoes add column if not exists condicao_pagamento text;
alter table if exists public.solicitacoes add column if not exists observacao_cotacao text;
alter table if exists public.solicitacoes add column if not exists data_orcamento_concluido timestamptz;
alter table if exists public.solicitacoes add column if not exists valor_realizado numeric default 0;
alter table if exists public.solicitacoes add column if not exists data_realizacao timestamptz;
alter table if exists public.solicitacoes add column if not exists observacao_realizacao text;

-- Usuários/perfis do InvestFlow ligados aos e-mails reais do Supabase Auth do projeto DEMO.
-- Auth correto visto no painel:
-- admin@investflowdemo.com
-- solicitante1@investflowdemo.com
-- diretor1@investflowdemo.com
-- patrimonio1@investflowdemo.com
-- projetos1@investflowdemo.com
-- compras1@investflowdemo.com
-- Obs.: compras1 acessa Orçamentos/Cotações e Realizações.

update public.usuarios
set nome = 'Anthony Ribeiro', email = 'admin@investflowdemo.com', perfil = 'admin', ativo = true
where lower(email) in ('admin@empresa.com', 'admin@investflow.com', 'admin@investflowdemo.com')
   or id = '7f37fc95-007c-485b-9530-6141fe455608';

update public.usuarios
set nome = 'Solicitante 01', email = 'solicitante1@investflowdemo.com', perfil = 'gerente_loja', ativo = true
where lower(email) in ('gerente01@empresa.com', 'gerente01@investflow.com', 'gerente01@investflowdemo.com', 'solicitante@investflowdemo.com', 'solicitante1@investflowdemo.com')
   or id = '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f';

update public.usuarios
set nome = 'Diretor 01', email = 'diretor1@investflowdemo.com', perfil = 'diretor', ativo = true
where lower(email) in ('diretor.a@empresa.com', 'diretor@investflow.com', 'diretor01@investflowdemo.com', 'diretoria@investflowdemo.com', 'diretor1@investflowdemo.com')
   or id = '46024949-77dc-452c-b5e0-5b5567425c9d';

update public.usuarios
set nome = 'Patrimônio 01', email = 'patrimonio1@investflowdemo.com', perfil = 'patrimonio', ativo = true
where lower(email) in ('patrimonio@empresa.com', 'patrimonio@investflow.com', 'patrimonio@investflowdemo.com', 'patrimonio1@investflowdemo.com')
   or id = '79fdde41-ef48-45fe-a466-94d996200476';

update public.usuarios
set nome = 'Projetos 01', email = 'projetos1@investflowdemo.com', perfil = 'projetos', ativo = true
where lower(email) in ('projetos@investflow.com', 'projetos@investflowdemo.com', 'projetos1@investflowdemo.com')
   or id = '9b8c54e5-55e3-4ee2-83d6-69bfb572c0c2';

update public.usuarios
set nome = 'Compras/Realizações 01', email = 'compras1@investflowdemo.com', perfil = 'orcamento_compras', ativo = true
where lower(email) in ('orcamento@empresa.com', 'orcamentos@investflow.com', 'orcamentos@investflowdemo.com', 'compras@investflowdemo.com', 'compras1@investflowdemo.com')
   or id = '1ff6f553-f578-4ff0-af00-60e8a7a5207a';

-- Insere perfis caso não existam ainda na tabela public.usuarios.
insert into public.usuarios (id, auth_user_id, nome, email, perfil, filial_id, diretoria_id, ativo, created_at)
select '7f37fc95-007c-485b-9530-6141fe455608', NULL, 'Anthony Ribeiro', 'admin@investflowdemo.com', 'admin', NULL, NULL, true, now()
where not exists (select 1 from public.usuarios where lower(email) = 'admin@investflowdemo.com');

insert into public.usuarios (id, auth_user_id, nome, email, perfil, filial_id, diretoria_id, ativo, created_at)
select '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', NULL, 'Solicitante 01', 'solicitante1@investflowdemo.com', 'gerente_loja', '235bde73-f097-4ba5-afd3-58a393cbf231', '9cdf2089-1296-4d09-a68e-625abdd6568a', true, now()
where not exists (select 1 from public.usuarios where lower(email) = 'solicitante1@investflowdemo.com');

insert into public.usuarios (id, auth_user_id, nome, email, perfil, filial_id, diretoria_id, ativo, created_at)
select '46024949-77dc-452c-b5e0-5b5567425c9d', NULL, 'Diretor 01', 'diretor1@investflowdemo.com', 'diretor', NULL, '9cdf2089-1296-4d09-a68e-625abdd6568a', true, now()
where not exists (select 1 from public.usuarios where lower(email) = 'diretor1@investflowdemo.com');

insert into public.usuarios (id, auth_user_id, nome, email, perfil, filial_id, diretoria_id, ativo, created_at)
select '79fdde41-ef48-45fe-a466-94d996200476', NULL, 'Patrimônio 01', 'patrimonio1@investflowdemo.com', 'patrimonio', NULL, '383b2a8a-47d9-4da2-980d-7fc6269d3715', true, now()
where not exists (select 1 from public.usuarios where lower(email) = 'patrimonio1@investflowdemo.com');

insert into public.usuarios (id, auth_user_id, nome, email, perfil, filial_id, diretoria_id, ativo, created_at)
select '9b8c54e5-55e3-4ee2-83d6-69bfb572c0c2', NULL, 'Projetos 01', 'projetos1@investflowdemo.com', 'projetos', NULL, 'b146f1af-8e16-4534-b51e-1b3389beaf4b', true, now()
where not exists (select 1 from public.usuarios where lower(email) = 'projetos1@investflowdemo.com');

insert into public.usuarios (id, auth_user_id, nome, email, perfil, filial_id, diretoria_id, ativo, created_at)
select '1ff6f553-f578-4ff0-af00-60e8a7a5207a', NULL, 'Compras/Realizações 01', 'compras1@investflowdemo.com', 'orcamento_compras', NULL, '2af079c3-9a1b-478a-a138-d4aac4f0de72', true, now()
where not exists (select 1 from public.usuarios where lower(email) = 'compras1@investflowdemo.com');


-- Regras de diretoria por usuário: cada diretoria enxerga apenas suas filiais.
-- E-mails criados no Supabase Auth:
-- diretor1@investflowdemo.com -> Diretoria Operacional
-- diretor2@investflowdemo.com -> Diretoria Expansão
-- diretor3@investflowdemo.com -> Diretoria Administrativa
-- diretor4@investflowdemo.com -> Diretoria Financeira

update public.diretorias
set supervisor_diretor = case id::text
  when '9cdf2089-1296-4d09-a68e-625abdd6568a' then 'Diretor Operacional'
  when 'b146f1af-8e16-4534-b51e-1b3389beaf4b' then 'Diretor Expansão'
  when '383b2a8a-47d9-4da2-980d-7fc6269d3715' then 'Diretor Administrativo'
  when '2af079c3-9a1b-478a-a138-d4aac4f0de72' then 'Diretor Financeiro'
  else supervisor_diretor
end
where id::text in (
  '9cdf2089-1296-4d09-a68e-625abdd6568a',
  'b146f1af-8e16-4534-b51e-1b3389beaf4b',
  '383b2a8a-47d9-4da2-980d-7fc6269d3715',
  '2af079c3-9a1b-478a-a138-d4aac4f0de72'
);

update public.filiais
set diretor_responsavel = case diretoria_id::text
  when '9cdf2089-1296-4d09-a68e-625abdd6568a' then 'Diretor Operacional'
  when 'b146f1af-8e16-4534-b51e-1b3389beaf4b' then 'Diretor Expansão'
  when '383b2a8a-47d9-4da2-980d-7fc6269d3715' then 'Diretor Administrativo'
  when '2af079c3-9a1b-478a-a138-d4aac4f0de72' then 'Diretor Financeiro'
  else diretor_responsavel
end,
area = case diretoria_id::text
  when '9cdf2089-1296-4d09-a68e-625abdd6568a' then 'Diretoria Operacional'
  when 'b146f1af-8e16-4534-b51e-1b3389beaf4b' then 'Diretoria Expansão'
  when '383b2a8a-47d9-4da2-980d-7fc6269d3715' then 'Diretoria Administrativa'
  when '2af079c3-9a1b-478a-a138-d4aac4f0de72' then 'Diretoria Financeira'
  else area
end
where diretoria_id::text in (
  '9cdf2089-1296-4d09-a68e-625abdd6568a',
  'b146f1af-8e16-4534-b51e-1b3389beaf4b',
  '383b2a8a-47d9-4da2-980d-7fc6269d3715',
  '2af079c3-9a1b-478a-a138-d4aac4f0de72'
);

update public.usuarios
set nome = 'Diretor Operacional', email = 'diretor1@investflowdemo.com', perfil = 'diretor', diretoria_id = '9cdf2089-1296-4d09-a68e-625abdd6568a', filial_id = NULL, ativo = true
where lower(email) in ('diretor1@investflowdemo.com', 'diretor01@investflowdemo.com', 'diretoria@investflowdemo.com')
   or id = '46024949-77dc-452c-b5e0-5b5567425c9d';

insert into public.usuarios (id, auth_user_id, nome, email, perfil, filial_id, diretoria_id, ativo, created_at)
select '46024949-77dc-452c-b5e0-5b5567425c9d', NULL, 'Diretor Operacional', 'diretor1@investflowdemo.com', 'diretor', NULL, '9cdf2089-1296-4d09-a68e-625abdd6568a', true, now()
where not exists (select 1 from public.usuarios where lower(email) = 'diretor1@investflowdemo.com');

update public.usuarios
set nome = 'Diretor Expansão', email = 'diretor2@investflowdemo.com', perfil = 'diretor', diretoria_id = 'b146f1af-8e16-4534-b51e-1b3389beaf4b', filial_id = NULL, ativo = true
where lower(email) = 'diretor2@investflowdemo.com';

insert into public.usuarios (id, auth_user_id, nome, email, perfil, filial_id, diretoria_id, ativo, created_at)
select 'fd2f82ec-2bfa-4c03-b1d3-904cbb73b902', NULL, 'Diretor Expansão', 'diretor2@investflowdemo.com', 'diretor', NULL, 'b146f1af-8e16-4534-b51e-1b3389beaf4b', true, now()
where not exists (select 1 from public.usuarios where lower(email) = 'diretor2@investflowdemo.com');

update public.usuarios
set nome = 'Diretor Administrativo', email = 'diretor3@investflowdemo.com', perfil = 'diretor', diretoria_id = '383b2a8a-47d9-4da2-980d-7fc6269d3715', filial_id = NULL, ativo = true
where lower(email) = 'diretor3@investflowdemo.com';

insert into public.usuarios (id, auth_user_id, nome, email, perfil, filial_id, diretoria_id, ativo, created_at)
select '2f757d61-d5e0-4b33-bf9b-16a49a33de8b', NULL, 'Diretor Administrativo', 'diretor3@investflowdemo.com', 'diretor', NULL, '383b2a8a-47d9-4da2-980d-7fc6269d3715', true, now()
where not exists (select 1 from public.usuarios where lower(email) = 'diretor3@investflowdemo.com');

update public.usuarios
set nome = 'Diretor Financeiro', email = 'diretor4@investflowdemo.com', perfil = 'diretor', diretoria_id = '2af079c3-9a1b-478a-a138-d4aac4f0de72', filial_id = NULL, ativo = true
where lower(email) = 'diretor4@investflowdemo.com';

insert into public.usuarios (id, auth_user_id, nome, email, perfil, filial_id, diretoria_id, ativo, created_at)
select 'd09fa08f-7339-4b75-9d9f-c330a6ef2cc2', NULL, 'Diretor Financeiro', 'diretor4@investflowdemo.com', 'diretor', NULL, '2af079c3-9a1b-478a-a138-d4aac4f0de72', true, now()
where not exists (select 1 from public.usuarios where lower(email) = 'diretor4@investflowdemo.com');

-- Vincula public.usuarios aos usuários reais do Supabase Auth pelo e-mail.
-- Essa parte só funciona para os e-mails que já existirem em Authentication > Users.
update public.usuarios u
set auth_user_id = au.id
from auth.users au
where lower(au.email) = lower(u.email);

-- View central compatível com relatórios limpos.
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
  coalesce(ip.item_nome, ic.nome_item, s.descricao_item_manual) as item_nome,
  s.descricao_item_manual,
  f.id as filial_id,
  f.codigo_filial,
  f.nome_filial,
  f.cidade,
  d.id as diretoria_id,
  d.nome as diretoria_nome,
  d.supervisor_diretor as diretor_responsavel,
  st.nome as setor_nome,
  coalesce(p.nome_projeto, s.projeto_orcamento) as nome_projeto,
  ip.tipo_movimento,
  coalesce(ip.situacao, case
    when s.status in ('pendente_orcamento', 'aguardando_cotacao', 'orcamento_concluido') then 'em_orcamento'
    when s.status in ('rejeitada_diretoria', 'rejeitada_patrimonio') then 'cancelado'
    else 'em_analise'
  end) as situacao,
  coalesce(ip.valor_total_investimento, ip.valor_orcado, s.valor_orcado, 0) as valor_total_investimento,
  coalesce(ip.valor_orcado, s.valor_orcado, 0) as valor_orcado,
  coalesce(ip.valor_aprovado, 0) as valor_aprovado,
  coalesce(ip.valor_realizado, s.valor_realizado, 0) as valor_realizado,
  s.created_at,
  s.updated_at
from public.solicitacoes s
left join public.filiais f on f.id = s.filial_id
left join public.diretorias d on d.id = f.diretoria_id
left join public.setores st on st.id = s.setor_id
left join public.itens_catalogo ic on ic.id = s.item_catalogo_id
left join public.itens_projeto ip on ip.solicitacao_id = s.id
left join public.projetos p on p.id = ip.projeto_id;

grant select on public.vw_central_investimentos to authenticated;

commit;
