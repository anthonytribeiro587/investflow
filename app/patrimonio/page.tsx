"use client";

import { useEffect, useMemo, useState } from "react";
import { KpiCard } from "@/components/KpiCard";
import { Shell } from "@/components/Shell";
import { supabase } from "@/lib/supabase";

type StatusFiltro = "analise" | "orcamento" | "ajustes" | "rejeitadas" | "todas";

type Solicitacao = {
  id: string;
  codigo: string | null;
  ano: number;
  filial_id: string | null;
  setor_id: string | null;
  item_catalogo_id: string | null;
  prioridade: string;
  status: string;
  tipo: string;
  semestre_sugerido: string | null;
  semestre_aprovado: string | null;
  justificativa: string | null;
  observacao_diretoria: string | null;
  foto_url: string | null;
  created_at: string;
  parecer_patrimonio: string | null;
  patrimonio_data: string | null;
};

type Filial = { id: string; nome_filial: string };
type Setor = { id: string; nome: string };
type ItemCatalogo = { id: string; nome_item: string };

export default function Patrimonio() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [itens, setItens] = useState<ItemCatalogo[]>([]);

  const [mensagem, setMensagem] = useState("");
  const [loadingId, setLoadingId] = useState("");
  const [aba, setAba] = useState<StatusFiltro>("analise");
  const [busca, setBusca] = useState("");

  const [detalheId, setDetalheId] = useState("");
  const [parecer, setParecer] = useState("");
  const [selecionadas, setSelecionadas] = useState<string[]>([]);

  const [modalRejeicaoId, setModalRejeicaoId] = useState("");
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  async function carregarDados() {
    if (!supabase) return;

    const [solicitacoesResp, filiaisResp, setoresResp, itensResp] =
      await Promise.all([
        supabase
          .from("solicitacoes")
          .select("*")
          .in("status", [
            "aprovada_diretoria",
            "pendente_orcamento",
            "ajuste_solicitado",
            "rejeitada_patrimonio",
          ])
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

  function formatarData(valor: string) {
    return new Date(valor).toLocaleDateString("pt-BR");
  }

  function formatarDataHora(valor: string) {
    return new Date(valor).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function traduzPrioridade(valor: string) {
    const mapa: Record<string, string> = {
      baixa: "Baixa",
      media: "Média",
      alta: "Alta",
      critica: "Crítica",
    };

    return mapa[valor] ?? valor;
  }

  function traduzStatus(valor: string) {
    const mapa: Record<string, string> = {
      aprovada_diretoria: "Em análise",
      pendente_orcamento: "Orçamento",
      ajuste_solicitado: "Ajuste",
      rejeitada_patrimonio: "Rejeitada",
    };

    return mapa[valor] ?? valor;
  }

  const emAnalise = solicitacoes.filter(
    (s) => s.status === "aprovada_diretoria"
  );

  const encaminhadas = solicitacoes.filter(
    (s) => s.status === "pendente_orcamento"
  );

  const ajustes = solicitacoes.filter((s) => s.status === "ajuste_solicitado");

  const rejeitadas = solicitacoes.filter(
    (s) => s.status === "rejeitada_patrimonio"
  );

  const altaPrioridade = emAnalise.filter(
    (s) => s.prioridade === "alta" || s.prioridade === "critica"
  ).length;

  const solicitacaoDetalhe = solicitacoes.find((s) => s.id === detalheId);
  const solicitacaoRejeicao = solicitacoes.find((s) => s.id === modalRejeicaoId);

  const solicitacoesFiltradas = useMemo(() => {
    let lista = solicitacoes;

    if (aba === "analise") lista = emAnalise;
    if (aba === "orcamento") lista = encaminhadas;
    if (aba === "ajustes") lista = ajustes;
    if (aba === "rejeitadas") lista = rejeitadas;

    if (busca.trim()) {
      const termo = busca.toLowerCase();

      lista = lista.filter((s) =>
        [
          s.codigo,
          nomeFilial(s.filial_id),
          nomeSetor(s.setor_id),
          nomeItem(s.item_catalogo_id),
          s.status,
          s.prioridade,
          s.tipo,
        ]
          .join(" ")
          .toLowerCase()
          .includes(termo)
      );
    }

    return lista;
  }, [solicitacoes, aba, busca, filiais, setores, itens]);

  const idsAnaliseVisiveis = solicitacoesFiltradas
    .filter((s) => s.status === "aprovada_diretoria")
    .map((s) => s.id);

  const todasSelecionadas =
    idsAnaliseVisiveis.length > 0 &&
    idsAnaliseVisiveis.every((id) => selecionadas.includes(id));

  function alternarSelecao(id: string) {
    setSelecionadas((atual) =>
      atual.includes(id)
        ? atual.filter((item) => item !== id)
        : [...atual, id]
    );
  }

  function alternarTodas() {
    setSelecionadas(todasSelecionadas ? [] : idsAnaliseVisiveis);
  }

  function abrirDetalhes(solicitacao: Solicitacao) {
    setDetalheId(solicitacao.id);
    setParecer(solicitacao.parecer_patrimonio ?? "");
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

  async function encaminharSelecionadas() {
    if (!supabase || selecionadas.length === 0) return;

    setMensagem("");
    setLoadingId("bulk");

    const selecionadasObjetos = solicitacoes.filter((s) =>
      selecionadas.includes(s.id)
    );

    const { error } = await supabase
      .from("solicitacoes")
      .update({
        status: "pendente_orcamento",
        parecer_patrimonio: "Encaminhado em massa pelo patrimônio.",
        patrimonio_data: new Date().toISOString(),
      })
      .in("id", selecionadas);

    if (error) {
      setLoadingId("");
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    await Promise.all(
      selecionadasObjetos.map((s) =>
        registrarHistorico({
          solicitacaoId: s.id,
          acao: "Encaminhamento em massa para orçamento",
          statusAnterior: s.status,
          statusNovo: "pendente_orcamento",
          motivo: "Encaminhado em massa pelo patrimônio.",
        })
      )
    );

    const total = selecionadas.length;

    setLoadingId("");
    setSelecionadas([]);
    setMensagem(`${total} solicitações encaminhadas para orçamento.`);
    await carregarDados();
  }

  async function encaminharRapido(solicitacao: Solicitacao) {
    if (!supabase) return;

    setMensagem("");
    setLoadingId(solicitacao.id);

    const { error } = await supabase
      .from("solicitacoes")
      .update({
        status: "pendente_orcamento",
        parecer_patrimonio: "Encaminhado pelo patrimônio.",
        patrimonio_data: new Date().toISOString(),
      })
      .eq("id", solicitacao.id);

    if (error) {
      setLoadingId("");
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    await registrarHistorico({
      solicitacaoId: solicitacao.id,
      acao: "Encaminhamento para orçamento",
      statusAnterior: solicitacao.status,
      statusNovo: "pendente_orcamento",
      motivo: "Encaminhado pelo patrimônio.",
    });

    setLoadingId("");
    setMensagem("Solicitação encaminhada para orçamento.");
    await carregarDados();
  }

  async function encaminharParaOrcamento() {
    if (!supabase || !solicitacaoDetalhe) return;

    if (!parecer.trim()) {
      setMensagem("Erro: informe o parecer técnico.");
      return;
    }

    setLoadingId(solicitacaoDetalhe.id);
    setMensagem("");

    const { error } = await supabase
      .from("solicitacoes")
      .update({
        status: "pendente_orcamento",
        parecer_patrimonio: parecer,
        patrimonio_data: new Date().toISOString(),
      })
      .eq("id", solicitacaoDetalhe.id);

    if (error) {
      setLoadingId("");
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    await registrarHistorico({
      solicitacaoId: solicitacaoDetalhe.id,
      acao: "Encaminhamento para orçamento",
      statusAnterior: solicitacaoDetalhe.status,
      statusNovo: "pendente_orcamento",
      motivo: parecer,
    });

    setLoadingId("");
    setDetalheId("");
    setMensagem("Solicitação encaminhada para orçamento com sucesso.");
    await carregarDados();
  }

  async function solicitarAjustePatrimonio() {
    if (!supabase || !solicitacaoDetalhe) return;

    if (!parecer.trim()) {
      setMensagem("Erro: informe o motivo do ajuste.");
      return;
    }

    setLoadingId(solicitacaoDetalhe.id);
    setMensagem("");

    const { error } = await supabase
      .from("solicitacoes")
      .update({
        status: "ajuste_solicitado",
        parecer_patrimonio: parecer,
        patrimonio_data: new Date().toISOString(),
      })
      .eq("id", solicitacaoDetalhe.id);

    if (error) {
      setLoadingId("");
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    await registrarHistorico({
      solicitacaoId: solicitacaoDetalhe.id,
      acao: "Ajuste solicitado pelo patrimônio",
      statusAnterior: solicitacaoDetalhe.status,
      statusNovo: "ajuste_solicitado",
      motivo: parecer,
    });

    setLoadingId("");
    setDetalheId("");
    setMensagem("Ajuste solicitado com sucesso.");
    await carregarDados();
  }

  async function confirmarRejeicao() {
    if (!supabase || !solicitacaoRejeicao) return;

    if (!motivoRejeicao.trim()) {
      setMensagem("Erro: informe o motivo da rejeição.");
      return;
    }

    setLoadingId(solicitacaoRejeicao.id);
    setMensagem("");

    const { error } = await supabase
      .from("solicitacoes")
      .update({
        status: "rejeitada_patrimonio",
        parecer_patrimonio: motivoRejeicao,
        patrimonio_data: new Date().toISOString(),
      })
      .eq("id", solicitacaoRejeicao.id);

    if (error) {
      setLoadingId("");
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    await registrarHistorico({
      solicitacaoId: solicitacaoRejeicao.id,
      acao: "Rejeição pelo patrimônio",
      statusAnterior: solicitacaoRejeicao.status,
      statusNovo: "rejeitada_patrimonio",
      motivo: motivoRejeicao,
    });

    setLoadingId("");
    setDetalheId("");
    setModalRejeicaoId("");
    setMotivoRejeicao("");
    setMensagem("Solicitação rejeitada pelo patrimônio.");
    await carregarDados();
  }

  return (
    <Shell
      title="Patrimônio"
      subtitle="Análise patrimonial e encaminhamento para orçamento."
    >
      <section className="kpi-grid">
        <KpiCard label="Em análise" value={String(emAnalise.length)} variant="orange" />
        <KpiCard label="Alta prioridade" value={String(altaPrioridade)} variant="purple" />
        <KpiCard label="Rejeitadas" value={String(rejeitadas.length)} variant="green" />
        <KpiCard label="Encaminhadas" value={String(encaminhadas.length)} variant="blue" />
      </section>

      {mensagem && (
        <div className={mensagem.startsWith("Erro") ? "alert-error" : "alert-success"}>
          {mensagem}
        </div>
      )}

      <section className="panel">
        <div className="panel-top">
          <div>
            <h2>Solicitações do patrimônio</h2>
            <p>
              Analise as demandas aprovadas pela diretoria e encaminhe para orçamento.
            </p>
          </div>

          {aba === "analise" && (
            <button
              type="button"
              className="action-button"
              disabled={selecionadas.length === 0 || loadingId === "bulk"}
              onClick={encaminharSelecionadas}
            >
              {loadingId === "bulk"
                ? "Encaminhando..."
                : `Encaminhar selecionadas (${selecionadas.length})`}
            </button>
          )}
        </div>

        <div className="tab-row">
          <button className={aba === "analise" ? "tab-button active" : "tab-button"} onClick={() => setAba("analise")}>
            Em análise ({emAnalise.length})
          </button>

          <button className={aba === "orcamento" ? "tab-button active" : "tab-button"} onClick={() => setAba("orcamento")}>
            Encaminhadas ({encaminhadas.length})
          </button>

          <button className={aba === "ajustes" ? "tab-button active" : "tab-button"} onClick={() => setAba("ajustes")}>
            Aguardando ajustes ({ajustes.length})
          </button>

          <button className={aba === "rejeitadas" ? "tab-button active" : "tab-button"} onClick={() => setAba("rejeitadas")}>
            Rejeitadas ({rejeitadas.length})
          </button>

          <button className={aba === "todas" ? "tab-button active" : "tab-button"} onClick={() => setAba("todas")}>
            Todas ({solicitacoes.length})
          </button>
        </div>

        <input
          className="search-input"
          placeholder="Buscar por código, filial, setor, item ou status..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <div className="request-table-limited diretoria-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={todasSelecionadas}
                    onChange={alternarTodas}
                    disabled={idsAnaliseVisiveis.length === 0}
                  />
                </th>
                <th>Código</th>
                <th>Data</th>
                <th>Filial</th>
                <th>Setor</th>
                <th>Item</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {solicitacoesFiltradas.map((solicitacao) => (
                <tr key={solicitacao.id}>
                  <td>
                    {solicitacao.status === "aprovada_diretoria" && (
                      <input
                        type="checkbox"
                        checked={selecionadas.includes(solicitacao.id)}
                        onChange={() => alternarSelecao(solicitacao.id)}
                      />
                    )}
                  </td>

                  <td title={solicitacao.codigo ?? ""}>
                    {codigoCurto(solicitacao.codigo)}
                  </td>

                  <td>{formatarData(solicitacao.created_at)}</td>
                  <td>{nomeFilial(solicitacao.filial_id)}</td>
                  <td>{nomeSetor(solicitacao.setor_id)}</td>

                  <td>
                    <strong>{nomeItem(solicitacao.item_catalogo_id)}</strong>
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

                      {solicitacao.status === "aprovada_diretoria" && (
                        <>
                          <button
                            type="button"
                            className="mini-button approve"
                            disabled={loadingId === solicitacao.id}
                            onClick={() => encaminharRapido(solicitacao)}
                          >
                            Encaminhar
                          </button>

                          <button
                            type="button"
                            className="mini-button reject"
                            disabled={loadingId === solicitacao.id}
                            onClick={() => {
                              setModalRejeicaoId(solicitacao.id);
                              setMotivoRejeicao("");
                            }}
                          >
                            Rejeitar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {solicitacoesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={8}>Nenhuma solicitação encontrada.</td>
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
                <h2>Análise patrimonial</h2>
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

            <div className="detail-grid">
              <div>
                <strong>Data da solicitação</strong>
                <span>{formatarDataHora(solicitacaoDetalhe.created_at)}</span>
              </div>

              <div>
                <strong>Filial</strong>
                <span>{nomeFilial(solicitacaoDetalhe.filial_id)}</span>
              </div>

              <div>
                <strong>Setor</strong>
                <span>{nomeSetor(solicitacaoDetalhe.setor_id)}</span>
              </div>

              <div>
                <strong>Item</strong>
                <span>{nomeItem(solicitacaoDetalhe.item_catalogo_id)}</span>
              </div>

              <div>
                <strong>Prioridade</strong>
                <span>{traduzPrioridade(solicitacaoDetalhe.prioridade)}</span>
              </div>

              <div>
                <strong>Status</strong>
                <span>{traduzStatus(solicitacaoDetalhe.status)}</span>
              </div>
            </div>

            <div className="detail-block">
              <strong>Justificativa da solicitação</strong>
              <p>
                {solicitacaoDetalhe.justificativa ||
                  "Sem justificativa informada."}
              </p>
            </div>

            <div className="detail-block">
              <strong>Observação da diretoria</strong>
              <p>
                {solicitacaoDetalhe.observacao_diretoria || "Sem observação."}
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

            <div className="detail-block">
              <strong>Parecer técnico do patrimônio</strong>

              <textarea
                value={parecer}
                onChange={(e) => setParecer(e.target.value)}
                placeholder="Informe o parecer técnico do patrimônio..."
              />
            </div>

            <div className="modal-footer-actions">
              {solicitacaoDetalhe.status === "aprovada_diretoria" && (
                <>
                  <button
                    type="button"
                    className="action-main adjust"
                    disabled={loadingId === solicitacaoDetalhe.id}
                    onClick={solicitarAjustePatrimonio}
                  >
                    Solicitar ajuste
                  </button>

                  <button
                    type="button"
                    className="action-main reject"
                    disabled={loadingId === solicitacaoDetalhe.id}
                    onClick={() => {
                      setModalRejeicaoId(solicitacaoDetalhe.id);
                      setMotivoRejeicao("");
                    }}
                  >
                    Rejeitar
                  </button>

                  <button
                    type="button"
                    className="action-main approve"
                    disabled={loadingId === solicitacaoDetalhe.id}
                    onClick={encaminharParaOrcamento}
                  >
                    Encaminhar para orçamento
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      )}

      {modalRejeicaoId && (
        <div className="modal-backdrop">
          <section className="modal-card">
            <div className="modal-header">
              <div>
                <h2>Rejeitar solicitação</h2>
                <p>Informe a justificativa da rejeição pelo patrimônio.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setModalRejeicaoId("")}
              >
                ×
              </button>
            </div>

            <label>
              Justificativa da rejeição
              <textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Ex.: item não se enquadra como investimento, necessidade já atendida, demanda improcedente..."
              />
            </label>

            <button
              type="button"
              className="action-button"
              disabled={loadingId === modalRejeicaoId}
              onClick={confirmarRejeicao}
            >
              {loadingId === modalRejeicaoId
                ? "Rejeitando..."
                : "Confirmar rejeição"}
            </button>
          </section>
        </div>
      )}
    </Shell>
  );
}