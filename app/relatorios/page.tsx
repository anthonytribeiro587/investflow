"use client";

import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { defaultReportForRole, getDemoDirectorScopeByEmail, normalizeRole, rowMatchesUserScope, type UserRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type LinhaRelatorio = {
  solicitacao_id: string;
  codigo: string | null;
  ano: number | null;
  status: string | null;
  tipo: string | null;
  prioridade: string | null;
  semestre_sugerido: string | null;
  semestre_aprovado: string | null;
  item_nome: string | null;
  filial_id: string | null;
  codigo_filial: string | null;
  nome_filial: string | null;
  diretoria_id: string | null;
  diretoria_nome: string | null;
  setor_nome: string | null;
  nome_projeto: string | null;
  situacao: string | null;
  valor_total_investimento: number | null;
  valor_orcado: number | null;
  valor_aprovado: number | null;
  valor_realizado: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type TipoRelatorio =
  | "geral"
  | "solicitante"
  | "diretoria"
  | "patrimonio"
  | "projetos"
  | "orcamentos_realizacoes";

const relatorios: { id: TipoRelatorio; label: string; descricao: string }[] = [
  { id: "geral", label: "Relatório geral", descricao: "Visão executiva consolidada do fluxo." },
  { id: "solicitante", label: "Solicitante", descricao: "Pedidos criados, ajustes e retorno das aprovações." },
  { id: "diretoria", label: "Diretoria", descricao: "Itens aguardando decisão ou já avaliados pela diretoria." },
  { id: "patrimonio", label: "Patrimônio", descricao: "Itens em análise patrimonial e encaminhados." },
  { id: "projetos", label: "Projetos", descricao: "Itens pendentes de projeto e responsáveis definidos." },
  { id: "orcamentos_realizacoes", label: "Orçamentos e realizações", descricao: "Cotações, valores orçados e realizado." },
];

const statusPorRelatorio: Record<TipoRelatorio, string[]> = {
  geral: [],
  solicitante: ["enviada", "ajuste_solicitado", "rejeitada_diretoria", "rejeitada_patrimonio", "aprovada_diretoria", "pendente_orcamento", "aguardando_cotacao", "orcamento_concluido"],
  diretoria: ["enviada", "ajuste_solicitado", "rejeitada_diretoria", "aprovada_diretoria"],
  patrimonio: ["aprovada_diretoria", "pendente_orcamento", "rejeitada_patrimonio"],
  projetos: ["pendente_orcamento", "aguardando_cotacao"],
  orcamentos_realizacoes: ["aguardando_cotacao", "orcamento_concluido", "comprado", "em_obra", "realizado"],
};

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

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function valorLinha(linha: LinhaRelatorio) {
  return Number(linha.valor_orcado || linha.valor_total_investimento || 0);
}

function etapaDaLinha(linha: LinhaRelatorio) {
  const status = linha.status || "";
  const mapa: Record<string, string> = {
    enviada: "Aguardando diretoria",
    ajuste_solicitado: "Ajuste solicitado",
    rejeitada_diretoria: "Rejeitada diretoria",
    aprovada_diretoria: "Patrimônio",
    rejeitada_patrimonio: "Rejeitada patrimônio",
    pendente_orcamento: "Projetos",
    aguardando_cotacao: "Cotação",
    orcamento_concluido: "Orçado",
    comprado: "Comprado",
    em_obra: "Em obra",
    realizado: "Realizado",
  };

  return mapa[status] ?? (status.replaceAll("_", " ") || "Em análise");
}

function formatarData(valor: string | null) {
  if (!valor) return "-";
  return new Date(valor).toLocaleDateString("pt-BR");
}

function gerarCsv(linhas: Record<string, string | number>[]) {
  if (!linhas.length) return "";

  const cabecalho = Object.keys(linhas[0]).join(";");
  const corpo = linhas
    .map((linha) =>
      Object.values(linha)
        .map((valor) => `"${String(valor).replaceAll('"', "'")}"`)
        .join(";")
    )
    .join("\r\n");

  return `\uFEFFsep=;\r\n${cabecalho}\r\n${corpo}`;
}

function baixarCsv(nomeArquivo: string, linhas: Record<string, string | number>[]) {
  const csv = gerarCsv(linhas);

  if (!csv) {
    window.alert("Não há registros para exportar com os filtros atuais.");
    return;
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Relatorios() {
  const [linhas, setLinhas] = useState<LinhaRelatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<UserRole>("admin");
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>("geral");
  const [anoFiltro, setAnoFiltro] = useState("todos");
  const [filialFiltro, setFilialFiltro] = useState("todos");
  const [diretoriaFiltro, setDiretoriaFiltro] = useState("todos");
  const [filialUsuarioId, setFilialUsuarioId] = useState("");
  const [diretoriaUsuarioId, setDiretoriaUsuarioId] = useState("");
  const [diretoriaUsuarioNome, setDiretoriaUsuarioNome] = useState("");

  useEffect(() => {
    const role = normalizeRole(lerCookie("investflow-role") || "admin");
    const email = decodificar(lerCookie("investflow-user-email")).toLowerCase().trim();
    const fallback = getDemoDirectorScopeByEmail(email);
    setPerfil(role);
    setTipoRelatorio(defaultReportForRole(role) as TipoRelatorio);
    setFilialUsuarioId(decodificar(lerCookie("investflow-filial-id")));
    setDiretoriaUsuarioId(decodificar(lerCookie("investflow-diretoria-id")) || fallback?.id || "");
    setDiretoriaUsuarioNome(decodificar(lerCookie("investflow-diretoria-nome")) || fallback?.nome || "");
    carregarDados();
  }, []);

  async function carregarDados() {
    if (!supabase) {
      setLinhas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("vw_central_investimentos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(120);

    if (error) {
      console.error("Erro relatórios:", error);
      setLinhas([]);
    } else {
      setLinhas((data ?? []) as LinhaRelatorio[]);
    }

    setLoading(false);
  }

  const relatoriosPermitidos = useMemo(() => {
    if (perfil === "admin") return relatorios;
    const padrao = defaultReportForRole(perfil);
    return relatorios.filter((relatorio) => relatorio.id === padrao);
  }, [perfil]);

  const linhasDoEscopo = useMemo(() => {
    return linhas.filter((linha) =>
      rowMatchesUserScope(linha, {
        perfil,
        filialId: filialUsuarioId,
        diretoriaId: diretoriaUsuarioId,
        diretoriaNome: diretoriaUsuarioNome,
      })
    );
  }, [linhas, perfil, filialUsuarioId, diretoriaUsuarioId, diretoriaUsuarioNome]);

  const opcoesAno = useMemo(() => {
    return Array.from(new Set(linhasDoEscopo.map((linha) => linha.ano).filter(Boolean))).sort();
  }, [linhasDoEscopo]);

  const opcoesFilial = useMemo(() => {
    return Array.from(new Set(linhasDoEscopo.map((linha) => linha.nome_filial).filter(Boolean))).sort() as string[];
  }, [linhasDoEscopo]);

  const opcoesDiretoria = useMemo(() => {
    return Array.from(new Set(linhasDoEscopo.map((linha) => linha.diretoria_nome).filter(Boolean))).sort() as string[];
  }, [linhasDoEscopo]);

  const filtradas = useMemo(() => {
    const statuses = statusPorRelatorio[tipoRelatorio];

    return linhasDoEscopo.filter((linha) => {
      const bateTipo = !statuses.length || statuses.includes(linha.status ?? "");
      const bateAno = anoFiltro === "todos" || String(linha.ano) === anoFiltro;
      const bateFilial = filialFiltro === "todos" || linha.nome_filial === filialFiltro;
      const bateDiretoria = diretoriaFiltro === "todos" || linha.diretoria_nome === diretoriaFiltro;
      return bateTipo && bateAno && bateFilial && bateDiretoria;
    });
  }, [linhasDoEscopo, tipoRelatorio, anoFiltro, filialFiltro, diretoriaFiltro]);

  const relatorioAtual = relatorios.find((relatorio) => relatorio.id === tipoRelatorio) ?? relatorios[0];
  const orcados = filtradas.filter((linha) => linha.status === "orcamento_concluido");
  const valorTotal = filtradas.reduce((acc, linha) => acc + valorLinha(linha), 0);
  const valorOrcado = orcados.reduce((acc, linha) => acc + valorLinha(linha), 0);
  const valorRealizado = filtradas.reduce((acc, linha) => acc + Number(linha.valor_realizado || 0), 0);
  const pendencias = filtradas.filter((linha) => linha.status !== "orcamento_concluido" && linha.status !== "realizado").length;

  const porEtapa = useMemo(() => {
    const mapa = new Map<string, { nome: string; qtd: number; valor: number }>();

    filtradas.forEach((linha) => {
      const etapa = etapaDaLinha(linha);
      const atual = mapa.get(etapa) ?? { nome: etapa, qtd: 0, valor: 0 };
      atual.qtd += 1;
      atual.valor += valorLinha(linha);
      mapa.set(etapa, atual);
    });

    return Array.from(mapa.values()).sort((a, b) => b.qtd - a.qtd || b.valor - a.valor);
  }, [filtradas]);

  const linhasTabela = filtradas.slice(0, 14);

  function exportar() {
    baixarCsv(`investflow-${tipoRelatorio}.csv`, filtradas.map((linha) => ({
      Codigo: linha.codigo ?? "-",
      Ano: linha.ano ?? "-",
      Unidade: linha.nome_filial ?? "-",
      Diretoria: linha.diretoria_nome ?? "-",
      Setor: linha.setor_nome ?? "-",
      Item: linha.item_nome ?? "-",
      Projeto: linha.nome_projeto ?? "-",
      Etapa: etapaDaLinha(linha),
      Status: linha.status ?? "-",
      Valor: valorLinha(linha),
      Realizado: Number(linha.valor_realizado || 0),
      Criado_em: formatarData(linha.created_at),
    })));
  }

  return (
    <Shell
      title="Relatórios"
      subtitle="Relatórios separados por fluxo, com visão limpa para apresentação."
    >
      <div className="reports-page">
        <section className="demo-note">
          Cada perfil acessa o relatório ligado ao seu fluxo. Diretores enxergam somente as unidades vinculadas à própria diretoria.
        </section>

        <section className="report-tabs">
          {relatoriosPermitidos.map((relatorio) => (
            <button
              key={relatorio.id}
              className={tipoRelatorio === relatorio.id ? "report-tab active" : "report-tab"}
              type="button"
              onClick={() => setTipoRelatorio(relatorio.id)}
            >
              <strong>{relatorio.label}</strong>
              <span>{relatorio.descricao}</span>
            </button>
          ))}
        </section>

        <section className="panel report-filter-panel">
          <div>
            <h2>{relatorioAtual.label}</h2>
            <p>{relatorioAtual.descricao}</p>
          </div>

          <div className="report-actions">
            <select value={anoFiltro} onChange={(e) => setAnoFiltro(e.target.value)}>
              <option value="todos">Todos os anos</option>
              {opcoesAno.map((ano) => <option key={ano} value={String(ano)}>{ano}</option>)}
            </select>

            <select value={filialFiltro} onChange={(e) => setFilialFiltro(e.target.value)}>
              <option value="todos">Todas as unidades</option>
              {opcoesFilial.map((filial) => <option key={filial} value={filial}>{filial}</option>)}
            </select>

            <select value={diretoriaFiltro} onChange={(e) => setDiretoriaFiltro(e.target.value)}>
              <option value="todos">Todas as diretorias</option>
              {opcoesDiretoria.map((diretoria) => <option key={diretoria} value={diretoria}>{diretoria}</option>)}
            </select>

            <button type="button" className="export-button" onClick={exportar}>Exportar CSV</button>
          </div>
        </section>

        <section className="kpi-grid compact-report-kpis">
          <div className="report-kpi"><span>Registros</span><strong>{loading ? "..." : filtradas.length}</strong><small>{pendencias} pendência(s)</small></div>
          <div className="report-kpi"><span>Valor em análise</span><strong>{moeda(valorTotal)}</strong><small>Conforme filtros atuais</small></div>
          <div className="report-kpi"><span>Valor orçado</span><strong>{moeda(valorOrcado)}</strong><small>{orcados.length} item(ns) concluído(s)</small></div>
          <div className="report-kpi"><span>Valor realizado</span><strong>{moeda(valorRealizado)}</strong><small>Quando preenchido</small></div>
        </section>

        <div className="report-content-grid">
          <section className="panel">
            <div className="panel-top">
              <div>
                <h2>Resumo por etapa</h2>
                <p>Mostra onde os itens estão dentro do fluxo selecionado.</p>
              </div>
              <span className="table-count">{porEtapa.length} etapas</span>
            </div>

            <div className="report-step-list">
              {porEtapa.length ? porEtapa.map((item) => (
                <div className="report-step" key={item.nome}>
                  <div>
                    <strong>{item.nome}</strong>
                    <span>{item.qtd} registro(s)</span>
                  </div>
                  <b>{moeda(item.valor)}</b>
                </div>
              )) : <div className="empty-state">Nenhum registro encontrado para os filtros atuais.</div>}
            </div>
          </section>

          <section className="panel">
            <div className="panel-top">
              <div>
                <h2>Lista resumida</h2>
                <p>Tabela curta para apresentação ao diretor.</p>
              </div>
              <span className="table-count">{linhasTabela.length} de {filtradas.length}</span>
            </div>

            <div className="report-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Unidade</th>
                    <th>Item</th>
                    <th>Etapa</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5}>Carregando...</td></tr>
                  ) : linhasTabela.length === 0 ? (
                    <tr><td colSpan={5}>Nenhum registro encontrado.</td></tr>
                  ) : linhasTabela.map((linha) => (
                    <tr key={linha.solicitacao_id}>
                      <td>{linha.codigo ?? "-"}</td>
                      <td>{linha.nome_filial ?? "-"}</td>
                      <td><strong>{linha.item_nome ?? "-"}</strong><small>{linha.setor_nome ?? linha.diretoria_nome ?? "-"}</small></td>
                      <td><span className={`status ${linha.status ?? ""}`}>{etapaDaLinha(linha)}</span></td>
                      <td><strong>{moeda(valorLinha(linha))}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </Shell>
  );
}
