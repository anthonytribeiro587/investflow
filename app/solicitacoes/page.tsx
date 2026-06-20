"use client";

import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { supabase } from "@/lib/supabase";

type Filial = {
  id: string;
  codigo_filial: string;
  nome_filial: string;
  diretor_responsavel: string | null;
};

type Setor = {
  id: string;
  nome: string;
};

type ItemCatalogo = {
  id: string;
  setor_id: string;
  nome_item: string;
};

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
  observacao: string | null;
  observacao_diretoria: string | null;
  foto_url: string | null;
  created_at: string;
};

export default function Solicitacoes() {
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [itens, setItens] = useState<ItemCatalogo[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);

  const [modoFormulario, setModoFormulario] = useState<"nova" | "ajuste" | "">("");
  const [solicitacaoEditandoId, setSolicitacaoEditandoId] = useState("");
  const [detalheId, setDetalheId] = useState("");

  const [tipo, setTipo] = useState("planejamento_anual");
  const [ano, setAno] = useState("2026");
  const [filialId, setFilialId] = useState("");
  const [setorId, setSetorId] = useState("");
  const [itemId, setItemId] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [semestre, setSemestre] = useState("2º semestre");
  const [justificativa, setJustificativa] = useState("");
  const [observacao, setObservacao] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoAtualUrl, setFotoAtualUrl] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const detalhe = solicitacoes.find((s) => s.id === detalheId);

  const ajustesPendentes = solicitacoes.filter(
    (s) => s.status === "ajuste_solicitado"
  ).length;

  const itensFiltrados = useMemo(() => {
    return itens.filter((item) => item.setor_id === setorId);
  }, [itens, setorId]);

  const solicitacoesFiltradas = useMemo(() => {
    const ordemStatus: Record<string, number> = {
      ajuste_solicitado: 1,
      enviada: 2,
      rejeitada_diretoria: 3,
      aprovada_diretoria: 4,
      em_analise_patrimonio: 5,
      em_orcamento: 6,
    };

    return solicitacoes
      .filter((solicitacao) => {
        const textoBusca = busca.toLowerCase();

        const filial = nomeFilial(solicitacao.filial_id).toLowerCase();
        const setor = nomeSetor(solicitacao.setor_id).toLowerCase();
        const item = nomeItem(solicitacao.item_catalogo_id).toLowerCase();
        const codigo = solicitacao.codigo?.toLowerCase() ?? "";

        const bateBusca =
          !busca ||
          codigo.includes(textoBusca) ||
          filial.includes(textoBusca) ||
          setor.includes(textoBusca) ||
          item.includes(textoBusca);

        const bateStatus = !filtroStatus || solicitacao.status === filtroStatus;

        const batePrioridade =
          !filtroPrioridade || solicitacao.prioridade === filtroPrioridade;

        return bateBusca && bateStatus && batePrioridade;
      })
      .sort((a, b) => {
        const ordemA = ordemStatus[a.status] ?? 99;
        const ordemB = ordemStatus[b.status] ?? 99;

        if (ordemA !== ordemB) return ordemA - ordemB;

        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      });
  }, [solicitacoes, busca, filtroStatus, filtroPrioridade, filiais, setores, itens]);

  async function carregarDados() {
    if (!supabase) return;

    const [filiaisResp, setoresResp, itensResp, solicitacoesResp] =
      await Promise.all([
        supabase
          .from("filiais")
          .select("id, codigo_filial, nome_filial, diretor_responsavel")
          .eq("ativo", true)
          .order("codigo_filial"),

        supabase
          .from("setores")
          .select("id, nome")
          .eq("ativo", true)
          .order("nome"),

        supabase
          .from("itens_catalogo")
          .select("id, setor_id, nome_item")
          .eq("ativo", true)
          .order("nome_item"),

        supabase
          .from("solicitacoes")
          .select(
            "id, codigo, ano, filial_id, setor_id, item_catalogo_id, prioridade, status, tipo, semestre_sugerido, semestre_aprovado, justificativa, observacao, observacao_diretoria, foto_url, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(200),
      ]);

    setFiliais(filiaisResp.data ?? []);
    setSetores(setoresResp.data ?? []);
    setItens(itensResp.data ?? []);
    setSolicitacoes(solicitacoesResp.data ?? []);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function limparFormulario() {
    setSolicitacaoEditandoId("");
    setTipo("planejamento_anual");
    setAno("2026");
    setFilialId("");
    setSetorId("");
    setItemId("");
    setPrioridade("media");
    setSemestre("2º semestre");
    setJustificativa("");
    setObservacao("");
    setFotoFile(null);
    setFotoAtualUrl(null);
  }

  function abrirNovaSolicitacao() {
    limparFormulario();
    setModoFormulario("nova");
  }

  function abrirAjuste(solicitacao: Solicitacao) {
    setSolicitacaoEditandoId(solicitacao.id);
    setTipo(solicitacao.tipo);
    setAno(String(solicitacao.ano));
    setFilialId(solicitacao.filial_id ?? "");
    setSetorId(solicitacao.setor_id ?? "");
    setItemId(solicitacao.item_catalogo_id ?? "");
    setPrioridade(solicitacao.prioridade);
    setSemestre(solicitacao.semestre_sugerido ?? "2º semestre");
    setJustificativa(solicitacao.justificativa ?? "");
    setObservacao(solicitacao.observacao ?? "");
    setFotoAtualUrl(solicitacao.foto_url);
    setFotoFile(null);
    setDetalheId("");
    setModoFormulario("ajuste");
  }

  async function enviarFoto(codigo: string) {
    if (!supabase || !fotoFile) return fotoAtualUrl;

    const extensao = fotoFile.name.split(".").pop();
    const caminho = `${codigo}-${Date.now()}.${extensao}`;

    const { error } = await supabase.storage
      .from("solicitacoes-fotos")
      .upload(caminho, fotoFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage
      .from("solicitacoes-fotos")
      .getPublicUrl(caminho);

    return data.publicUrl;
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
      usuario: "Solicitante",
    });
  }

  async function enviarSolicitacao(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase) {
      setMensagem("Erro: Supabase não configurado.");
      return;
    }

    if (!filialId || !setorId || !itemId || !justificativa.trim()) {
      setMensagem("Erro: preencha filial, setor, item e justificativa.");
      return;
    }

    setLoading(true);
    setMensagem("");

    try {
      if (modoFormulario === "nova") {
        const codigo = `SOL-${ano}-${Date.now()}`;
        const fotoUrl = await enviarFoto(codigo);

        const { data, error } = await supabase
          .from("solicitacoes")
          .insert({
            codigo,
            ano: Number(ano),
            filial_id: filialId,
            setor_id: setorId,
            item_catalogo_id: itemId,
            solicitante_id: null,
            tipo,
            prioridade,
            status: "enviada",
            semestre_sugerido: semestre,
            semestre_aprovado: null,
            justificativa,
            observacao,
            foto_url: fotoUrl,
            item_nao_encontrado: false,
          })
          .select("id")
          .single();

        if (error) throw new Error(error.message);

        if (data?.id) {
          await registrarHistorico({
            solicitacaoId: data.id,
            acao: "Solicitação criada",
            statusNovo: "enviada",
            motivo: "Solicitação criada pelo solicitante.",
          });
        }

        setMensagem("Solicitação enviada com sucesso.");
      }

      if (modoFormulario === "ajuste") {
        const solicitacaoOriginal = solicitacoes.find(
          (s) => s.id === solicitacaoEditandoId
        );

        if (!solicitacaoOriginal) {
          throw new Error("Solicitação não encontrada para ajuste.");
        }

        const codigo = solicitacaoOriginal.codigo ?? `SOL-${ano}-${Date.now()}`;
        const fotoUrl = await enviarFoto(codigo);

        const { error } = await supabase
          .from("solicitacoes")
          .update({
            ano: Number(ano),
            filial_id: filialId,
            setor_id: setorId,
            item_catalogo_id: itemId,
            tipo,
            prioridade,
            status: "enviada",
            semestre_sugerido: semestre,
            justificativa,
            observacao,
            foto_url: fotoUrl,
          })
          .eq("id", solicitacaoEditandoId);

        if (error) throw new Error(error.message);

        await registrarHistorico({
          solicitacaoId: solicitacaoEditandoId,
          acao: "Solicitação ajustada e reenviada",
          statusAnterior: solicitacaoOriginal.status,
          statusNovo: "enviada",
          motivo:
            "Solicitante realizou os ajustes solicitados e reenviou para análise.",
        });

        setMensagem("Solicitação ajustada e reenviada com sucesso.");
      }

      limparFormulario();
      setModoFormulario("");
      await carregarDados();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado ao salvar.";
      setMensagem(`Erro: ${message}`);
    } finally {
      setLoading(false);
    }
  }

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

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString("pt-BR");
  }

  function formatarDataHora(data: string) {
    return new Date(data).toLocaleString("pt-BR");
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
      ajuste_solicitado: "Ajuste solicitado",
      rejeitada_diretoria: "Rejeitada",
      aprovada_diretoria: "Aprovada",
      em_analise_patrimonio: "Patrimônio",
      recusado_investimento: "Recusado",
      aprovado_investimento: "Aprovado",
      em_orcamento: "Em orçamento",
    };

    return mapa[valor] ?? valor;
  }

  return (
    <Shell
      title="Solicitações"
      subtitle="O gerente da loja informa a necessidade; o projeto é definido depois pelo orçamento."
    >
      <div className="request-page">
        {mensagem && (
          <div
            className={
              mensagem.startsWith("Erro") ? "alert-error" : "alert-success"
            }
          >
            {mensagem}
          </div>
        )}

        {ajustesPendentes > 0 && (
          <div className="warning-banner">
            ⚠️ Você possui {ajustesPendentes} solicitação(ões) aguardando ajuste
            e reenvio.
          </div>
        )}

        <section className="panel">
          <div className="panel-top">
            <div>
              <h2>Solicitações existentes</h2>
              <p>Consulte, filtre, ajuste e acompanhe as solicitações criadas.</p>
            </div>

            <button
              className="action-button"
              type="button"
              onClick={abrirNovaSolicitacao}
            >
              + Nova solicitação
            </button>
          </div>

          <div className="form-grid compact">
            <label>
              Buscar
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Código, filial, setor ou item"
              />
            </label>

            <label>
              Status
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="ajuste_solicitado">Ajuste solicitado</option>
                <option value="enviada">Enviada</option>
                <option value="aprovada_diretoria">Aprovada</option>
                <option value="rejeitada_diretoria">Rejeitada</option>
                <option value="em_analise_patrimonio">Patrimônio</option>
                <option value="em_orcamento">Em orçamento</option>
              </select>
            </label>

            <label>
              Prioridade
              <select
                value={filtroPrioridade}
                onChange={(e) => setFiltroPrioridade(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </label>
          </div>

          <div className="request-table-limited">
            <table>
              <thead>
                <tr>
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
                  <tr
                    key={solicitacao.id}
                    className={
                      solicitacao.status === "ajuste_solicitado"
                        ? "row-needs-adjustment"
                        : ""
                    }
                  >
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

                        {solicitacao.status === "ajuste_solicitado" && (
                          <button
                            type="button"
                            className="mini-button adjust"
                            onClick={() => abrirAjuste(solicitacao)}
                          >
                            Ajustar
                          </button>
                        )}
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

        {modoFormulario && (
          <div className="modal-backdrop">
            <section className="modal-card">
              <div className="modal-header">
                <div>
                  <h2>
                    {modoFormulario === "nova"
                      ? "Nova solicitação"
                      : "Ajustar solicitação"}
                  </h2>
                  <p>
                    {modoFormulario === "nova"
                      ? "Informe a necessidade da loja para análise da diretoria."
                      : "Revise as informações solicitadas e reenvie para análise."}
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() => {
                    limparFormulario();
                    setModoFormulario("");
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={enviarSolicitacao}>
                <div className="form-grid">
                  <label>
                    Tipo
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                    >
                      <option value="planejamento_anual">
                        Planejamento anual
                      </option>
                      <option value="extraordinaria">Extraordinária</option>
                    </select>
                  </label>

                  <label>
                    Plano/Ano
                    <select
                      value={ano}
                      onChange={(e) => setAno(e.target.value)}
                    >
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </label>

                  <label>
                    Filial
                    <select
                      value={filialId}
                      onChange={(e) => setFilialId(e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {filiais.map((filial) => (
                        <option key={filial.id} value={filial.id}>
                          {filial.codigo_filial} - {filial.nome_filial}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Setor
                    <select
                      value={setorId}
                      onChange={(e) => {
                        setSetorId(e.target.value);
                        setItemId("");
                      }}
                    >
                      <option value="">Selecione</option>
                      {setores.map((setor) => (
                        <option key={setor.id} value={setor.id}>
                          {setor.nome}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Item solicitado
                    <select
                      value={itemId}
                      onChange={(e) => setItemId(e.target.value)}
                      disabled={!setorId}
                    >
                      <option value="">Selecione</option>
                      {itensFiltrados.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nome_item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Prioridade
                    <select
                      value={prioridade}
                      onChange={(e) => setPrioridade(e.target.value)}
                    >
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </label>

                  <label>
                    Semestre sugerido
                    <select
                      value={semestre}
                      onChange={(e) => setSemestre(e.target.value)}
                    >
                      <option value="1º semestre">1º semestre</option>
                      <option value="2º semestre">2º semestre</option>
                    </select>
                  </label>

                  <label>
                    Foto da necessidade
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFotoFile(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                </div>

                {modoFormulario === "ajuste" && fotoAtualUrl && (
                  <div className="detail-block">
                    <strong>Foto atual</strong>
                    <img
                      src={fotoAtualUrl}
                      alt="Foto atual da solicitação"
                      className="request-photo"
                    />
                  </div>
                )}

                <label>
                  Justificativa
                  <textarea
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    placeholder="Descreva a necessidade, problema ou oportunidade..."
                  />
                </label>

                <label>
                  Observação complementar
                  <textarea
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Informações adicionais, medidas, contexto da loja..."
                  />
                </label>

                <div className="modal-footer-actions">
                  <button
                    type="submit"
                    className="action-main approve"
                    disabled={loading}
                  >
                    {loading
                      ? "Salvando..."
                      : modoFormulario === "nova"
                      ? "Enviar solicitação"
                      : "Reenviar solicitação"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {detalhe && (
          <div className="modal-backdrop">
            <section className="modal-card">
              <div className="modal-header">
                <div>
                  <h2>Detalhes da solicitação</h2>
                  <p>{detalhe.codigo}</p>
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
                  <strong>Data/hora</strong>
                  <span>{formatarDataHora(detalhe.created_at)}</span>
                </div>

                <div>
                  <strong>Filial</strong>
                  <span>{nomeFilial(detalhe.filial_id)}</span>
                </div>

                <div>
                  <strong>Setor</strong>
                  <span>{nomeSetor(detalhe.setor_id)}</span>
                </div>

                <div>
                  <strong>Item</strong>
                  <span>{nomeItem(detalhe.item_catalogo_id)}</span>
                </div>

                <div>
                  <strong>Prioridade</strong>
                  <span>{traduzPrioridade(detalhe.prioridade)}</span>
                </div>

                <div>
                  <strong>Semestre sugerido</strong>
                  <span>{detalhe.semestre_sugerido ?? "-"}</span>
                </div>

                <div>
                  <strong>Semestre aprovado</strong>
                  <span>{detalhe.semestre_aprovado ?? "Não definido"}</span>
                </div>

                <div>
                  <strong>Status</strong>
                  <span>{traduzStatus(detalhe.status)}</span>
                </div>
              </div>

              {detalhe.status === "ajuste_solicitado" && (
                <div className="warning-banner compact-warning">
                  ⚠️ A diretoria solicitou ajuste nesta solicitação. Revise as
                  informações e reenvie para análise.
                </div>
              )}

              <div className="detail-block">
                <strong>Justificativa</strong>
                <p>{detalhe.justificativa || "Sem justificativa informada."}</p>
              </div>

              <div className="detail-block">
                <strong>Observação complementar</strong>
                <p>{detalhe.observacao || "Sem observação."}</p>
              </div>

              <div className="detail-block">
                <strong>Retorno da diretoria</strong>
                <p>{detalhe.observacao_diretoria || "Sem retorno da diretoria."}</p>
              </div>

              <div className="detail-block">
                <strong>Foto da necessidade</strong>
                {detalhe.foto_url ? (
                  <img
                    src={detalhe.foto_url}
                    alt="Foto da necessidade"
                    className="request-photo"
                  />
                ) : (
                  <p>Nenhuma foto anexada.</p>
                )}
              </div>

              {detalhe.status === "ajuste_solicitado" && (
                <div className="modal-footer-actions">
                  <button
                    type="button"
                    className="action-main adjust"
                    onClick={() => abrirAjuste(detalhe)}
                  >
                    Ajustar solicitação
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </Shell>
  );
}