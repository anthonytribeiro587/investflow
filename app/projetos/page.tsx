"use client";

import { useEffect, useMemo, useState } from "react";
import { DetailInfoGrid } from "@/components/DetailInfoGrid";
import { KpiCard } from "@/components/KpiCard";
import { Shell } from "@/components/Shell";
import { supabase } from "@/lib/supabase";

type StatusFiltro = "pendentes" | "definidos" | "todas";

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
};

type Filial = { id: string; nome_filial: string };
type Setor = { id: string; nome: string };
type ItemCatalogo = { id: string; nome_item: string };

const projetos = [
  "PROJETO ADEQUAÇÃO E LEGISLAÇÃO ATACAREJO",
  "PROJETO ADEQUAÇÃO E LEGISLAÇÃO VAREJO",
  "PROJETO BALCOES EXPOSITORES",
  "PROJETO BATERIAS EMPILHADEIRAS / LAVADORAS ATACAREJO",
  "PROJETO BATERIAS EMPILHADEIRAS / LAVADORAS VAREJO",
  "PROJETO CARRINHOS / PALETEIRAS",
  "PROJETO CENTRAL DE PADARIA",
  "PROJETO CLIMATIZAÇÃO",
  "PROJETO COMPRESSORES REFRIGERAÇÃO ATACAREJO",
  "PROJETO COMPRESSORES REFRIGERAÇÃO VAREJO",
  "PROJETO ELETRO E UTENSILIOS",
  "PROJETO ESCRITÓRIOS / REFEITÓRIOS",
  "PROJETO FRETES E LOCAÇÕES",
  "PROJETO GELADEIRAS",
  "PROJETO ILUMINAÇÃO",
  "PROJETO IMPLANTAÇÃO GAS NATURAL LOJAS",
  "PROJETO IMPREVISTOS ATACAREJO",
  "PROJETO IMPREVISTOS INFRAESTRUTURA",
  "PROJETO IMPREVISTOS PESSOAS E CULTURA",
  "PROJETO IMPREVISTOS VAREJO",
  "PROJETO LOGISTICA",
  "PROJETO MACROMIX (NOME LOJA NOVA)",
  "PROJETO MAQUINAS E EQUIPAMENTOS",
  "PROJETO MARKETING",
  "PROJETO MOVEIS E UTENSILIOS EM INOX",
  "PROJETO MOVEIS SOB MEDIDA",
  "PROJETO PISO URETANO",
  "PROJETO PREDIAL/ESTRUTURAL",
  "PROJETO RETROFIT (FILIAL)",
  "PROJETO RISSUL (CIDADE LOJA)",
  "PROJETO SEGURANÇA PATRIMONIAL",
  "PROJETO SEGURANÇA PATRIMONIAL TELHADOS",
  "PROJETO SELF CHECKOUT",
  "PROJETO SULBRAS",
  "PROJETO T.I",
  "PROJETO VEICULOS UNIDASUL",
];

const responsaveis = [
  "Kelly M. dos Santos",
  "Ricardo Braga",
  "Daniel Peyrot",
  "Gilmar Brustolin",
  "Lucas Mattos",
  "Edson França",
  "Adriano Bispo",
  "Jana Back Salazar",
  "Rodrigo Haefliger",
  "Geral",
  "Rafael Antunes",
  "Rafael Lubini",
];

export default function Projetos() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [itens, setItens] = useState<ItemCatalogo[]>([]);

  const [aba, setAba] = useState<StatusFiltro>("pendentes");
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loadingId, setLoadingId] = useState("");

  const [detalheId, setDetalheId] = useState("");
  const [projeto, setProjeto] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [observacao, setObservacao] = useState("");

  async function carregarDados() {
    if (!supabase) return;

    const [solicitacoesResp, filiaisResp, setoresResp, itensResp] =
      await Promise.all([
        supabase
          .from("solicitacoes")
          .select("*")
          .in("status", ["pendente_orcamento", "aguardando_cotacao"])
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

  function formatarDataHora(valor: string) {
    return new Date(valor).toLocaleString("pt-BR");
  }

  function traduzStatus(valor: string) {
    const mapa: Record<string, string> = {
      pendente_orcamento: "Pendente",
      aguardando_cotacao: "Projeto definido",
    };

    return mapa[valor] ?? valor;
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

  const pendentes = solicitacoes.filter(
    (s) => s.status === "pendente_orcamento"
  );

  const projetosDefinidos = solicitacoes.filter(
    (s) => s.status === "aguardando_cotacao"
  );

  const altaPrioridade = pendentes.filter(
    (s) => s.prioridade === "alta" || s.prioridade === "critica"
  ).length;

  const solicitacaoDetalhe = solicitacoes.find((s) => s.id === detalheId);

  const solicitacoesFiltradas = useMemo(() => {
    let lista = solicitacoes;

    if (aba === "pendentes") lista = pendentes;
    if (aba === "definidos") lista = projetosDefinidos;

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
    setProjeto(solicitacao.projeto_orcamento ?? "");
    setResponsavel(solicitacao.responsavel_orcamento ?? "");
    setObservacao(solicitacao.observacao_orcamento ?? "");
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

  async function salvarEncaminhamento() {
    if (!supabase || !solicitacaoDetalhe) return;

    if (!projeto.trim()) {
      setMensagem("Erro: selecione ou informe o projeto.");
      return;
    }

    if (!responsavel.trim()) {
      setMensagem("Erro: selecione o responsável.");
      return;
    }

    setLoadingId(solicitacaoDetalhe.id);
    setMensagem("");

    const novoStatus = "aguardando_cotacao";

    const { error } = await supabase
      .from("solicitacoes")
      .update({
        status: novoStatus,
        projeto_orcamento: projeto,
        responsavel_orcamento: responsavel,
        observacao_orcamento: observacao,
        data_encaminhamento_orcamento: new Date().toISOString(),
      })
      .eq("id", solicitacaoDetalhe.id);

    if (error) {
      setLoadingId("");
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    await registrarHistorico({
      solicitacaoId: solicitacaoDetalhe.id,
      acao: "Definição de projeto e responsável",
      statusAnterior: solicitacaoDetalhe.status,
      statusNovo: novoStatus,
      motivo: `Projeto: ${projeto}. Responsável: ${responsavel}. ${observacao}`,
    });

    setLoadingId("");
    setDetalheId("");
    setMensagem("Projeto e responsável definidos com sucesso.");
    await carregarDados();
  }

  return (
    <Shell
      title="Projetos"
      subtitle="Classificação das solicitações em projetos corporativos e definição dos responsáveis."
    >
      <section className="kpi-grid">
        <KpiCard
          label="Pendentes"
          value={String(pendentes.length)}
          variant="orange"
        />
        <KpiCard
          label="Alta prioridade"
          value={String(altaPrioridade)}
          variant="purple"
        />
        <KpiCard
          label="Projetos definidos"
          value={String(projetosDefinidos.length)}
          variant="blue"
        />
        <KpiCard
          label="Total"
          value={String(solicitacoes.length)}
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
            <h2>Solicitações para definição de projeto</h2>
            <p>
              Classifique cada solicitação no projeto correto e atribua o
              responsável pelo orçamento.
            </p>
          </div>
        </div>

        <div className="tab-row">
          <button
            className={aba === "pendentes" ? "tab-button active" : "tab-button"}
            onClick={() => setAba("pendentes")}
          >
            Pendentes ({pendentes.length})
          </button>

          <button
            className={aba === "definidos" ? "tab-button active" : "tab-button"}
            onClick={() => setAba("definidos")}
          >
            Projetos definidos ({projetosDefinidos.length})
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
          placeholder="Buscar por código, filial, setor, item, projeto ou responsável..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <div className="request-table-limited projetos-table">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Item</th>
                <th>Filial</th>
                <th>Setor</th>
                <th>Status</th>
                <th>Qtd.</th>
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

                  <td title={nomeFilial(solicitacao.filial_id)}>
                    {nomeFilial(solicitacao.filial_id)}
                  </td>

                  <td title={nomeSetor(solicitacao.setor_id)}>
                    {nomeSetor(solicitacao.setor_id)}
                  </td>

                  <td>
                    <span className={`status ${solicitacao.status}`}>
                      {traduzStatus(solicitacao.status)}
                    </span>
                  </td>

                  <td>1</td>

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
                        {solicitacao.status === "pendente_orcamento"
                          ? "Definir"
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
                <h2>Projeto e responsável</h2>
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
                { label: "Quantidade", value: "1" },
                {
                  label: "Prioridade",
                  value: traduzPrioridade(solicitacaoDetalhe.prioridade),
                },
                { label: "Status", value: traduzStatus(solicitacaoDetalhe.status) },
                {
                  label: "Projeto atual",
                  value: solicitacaoDetalhe.projeto_orcamento || "Não definido",
                },
                {
                  label: "Responsável atual",
                  value: solicitacaoDetalhe.responsavel_orcamento || "Não definido",
                },
              ]}
            />

            <div className="detail-block">
              <strong>Justificativa da solicitação</strong>
              <p>
                {solicitacaoDetalhe.justificativa ||
                  "Sem justificativa informada."}
              </p>
            </div>

            <div className="detail-block">
              <strong>Retorno da diretoria</strong>
              <p>
                {solicitacaoDetalhe.observacao_diretoria ||
                  "Sem retorno da diretoria."}
              </p>
            </div>

            <div className="detail-block">
              <strong>Retorno do patrimônio</strong>
              <p>
                {solicitacaoDetalhe.parecer_patrimonio ||
                  "Sem retorno do patrimônio."}
              </p>
            </div>

            <div className="form-grid">
              <label>
                Projeto
                <input
                  list="lista-projetos"
                  value={projeto}
                  onChange={(e) => setProjeto(e.target.value)}
                  placeholder="Digite para buscar o projeto..."
                />

                <datalist id="lista-projetos">
                  {projetos.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </label>

              <label>
                Responsável
                <select
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {responsaveis.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="detail-block">
              <strong>Observação para orçamento/cotação</strong>

              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex.: solicitar 3 cotações, verificar fornecedor homologado, prioridade alta..."
              />
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
                onClick={salvarEncaminhamento}
              >
                {loadingId === solicitacaoDetalhe.id
                  ? "Salvando..."
                  : "Salvar e encaminhar para orçamentos"}
              </button>
            </div>
          </section>
        </div>
      )}
    </Shell>
  );
}
