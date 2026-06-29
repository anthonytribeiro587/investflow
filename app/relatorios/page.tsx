"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Shell } from "@/components/Shell";
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

type Agrupado = { nome: string; qtd: number; valor: number };

const styles: Record<string, CSSProperties> = {
  page: { display: "flex", flexDirection: "column", gap: 18 },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  syncBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 900,
    fontSize: 13,
  },
  actions: { display: "flex", gap: 10, flexWrap: "wrap" },
  exportButton: {
    border: 0,
    background: "#07111f",
    color: "white",
    padding: "11px 15px",
    borderRadius: 13,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(15,23,42,.16)",
  },
  note: {
    background: "linear-gradient(90deg, #eff6ff, #f8fafc)",
    border: "1px solid #bfdbfe",
    color: "#1d4ed8",
    padding: "14px 16px",
    borderRadius: 16,
    fontWeight: 850,
    lineHeight: 1.35,
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
  },
  kpi: {
    position: "relative",
    overflow: "hidden",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: 20,
    minHeight: 116,
    boxShadow: "0 16px 38px rgba(15,23,42,.07)",
  },
  kpiAccent: {
    position: "absolute",
    inset: "0 auto 0 0",
    width: 6,
    borderRadius: "20px 0 0 20px",
  },
  kpiLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: ".45px",
  },
  kpiValue: {
    marginTop: 14,
    fontSize: 30,
    fontWeight: 950,
    color: "#07111f",
    lineHeight: 1,
  },
  kpiHint: { marginTop: 9, color: "#64748b", fontSize: 13, fontWeight: 700 },
  panel: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 22,
    padding: 22,
    boxShadow: "0 16px 42px rgba(15,23,42,.07)",
    overflow: "hidden",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
    marginBottom: 16,
  },
  panelTitle: { margin: 0, fontSize: 22, fontWeight: 950, color: "#07111f" },
  panelSubtitle: { margin: "6px 0 0", color: "#64748b", fontSize: 14, lineHeight: 1.4 },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(140px, 1fr))",
    gap: 12,
  },
  select: {
    height: 44,
    border: "1px solid #dbe3ee",
    borderRadius: 14,
    background: "white",
    color: "#07111f",
    padding: "0 13px",
    fontWeight: 850,
    minWidth: 0,
  },
  cleanButton: {
    border: "1px solid #dbe3ee",
    background: "white",
    color: "#07111f",
    borderRadius: 12,
    padding: "10px 13px",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.05fr .95fr",
    gap: 16,
  },
  miniGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  stepCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 15,
    background: "#f8fafc",
  },
  stepTop: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" },
  stepName: { fontWeight: 900, color: "#07111f" },
  stepCount: { fontWeight: 950, color: "#2563eb" },
  progressTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    background: "#e2e8f0",
  },
  progressBar: { height: "100%", borderRadius: 999, background: "#2563eb" },
  list: { display: "grid", gap: 0, maxHeight: 330, overflowY: "auto" },
  listRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto auto",
    gap: 12,
    alignItems: "center",
    borderBottom: "1px solid #e2e8f0",
    padding: "12px 0",
  },
  listName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 850,
    color: "#07111f",
  },
  listValue: { whiteSpace: "nowrap", color: "#07111f", fontWeight: 800 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: "7px 10px",
    background: "#e8eef7",
    color: "#334155",
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  tableWrap: { border: "1px solid #e2e8f0", borderRadius: 18, overflow: "hidden" },
  tableScroller: { maxHeight: 410, overflowY: "auto", overflowX: "auto" },
  table: { width: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: 13 },
  th: {
    background: "#f8fafc",
    color: "#475569",
    textAlign: "left",
    padding: "12px 11px",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 11px",
    borderBottom: "1px solid #e2e8f0",
    color: "#07111f",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  empty: {
    padding: 18,
    border: "1px dashed #cbd5e1",
    borderRadius: 16,
    background: "#f8fafc",
    color: "#64748b",
    fontWeight: 800,
  },
};

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function normalizar(texto: string | null | undefined) {
  if (!texto) return "-";
  const mapa: Record<string, string> = {
    enviada: "Diretoria",
    ajuste_solicitado: "Ajuste solicitado",
    rejeitada_diretoria: "Rejeitada diretoria",
    aprovada_diretoria: "Patrimônio",
    rejeitada_patrimonio: "Rejeitada patrimônio",
    pendente_orcamento: "Projetos",
    aguardando_cotacao: "Aguardando cotação",
    orcamento_concluido: "Orçamento concluído",
    em_orcamento: "Em orçamento",
  };
  return mapa[texto] ?? texto.replaceAll("_", " ");
}

function valorLinha(linha: LinhaRelatorio) {
  return Number(linha.valor_orcado || linha.valor_total_investimento || 0);
}

function etapaDaLinha(linha: LinhaRelatorio) {
  const status = linha.status || "";
  if (["enviada", "ajuste_solicitado", "rejeitada_diretoria"].includes(status)) return "Diretoria";
  if (["aprovada_diretoria", "rejeitada_patrimonio"].includes(status)) return "Patrimônio";
  if (status === "pendente_orcamento") return "Projetos";
  if (["aguardando_cotacao", "orcamento_concluido"].includes(status)) return "Orçamento";
  return "Outros";
}

function Kpi({ label, value, hint, accent }: { label: string; value: string | number; hint: string; accent: string }) {
  return (
    <div style={styles.kpi}>
      <span style={{ ...styles.kpiAccent, background: accent }} />
      <div style={styles.kpiLabel}>{label}</div>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiHint}>{hint}</div>
    </div>
  );
}

function agrupar(
  linhas: LinhaRelatorio[],
  chave: (linha: LinhaRelatorio) => string,
  apenasOrcados = false
): Agrupado[] {
  const mapa = new Map<string, Agrupado>();
  linhas.forEach((linha) => {
    if (apenasOrcados && linha.status !== "orcamento_concluido") return;
    const nome = chave(linha) || "Não informado";
    const atual = mapa.get(nome) || { nome, qtd: 0, valor: 0 };
    atual.qtd += 1;
    atual.valor += valorLinha(linha);
    mapa.set(nome, atual);
  });
  return Array.from(mapa.values()).sort((a, b) => b.valor - a.valor || b.qtd - a.qtd);
}

function baixarCsv(nomeArquivo: string, linhas: Record<string, string | number>[]) {
  if (!linhas.length) {
    window.alert("Não há registros para exportar com os filtros atuais.");
    return;
  }
  const cabecalho = Object.keys(linhas[0]).join(";");
  const corpo = linhas
    .map((linha) => Object.values(linha).map((valor) => `"${String(valor).replaceAll('"', "'")}"`).join(";"))
    .join("\n");

  const blob = new Blob([`sep=;\n${cabecalho}\n${corpo}`], { type: "text/csv;charset=utf-8;" });
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
  const [anoFiltro, setAnoFiltro] = useState("todos");
  const [filialFiltro, setFilialFiltro] = useState("todos");
  const [diretoriaFiltro, setDiretoriaFiltro] = useState("todos");
  const [setorFiltro, setSetorFiltro] = useState("todos");
  const [etapaFiltro, setEtapaFiltro] = useState("todos");

  useEffect(() => {
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
      .limit(80);

    if (error) {
      console.error("Erro relatórios:", error);
      setLinhas([]);
    } else {
      setLinhas((data ?? []) as LinhaRelatorio[]);
    }
    setLoading(false);
  }

  const anos = useMemo(() => Array.from(new Set(linhas.map((l) => l.ano).filter(Boolean))).sort((a, b) => Number(b) - Number(a)), [linhas]);
  const filiais = useMemo(() => agrupar(linhas, (l) => l.nome_filial || "Não informado"), [linhas]);
  const diretorias = useMemo(() => agrupar(linhas, (l) => l.diretoria_nome || "Não informado"), [linhas]);
  const setores = useMemo(() => agrupar(linhas, (l) => l.setor_nome || "Não informado"), [linhas]);

  const filtradas = useMemo(() => {
    return linhas.filter((linha) => {
      return (
        (anoFiltro === "todos" || String(linha.ano) === anoFiltro) &&
        (filialFiltro === "todos" || linha.nome_filial === filialFiltro) &&
        (diretoriaFiltro === "todos" || linha.diretoria_nome === diretoriaFiltro) &&
        (setorFiltro === "todos" || linha.setor_nome === setorFiltro) &&
        (etapaFiltro === "todos" || etapaDaLinha(linha) === etapaFiltro)
      );
    });
  }, [linhas, anoFiltro, filialFiltro, diretoriaFiltro, setorFiltro, etapaFiltro]);

  const orcados = useMemo(() => filtradas.filter((l) => l.status === "orcamento_concluido"), [filtradas]);
  const emCotacao = useMemo(() => filtradas.filter((l) => l.status === "aguardando_cotacao"), [filtradas]);
  const emAndamento = useMemo(() => filtradas.filter((l) => !["orcamento_concluido", "rejeitada_diretoria", "rejeitada_patrimonio"].includes(String(l.status))), [filtradas]);
  const valorOrcado = orcados.reduce((acc, linha) => acc + valorLinha(linha), 0);
  const valorEmFluxo = filtradas.reduce((acc, linha) => acc + valorLinha(linha), 0);

  const etapas = useMemo(() => {
    const nomes = ["Diretoria", "Patrimônio", "Projetos", "Orçamento"];
    return nomes.map((nome) => {
      const lista = filtradas.filter((linha) => etapaDaLinha(linha) === nome);
      const valor = lista.reduce((acc, linha) => acc + valorLinha(linha), 0);
      const perc = filtradas.length ? Math.round((lista.length / filtradas.length) * 100) : 0;
      return { nome, qtd: lista.length, valor, perc };
    });
  }, [filtradas]);

  const porDiretoria = useMemo(() => agrupar(filtradas, (l) => l.diretoria_nome || "Não informado", true), [filtradas]);
  const porFilial = useMemo(() => agrupar(filtradas, (l) => l.nome_filial || "Não informado").slice(0, 8), [filtradas]);
  const topOrcados = useMemo(() => [...orcados].sort((a, b) => valorLinha(b) - valorLinha(a)).slice(0, 8), [orcados]);

  function limparFiltros() {
    setAnoFiltro("todos");
    setFilialFiltro("todos");
    setDiretoriaFiltro("todos");
    setSetorFiltro("todos");
    setEtapaFiltro("todos");
  }

  function exportarResumoDiretoria() {
    baixarCsv(
      "investflow-demo-resumo-diretoria.csv",
      porDiretoria.map((item) => ({ Diretoria: item.nome, Itens: item.qtd, Valor: item.valor }))
    );
  }

  function exportarItensOrcados() {
    baixarCsv(
      "investflow-demo-itens-orcados.csv",
      orcados.map((linha) => ({
        Codigo: linha.codigo || "",
        Diretoria: linha.diretoria_nome || "",
        Unidade: linha.nome_filial || "",
        Setor: linha.setor_nome || "",
        Projeto: linha.nome_projeto || "",
        Item: linha.item_nome || "",
        Status: normalizar(linha.status),
        Valor: valorLinha(linha),
      }))
    );
  }

  return (
    <Shell title="Relatórios" subtitle="Resumo executivo da base demo, conectado ao mesmo fluxo do dashboard.">
      <div style={styles.page}>
        <div style={styles.topBar}>
          <span style={styles.syncBadge}>✓ Base demo sincronizada com a Central de Investimentos</span>
          <div style={styles.actions}>
            <button onClick={exportarResumoDiretoria} style={styles.exportButton}>Resumo por diretoria</button>
            <button onClick={exportarItensOrcados} style={styles.exportButton}>Exportar orçados</button>
          </div>
        </div>

        <section style={styles.note}>
          Relatório em modo apresentação: dados fictícios, valores reduzidos e visão consolidada por etapa. Os itens com orçamento concluído já entram automaticamente nos indicadores e exportações.
        </section>

        <div style={styles.kpiGrid}>
          <Kpi label="Itens no fluxo" value={loading ? "..." : filtradas.length} hint={`${emAndamento.length} em andamento`} accent="#2563eb" />
          <Kpi label="Em cotação" value={loading ? "..." : emCotacao.length} hint="Aguardando fornecedor/valor" accent="#f97316" />
          <Kpi label="Orçados" value={loading ? "..." : orcados.length} hint="Concluídos e prontos para conselho" accent="#059669" />
          <Kpi label="Valor orçado" value={loading ? "..." : moeda(valorOrcado)} hint={`${moeda(valorEmFluxo)} no fluxo total`} accent="#7c3aed" />
        </div>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Filtros</h2>
              <p style={styles.panelSubtitle}>Use para simular uma visão por ano, unidade, diretoria, setor ou etapa.</p>
            </div>
            <button onClick={limparFiltros} style={styles.cleanButton}>Limpar</button>
          </div>

          <div style={styles.filterGrid}>
            <select value={anoFiltro} onChange={(e) => setAnoFiltro(e.target.value)} style={styles.select}>
              <option value="todos">Todos os anos</option>
              {anos.map((ano) => <option key={String(ano)} value={String(ano)}>{ano}</option>)}
            </select>
            <select value={filialFiltro} onChange={(e) => setFilialFiltro(e.target.value)} style={styles.select}>
              <option value="todos">Todas as unidades</option>
              {filiais.map((item) => <option key={item.nome} value={item.nome}>{item.nome}</option>)}
            </select>
            <select value={diretoriaFiltro} onChange={(e) => setDiretoriaFiltro(e.target.value)} style={styles.select}>
              <option value="todos">Todas as diretorias</option>
              {diretorias.map((item) => <option key={item.nome} value={item.nome}>{item.nome}</option>)}
            </select>
            <select value={setorFiltro} onChange={(e) => setSetorFiltro(e.target.value)} style={styles.select}>
              <option value="todos">Todos os setores</option>
              {setores.map((item) => <option key={item.nome} value={item.nome}>{item.nome}</option>)}
            </select>
            <select value={etapaFiltro} onChange={(e) => setEtapaFiltro(e.target.value)} style={styles.select}>
              <option value="todos">Todas as etapas</option>
              <option value="Diretoria">Diretoria</option>
              <option value="Patrimônio">Patrimônio</option>
              <option value="Projetos">Projetos</option>
              <option value="Orçamento">Orçamento</option>
            </select>
          </div>
        </section>

        <div style={styles.contentGrid}>
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>Distribuição por etapa</h2>
                <p style={styles.panelSubtitle}>Mostra se o fluxo está coerente entre dashboard, aprovações, projetos e orçamentos.</p>
              </div>
              <span style={styles.badge}>{filtradas.length} registros</span>
            </div>

            <div style={styles.miniGrid}>
              {etapas.map((etapa) => (
                <div key={etapa.nome} style={styles.stepCard}>
                  <div style={styles.stepTop}>
                    <span style={styles.stepName}>{etapa.nome}</span>
                    <strong style={styles.stepCount}>{etapa.qtd}</strong>
                  </div>
                  <div style={styles.progressTrack}>
                    <div style={{ ...styles.progressBar, width: `${etapa.perc}%` }} />
                  </div>
                  <div style={styles.kpiHint}>{moeda(etapa.valor)}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>Orçados por diretoria</h2>
                <p style={styles.panelSubtitle}>Itens prontos para análise gerencial/conselho.</p>
              </div>
              <span style={styles.badge}>{orcados.length} orçados</span>
            </div>

            <div style={styles.list}>
              {porDiretoria.length ? porDiretoria.map((item) => (
                <div key={item.nome} style={styles.listRow}>
                  <strong style={styles.listName}>{item.nome}</strong>
                  <span style={styles.listValue}>{moeda(item.valor)}</span>
                  <span style={styles.badge}>{item.qtd}</span>
                </div>
              )) : <div style={styles.empty}>Nenhum orçamento concluído com os filtros atuais.</div>}
            </div>
          </section>
        </div>

        <div style={styles.contentGrid}>
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>Top orçados</h2>
                <p style={styles.panelSubtitle}>Lista curta, limpa e pronta para apresentação.</p>
              </div>
              <span style={styles.badge}>{topOrcados.length} registros</span>
            </div>

            <div style={styles.tableWrap}>
              <div style={styles.tableScroller}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, width: 120 }}>Código</th>
                      <th style={styles.th}>Unidade</th>
                      <th style={styles.th}>Item</th>
                      <th style={{ ...styles.th, width: 150 }}>Diretoria</th>
                      <th style={{ ...styles.th, width: 125 }}>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td style={styles.td} colSpan={5}>Carregando...</td></tr>
                    ) : topOrcados.length === 0 ? (
                      <tr><td style={styles.td} colSpan={5}>Nenhum orçamento concluído encontrado.</td></tr>
                    ) : topOrcados.map((linha) => (
                      <tr key={linha.solicitacao_id}>
                        <td style={{ ...styles.td, fontWeight: 950 }}>{linha.codigo || "-"}</td>
                        <td style={styles.td}>{linha.nome_filial || "-"}</td>
                        <td style={{ ...styles.td, fontWeight: 800 }}>{linha.item_nome || "-"}</td>
                        <td style={styles.td}>{linha.diretoria_nome || "-"}</td>
                        <td style={{ ...styles.td, fontWeight: 950 }}>{moeda(valorLinha(linha))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>Unidades atendidas</h2>
                <p style={styles.panelSubtitle}>Resumo da amostra por unidade demonstrativa.</p>
              </div>
              <span style={styles.badge}>{porFilial.length} unidades</span>
            </div>

            <div style={styles.list}>
              {porFilial.length ? porFilial.map((item) => (
                <div key={item.nome} style={styles.listRow}>
                  <strong style={styles.listName}>{item.nome}</strong>
                  <span style={styles.listValue}>{moeda(item.valor)}</span>
                  <span style={styles.badge}>{item.qtd}</span>
                </div>
              )) : <div style={styles.empty}>Nenhuma unidade encontrada.</div>}
            </div>
          </section>
        </div>
      </div>
    </Shell>
  );
}
