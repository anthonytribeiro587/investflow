-- InvestFlow - correção de diretoria por usuário
-- Rode no Supabase DEMO depois de criar diretor1, diretor2, diretor3 e diretor4 no Authentication > Users.

begin;

update public.diretorias
set supervisor_diretor = case id::text
  when '9cdf2089-1296-4d09-a68e-625abdd6568a' then 'Diretor Operacional'
  when 'b146f1af-8e16-4534-b51e-1b3389beaf4b' then 'Diretor Expansão'
  when '383b2a8a-47d9-4da2-980d-7fc6269d3715' then 'Diretor Administrativo'
  when '2af079c3-9a1b-478a-a138-d4aac4f0de72' then 'Diretor Financeiro'
  else supervisor_diretor
end
where id::text in ('9cdf2089-1296-4d09-a68e-625abdd6568a','b146f1af-8e16-4534-b51e-1b3389beaf4b','383b2a8a-47d9-4da2-980d-7fc6269d3715','2af079c3-9a1b-478a-a138-d4aac4f0de72');

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
where diretoria_id::text in ('9cdf2089-1296-4d09-a68e-625abdd6568a','b146f1af-8e16-4534-b51e-1b3389beaf4b','383b2a8a-47d9-4da2-980d-7fc6269d3715','2af079c3-9a1b-478a-a138-d4aac4f0de72');

update public.usuarios set nome='Diretor Operacional', email='diretor1@investflowdemo.com', perfil='diretor', filial_id=NULL, diretoria_id='9cdf2089-1296-4d09-a68e-625abdd6568a', ativo=true where lower(email) in ('diretor1@investflowdemo.com','diretor01@investflowdemo.com','diretoria@investflowdemo.com') or id='46024949-77dc-452c-b5e0-5b5567425c9d';
insert into public.usuarios (id, auth_user_id, nome, email, perfil, filial_id, diretoria_id, ativo, created_at) select '46024949-77dc-452c-b5e0-5b5567425c9d', NULL, 'Diretor Operacional', 'diretor1@investflowdemo.com', 'diretor', NULL, '9cdf2089-1296-4d09-a68e-625abdd6568a', true, now() where not exists (select 1 from public.usuarios where lower(email)='diretor1@investflowdemo.com');

update public.usuarios set nome='Diretor Expansão', email='diretor2@investflowdemo.com', perfil='diretor', filial_id=NULL, diretoria_id='b146f1af-8e16-4534-b51e-1b3389beaf4b', ativo=true where lower(email)='diretor2@investflowdemo.com';
insert into public.usuarios (id, auth_user_id, nome, email, perfil, filial_id, diretoria_id, ativo, created_at) select 'fd2f82ec-2bfa-4c03-b1d3-904cbb73b902', NULL, 'Diretor Expansão', 'diretor2@investflowdemo.com', 'diretor', NULL, 'b146f1af-8e16-4534-b51e-1b3389beaf4b', true, now() where not exists (select 1 from public.usuarios where lower(email)='diretor2@investflowdemo.com');

update public.usuarios set nome='Diretor Administrativo', email='diretor3@investflowdemo.com', perfil='diretor', filial_id=NULL, diretoria_id='383b2a8a-47d9-4da2-980d-7fc6269d3715', ativo=true where lower(email)='diretor3@investflowdemo.com';
insert into public.usuarios (id, auth_user_id, nome, email, perfil, filial_id, diretoria_id, ativo, created_at) select '2f757d61-d5e0-4b33-bf9b-16a49a33de8b', NULL, 'Diretor Administrativo', 'diretor3@investflowdemo.com', 'diretor', NULL, '383b2a8a-47d9-4da2-980d-7fc6269d3715', true, now() where not exists (select 1 from public.usuarios where lower(email)='diretor3@investflowdemo.com');

update public.usuarios set nome='Diretor Financeiro', email='diretor4@investflowdemo.com', perfil='diretor', filial_id=NULL, diretoria_id='2af079c3-9a1b-478a-a138-d4aac4f0de72', ativo=true where lower(email)='diretor4@investflowdemo.com';
insert into public.usuarios (id, auth_user_id, nome, email, perfil, filial_id, diretoria_id, ativo, created_at) select 'd09fa08f-7339-4b75-9d9f-c330a6ef2cc2', NULL, 'Diretor Financeiro', 'diretor4@investflowdemo.com', 'diretor', NULL, '2af079c3-9a1b-478a-a138-d4aac4f0de72', true, now() where not exists (select 1 from public.usuarios where lower(email)='diretor4@investflowdemo.com');

update public.usuarios u set auth_user_id=au.id from auth.users au where lower(au.email)=lower(u.email);

create or replace view public.vw_central_investimentos as
select
  s.id as solicitacao_id, s.codigo, s.ano, s.status, s.tipo, s.prioridade, s.semestre_sugerido, s.semestre_aprovado,
  coalesce(ip.item_nome, ic.nome_item, s.descricao_item_manual) as item_nome, s.descricao_item_manual,
  f.id as filial_id, f.codigo_filial, f.nome_filial, f.cidade, d.id as diretoria_id, d.nome as diretoria_nome, d.supervisor_diretor as diretor_responsavel,
  st.nome as setor_nome, coalesce(p.nome_projeto, s.projeto_orcamento) as nome_projeto, ip.tipo_movimento,
  coalesce(ip.situacao, case when s.status in ('pendente_orcamento','aguardando_cotacao','orcamento_concluido') then 'em_orcamento' when s.status in ('rejeitada_diretoria','rejeitada_patrimonio') then 'cancelado' else 'em_analise' end) as situacao,
  coalesce(ip.valor_total_investimento, ip.valor_orcado, s.valor_orcado, 0) as valor_total_investimento,
  coalesce(ip.valor_orcado, s.valor_orcado, 0) as valor_orcado, coalesce(ip.valor_aprovado, 0) as valor_aprovado, coalesce(ip.valor_realizado, s.valor_realizado, 0) as valor_realizado,
  s.created_at, s.updated_at
from public.solicitacoes s
left join public.filiais f on f.id = s.filial_id
left join public.diretorias d on d.id = f.diretoria_id
left join public.setores st on st.id = s.setor_id
left join public.itens_catalogo ic on ic.id = s.item_catalogo_id
left join public.itens_projeto ip on ip.solicitacao_id = s.id
left join public.projetos p on p.id = ip.projeto_id;

grant select on public.vw_central_investimentos to authenticated;

commit;
