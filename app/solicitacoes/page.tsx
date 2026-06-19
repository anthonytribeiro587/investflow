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
  justificativa: string | null;
  created_at: string;
};

export default function Solicitacoes() {
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [itens, setItens] = useState<ItemCatalogo[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [tipo, setTipo] = useState("planejamento_anual");
  const [ano, setAno] = useState("2026");
  const [filialId, setFilialId] = useState("");
  const [setorId, setSetorId] = useState("");
  const [itemId, setItemId] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [semestre, setSemestre] = useState("2º semestre");
  const [justificativa, setJustificativa] = useState("");
  const [observacao, setObservacao] = useState("");

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const itensFiltrados = useMemo(() => {
    return itens.filter((item) => item.setor_id === setorId);
  }, [itens, setorId]);

  const solicitacoesFiltradas = useMemo(() => {
    return solicitacoes.filter((solicitacao) => {
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

      const bateStatus =
        !filtroStatus || solicitacao.status === filtroStatus;

      const batePrioridade =
        !filtroPrioridade || solicitacao.prioridade === filtroPrioridade;

      return bateBusca && bateStatus && batePrioridade;
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
            "id, codigo, ano, filial_id, setor_id, item_catalogo_id, prioridade, status, tipo, semestre_sugerido, justificativa, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(100)
      ]);

    setFiliais(filiaisResp.data ?? []);
    setSetores(setoresResp.data ?? []);
    setItens(itensResp.data ?? []);
    setSolicitacoes(solicitacoesResp.data ?? []);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function enviarSolicitacao(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase) {
      setMensagem("Erro: Supabase não configurado.");
      return;
    }

    if (!filialId || !setorId || !itemId || !justificativa) {
      setMensagem("Erro: preencha filial, setor, item e justificativa.");
      return;
    }

    setLoading(true);
    setMensagem("");

    const codigo = `SOL-${ano}-${Date.now()}`;

    const { error } = await supabase.from("solicitacoes").insert({
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
      justificativa,
      observacao,
      item_nao_encontrado: false
    });

    setLoading(false);

    if (error) {
      console.error(error);
      setMensagem(`Erro ao salvar: ${error.message}`);
      return;
    }

    setMensagem("Solicitação enviada com sucesso.");

    setFilialId("");
    setSetorId("");
    setItemId("");
    setPrioridade("media");
    setSemestre("2º semestre");
    setJustificativa("");
    setObservacao("");
    setMostrarFormulario(false);

    await carregarDados();
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

  function traduzPrioridade(valor: string) {
    const mapa: Record<string, string> = {
      baixa: "Baixa",
      media: "Média",
      alta: "Alta",
      critica: "Crítica"
    };

    return mapa[valor] ?? valor;
  }

  function traduzStatus(valor: string) {
    const mapa: Record<string, string> = {
      enviada: "Enviada",
      em_analise_diretoria: "Em análise da diretoria",
      ajuste_solicitado: "Ajuste solicitado",
      rejeitada_diretoria: "Rejeitada pela diretoria",
      aprovada_diretoria: "Aprovada pela diretoria",
      em_analise_patrimonio: "Em análise do patrimônio",
      recusado_investimento: "Investimento recusado",
      aprovado_investimento: "Investimento aprovado",
      em_orcamento: "Em orçamento"
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

        <section className="panel">
          <div className="panel-top">
            <div>
              <h2>Solicitações existentes</h2>
              <p>Consulte, filtre e acompanhe as solicitações criadas.</p>
            </div>

            <button
              className="action-button"
              type="button"
              onClick={() => setMostrarFormulario((atual) => !atual)}
            >
              {mostrarFormulario ? "Fechar formulário" : "+ Nova solicitação"}
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
                <option value="enviada">Enviada</option>
                <option value="em_analise_diretoria">
                  Em análise da diretoria
                </option>
                <option value="aprovada_diretoria">
                  Aprovada pela diretoria
                </option>
                <option value="rejeitada_diretoria">
                  Rejeitada pela diretoria
                </option>
                <option value="em_analise_patrimonio">
                  Em análise do patrimônio
                </option>
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
                  <th>Filial</th>
                  <th>Setor</th>
                  <th>Item</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {solicitacoesFiltradas.map((solicitacao) => (
                  <tr key={solicitacao.id}>
                    <td>{solicitacao.codigo ?? "-"}</td>
                    <td>{nomeFilial(solicitacao.filial_id)}</td>
                    <td>{nomeSetor(solicitacao.setor_id)}</td>
                    <td>{nomeItem(solicitacao.item_catalogo_id)}</td>
                    <td>{traduzPrioridade(solicitacao.prioridade)}</td>
                    <td>
                      <span className={`status ${solicitacao.status}`}>
                        {traduzStatus(solicitacao.status)}
                      </span>
                    </td>
                  </tr>
                ))}

                {solicitacoesFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={6}>Nenhuma solicitação encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {mostrarFormulario && (
  <div className="modal-backdrop">
    <section className="modal-card">
      <div className="modal-header">
        <div>
          <h2>Nova solicitação</h2>
          <p>
            O solicitante informa filial, setor e item. A solicitação entra no
            fluxo com status inicial enviada.
          </p>
        </div>

        <button
          type="button"
          className="modal-close"
          onClick={() => setMostrarFormulario(false)}
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
                  <select value={ano} onChange={(e) => setAno(e.target.value)}>
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
              </div>

              <label>
                Justificativa
                <textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Explique a necessidade, impacto e urgência da solicitação."
                />
              </label>

              <label>
                Observação
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Use este campo para detalhar a demanda."
                />
              </label>

              <button className="action-button" disabled={loading}>
                {loading ? "Enviando..." : "Enviar solicitação"}
              </button>
            </form>
           </section>
  </div>
)}
      </div>
    </Shell>
  );
}