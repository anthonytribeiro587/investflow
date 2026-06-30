"use client";

import { useEffect, useMemo, useState } from "react";
import { DetailInfoGrid } from "@/components/DetailInfoGrid";
import { KpiCard } from "@/components/KpiCard";
import { Shell } from "@/components/Shell";
import { getDemoDirectorScopeByEmail } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type StatusFiltro = "pendentes" | "aprovadas" | "ajustes" | "rejeitadas" | "todas";

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
};

type Filial = { id: string; nome_filial: string; diretoria_id: string | null };
type Setor = { id: string; nome: string };
type ItemCatalogo = { id: string; nome_item: string };

function lerCookie(nome: string) {
  if (typeof document === "undefined") return "";
  return document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${nome}=`))
    ?.split("=")
    .slice(1)
    .join("=") ?? "";
}

function decodificar(valor: string) {
  try {
    return decodeURIComponent(valor);
  } catch {
    return valor;
  }
}

function escopoDiretoriaAtual() {
  const email = decodificar(lerCookie("investflow-user-email")).toLowerCase().trim();
  const fallback = getDemoDirectorScopeByEmail(email);

  return {
    diretoriaId: decodificar(lerCookie("investflow-diretoria-id")) || fallback?.id || "",
    diretoriaNome: decodificar(lerCookie("investflow-diretoria-nome")) || fallback?.nome || "",
  };
}

export default function Diretor() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [itens, setItens] = useState<ItemCatalogo[]>([]);

  const [mensagem, setMensagem] = useState("");
  const [loadingId, setLoadingId] = useState("");
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [aba, setAba] = useState<StatusFiltro>("pendentes");
  const [busca, setBusca] = useState("");

  const [detalheId, setDetalheId] = useState("");
  const [modalAjusteId, setModalAjusteId] = useState("");
  const [observacaoAjuste, setObservacaoAjuste] = useState("");

  const [modalRejeicaoId, setModalRejeicaoId] = useState("");
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  const [modalCancelamentoId, setModalCancelamentoId] = useState("");
  const [motivoCancelamento, setMotivoCancelamento] = useState("");

  async function carregarDados() {
    if (!supabase) return;

    const escopo = escopoDiretoriaAtual();

    const [filiaisResp, setoresResp, itensResp] = await Promise.all([
      supabase.from("filiais").select("id, nome_filial, diretoria_id").eq("ativo", true),
      supabase.from("setores").select("id, nome"),
      supabase.from("itens_catalogo").select("id, nome_item"),
    ]);

    const filiaisDaDiretoria = ((filiaisResp.data ?? []) as Filial[]).filter((filial) => {
      if (!escopo.diretoriaId) return true;
      return filial.diretoria_id === escopo.diretoriaId;
    });

    const idsFiliais = filiaisDaDiretoria.map((filial) => filial.id);

    let query = supabase
      .from("solicitacoes")
      .select("*")
      .in("status", [
        "enviada",
        "ajuste_solicitado",
        "aprovada_diretoria",
        "rejeitada_diretoria",
      ])
      .order("created_at", { ascending: false });

    if (idsFiliais.length > 0) {
      query = query.in("filial_id", idsFiliais);
    } else if (escopo.diretoriaId) {
      setSolicitacoes([]);
      setFiliais([]);
      setSetores(setoresResp.data ?? []);
      setItens(itensResp.data ?? []);
      return;
    }

    const solicitacoesResp = await query;

    setSolicitacoes(solicitacoesResp.data ?? []);
    setFiliais(filiaisDaDiretoria);
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

  function normalizarSemestre(valor: string | null) {
    if (!valor) return "";
    const texto = valor.toLowerCase();
    if (texto.includes("1")) return "1º Semestre";
    if (texto.includes("2")) return "2º Semestre";
    return valor;
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
      enviada: "Enviada",
      ajuste_solicitado: "Ajuste",
      aprovada_diretoria: "Aprovada",
      rejeitada_diretoria: "Rejeitada",
    };

    return mapa[valor] ?? valor;
  }

  const pendentes = solicitacoes.filter((s) => s.status === "enviada");
  const ajustesSolicitados = solicitacoes.filter(
    (s) => s.status === "ajuste_solicitado"
  );
  const aprovadas = solicitacoes.filter(
    (s) => s.status === "aprovada_diretoria"
  );
  const rejeitadas = solicitacoes.filter(
    (s) => s.status === "rejeitada_diretoria"
  );

  const altaPrioridade = pendentes.filter(
    (s) => s.prioridade === "alta" || s.prioridade === "critica"
  ).length;

  const solicitacaoDetalhe = solicitacoes.find((s) => s.id === detalheId);
  const solicitacaoRejeicao = solicitacoes.find((s) => s.id === modalRejeicaoId);
  const solicitacaoCancelamento = solicitacoes.find(
    (s) => s.id === modalCancelamentoId
  );

  const solicitacoesFiltradas = useMemo(() => {
    let lista = solicitacoes;

    if (aba === "pendentes") lista = pendentes;
    if (aba === "aprovadas") lista = aprovadas;
    if (aba === "ajustes") lista = ajustesSolicitados;
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
        ]
          .join(" ")
          .toLowerCase()
          .includes(termo)
      );
    }

    return lista;
  }, [solicitacoes, aba, busca, filiais, setores, itens]);

  const idsPendentesVisiveis = solicitacoesFiltradas
    .filter((s) => s.status === "enviada")
    .map((s) => s.id);

  const todasSelecionadas =
    idsPendentesVisiveis.length > 0 &&
    idsPendentesVisiveis.every((id) => selecionadas.includes(id));

  function alternarSelecao(id: string) {
    setSelecionadas((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]
    );
  }

  function alternarTodas() {
    setSelecionadas(todasSelecionadas ? [] : idsPendentesVisiveis);
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

  async function aprovarSolicitacao(solicitacao: Solicitacao) {
    if (!supabase) return;

    setLoadingId(solicitacao.id);
    setMensagem("");

    const semestreFinal =
      solicitacao.semestre_aprovado || normalizarSemestre(solicitacao.semestre_sugerido);

    const { error } = await supabase
      .from("solicitacoes")
      .update({
        status: "aprovada_diretoria",
        semestre_aprovado: semestreFinal || null,
        observacao_diretoria: "Aprovado pela diretoria.",
      })
      .eq("id", solicitacao.id);

    if (error) {
      setLoadingId("");
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    await registrarHistorico({
      solicitacaoId: solicitacao.id,
      acao: "Aprovação da diretoria",
      statusAnterior: solicitacao.status,
      statusNovo: "aprovada_diretoria",
      motivo: "Aprovado pela diretoria.",
    });

    setLoadingId("");
    setDetalheId("");
    setMensagem("Solicitação aprovada com sucesso.");
    await carregarDados();
  }

  async function aprovarSelecionadas() {
    if (!supabase || selecionadas.length === 0) return;

    setMensagem("");
    setLoadingId("bulk");

    const selecionadasObjetos = solicitacoes.filter((s) =>
      selecionadas.includes(s.id)
    );

    const { error } = await supabase
      .from("solicitacoes")
      .update({
        status: "aprovada_diretoria",
        observacao_diretoria: "Aprovado em massa pela diretoria.",
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
          acao: "Aprovação em massa da diretoria",
          statusAnterior: s.status,
          statusNovo: "aprovada_diretoria",
          motivo: "Aprovado em massa pela diretoria.",
        })
      )
    );

    setLoadingId("");
    setMensagem(`${selecionadas.length} solicitações aprovadas com sucesso.`);
    setSelecionadas([]);
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
        status: "rejeitada_diretoria",
        observacao_diretoria: motivoRejeicao,
      })
      .eq("id", solicitacaoRejeicao.id);

    if (error) {
      setLoadingId("");
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    await registrarHistorico({
      solicitacaoId: solicitacaoRejeicao.id,
      acao: "Rejeição da diretoria",
      statusAnterior: solicitacaoRejeicao.status,
      statusNovo: "rejeitada_diretoria",
      motivo: motivoRejeicao,
    });

    setLoadingId("");
    setDetalheId("");
    setModalRejeicaoId("");
    setMotivoRejeicao("");
    setMensagem("Solicitação rejeitada com sucesso.");
    await carregarDados();
  }

  async function solicitarAjuste() {
    const solicitacao = solicitacoes.find((s) => s.id === modalAjusteId);

    if (!solicitacao) return;

    if (!observacaoAjuste.trim()) {
      setMensagem("Erro: informe a observação do ajuste.");
      return;
    }

    if (!supabase) return;

    setLoadingId(modalAjusteId);
    setMensagem("");

    const { error } = await supabase
      .from("solicitacoes")
      .update({
        status: "ajuste_solicitado",
        observacao_diretoria: observacaoAjuste,
      })
      .eq("id", modalAjusteId);

    if (error) {
      setLoadingId("");
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    await registrarHistorico({
      solicitacaoId: solicitacao.id,
      acao: "Solicitação de ajuste",
      statusAnterior: solicitacao.status,
      statusNovo: "ajuste_solicitado",
      motivo: observacaoAjuste,
    });

    setLoadingId("");
    setDetalheId("");
    setModalAjusteId("");
    setObservacaoAjuste("");
    setMensagem("Ajuste solicitado com sucesso.");
    await carregarDados();
  }

  async function confirmarCancelamento() {
    if (!supabase || !solicitacaoCancelamento) return;

    if (!motivoCancelamento.trim()) {
      setMensagem("Erro: informe o motivo do cancelamento.");
      return;
    }

    setLoadingId(solicitacaoCancelamento.id);
    setMensagem("");

    const { error } = await supabase
      .from("solicitacoes")
      .update({
        status: "enviada",
        observacao_diretoria: motivoCancelamento,
      })
      .eq("id", solicitacaoCancelamento.id);

    if (error) {
      setLoadingId("");
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    await registrarHistorico({
      solicitacaoId: solicitacaoCancelamento.id,
      acao: "Cancelamento de aprovação",
      statusAnterior: solicitacaoCancelamento.status,
      statusNovo: "enviada",
      motivo: motivoCancelamento,
    });

    setLoadingId("");
    setDetalheId("");
    setModalCancelamentoId("");
    setMotivoCancelamento("");
    setMensagem("Aprovação cancelada com sucesso.");
    await carregarDados();
  }

  async function reabrirSolicitacao(solicitacao: Solicitacao) {
    if (!supabase) return;

    setLoadingId(solicitacao.id);
    setMensagem("");

    const { error } = await supabase
      .from("solicitacoes")
      .update({
        status: "enviada",
        observacao_diretoria: "Solicitação reaberta pela diretoria.",
      })
      .eq("id", solicitacao.id);

    if (error) {
      setLoadingId("");
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    await registrarHistorico({
      solicitacaoId: solicitacao.id,
      acao: "Reabertura da solicitação",
      statusAnterior: solicitacao.status,
      statusNovo: "enviada",
      motivo: "Solicitação reaberta pela diretoria.",
    });

    setLoadingId("");
    setDetalheId("");
    setMensagem("Solicitação reaberta com sucesso.");
    await carregarDados();
  }

  async function atualizarSemestre(id: string, semestre: string) {
    if (!supabase) return;

    setLoadingId(id);
    setMensagem("");

    const { error } = await supabase
      .from("solicitacoes")
      .update({
        semestre_aprovado: semestre || null,
      })
      .eq("id", id);

    if (error) {
      setLoadingId("");
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    await registrarHistorico({
      solicitacaoId: id,
      acao: "Definição de semestre pela diretoria",
      motivo: semestre
        ? `Semestre aprovado definido como ${semestre}.`
        : "Semestre aprovado removido.",
    });

    setLoadingId("");
    setMensagem("Semestre definido com sucesso.");
    await carregarDados();
  }

  return (
    <Shell
      title="Aprovação Diretoria"
      subtitle="Avaliação das solicitações vinculadas à diretoria do usuário logado."
    >
      <section className="kpi-grid">
        <KpiCard label="Pendentes" value={String(pendentes.length)} variant="orange" />
        <KpiCard label="Alta prioridade" value={String(altaPrioridade)} variant="purple" />
        <KpiCard label="Ajustes solicitados" value={String(ajustesSolicitados.length)} variant="green" />
        <KpiCard label="Aprovadas" value={String(aprovadas.length)} variant="blue" />
      </section>

      {mensagem && (
        <div className={mensagem.startsWith("Erro") ? "alert-error" : "alert-success"}>
          {mensagem}
        </div>
      )}

      <section className="panel">
        <div className="panel-top">
          <div>
            <h2>Solicitações da sua diretoria</h2>
            <p>Analise apenas as demandas das unidades vinculadas à sua diretoria.</p>
          </div>

          {aba === "pendentes" && (
            <button
              type="button"
              className="action-button"
              disabled={selecionadas.length === 0 || loadingId === "bulk"}
              onClick={aprovarSelecionadas}
            >
              {loadingId === "bulk"
                ? "Aprovando..."
                : `Aprovar selecionadas (${selecionadas.length})`}
            </button>
          )}
        </div>

        <div className="tab-row">
          <button className={aba === "pendentes" ? "tab-button active" : "tab-button"} onClick={() => setAba("pendentes")}>
            Pendentes ({pendentes.length})
          </button>
          <button className={aba === "aprovadas" ? "tab-button active" : "tab-button"} onClick={() => setAba("aprovadas")}>
            Aprovadas ({aprovadas.length})
          </button>
          <button className={aba === "ajustes" ? "tab-button active" : "tab-button"} onClick={() => setAba("ajustes")}>
            Aguardando ajustes ({ajustesSolicitados.length})
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
                    disabled={idsPendentesVisiveis.length === 0}
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
                    {solicitacao.status === "enviada" && (
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
                        onClick={() => setDetalheId(solicitacao.id)}
                      >
                        Detalhes
                      </button>

                      {solicitacao.status === "enviada" && (
                        <>
                          <button
                            type="button"
                            className="mini-button approve"
                            disabled={loadingId === solicitacao.id}
                            onClick={() => aprovarSolicitacao(solicitacao)}
                          >
                            Aprovar
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

                      {solicitacao.status === "aprovada_diretoria" && (
                        <button
                          type="button"
                          className="mini-button reject"
                          disabled={loadingId === solicitacao.id}
                          onClick={() => {
                            setModalCancelamentoId(solicitacao.id);
                            setMotivoCancelamento("");
                          }}
                        >
                          Cancelar
                        </button>
                      )}

                      {solicitacao.status === "rejeitada_diretoria" && (
                        <button
                          type="button"
                          className="mini-button approve"
                          disabled={loadingId === solicitacao.id}
                          onClick={() => reabrirSolicitacao(solicitacao)}
                        >
                          Reabrir
                        </button>
                      )}

                      {solicitacao.status === "ajuste_solicitado" && (
                        <button
                          type="button"
                          className="mini-button adjust"
                          disabled={loadingId === solicitacao.id}
                          onClick={() => reabrirSolicitacao(solicitacao)}
                        >
                          Reanalisar
                        </button>
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
                <h2>Detalhes da solicitação</h2>
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
                  label: "Prioridade solicitada",
                  value: traduzPrioridade(solicitacaoDetalhe.prioridade),
                },
                { label: "Status", value: traduzStatus(solicitacaoDetalhe.status) },
              ]}
            />

            <div className="detail-block">
              <strong>Semestre definido pela diretoria</strong>

              <select
                className="semester-select"
                value={
                  solicitacaoDetalhe.semestre_aprovado ||
                  normalizarSemestre(solicitacaoDetalhe.semestre_sugerido) ||
                  ""
                }
                onChange={(e) =>
                  atualizarSemestre(solicitacaoDetalhe.id, e.target.value)
                }
              >
                <option value="">Selecione</option>
                <option value="1º Semestre">1º Semestre</option>
                <option value="2º Semestre">2º Semestre</option>
              </select>

              <small className="semester-hint">
                Sugestão do gerente: {solicitacaoDetalhe.semestre_sugerido || "Não informado"}
              </small>
            </div>

            <div className="detail-block">
              <strong>Justificativa da solicitação</strong>
              <p>
                {solicitacaoDetalhe.justificativa ||
                  "Sem justificativa informada."}
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
              <strong>Observação da diretoria</strong>
              <p>
                {solicitacaoDetalhe.observacao_diretoria || "Sem observação."}
              </p>
            </div>

            <div className="modal-footer-actions">
              {solicitacaoDetalhe.status === "enviada" && (
                <>
                  <button
                    type="button"
                    className="action-main approve"
                    disabled={loadingId === solicitacaoDetalhe.id}
                    onClick={() => aprovarSolicitacao(solicitacaoDetalhe)}
                  >
                    Aprovar
                  </button>

                  <button
                    type="button"
                    className="action-main adjust"
                    disabled={loadingId === solicitacaoDetalhe.id}
                    onClick={() => {
                      setModalAjusteId(solicitacaoDetalhe.id);
                      setObservacaoAjuste("");
                    }}
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
                </>
              )}

              {solicitacaoDetalhe.status === "aprovada_diretoria" && (
                <button
                  type="button"
                  className="action-main reject"
                  disabled={loadingId === solicitacaoDetalhe.id}
                  onClick={() => {
                    setModalCancelamentoId(solicitacaoDetalhe.id);
                    setMotivoCancelamento("");
                  }}
                >
                  Cancelar aprovação
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {modalAjusteId && (
        <div className="modal-backdrop">
          <section className="modal-card">
            <div className="modal-header">
              <div>
                <h2>Solicitar ajuste</h2>
                <p>Informe o que precisa ser corrigido pelo solicitante.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setModalAjusteId("")}
              >
                ×
              </button>
            </div>

            <label>
              Motivo do ajuste
              <textarea
                value={observacaoAjuste}
                onChange={(e) => setObservacaoAjuste(e.target.value)}
                placeholder="Ex.: complementar justificativa, enviar fotos, revisar prioridade..."
              />
            </label>

            <button
              type="button"
              className="action-button"
              disabled={loadingId === modalAjusteId}
              onClick={solicitarAjuste}
            >
              {loadingId === modalAjusteId
                ? "Enviando..."
                : "Enviar solicitação de ajuste"}
            </button>
          </section>
        </div>
      )}

      {modalRejeicaoId && (
        <div className="modal-backdrop">
          <section className="modal-card">
            <div className="modal-header">
              <div>
                <h2>Rejeitar solicitação</h2>
                <p>Informe o motivo da rejeição para registro no histórico.</p>
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
              Motivo da rejeição
              <textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Ex.: investimento não aprovado para este ciclo, justificativa insuficiente, valor incompatível..."
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

      {modalCancelamentoId && (
        <div className="modal-backdrop">
          <section className="modal-card">
            <div className="modal-header">
              <div>
                <h2>Cancelar aprovação</h2>
                <p>Informe o motivo para registro no histórico.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setModalCancelamentoId("")}
              >
                ×
              </button>
            </div>

            <label>
              Motivo do cancelamento
              <textarea
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                placeholder="Ex.: aprovado por engano, necessidade de reavaliação, alteração de prioridade..."
              />
            </label>

            <button
              type="button"
              className="action-button"
              disabled={loadingId === modalCancelamentoId}
              onClick={confirmarCancelamento}
            >
              {loadingId === modalCancelamentoId
                ? "Cancelando..."
                : "Confirmar cancelamento"}
            </button>
          </section>
        </div>
      )}
    </Shell>
  );
}
