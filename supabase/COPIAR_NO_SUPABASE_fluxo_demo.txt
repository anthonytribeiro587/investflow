-- InvestFlow Demo - base menor e fluxo completo para apresentação
-- Rode este script no projeto Supabase DEMO depois do setup inicial.
-- Ele substitui os dados demo grandes por uma amostra fictícia de 24 solicitações.

begin;

alter table public.historico_solicitacoes add column if not exists solicitacao_id uuid;
alter table public.historico_solicitacoes add column if not exists acao text;
alter table public.historico_solicitacoes add column if not exists status_anterior text;
alter table public.historico_solicitacoes add column if not exists status_novo text;
alter table public.historico_solicitacoes add column if not exists motivo text;
alter table public.historico_solicitacoes add column if not exists usuario text;

delete from public.itens_projeto;
delete from public.historico_solicitacoes;
delete from public.solicitacoes;
delete from public.usuarios;
delete from public.projetos;
delete from public.itens_catalogo;
delete from public.filiais;
delete from public.setores;
delete from public.diretorias;

insert into public.diretorias (id, nome, ativo, created_at, supervisor_diretor) values
  ('9cdf2089-1296-4d09-a68e-625abdd6568a', 'Diretoria Operacional', true, now(), 'Diretor Operacional'),
  ('b146f1af-8e16-4534-b51e-1b3389beaf4b', 'Diretoria Expansão', true, now(), 'Diretor Expansão'),
  ('383b2a8a-47d9-4da2-980d-7fc6269d3715', 'Diretoria Administrativa', true, now(), 'Diretor Administrativo'),
  ('2af079c3-9a1b-478a-a138-d4aac4f0de72', 'Diretoria Financeira', true, now(), 'Diretor Financeiro');

insert into public.setores (id, nome, ativo, created_at) values
  ('149bbdad-a88d-4049-86a4-8c8efcf6f7d5', 'Obras e Reformas', true, now()),
  ('656186c4-9f03-42e4-a809-6cbb657601d9', 'Manutenção Predial', true, now()),
  ('68a7beba-2eac-453c-a8a4-69fa8f398b85', 'Tecnologia e Sistemas', true, now()),
  ('b31539b5-35dc-4e36-83d8-4f151686555c', 'Segurança Patrimonial', true, now()),
  ('146bb6e3-748b-40f3-ad89-a910b0562dda', 'Climatização', true, now()),
  ('30c0a32f-1e1b-49bd-a618-c3c3cc9bfa88', 'Operações', true, now());

insert into public.filiais (id, codigo_filial, nome_filial, bandeira, cidade, area, gerente_nome, gerente_email, diretoria_id, ativo, created_at, empresa, segmento, centro_lucro, diretor_responsavel) values
  ('235bde73-f097-4ba5-afd3-58a393cbf231', 'U001', 'Unidade 01 — Centro', 'Demo', 'Metropolitana', 'Área Demo', 'Gerente Demo 001', 'u001@investflowdemo.com', '9cdf2089-1296-4d09-a68e-625abdd6568a', true, now(), 'Grupo Horizonte Demo', 'Operação fictícia', 'CL-001', 'Diretor Operacional'),
  ('0510e989-02ee-4ec7-b8aa-862783560789', 'U002', 'Unidade 02 — Norte', 'Demo', 'Metropolitana', 'Área Demo', 'Gerente Demo 002', 'u002@investflowdemo.com', '9cdf2089-1296-4d09-a68e-625abdd6568a', true, now(), 'Grupo Horizonte Demo', 'Operação fictícia', 'CL-002', 'Diretor Operacional'),
  ('2b60b344-4105-4800-9fb4-8a928335346d', 'U003', 'Unidade 03 — Sul', 'Demo', 'Metropolitana', 'Área Demo', 'Gerente Demo 003', 'u003@investflowdemo.com', 'b146f1af-8e16-4534-b51e-1b3389beaf4b', true, now(), 'Grupo Horizonte Demo', 'Operação fictícia', 'CL-003', 'Diretor Expansão'),
  ('bdf84a60-0b67-4146-909b-c8980ca0ff88', 'U004', 'Unidade 04 — Vale', 'Demo', 'Interior', 'Área Demo', 'Gerente Demo 004', 'u004@investflowdemo.com', 'b146f1af-8e16-4534-b51e-1b3389beaf4b', true, now(), 'Grupo Horizonte Demo', 'Operação fictícia', 'CL-004', 'Diretor Expansão'),
  ('d649ed82-6f03-4506-a565-806d2a2d42b4', 'U005', 'Unidade 05 — Litoral', 'Demo', 'Litoral', 'Área Demo', 'Gerente Demo 005', 'u005@investflowdemo.com', '383b2a8a-47d9-4da2-980d-7fc6269d3715', true, now(), 'Grupo Horizonte Demo', 'Operação fictícia', 'CL-005', 'Diretor Administrativo'),
  ('62aa6930-f4a8-41f6-9cd2-dc0e6b4bfe4b', 'U006', 'Unidade 06 — Serra', 'Demo', 'Interior', 'Área Demo', 'Gerente Demo 006', 'u006@investflowdemo.com', '383b2a8a-47d9-4da2-980d-7fc6269d3715', true, now(), 'Grupo Horizonte Demo', 'Operação fictícia', 'CL-006', 'Diretor Administrativo'),
  ('895ec1ed-d53c-4865-a9be-c84f08649b54', 'U007', 'Unidade 07 — Industrial', 'Demo', 'Metropolitana', 'Área Demo', 'Gerente Demo 007', 'u007@investflowdemo.com', '2af079c3-9a1b-478a-a138-d4aac4f0de72', true, now(), 'Grupo Horizonte Demo', 'Operação fictícia', 'CL-007', 'Diretor Financeiro'),
  ('1dbfa2f9-98c4-428e-802c-0cf8a4d52d34', 'U008', 'Unidade 08 — Comercial', 'Demo', 'Interior', 'Área Demo', 'Gerente Demo 008', 'u008@investflowdemo.com', '2af079c3-9a1b-478a-a138-d4aac4f0de72', true, now(), 'Grupo Horizonte Demo', 'Operação fictícia', 'CL-008', 'Diretor Financeiro');

insert into public.itens_catalogo (id, setor_id, nome_item, ativo, created_at) values
  ('4708415c-3b98-40af-b572-5613ec3e4bb4', '149bbdad-a88d-4049-86a4-8c8efcf6f7d5', 'Reforma de fachada', true, now()),
  ('7bb1b089-91bf-4b55-9482-6af5e270fe0a', '149bbdad-a88d-4049-86a4-8c8efcf6f7d5', 'Troca de piso', true, now()),
  ('a67929c8-8789-4096-b51d-a9e9710e1da0', '149bbdad-a88d-4049-86a4-8c8efcf6f7d5', 'Adequação de layout', true, now()),
  ('cf0ee5f6-4423-487b-be7a-ff78ade1dc12', '656186c4-9f03-42e4-a809-6cbb657601d9', 'Manutenção predial', true, now()),
  ('800d07f3-8079-43b7-bbb8-74b27470f785', '656186c4-9f03-42e4-a809-6cbb657601d9', 'Porta automática', true, now()),
  ('a48c4f4f-266e-4bdb-bd94-1071995e7d53', '68a7beba-2eac-453c-a8a4-69fa8f398b85', 'Rede lógica', true, now()),
  ('dd773dbb-8e91-4042-b603-38135e4da69f', '68a7beba-2eac-453c-a8a4-69fa8f398b85', 'Nobreak', true, now()),
  ('b35df70f-7b28-4b67-bae3-4ca872d6d2d5', '68a7beba-2eac-453c-a8a4-69fa8f398b85', 'Equipamento de atendimento', true, now()),
  ('391f6367-e45c-482f-b780-b253eabe83e4', 'b31539b5-35dc-4e36-83d8-4f151686555c', 'Instalação de câmeras', true, now()),
  ('2c9e7516-7304-4559-9778-f4cef0702f67', 'b31539b5-35dc-4e36-83d8-4f151686555c', 'Sistema de alarme', true, now()),
  ('d19e881a-a08e-4433-a0e5-a551f2fb1785', '146bb6e3-748b-40f3-ad89-a910b0562dda', 'Climatização administrativa', true, now()),
  ('f63d9e12-96fa-4144-ac97-6f175a69f0a7', '146bb6e3-748b-40f3-ad89-a910b0562dda', 'Expositor refrigerado', true, now()),
  ('67344bd8-4d62-4af2-b9f4-eed1cbd54f1e', '30c0a32f-1e1b-49bd-a618-c3c3cc9bfa88', 'Mobiliário operacional', true, now()),
  ('4d93db36-02f7-4174-8045-b8ee0f45f0e9', '30c0a32f-1e1b-49bd-a618-c3c3cc9bfa88', 'Comunicação visual', true, now()),
  ('8248a8f2-59cf-4e70-a382-c0e5da4f05f2', '30c0a32f-1e1b-49bd-a618-c3c3cc9bfa88', 'Bancada de atendimento', true, now()),
  ('6e433b69-48eb-4546-ad9b-e15e97c1aebd', '149bbdad-a88d-4049-86a4-8c8efcf6f7d5', 'Adequação elétrica', true, now());

insert into public.projetos (id, ano, nome_projeto, setor_id, descricao, ativo, created_at) values
  ('a494857f-6f76-4290-aa5f-40691415b796', 2026, 'Projeto 001 - Reforma de Loja', '149bbdad-a88d-4049-86a4-8c8efcf6f7d5', 'Projeto fictício para demonstração.', true, now()),
  ('82ed6ff7-7348-42b9-84cf-2c50354f8c6c', 2026, 'Projeto 002 - Tecnologia e Sistemas', '68a7beba-2eac-453c-a8a4-69fa8f398b85', 'Projeto fictício para demonstração.', true, now()),
  ('c495b3ad-2316-463c-80df-af5d65517ac3', 2026, 'Projeto 003 - Segurança Patrimonial', 'b31539b5-35dc-4e36-83d8-4f151686555c', 'Projeto fictício para demonstração.', true, now()),
  ('fb86aa4b-bb89-496b-81fd-c97ae93f94a9', 2026, 'Projeto 004 - Eficiência Energética', '146bb6e3-748b-40f3-ad89-a910b0562dda', 'Projeto fictício para demonstração.', true, now()),
  ('7d0a5413-b72b-44ed-8d5a-9ba31df4d595', 2026, 'Projeto 005 - Infraestrutura Predial', '656186c4-9f03-42e4-a809-6cbb657601d9', 'Projeto fictício para demonstração.', true, now()),
  ('5e8b366a-177f-408b-852b-98a2aa8ab804', 2026, 'Projeto 006 - Padronização Visual', '30c0a32f-1e1b-49bd-a618-c3c3cc9bfa88', 'Projeto fictício para demonstração.', true, now()),
  ('bd9b2498-c91c-4df1-9509-81af4eb80fa3', 2026, 'Projeto 007 - Climatização', '146bb6e3-748b-40f3-ad89-a910b0562dda', 'Projeto fictício para demonstração.', true, now()),
  ('4ba30e79-fbfe-4c44-ae4f-78e2b61d38c3', 2026, 'Projeto 008 - Expansão Comercial', '149bbdad-a88d-4049-86a4-8c8efcf6f7d5', 'Projeto fictício para demonstração.', true, now());

insert into public.usuarios (id, auth_user_id, nome, email, perfil, filial_id, diretoria_id, ativo, created_at) values
  ('7f37fc95-007c-485b-9530-6141fe455608', NULL, 'Anthony Ribeiro', 'admin@investflowdemo.com', 'admin', '235bde73-f097-4ba5-afd3-58a393cbf231', '9cdf2089-1296-4d09-a68e-625abdd6568a', true, now()),
  ('99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', NULL, 'Solicitante 01', 'solicitante1@investflowdemo.com', 'gerente_loja', '235bde73-f097-4ba5-afd3-58a393cbf231', '9cdf2089-1296-4d09-a68e-625abdd6568a', true, now()),
  ('46024949-77dc-452c-b5e0-5b5567425c9d', NULL, 'Diretor 01', 'diretor1@investflowdemo.com', 'diretor', NULL, '9cdf2089-1296-4d09-a68e-625abdd6568a', true, now()),
  ('79fdde41-ef48-45fe-a466-94d996200476', NULL, 'Patrimônio 01', 'patrimonio1@investflowdemo.com', 'patrimonio', NULL, '383b2a8a-47d9-4da2-980d-7fc6269d3715', true, now()),
  ('1ff6f553-f578-4ff0-af00-60e8a7a5207a', NULL, 'Compras/Realizações 01', 'compras1@investflowdemo.com', 'orcamento_compras', NULL, '2af079c3-9a1b-478a-a138-d4aac4f0de72', true, now());

insert into public.solicitacoes (id, codigo, ano, filial_id, solicitante_id, setor_id, item_catalogo_id, item_nao_encontrado, descricao_item_manual, prioridade, justificativa, observacao, status, semestre_sugerido, observacao_diretoria, observacao_patrimonio, created_at, updated_at, tipo, semestre_aprovado, foto_url, parecer_patrimonio, classificacao_patrimonio, patrimonio_data, projeto_orcamento, responsavel_orcamento, observacao_orcamento, data_encaminhamento_orcamento, fornecedor_orcamento, valor_orcado, prazo_orcamento, condicao_pagamento, observacao_cotacao, data_orcamento_concluido) values
  ('724bba5c-1850-4362-8686-a3f9ac733543', 'SOL-DEMO-001', 2026, '235bde73-f097-4ba5-afd3-58a393cbf231', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '149bbdad-a88d-4049-86a4-8c8efcf6f7d5', '4708415c-3b98-40af-b572-5613ec3e4bb4', false, NULL, 'media', 'Demanda demonstrativa 01 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'enviada', '2º semestre', NULL, NULL, '2026-06-19T18:00:00+00:00', '2026-06-19T18:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 18000, NULL, NULL, NULL, NULL),
  ('d5cc5bf2-41f1-4f86-a8f1-fb5e41707475', 'SOL-DEMO-002', 2026, '0510e989-02ee-4ec7-b8aa-862783560789', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '149bbdad-a88d-4049-86a4-8c8efcf6f7d5', '7bb1b089-91bf-4b55-9482-6af5e270fe0a', false, NULL, 'alta', 'Demanda demonstrativa 02 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'enviada', '2º semestre', NULL, NULL, '2026-06-20T00:00:00+00:00', '2026-06-20T00:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 32000, NULL, NULL, NULL, NULL),
  ('5297c5c8-0711-4e13-8ca3-bd8a4aa2ba43', 'SOL-DEMO-003', 2026, '2b60b344-4105-4800-9fb4-8a928335346d', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '149bbdad-a88d-4049-86a4-8c8efcf6f7d5', 'a67929c8-8789-4096-b51d-a9e9710e1da0', false, NULL, 'baixa', 'Demanda demonstrativa 03 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'enviada', '2º semestre', NULL, NULL, '2026-06-20T06:00:00+00:00', '2026-06-20T06:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 9500, NULL, NULL, NULL, NULL),
  ('1f009ce9-3826-4d05-ad25-b011f7128ed6', 'SOL-DEMO-004', 2026, 'bdf84a60-0b67-4146-909b-c8980ca0ff88', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '656186c4-9f03-42e4-a809-6cbb657601d9', 'cf0ee5f6-4423-487b-be7a-ff78ade1dc12', false, NULL, 'critica', 'Demanda demonstrativa 04 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'enviada', '2º semestre', NULL, NULL, '2026-06-20T12:00:00+00:00', '2026-06-20T12:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 46000, NULL, NULL, NULL, NULL),
  ('74a921d9-d650-464e-9127-5e2e5a17f0f7', 'SOL-DEMO-005', 2026, 'd649ed82-6f03-4506-a565-806d2a2d42b4', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '656186c4-9f03-42e4-a809-6cbb657601d9', '800d07f3-8079-43b7-bbb8-74b27470f785', false, NULL, 'media', 'Demanda demonstrativa 05 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'enviada', '2º semestre', NULL, NULL, '2026-06-20T18:00:00+00:00', '2026-06-20T18:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 12000, NULL, NULL, NULL, NULL),
  ('247c5611-eddc-4f84-9dcf-6a2c61097377', 'SOL-DEMO-006', 2026, '62aa6930-f4a8-41f6-9cd2-dc0e6b4bfe4b', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '68a7beba-2eac-453c-a8a4-69fa8f398b85', 'a48c4f4f-266e-4bdb-bd94-1071995e7d53', false, NULL, 'alta', 'Demanda demonstrativa 06 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'ajuste_solicitado', '2º semestre', 'Solicitação precisa de complemento de escopo e justificativa.', NULL, '2026-06-21T00:00:00+00:00', '2026-06-21T00:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 28000, NULL, NULL, NULL, NULL),
  ('998c7dd5-bb42-4735-9e81-1272700235dc', 'SOL-DEMO-007', 2026, '895ec1ed-d53c-4865-a9be-c84f08649b54', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '68a7beba-2eac-453c-a8a4-69fa8f398b85', 'dd773dbb-8e91-4042-b603-38135e4da69f', false, NULL, 'baixa', 'Demanda demonstrativa 07 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'ajuste_solicitado', '2º semestre', 'Solicitação precisa de complemento de escopo e justificativa.', NULL, '2026-06-21T06:00:00+00:00', '2026-06-21T06:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 7500, NULL, NULL, NULL, NULL),
  ('b9ec31ec-c1d1-485b-b5cc-552d5a67e741', 'SOL-DEMO-008', 2026, '1dbfa2f9-98c4-428e-802c-0cf8a4d52d34', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '68a7beba-2eac-453c-a8a4-69fa8f398b85', 'b35df70f-7b28-4b67-bae3-4ca872d6d2d5', false, NULL, 'critica', 'Demanda demonstrativa 08 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'rejeitada_diretoria', '2º semestre', 'Demanda recusada para a simulação por baixa prioridade no ciclo atual.', NULL, '2026-06-21T12:00:00+00:00', '2026-06-21T12:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 64000, NULL, NULL, NULL, NULL),
  ('d167fff1-9ce6-455f-9ad4-fd7c9a4b4e31', 'SOL-DEMO-009', 2026, '235bde73-f097-4ba5-afd3-58a393cbf231', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', 'b31539b5-35dc-4e36-83d8-4f151686555c', '391f6367-e45c-482f-b780-b253eabe83e4', false, NULL, 'media', 'Demanda demonstrativa 09 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'aprovada_diretoria', '2º semestre', 'Aprovado para seguir no fluxo demonstrativo.', NULL, '2026-06-21T18:00:00+00:00', '2026-06-21T18:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 21000, NULL, NULL, NULL, NULL),
  ('8515c283-2372-4e47-94fe-a9218881e346', 'SOL-DEMO-010', 2026, '0510e989-02ee-4ec7-b8aa-862783560789', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', 'b31539b5-35dc-4e36-83d8-4f151686555c', '2c9e7516-7304-4559-9778-f4cef0702f67', false, NULL, 'alta', 'Demanda demonstrativa 10 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'aprovada_diretoria', '2º semestre', 'Aprovado para seguir no fluxo demonstrativo.', NULL, '2026-06-22T00:00:00+00:00', '2026-06-22T00:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 39000, NULL, NULL, NULL, NULL),
  ('cbf2345c-483b-4f58-8f88-3a07d6c5ba6d', 'SOL-DEMO-011', 2026, '2b60b344-4105-4800-9fb4-8a928335346d', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '146bb6e3-748b-40f3-ad89-a910b0562dda', 'd19e881a-a08e-4433-a0e5-a551f2fb1785', false, NULL, 'baixa', 'Demanda demonstrativa 11 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'aprovada_diretoria', '2º semestre', 'Aprovado para seguir no fluxo demonstrativo.', NULL, '2026-06-22T06:00:00+00:00', '2026-06-22T06:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 15000, NULL, NULL, NULL, NULL),
  ('a2a47cbe-2fe0-46a7-9621-263a787f9069', 'SOL-DEMO-012', 2026, 'bdf84a60-0b67-4146-909b-c8980ca0ff88', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '146bb6e3-748b-40f3-ad89-a910b0562dda', 'f63d9e12-96fa-4144-ac97-6f175a69f0a7', false, NULL, 'critica', 'Demanda demonstrativa 12 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'aprovada_diretoria', '2º semestre', 'Aprovado para seguir no fluxo demonstrativo.', NULL, '2026-06-22T12:00:00+00:00', '2026-06-22T12:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 54000, NULL, NULL, NULL, NULL),
  ('8e41fcaa-ff5a-4bcc-b38c-41b7bf9e0f2f', 'SOL-DEMO-013', 2026, 'd649ed82-6f03-4506-a565-806d2a2d42b4', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '30c0a32f-1e1b-49bd-a618-c3c3cc9bfa88', '67344bd8-4d62-4af2-b9f4-eed1cbd54f1e', false, NULL, 'media', 'Demanda demonstrativa 13 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'rejeitada_patrimonio', '2º semestre', NULL, NULL, '2026-06-22T18:00:00+00:00', '2026-06-22T18:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, 'Recusado por necessidade de reavaliação técnica.', NULL, '2026-06-22T23:00:00+00:00', NULL, NULL, NULL, NULL, NULL, 18000, NULL, NULL, NULL, NULL),
  ('3aac7f0a-d02f-4765-b63a-6452f5f32818', 'SOL-DEMO-014', 2026, '62aa6930-f4a8-41f6-9cd2-dc0e6b4bfe4b', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '30c0a32f-1e1b-49bd-a618-c3c3cc9bfa88', '4d93db36-02f7-4174-8045-b8ee0f45f0e9', false, NULL, 'alta', 'Demanda demonstrativa 14 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'pendente_orcamento', '2º semestre', 'Aprovado para seguir no fluxo demonstrativo.', NULL, '2026-06-23T00:00:00+00:00', '2026-06-23T00:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, 'Aprovado pelo patrimônio na base demo.', NULL, '2026-06-23T22:00:00+00:00', NULL, NULL, NULL, NULL, NULL, 32000, NULL, NULL, NULL, NULL),
  ('74a306fa-ac0a-44ea-80c0-212df9d1e1f5', 'SOL-DEMO-015', 2026, '895ec1ed-d53c-4865-a9be-c84f08649b54', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '30c0a32f-1e1b-49bd-a618-c3c3cc9bfa88', '8248a8f2-59cf-4e70-a382-c0e5da4f05f2', false, NULL, 'baixa', 'Demanda demonstrativa 15 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'pendente_orcamento', '2º semestre', 'Aprovado para seguir no fluxo demonstrativo.', NULL, '2026-06-23T06:00:00+00:00', '2026-06-23T06:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, 'Aprovado pelo patrimônio na base demo.', NULL, '2026-06-23T21:00:00+00:00', NULL, NULL, NULL, NULL, NULL, 9500, NULL, NULL, NULL, NULL),
  ('0f6908eb-4f2e-4ce7-a1b4-ed1f4d2414d7', 'SOL-DEMO-016', 2026, '1dbfa2f9-98c4-428e-802c-0cf8a4d52d34', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '149bbdad-a88d-4049-86a4-8c8efcf6f7d5', '6e433b69-48eb-4546-ad9b-e15e97c1aebd', false, NULL, 'critica', 'Demanda demonstrativa 16 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'pendente_orcamento', '2º semestre', 'Aprovado para seguir no fluxo demonstrativo.', NULL, '2026-06-23T12:00:00+00:00', '2026-06-23T12:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, 'Aprovado pelo patrimônio na base demo.', NULL, '2026-06-23T20:00:00+00:00', NULL, NULL, NULL, NULL, NULL, 46000, NULL, NULL, NULL, NULL),
  ('3e30b9de-5e8d-4fa8-a3e1-472bd976ce8b', 'SOL-DEMO-017', 2026, '235bde73-f097-4ba5-afd3-58a393cbf231', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '149bbdad-a88d-4049-86a4-8c8efcf6f7d5', '4708415c-3b98-40af-b572-5613ec3e4bb4', false, NULL, 'media', 'Demanda demonstrativa 17 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'pendente_orcamento', '2º semestre', 'Aprovado para seguir no fluxo demonstrativo.', NULL, '2026-06-23T18:00:00+00:00', '2026-06-23T18:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, 'Aprovado pelo patrimônio na base demo.', NULL, '2026-06-23T19:00:00+00:00', NULL, NULL, NULL, NULL, NULL, 12000, NULL, NULL, NULL, NULL),
  ('f1083796-dfd4-4da7-af7a-409393f5370b', 'SOL-DEMO-018', 2026, '0510e989-02ee-4ec7-b8aa-862783560789', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '149bbdad-a88d-4049-86a4-8c8efcf6f7d5', '7bb1b089-91bf-4b55-9482-6af5e270fe0a', false, NULL, 'alta', 'Demanda demonstrativa 18 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'aguardando_cotacao', '2º semestre', 'Aprovado para seguir no fluxo demonstrativo.', NULL, '2026-06-24T00:00:00+00:00', '2026-06-24T00:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, 'Aprovado pelo patrimônio na base demo.', NULL, '2026-06-23T18:00:00+00:00', 'Projeto 002 - Tecnologia e Sistemas', 'Responsável Operações', 'Encaminhado para cotação no ambiente demonstrativo.', '2026-06-25T18:00:00+00:00', NULL, 28000, NULL, NULL, NULL, NULL),
  ('7fa4abb6-fe5a-4930-98b7-da9f4e5592ba', 'SOL-DEMO-019', 2026, '2b60b344-4105-4800-9fb4-8a928335346d', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '149bbdad-a88d-4049-86a4-8c8efcf6f7d5', 'a67929c8-8789-4096-b51d-a9e9710e1da0', false, NULL, 'baixa', 'Demanda demonstrativa 19 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'aguardando_cotacao', '2º semestre', 'Aprovado para seguir no fluxo demonstrativo.', NULL, '2026-06-24T06:00:00+00:00', '2026-06-24T06:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, 'Aprovado pelo patrimônio na base demo.', NULL, '2026-06-23T17:00:00+00:00', 'Projeto 003 - Segurança Patrimonial', 'Responsável Obras', 'Encaminhado para cotação no ambiente demonstrativo.', '2026-06-25T17:00:00+00:00', NULL, 7500, NULL, NULL, NULL, NULL),
  ('9c1fc362-bd35-4086-9b64-89bd1cc7fa09', 'SOL-DEMO-020', 2026, 'bdf84a60-0b67-4146-909b-c8980ca0ff88', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '656186c4-9f03-42e4-a809-6cbb657601d9', 'cf0ee5f6-4423-487b-be7a-ff78ade1dc12', false, NULL, 'critica', 'Demanda demonstrativa 20 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'aguardando_cotacao', '2º semestre', 'Aprovado para seguir no fluxo demonstrativo.', NULL, '2026-06-24T12:00:00+00:00', '2026-06-24T12:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, 'Aprovado pelo patrimônio na base demo.', NULL, '2026-06-23T16:00:00+00:00', 'Projeto 004 - Eficiência Energética', 'Responsável Compras', 'Encaminhado para cotação no ambiente demonstrativo.', '2026-06-25T16:00:00+00:00', NULL, 64000, NULL, NULL, NULL, NULL),
  ('c65fda67-87f2-470d-94d5-4d63ac6cd656', 'SOL-DEMO-021', 2026, 'd649ed82-6f03-4506-a565-806d2a2d42b4', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '656186c4-9f03-42e4-a809-6cbb657601d9', '800d07f3-8079-43b7-bbb8-74b27470f785', false, NULL, 'media', 'Demanda demonstrativa 21 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'aguardando_cotacao', '2º semestre', 'Aprovado para seguir no fluxo demonstrativo.', NULL, '2026-06-24T18:00:00+00:00', '2026-06-24T18:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, 'Aprovado pelo patrimônio na base demo.', NULL, '2026-06-23T15:00:00+00:00', 'Projeto 005 - Infraestrutura Predial', 'Responsável TI', 'Encaminhado para cotação no ambiente demonstrativo.', '2026-06-25T15:00:00+00:00', NULL, 21000, NULL, NULL, NULL, NULL),
  ('f2a94613-2edd-423d-b74b-3c42aaaa2903', 'SOL-DEMO-022', 2026, '62aa6930-f4a8-41f6-9cd2-dc0e6b4bfe4b', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '68a7beba-2eac-453c-a8a4-69fa8f398b85', 'a48c4f4f-266e-4bdb-bd94-1071995e7d53', false, NULL, 'alta', 'Demanda demonstrativa 22 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'orcamento_concluido', '2º semestre', 'Aprovado para seguir no fluxo demonstrativo.', NULL, '2026-06-25T00:00:00+00:00', '2026-06-25T00:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, 'Aprovado pelo patrimônio na base demo.', NULL, '2026-06-23T14:00:00+00:00', 'Projeto 006 - Padronização Visual', 'Responsável Segurança', 'Encaminhado para cotação no ambiente demonstrativo.', '2026-06-25T14:00:00+00:00', 'Fornecedor Demo 2', 42120, '32 dias úteis', '30 dias após faturamento', 'Cotação preenchida para apresentação do fluxo completo.', '2026-06-27T14:00:00+00:00'),
  ('60b8c837-9f9c-4d64-b867-1c6959eb8cb7', 'SOL-DEMO-023', 2026, '895ec1ed-d53c-4865-a9be-c84f08649b54', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '68a7beba-2eac-453c-a8a4-69fa8f398b85', 'dd773dbb-8e91-4042-b603-38135e4da69f', false, NULL, 'baixa', 'Demanda demonstrativa 23 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'orcamento_concluido', '2º semestre', 'Aprovado para seguir no fluxo demonstrativo.', NULL, '2026-06-25T06:00:00+00:00', '2026-06-25T06:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, 'Aprovado pelo patrimônio na base demo.', NULL, '2026-06-23T13:00:00+00:00', 'Projeto 007 - Climatização', 'Responsável Manutenção', 'Encaminhado para cotação no ambiente demonstrativo.', '2026-06-25T13:00:00+00:00', 'Fornecedor Demo 3', 16200, '33 dias úteis', '30 dias após faturamento', 'Cotação preenchida para apresentação do fluxo completo.', '2026-06-27T13:00:00+00:00'),
  ('77fefc97-0361-49b2-8bef-812f0d2f8565', 'SOL-DEMO-024', 2026, '1dbfa2f9-98c4-428e-802c-0cf8a4d52d34', '99fbb4e2-94f1-4104-b5b7-e25faa95ce7f', '68a7beba-2eac-453c-a8a4-69fa8f398b85', 'b35df70f-7b28-4b67-bae3-4ca872d6d2d5', false, NULL, 'critica', 'Demanda demonstrativa 24 para validar o fluxo de CAPEX sem dados reais.', 'Registro fictício criado para apresentação.', 'orcamento_concluido', '2º semestre', 'Aprovado para seguir no fluxo demonstrativo.', NULL, '2026-06-25T12:00:00+00:00', '2026-06-25T12:00:00+00:00', 'planejamento_anual', '2º semestre', NULL, 'Aprovado pelo patrimônio na base demo.', NULL, '2026-06-23T12:00:00+00:00', 'Projeto 008 - Expansão Comercial', 'Responsável Operações', 'Encaminhado para cotação no ambiente demonstrativo.', '2026-06-25T12:00:00+00:00', 'Fornecedor Demo 1', 58320, '34 dias úteis', '30 dias após faturamento', 'Cotação preenchida para apresentação do fluxo completo.', '2026-06-27T12:00:00+00:00');

insert into public.itens_projeto (id, solicitacao_id, projeto_id, filial_id, lote_compra_id, item_nome, responsavel_orcamento, valor_orcado, valor_aprovado, valor_realizado, prazo_entrega, tipo_prazo, fornecedor, situacao, observacao_orcamento, data_compra, data_realizacao, codigo_sap, pedido_sap, created_at, updated_at, quantidade, valor_unitario, valor_total_investimento, tipo_movimento) values
  ('ddeeddb7-88fa-452a-b13d-dc97992a68b4', '3aac7f0a-d02f-4765-b63a-6452f5f32818', '5e8b366a-177f-408b-852b-98a2aa8ab804', '62aa6930-f4a8-41f6-9cd2-dc0e6b4bfe4b', NULL, 'Comunicação visual', 'Responsável Compras', 0, 0, 0, NULL, 'Prazo demo', NULL, 'em_orcamento', 'Item vinculado ao fluxo demonstrativo.', NULL, NULL, NULL, NULL, '2026-06-23T00:00:00+00:00', '2026-06-23T00:00:00+00:00', 1, 32000, 32000, 'demo'),
  ('581f5abe-2f08-4486-9837-343d3eb42992', '74a306fa-ac0a-44ea-80c0-212df9d1e1f5', 'bd9b2498-c91c-4df1-9509-81af4eb80fa3', '895ec1ed-d53c-4865-a9be-c84f08649b54', NULL, 'Bancada de atendimento', 'Responsável TI', 0, 0, 0, NULL, 'Prazo demo', NULL, 'em_orcamento', 'Item vinculado ao fluxo demonstrativo.', NULL, NULL, NULL, NULL, '2026-06-23T06:00:00+00:00', '2026-06-23T06:00:00+00:00', 1, 9500, 9500, 'demo'),
  ('45626802-62e9-4450-8b77-780b468bd4c8', '0f6908eb-4f2e-4ce7-a1b4-ed1f4d2414d7', '4ba30e79-fbfe-4c44-ae4f-78e2b61d38c3', '1dbfa2f9-98c4-428e-802c-0cf8a4d52d34', NULL, 'Adequação elétrica', 'Responsável Segurança', 0, 0, 0, NULL, 'Prazo demo', NULL, 'em_orcamento', 'Item vinculado ao fluxo demonstrativo.', NULL, NULL, NULL, NULL, '2026-06-23T12:00:00+00:00', '2026-06-23T12:00:00+00:00', 1, 46000, 46000, 'demo'),
  ('c96d47c5-f222-4c44-b4e2-7775aa95c044', '3e30b9de-5e8d-4fa8-a3e1-472bd976ce8b', 'a494857f-6f76-4290-aa5f-40691415b796', '235bde73-f097-4ba5-afd3-58a393cbf231', NULL, 'Reforma de fachada', 'Responsável Manutenção', 0, 0, 0, NULL, 'Prazo demo', NULL, 'em_orcamento', 'Item vinculado ao fluxo demonstrativo.', NULL, NULL, NULL, NULL, '2026-06-23T18:00:00+00:00', '2026-06-23T18:00:00+00:00', 1, 12000, 12000, 'demo'),
  ('8becc856-8072-4dfe-9808-9ceb02e0c306', 'f1083796-dfd4-4da7-af7a-409393f5370b', '82ed6ff7-7348-42b9-84cf-2c50354f8c6c', '0510e989-02ee-4ec7-b8aa-862783560789', NULL, 'Troca de piso', 'Responsável Operações', 28000, 0, 0, NULL, 'Prazo demo', NULL, 'em_orcamento', 'Item vinculado ao fluxo demonstrativo.', NULL, NULL, NULL, NULL, '2026-06-24T00:00:00+00:00', '2026-06-24T00:00:00+00:00', 1, 28000, 28000, 'demo'),
  ('bfd32eef-0047-4676-9c5b-c874d6ce62df', '7fa4abb6-fe5a-4930-98b7-da9f4e5592ba', 'c495b3ad-2316-463c-80df-af5d65517ac3', '2b60b344-4105-4800-9fb4-8a928335346d', NULL, 'Adequação de layout', 'Responsável Obras', 7500, 0, 0, NULL, 'Prazo demo', NULL, 'em_orcamento', 'Item vinculado ao fluxo demonstrativo.', NULL, NULL, NULL, NULL, '2026-06-24T06:00:00+00:00', '2026-06-24T06:00:00+00:00', 1, 7500, 7500, 'demo'),
  ('3d4f4d2d-de36-4609-82ca-e0b0ec809e0a', '9c1fc362-bd35-4086-9b64-89bd1cc7fa09', 'fb86aa4b-bb89-496b-81fd-c97ae93f94a9', 'bdf84a60-0b67-4146-909b-c8980ca0ff88', NULL, 'Manutenção predial', 'Responsável Compras', 64000, 0, 0, NULL, 'Prazo demo', NULL, 'em_orcamento', 'Item vinculado ao fluxo demonstrativo.', NULL, NULL, NULL, NULL, '2026-06-24T12:00:00+00:00', '2026-06-24T12:00:00+00:00', 1, 64000, 64000, 'demo'),
  ('aee7b501-f133-4138-9fb8-1c4ca5e6509f', 'c65fda67-87f2-470d-94d5-4d63ac6cd656', '7d0a5413-b72b-44ed-8d5a-9ba31df4d595', 'd649ed82-6f03-4506-a565-806d2a2d42b4', NULL, 'Porta automática', 'Responsável TI', 21000, 0, 0, NULL, 'Prazo demo', NULL, 'em_orcamento', 'Item vinculado ao fluxo demonstrativo.', NULL, NULL, NULL, NULL, '2026-06-24T18:00:00+00:00', '2026-06-24T18:00:00+00:00', 1, 21000, 21000, 'demo'),
  ('e45d4c33-c015-40e1-9c5d-28675b35bb3d', 'f2a94613-2edd-423d-b74b-3c42aaaa2903', '5e8b366a-177f-408b-852b-98a2aa8ab804', '62aa6930-f4a8-41f6-9cd2-dc0e6b4bfe4b', NULL, 'Rede lógica', 'Responsável Segurança', 42120, 42120, 0, NULL, 'Prazo demo', 'Fornecedor Demo 2', 'em_orcamento', 'Item vinculado ao fluxo demonstrativo.', NULL, NULL, NULL, NULL, '2026-06-25T00:00:00+00:00', '2026-06-25T00:00:00+00:00', 1, 42120, 42120, 'demo'),
  ('f252ed6c-668b-424c-b7c2-24a5f525a41d', '60b8c837-9f9c-4d64-b867-1c6959eb8cb7', 'bd9b2498-c91c-4df1-9509-81af4eb80fa3', '895ec1ed-d53c-4865-a9be-c84f08649b54', NULL, 'Nobreak', 'Responsável Manutenção', 16200, 16200, 0, NULL, 'Prazo demo', 'Fornecedor Demo 3', 'em_orcamento', 'Item vinculado ao fluxo demonstrativo.', NULL, NULL, NULL, NULL, '2026-06-25T06:00:00+00:00', '2026-06-25T06:00:00+00:00', 1, 16200, 16200, 'demo'),
  ('559e693a-dcce-48ad-9abb-b8a45ebd64ca', '77fefc97-0361-49b2-8bef-812f0d2f8565', '4ba30e79-fbfe-4c44-ae4f-78e2b61d38c3', '1dbfa2f9-98c4-428e-802c-0cf8a4d52d34', NULL, 'Equipamento de atendimento', 'Responsável Operações', 58320, 58320, 0, NULL, 'Prazo demo', 'Fornecedor Demo 1', 'em_orcamento', 'Item vinculado ao fluxo demonstrativo.', NULL, NULL, NULL, NULL, '2026-06-25T12:00:00+00:00', '2026-06-25T12:00:00+00:00', 1, 58320, 58320, 'demo');

insert into public.historico_solicitacoes (id, created_at, solicitacao_id, acao, status_anterior, status_novo, motivo, usuario, observacao) values
  ('8998e9aa-e893-425f-958d-8e6321d77823', now(), '724bba5c-1850-4362-8686-a3f9ac733543', 'Registro criado para demo', NULL, 'enviada', 'Solicitação fictícia inserida na etapa enviada', 'Sistema Demo', NULL),
  ('262f19ec-b01b-49ed-b99f-cdb4376f1b78', now(), 'd5cc5bf2-41f1-4f86-a8f1-fb5e41707475', 'Registro criado para demo', NULL, 'enviada', 'Solicitação fictícia inserida na etapa enviada', 'Sistema Demo', NULL),
  ('bd4e0e6b-8185-4797-9676-d1b328d0cfa9', now(), '5297c5c8-0711-4e13-8ca3-bd8a4aa2ba43', 'Registro criado para demo', NULL, 'enviada', 'Solicitação fictícia inserida na etapa enviada', 'Sistema Demo', NULL),
  ('87667af6-49b6-4b74-aebc-22db720474e5', now(), '1f009ce9-3826-4d05-ad25-b011f7128ed6', 'Registro criado para demo', NULL, 'enviada', 'Solicitação fictícia inserida na etapa enviada', 'Sistema Demo', NULL),
  ('9f84c72f-0f48-44ad-8093-7d5481d8954e', now(), '74a921d9-d650-464e-9127-5e2e5a17f0f7', 'Registro criado para demo', NULL, 'enviada', 'Solicitação fictícia inserida na etapa enviada', 'Sistema Demo', NULL),
  ('5bde8619-fcf6-454d-876d-e9f9ce54cdc6', now(), '247c5611-eddc-4f84-9dcf-6a2c61097377', 'Registro criado para demo', NULL, 'ajuste_solicitado', 'Solicitação fictícia inserida na etapa ajuste_solicitado', 'Sistema Demo', NULL),
  ('47eccf2d-9d81-4ea1-96b8-cca34b99e3a2', now(), '998c7dd5-bb42-4735-9e81-1272700235dc', 'Registro criado para demo', NULL, 'ajuste_solicitado', 'Solicitação fictícia inserida na etapa ajuste_solicitado', 'Sistema Demo', NULL),
  ('45362fbd-5242-4da1-930e-b4be6af9dc29', now(), 'b9ec31ec-c1d1-485b-b5cc-552d5a67e741', 'Registro criado para demo', NULL, 'rejeitada_diretoria', 'Solicitação fictícia inserida na etapa rejeitada_diretoria', 'Sistema Demo', NULL),
  ('b41a21f2-b7ab-4ee9-a18c-7964015ac8d2', now(), 'd167fff1-9ce6-455f-9ad4-fd7c9a4b4e31', 'Registro criado para demo', NULL, 'aprovada_diretoria', 'Solicitação fictícia inserida na etapa aprovada_diretoria', 'Sistema Demo', NULL),
  ('939e61ee-73ec-4573-afea-8c823c186242', now(), '8515c283-2372-4e47-94fe-a9218881e346', 'Registro criado para demo', NULL, 'aprovada_diretoria', 'Solicitação fictícia inserida na etapa aprovada_diretoria', 'Sistema Demo', NULL),
  ('c2716179-468c-4d39-b782-b77cfcdda650', now(), 'cbf2345c-483b-4f58-8f88-3a07d6c5ba6d', 'Registro criado para demo', NULL, 'aprovada_diretoria', 'Solicitação fictícia inserida na etapa aprovada_diretoria', 'Sistema Demo', NULL),
  ('58f721e0-64ed-4bac-9aa1-c605077156cf', now(), 'a2a47cbe-2fe0-46a7-9621-263a787f9069', 'Registro criado para demo', NULL, 'aprovada_diretoria', 'Solicitação fictícia inserida na etapa aprovada_diretoria', 'Sistema Demo', NULL),
  ('59833a3c-7f6c-4c98-9a59-0c0cc8bdf42c', now(), '8e41fcaa-ff5a-4bcc-b38c-41b7bf9e0f2f', 'Registro criado para demo', NULL, 'rejeitada_patrimonio', 'Solicitação fictícia inserida na etapa rejeitada_patrimonio', 'Sistema Demo', NULL),
  ('5c05793b-0660-4578-ba15-3cfd513725f1', now(), '3aac7f0a-d02f-4765-b63a-6452f5f32818', 'Registro criado para demo', NULL, 'pendente_orcamento', 'Solicitação fictícia inserida na etapa pendente_orcamento', 'Sistema Demo', NULL),
  ('550350d4-aaf5-4dec-9536-eb1a2570ee21', now(), '74a306fa-ac0a-44ea-80c0-212df9d1e1f5', 'Registro criado para demo', NULL, 'pendente_orcamento', 'Solicitação fictícia inserida na etapa pendente_orcamento', 'Sistema Demo', NULL),
  ('c7aa15fc-36db-497d-98d7-e23e7a68f867', now(), '0f6908eb-4f2e-4ce7-a1b4-ed1f4d2414d7', 'Registro criado para demo', NULL, 'pendente_orcamento', 'Solicitação fictícia inserida na etapa pendente_orcamento', 'Sistema Demo', NULL),
  ('35741022-7fcd-4c75-8ccc-635bca1fcf24', now(), '3e30b9de-5e8d-4fa8-a3e1-472bd976ce8b', 'Registro criado para demo', NULL, 'pendente_orcamento', 'Solicitação fictícia inserida na etapa pendente_orcamento', 'Sistema Demo', NULL),
  ('c396f9db-959c-4c8e-8beb-2f019d09a2b1', now(), 'f1083796-dfd4-4da7-af7a-409393f5370b', 'Registro criado para demo', NULL, 'aguardando_cotacao', 'Solicitação fictícia inserida na etapa aguardando_cotacao', 'Sistema Demo', NULL),
  ('b14b64e4-9b76-4d80-a9f2-a3ac76d5b0ed', now(), '7fa4abb6-fe5a-4930-98b7-da9f4e5592ba', 'Registro criado para demo', NULL, 'aguardando_cotacao', 'Solicitação fictícia inserida na etapa aguardando_cotacao', 'Sistema Demo', NULL),
  ('db91e4ad-f7ac-4e47-bf7c-73bbd0e3842c', now(), '9c1fc362-bd35-4086-9b64-89bd1cc7fa09', 'Registro criado para demo', NULL, 'aguardando_cotacao', 'Solicitação fictícia inserida na etapa aguardando_cotacao', 'Sistema Demo', NULL),
  ('09659498-cf8e-42f5-8d54-d2d925a4c491', now(), 'c65fda67-87f2-470d-94d5-4d63ac6cd656', 'Registro criado para demo', NULL, 'aguardando_cotacao', 'Solicitação fictícia inserida na etapa aguardando_cotacao', 'Sistema Demo', NULL),
  ('dded682d-315b-4871-801b-5a217f5e7c24', now(), 'f2a94613-2edd-423d-b74b-3c42aaaa2903', 'Registro criado para demo', NULL, 'orcamento_concluido', 'Solicitação fictícia inserida na etapa orcamento_concluido', 'Sistema Demo', NULL),
  ('788be789-41c6-4b78-b8a2-62b8e8c99e35', now(), '60b8c837-9f9c-4d64-b867-1c6959eb8cb7', 'Registro criado para demo', NULL, 'orcamento_concluido', 'Solicitação fictícia inserida na etapa orcamento_concluido', 'Sistema Demo', NULL),
  ('60b57533-7896-4891-a111-6209ab656783', now(), '77fefc97-0361-49b2-8bef-812f0d2f8565', 'Registro criado para demo', NULL, 'orcamento_concluido', 'Solicitação fictícia inserida na etapa orcamento_concluido', 'Sistema Demo', NULL);


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
  d.nome as diretoria_nome,
  st.nome as setor_nome,
  p.nome_projeto,
  ip.tipo_movimento,
  coalesce(ip.situacao, case
    when s.status in ('pendente_orcamento', 'aguardando_cotacao', 'orcamento_concluido') then 'em_orcamento'
    when s.status in ('rejeitada_diretoria', 'rejeitada_patrimonio') then 'cancelado'
    else 'em_analise'
  end) as situacao,
  coalesce(ip.valor_total_investimento, ip.valor_orcado, s.valor_orcado, 0) as valor_total_investimento,
  coalesce(ip.valor_orcado, s.valor_orcado, 0) as valor_orcado,
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

grant all on public.diretorias to anon, authenticated;
grant all on public.setores to anon, authenticated;
grant all on public.filiais to anon, authenticated;
grant all on public.itens_catalogo to anon, authenticated;
grant all on public.projetos to anon, authenticated;
grant all on public.usuarios to anon, authenticated;
grant all on public.solicitacoes to anon, authenticated;
grant all on public.itens_projeto to anon, authenticated;
grant all on public.historico_solicitacoes to anon, authenticated;
grant select on public.vw_central_investimentos to anon, authenticated;
grant select on public.vw_dashboard_investimentos to anon, authenticated;

commit;
