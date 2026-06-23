"use client";

import { useEffect, useMemo, useState } from "react";
import { DetailInfoGrid } from "@/components/DetailInfoGrid";
import { KpiCard } from "@/components/KpiCard";
import { Shell } from "@/components/Shell";
import { supabase } from "@/lib/supabase";

type StatusFiltro = "pendentes" | "concluidos" | "todas";

type Solicitacao = {
  id: string;
  codigo: string | null;
  filial_id: string | null;
  setor_id: string | null;
  item_catalogo_id: string | null;
  prioridade: string;
  status: string;
  tipo: string;
  justificativa: string | null;
  observacao_diretoria: string | null;
  parecer_patrimonio: string | null;
  foto_url: string | null;
  created_at: string;
  projeto_orcamento: string | null;
  responsavel_orcamento: string | null;
  observacao_orcamento: string | null;
  data_encaminhamento_orcamento: string | null;
  fornecedor_orcamento: string | null;
  valor_orcado: number | null;
  prazo_orcamento: string | null;
  condicao_pagamento: string | null;
  observacao_cotacao: string | null;
  data_orcamento_concluido: string | null;
};

type Filial = { id: string; nome_filial: string };
type Setor = { id: string; nome: string };
type ItemCatalogo = { id: string; nome_item: string };

export default function Orcamentos() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [itens, setItens] = useState<ItemCatalogo[]>([]);

  const [aba, setAba] = useState<StatusFiltro>("pendentes");
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loadingId, setLoadingId] = useState("");

  const [detalheId, setDetalheId] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [valor, setValor] = useState("");
  const [prazo, setPrazo] = useState("");
  const [condicao, setCondicao] = useState("");
  const [observacaoCotacao, setObservacaoCotacao] = useState("");

  async function carregarDados() {
    if (!supabase) return;

    const [solicitacoesResp, filiaisResp, setoresResp, itensResp] =
      await Promise.all([
        supabase
          .from("solicitacoes")
          .select("*")
          .in("status", ["aguardando_cotacao", "orcamento_concluido"])
          .order("created_at", { ascending: false }),
        supabase.from("filiais").select("id, nome_filial"),
        supabase.from("setores").select("id, nome"),
        supabase.from("itens_catalogo").select("id, nome_item"),
      ]);

    if (solicitacoesResp.error) {
      setMensagem(`Erro: ${solicitacoesResp.error.message}`);
      return;
    }

    setSolicitacoes((solicitacoesResp.data ?? []) as Solicitacao[]);
    setFiliais(filiaisResp.data ?? []);
    setSetores(setoresResp.data ?? []);
    setItens(itensResp.data ?? []);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function nomeFilial(id: string | null) {
    return filiais.find((f) => f.id === id)?.nome_filial ?? "-";
  }

  function nomeSetor(id: string | null) {
    return setores.find((s) => s.id === id)?.nome ?? "-";
  }

  function nomeItem(id: string | null) {
    return itens.find((i) => i.id === id)?.nome_item ?? "-";
  }

  function codigoCurto(codigo: string | null) {
    if (!codigo) return "-";

    const numeros = codigo.replace(/\D/g, "");
    const final = numeros.slice(-4);

    if (codigo.startsWith("SOL")) return `SOL-${final}`;
    if (codigo.startsWith("IMP")) return `IMP-${final}`;

    return `#${final}`;
  }

  function formatarDataHora(valor: string | null) {
    if (!valor) return "-";
    return new Date(valor).toLocaleString("pt-BR");
  }

  function formatarMoeda(valorAtual: number | null) {
    if (valorAtual === null || valorAtual === undefined) return "-";

    return valorAtual.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function valorParaNumero(valorTexto: string) {
    const limpo = valorTexto
      .replace(/\s/g, "")
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".");

    const numero = Number(limpo);

    return Number.isNaN(numero) ? 0 : numero;
  }

  function traduzStatus(valorAtual: string) {
    const mapa: Record<string, string> = {
      aguardando_cotacao: "Aguardando cotação",
      orcamento_concluido: "Orçamento concluído",
    };

    return mapa[valorAtual] ?? valorAtual;
  }

  function traduzPrioridade(valorAtual: string) {
    const mapa: Record<string, string> = {
      baixa: "Baixa",
      media: "Média",
      alta: "Alta",
      critica: "Crítica",
    };

    return mapa[valorAtual] ?? valorAtual;
  }

  const pendentes = solicitacoes.filter(
    (s) => s.status === "aguardando_cotacao"
  );

  const concluidos = solicitacoes.filter(
    (s) => s.status === "orcamento_concluido"
  );

  const valorTotalOrcado = concluidos.reduce(
    (total, s) => total + Number(s.valor_orcado ?? 0),
    0
  );

  const altaPrioridade = pendentes.filter(
    (s) => s.prioridade === "alta" || s.prioridade === "critica"
  ).length;

  const solicitacaoDetalhe = solicitacoes.find((s) => s.id === detalheId);

  const solicitacoesFiltradas = useMemo(() => {
    let lista = solicitacoes;

    if (aba === "pendentes") lista = pendentes;
    if (aba === "concluidos") lista = concluidos;

    if (busca.trim()) {
      const termo = busca.toLowerCase();

      lista = lista.filter((s) =>
        [
          s.codigo,
          nomeFilial(s.filial_id),
          nomeSetor(s.setor_id),
          nomeItem(s.item_catalogo_id),
          s.status,
          s.projeto_orcamento,
          s.responsavel_orcamento,
          s.fornecedor_orcamento,
        ]
          .join(" ")
          .toLowerCase()
          .includes(termo)
      );
    }

    return lista;
  }, [solicitacoes, aba, busca, filiais, setores, itens]);

  function abrirDetalhes(solicitacao: Solicitacao) {
    setDetalheId(solicitacao.id);
    setFornecedor(solicitacao.fornecedor_orcamento ?? "");
    setValor(
      solicitacao.valor_orcado
        ? String(solicitacao.valor_orcado).replace(".", ",")
        : ""
    );
    setPrazo(solicitacao.prazo_orcamento ?? "");
    setCondicao(solicitacao.condicao_pagamento ?? "");
    setObservacaoCotacao(solicitacao.observacao_cotacao ?? "");
  }

  async function registrarHistorico(params: {
    solicitacaoId: string;
    acao: string;
    statusAnterior?: string;
    statusNovo?: string;
    motivo?: string;
  }) {
    if (!supabase) return;

    await supabase.from("historico_solicitacoes").insert({
      solicitacao_id: params.solicitacaoId,
      acao: params.acao,
      status_anterior: params.statusAnterior ?? null,
      status_novo: params.statusNovo ?? null,
      motivo: params.motivo ?? null,
      usuario: "Admin Modelo",
    });
  }

  async function concluirOrcamento() {
    if (!supabase || !solicitacaoDetalhe) return;

    if (!fornecedor.trim()) {
      setMensagem("Erro: informe o fornecedor.");
      return;
    }

    if (!valor.trim()) {
      setMensagem("Erro: informe o valor orçado.");
      return;
    }

    if (!prazo.trim()) {
      setMensagem("Erro: informe o prazo.");
      return;
    }

    const valorNumerico = valorParaNumero(valor);

    if (valorNumerico <= 0) {
      setMensagem("Erro: informe um valor válido.");
      return;
    }

    setLoadingId(solicitacaoDetalhe.id);
    setMensagem("");

    const novoStatus = "orcamento_concluido";

    const { error } = await supabase
      .from("solicitacoes")
      .update({
        status: novoStatus,
        fornecedor_orcamento: fornecedor,
        valor_orcado: valorNumerico,
        prazo_orcamento: prazo,
        condicao_pagamento: condicao,
        observacao_cotacao: observacaoCotacao,
        data_orcamento_concluido: new Date().toISOString(),
      })
      .eq("id", solicitacaoDetalhe.id);

    if (error) {
      setLoadingId("");
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    await registrarHistorico({
      solicitacaoId: solicitacaoDetalhe.id,
      acao: "Orçamento concluído",
      statusAnterior: solicitacaoDetalhe.status,
      statusNovo: novoStatus,
      motivo: `Fornecedor: ${fornecedor}. Valor: ${formatarMoeda(
        valorNumerico
      )}. Prazo: ${prazo}.`,
    });

    setLoadingId("");
    setDetalheId("");
    setMensagem("Orçamento concluído com sucesso.");
    await carregarDados();
  }

  return (
    <Shell
      title="Orçamentos/Cotações"
      subtitle="Registro de fornecedores, valores, prazos e condições das cotações."
    >
      <section className="kpi-grid">
        <KpiCard
          label="Aguardando cotação"
          value={String(pendentes.length)}
          variant="orange"
        />

        <KpiCard
          label="Alta prioridade"
          value={String(altaPrioridade)}
          variant="purple"
        />

        <KpiCard
          label="Concluídos"
          value={String(concluidos.length)}
          variant="blue"
        />

        <KpiCard
          label="Valor orçado"
          value={formatarMoeda(valorTotalOrcado)}
          variant="green"
        />
      </section>

      {mensagem && (
        <div
          className={mensagem.startsWith("Erro") ? "alert-error" : "alert-success"}
        >
          {mensagem}
        </div>
      )}

      <section className="panel">
        <div className="panel-top">
          <div>
            <h2>Solicitações para cotação</h2>
            <p>
              Informe fornecedor, valor, prazo e condição de pagamento para
              concluir o orçamento.
            </p>
          </div>
        </div>

        <div className="tab-row">
          <button
            className={aba === "pendentes" ? "tab-button active" : "tab-button"}
            onClick={() => setAba("pendentes")}
          >
            Aguardando cotação ({pendentes.length})
          </button>

          <button
            className={aba === "concluidos" ? "tab-button active" : "tab-button"}
            onClick={() => setAba("concluidos")}
          >
            Concluídos ({concluidos.length})
          </button>

          <button
            className={aba === "todas" ? "tab-button active" : "tab-button"}
            onClick={() => setAba("todas")}
          >
            Todas ({solicitacoes.length})
          </button>
        </div>

        <input
          className="search-input"
          placeholder="Buscar por código, filial, setor, item, projeto, responsável ou fornecedor..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <div className="request-table-limited orcamentos-table">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Item</th>
                <th>Projeto</th>
                <th>Responsável</th>
                <th>Fornecedor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {solicitacoesFiltradas.map((solicitacao) => (
                <tr key={solicitacao.id}>
                  <td title={solicitacao.codigo ?? ""}>
                    {codigoCurto(solicitacao.codigo)}
                  </td>

                  <td title={nomeItem(solicitacao.item_catalogo_id)}>
                    <strong>{nomeItem(solicitacao.item_catalogo_id)}</strong>
                  </td>

                  <td title={solicitacao.projeto_orcamento ?? ""}>
                    {solicitacao.projeto_orcamento ?? "-"}
                  </td>

                  <td title={solicitacao.responsavel_orcamento ?? ""}>
                    {solicitacao.responsavel_orcamento ?? "-"}
                  </td>

                  <td title={solicitacao.fornecedor_orcamento ?? ""}>
                    {solicitacao.fornecedor_orcamento ?? "-"}
                  </td>

                  <td>
                    <span className={`status ${solicitacao.status}`}>
                      {traduzStatus(solicitacao.status)}
                    </span>
                  </td>

                  <td>
                    <div className="action-row">
                      <button
                        type="button"
                        className="mini-button"
                        onClick={() => abrirDetalhes(solicitacao)}
                      >
                        Detalhes
                      </button>

                      <button
                        type="button"
                        className="mini-button approve"
                        onClick={() => abrirDetalhes(solicitacao)}
                      >
                        {solicitacao.status === "aguardando_cotacao"
                          ? "Orçar"
                          : "Editar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {solicitacoesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={7}>Nenhuma solicitação encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {solicitacaoDetalhe && (
        <div className="modal-backdrop">
          <section className="modal-card modal-card-wide">
            <div className="modal-header">
              <div>
                <h2>Orçamento / Cotação</h2>
                <p>{solicitacaoDetalhe.codigo}</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setDetalheId("")}
              >
                ×
              </button>
            </div>

            <DetailInfoGrid
              items={[
                {
                  label: "Data da solicitação",
                  value: formatarDataHora(solicitacaoDetalhe.created_at),
                },
                { label: "Filial", value: nomeFilial(solicitacaoDetalhe.filial_id) },
                { label: "Setor", value: nomeSetor(solicitacaoDetalhe.setor_id) },
                { label: "Item", value: nomeItem(solicitacaoDetalhe.item_catalogo_id) },
                {
                  label: "Projeto",
                  value: solicitacaoDetalhe.projeto_orcamento ?? "-",
                },
                {
                  label: "Responsável",
                  value: solicitacaoDetalhe.responsavel_orcamento ?? "-",
                },
                { label: "Status", value: traduzStatus(solicitacaoDetalhe.status) },
                {
                  label: "Valor atual",
                  value: formatarMoeda(solicitacaoDetalhe.valor_orcado),
                },
              ]}
            />

            <div className="detail-block">
              <strong>Observação do projeto</strong>
              <p>
                {solicitacaoDetalhe.observacao_orcamento ||
                  "Sem observação do projeto."}
              </p>
            </div>

            <div className="form-grid">
              <label>
                Fornecedor
                <input
                  value={fornecedor}
                  onChange={(e) => setFornecedor(e.target.value)}
                  placeholder="Ex.: Refricomp, Nilfisk, fornecedor homologado..."
                />
              </label>

              <label>
                Valor orçado
                <input
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="Ex.: 8950,00"
                />
              </label>

              <label>
                Prazo
                <input
                  value={prazo}
                  onChange={(e) => setPrazo(e.target.value)}
                  placeholder="Ex.: 30 dias após pedido"
                />
              </label>

              <label>
                Condição de pagamento
                <input
                  value={condicao}
                  onChange={(e) => setCondicao(e.target.value)}
                  placeholder="Ex.: 28 dias, boleto, faturado..."
                />
              </label>
            </div>

            <div className="detail-block">
              <strong>Observação da cotação</strong>

              <textarea
                value={observacaoCotacao}
                onChange={(e) => setObservacaoCotacao(e.target.value)}
                placeholder="Informe detalhes da cotação, condição comercial, fornecedor alternativo ou justificativa."
              />
            </div>

            <div className="detail-block">
              <strong>Retorno do patrimônio</strong>
              <p>
                {solicitacaoDetalhe.parecer_patrimonio ||
                  "Sem retorno do patrimônio."}
              </p>
            </div>

            <div className="detail-block">
              <strong>Foto da necessidade</strong>

              {solicitacaoDetalhe.foto_url ? (
                <a
                  href={solicitacaoDetalhe.foto_url}
                  target="_blank"
                  rel="noreferrer"
                  className="request-photo-link"
                >
                  <img
                    src={solicitacaoDetalhe.foto_url}
                    alt="Foto da necessidade"
                    className="request-photo"
                  />
                </a>
              ) : (
                <p>Nenhuma foto anexada.</p>
              )}
            </div>

            <div className="modal-footer-actions">
              <button
                type="button"
                className="action-main approve"
                disabled={loadingId === solicitacaoDetalhe.id}
                onClick={concluirOrcamento}
              >
                {loadingId === solicitacaoDetalhe.id
                  ? "Salvando..."
                  : "Concluir orçamento"}
              </button>
            </div>
          </section>
        </div>
      )}
    </Shell>
  );
}
