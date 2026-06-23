"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Shell } from "@/components/Shell";
import { supabase } from "@/lib/supabase";

type SolicitacaoRelatorio = {
  id: string;
  codigo: string | null;
  ano: number;
  prioridade: string | null;
  status: string | null;
  tipo: string | null;
  valor_orcado: number | null;
  fornecedor_orcamento: string | null;
  created_at: string | null;
  filial_id: string | null;
  setor_id: string | null;
  descricao_item_manual: string | null;
  filiais: {
    nome_filial: string | null;
    diretor_responsavel: string | null;
  } | null;
  setores: { nome: string | null } | null;
  itens_catalogo: { nome_item: string | null } | null;
};

const styles: Record<string, CSSProperties> = {
  page: { display: "flex", flexDirection: "column", gap: 22 },
  actions: { display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" },
  exportButton: {
    border: 0,
    background: "#07111f",
    color: "white",
    padding: "12px 18px",
    borderRadius: 14,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(15,23,42,.18)",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 18,
  },
  kpi: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: 22,
    boxShadow: "0 16px 38px rgba(15,23,42,.07)",
  },
  kpiLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: ".5px",
  },
  kpiValue: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: 900,
    color: "#07111f",
  },
  panel: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 22,
    padding: 24,
    boxShadow: "0 16px 42px rgba(15,23,42,.07)",
    overflow: "hidden",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
    marginBottom: 18,
  },
  panelTitle: { margin: 0, fontSize: 22, fontWeight: 900, color: "#07111f" },
  panelSubtitle: { margin: "6px 0 0", color: "#64748b", fontSize: 14 },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
  },
  select: {
    height: 46,
    border: "1px solid #dbe3ee",
    borderRadius: 14,
    background: "white",
    color: "#07111f",
    padding: "0 14px",
    fontWeight: 800,
    minWidth: 0,
  },
  cleanButton: {
    border: "1px solid #dbe3ee",
    background: "white",
    color: "#07111f",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  gridThree: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 18,
  },
  list: { display: "grid", gap: 0, maxHeight: 360, overflowY: "auto" },
  listRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto auto",
    gap: 12,
    alignItems: "center",
    borderBottom: "1px solid #e2e8f0",
    padding: "13px 0",
  },
  listName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 850,
    color: "#07111f",
  },
  listValue: { whiteSpace: "nowrap", color: "#07111f", fontWeight: 700 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: "7px 11px",
    background: "#e8eef7",
    color: "#334155",
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  tableWrap: {
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    overflow: "hidden",
  },
  tableScroller: { maxHeight: 420, overflowY: "auto", overflowX: "auto" },
  table: {
    width: "100%",
    tableLayout: "fixed",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    background: "#f8fafc",
    color: "#475569",
    textAlign: "left",
    padding: "13px 12px",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "13px 12px",
    borderBottom: "1px solid #e2e8f0",
    color: "#07111f",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function normalizar(texto: string | null | undefined) {
  if (!texto) return "-";

  const mapa: Record<string, string> = {
    enviada: "Enviada",
    ajuste_solicitado: "Ajuste solicitado",
    rejeitada_diretoria: "Rejeitada diretoria",
    aprovada_diretoria: "Aprovada diretoria",
    rejeitada_patrimonio: "Rejeitada patrimônio",
    pendente_orcamento: "Pendente orçamento",
    aguardando_cotacao: "Aguardando cotação",
    orcamento_concluido: "Orçamento concluído",
    em_orcamento: "Em orçamento",
  };

  return mapa[texto] ?? texto.replaceAll("_", " ");
}

function Kpi({ label, value, color = "#07111f" }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={styles.kpi}>
      <div style={styles.kpiLabel}>{label}</div>
      <div style={{ ...styles.kpiValue, color }}>{value}</div>
    </div>
  );
}

export default function Relatorios() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoRelatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [anoFiltro, setAnoFiltro] = useState("todos");
  const [filialFiltro, setFilialFiltro] = useState("todos");
  const [diretoriaFiltro, setDiretoriaFiltro] = useState("todos");
  const [setorFiltro, setSetorFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState("todos");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    if (!supabase) {
      setSolicitacoes([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("solicitacoes")
      .select(`
        id,
        codigo,
        ano,
        prioridade,
        status,
        tipo,
        valor_orcado,
        fornecedor_orcamento,
        created_at,
        filial_id,
        setor_id,
        descricao_item_manual,
        filiais ( nome_filial, diretor_responsavel ),
        setores ( nome ),
        itens_catalogo ( nome_item )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro relatórios:", error);
      setSolicitacoes([]);
    } else {
      setSolicitacoes((data ?? []) as unknown as SolicitacaoRelatorio[]);
    }

    setLoading(false);
  }

  const anos = useMemo(() => {
    return Array.from(new Set(solicitacoes.map((s) => s.ano))).sort(
      (a, b) => b - a
    );
  }, [solicitacoes]);

  const filiais = useMemo(() => {
    const mapa = new Map<string, string>();

    solicitacoes.forEach((s) => {
      if (s.filial_id && s.filiais?.nome_filial) {
        mapa.set(s.filial_id, s.filiais.nome_filial);
      }
    });

    return Array.from(mapa.entries()).sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [solicitacoes]);

  const setores = useMemo(() => {
    const mapa = new Map<string, string>();

    solicitacoes.forEach((s) => {
      if (s.setor_id && s.setores?.nome) {
        mapa.set(s.setor_id, s.setores.nome);
      }
    });

    return Array.from(mapa.entries()).sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [solicitacoes]);

  const diretorias = useMemo(() => {
    return Array.from(
      new Set(
        solicitacoes
          .map((s) => s.filiais?.diretor_responsavel)
          .filter(Boolean) as string[]
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [solicitacoes]);

  const statusDisponiveis = useMemo(() => {
    return Array.from(
      new Set(solicitacoes.map((s) => s.status).filter(Boolean) as string[])
    ).sort();
  }, [solicitacoes]);

  const filtradas = useMemo(() => {
    return solicitacoes.filter((s) => {
      return (
        (anoFiltro === "todos" || String(s.ano) === anoFiltro) &&
        (filialFiltro === "todos" || s.filial_id === filialFiltro) &&
        (diretoriaFiltro === "todos" ||
          s.filiais?.diretor_responsavel === diretoriaFiltro) &&
        (setorFiltro === "todos" || s.setor_id === setorFiltro) &&
        (statusFiltro === "todos" || s.status === statusFiltro)
      );
    });
  }, [
    solicitacoes,
    anoFiltro,
    filialFiltro,
    diretoriaFiltro,
    setorFiltro,
    statusFiltro,
  ]);

  const orcadosFiltrados = useMemo(() => {
    return filtradas.filter((s) => s.status === "orcamento_concluido");
  }, [filtradas]);

  const total = filtradas.length;

  const emAndamento = filtradas.filter((s) =>
    ["pendente_orcamento", "aguardando_cotacao", "em_orcamento"].includes(
      String(s.status)
    )
  ).length;

  const orcamentosConcluidos = filtradas.filter(
    (s) => s.status === "orcamento_concluido"
  ).length;

  const valorTotal = filtradas.reduce(
    (acc, s) => acc + Number(s.valor_orcado || 0),
    0
  );

  const valorOrcadoConselho = orcadosFiltrados.reduce(
    (acc, s) => acc + Number(s.valor_orcado || 0),
    0
  );

  const filiaisAtendidas = new Set(
    filtradas.filter((s) => s.filial_id).map((s) => s.filial_id)
  ).size;

  const diretoriasAtendidas = new Set(
    filtradas
      .map((s) => s.filiais?.diretor_responsavel)
      .filter(Boolean)
  ).size;

  const resumoPorFilial = useMemo(() => {
    const mapa = new Map<string, { qtd: number; valor: number }>();

    filtradas.forEach((s) => {
      const nome = s.filiais?.nome_filial || "Sem filial";
      const atual = mapa.get(nome) || { qtd: 0, valor: 0 };
      atual.qtd += 1;
      atual.valor += Number(s.valor_orcado || 0);
      mapa.set(nome, atual);
    });

    return Array.from(mapa.entries()).sort((a, b) => b[1].qtd - a[1].qtd);
  }, [filtradas]);

  const resumoPorSetor = useMemo(() => {
    const mapa = new Map<string, { qtd: number; valor: number }>();

    filtradas.forEach((s) => {
      const nome = s.setores?.nome || "Sem setor";
      const atual = mapa.get(nome) || { qtd: 0, valor: 0 };
      atual.qtd += 1;
      atual.valor += Number(s.valor_orcado || 0);
      mapa.set(nome, atual);
    });

    return Array.from(mapa.entries()).sort((a, b) => b[1].qtd - a[1].qtd);
  }, [filtradas]);

  const resumoPorDiretoria = useMemo(() => {
    const mapa = new Map<string, { qtd: number; valor: number }>();

    orcadosFiltrados.forEach((s) => {
      const nome = s.filiais?.diretor_responsavel || "Sem diretoria";
      const atual = mapa.get(nome) || { qtd: 0, valor: 0 };
      atual.qtd += 1;
      atual.valor += Number(s.valor_orcado || 0);
      mapa.set(nome, atual);
    });

    return Array.from(mapa.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
  }, [orcadosFiltrados]);

  const resumoPorStatus = useMemo(() => {
    const mapa = new Map<string, number>();

    filtradas.forEach((s) => {
      const nome = s.status || "Sem status";
      mapa.set(nome, (mapa.get(nome) || 0) + 1);
    });

    return Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]);
  }, [filtradas]);

  const topInvestimentos = useMemo(() => {
    return [...orcadosFiltrados]
      .sort((a, b) => Number(b.valor_orcado || 0) - Number(a.valor_orcado || 0))
      .slice(0, 10);
  }, [orcadosFiltrados]);

  function limparFiltros() {
    setAnoFiltro("todos");
    setFilialFiltro("todos");
    setDiretoriaFiltro("todos");
    setSetorFiltro("todos");
    setStatusFiltro("todos");
  }

  function exportarCsv() {
    const linhas = [...orcadosFiltrados]
      .sort((a, b) => {
        const diretoriaA = a.filiais?.diretor_responsavel || "";
        const diretoriaB = b.filiais?.diretor_responsavel || "";
        const filialA = a.filiais?.nome_filial || "";
        const filialB = b.filiais?.nome_filial || "";

        return (
          diretoriaA.localeCompare(diretoriaB) ||
          filialA.localeCompare(filialB) ||
          Number(b.valor_orcado || 0) - Number(a.valor_orcado || 0)
        );
      })
      .map((s) => ({
        Diretoria: s.filiais?.diretor_responsavel || "Sem diretoria",
        Codigo: s.codigo || "",
        Ano: s.ano,
        Filial: s.filiais?.nome_filial || "Sem filial",
        Setor: s.setores?.nome || "Sem setor",
        Item:
          s.itens_catalogo?.nome_item ||
          s.descricao_item_manual ||
          "Sem item",
        Tipo: normalizar(s.tipo),
        Status: normalizar(s.status),
        Valor: s.valor_orcado || 0,
        Fornecedor: s.fornecedor_orcamento || "",
      }));

    baixarCsv("itens-orcados-por-diretoria.csv", linhas);
  }

  function baixarCsv(nomeArquivo: string, linhas: Record<string, string | number>[]) {
    if (!linhas.length) {
      window.alert("Não há itens orçados para exportar com os filtros atuais.");
      return;
    }

    const cabecalho = Object.keys(linhas[0]).join(";");
    const corpo = linhas
      .map((linha) =>
        Object.values(linha)
          .map((valor) => `"${String(valor).replaceAll('"', "'")}"`)
          .join(";")
      )
      .join("\n");

    const blob = new Blob([`sep=;\n${cabecalho}\n${corpo}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = nomeArquivo;
    link.click();

    URL.revokeObjectURL(url);
  }

  function exportarResumoDiretoria() {
    const linhas = resumoPorDiretoria.map(([diretoria, dados]) => ({
      Diretoria: diretoria,
      Itens: dados.qtd,
      "Soma de Valor Total": dados.valor,
    }));

    baixarCsv("resumo-orcado-por-diretoria.csv", linhas);
  }

  return (
    <Shell
      title="Relatórios"
      subtitle="Visão gerencial dos investimentos por filial, setor, status e valor."
    >
      <div style={styles.page}>
        <div style={styles.actions}>
          <button onClick={exportarResumoDiretoria} style={styles.exportButton}>
            Exportar resumo por diretoria
          </button>
          <button onClick={exportarCsv} style={styles.exportButton}>
            Exportar itens orçados por diretoria
          </button>
        </div>

        <div style={styles.kpiGrid}>
          <Kpi label="Solicitações" value={total} />
          <Kpi label="Em andamento" value={emAndamento} color="#2563eb" />
          <Kpi
            label="Orçamentos concluídos"
            value={orcamentosConcluidos}
            color="#059669"
          />
          <Kpi
            label="Filiais atendidas"
            value={filiaisAtendidas}
            color="#7c3aed"
          />
        </div>

        <div style={styles.kpiGrid}>
          <Kpi label="Valor total filtrado" value={moeda(valorTotal)} color="#059669" />
          <Kpi label="Valor planilha conselho" value={moeda(valorOrcadoConselho)} color="#0ea5e9" />
          <Kpi label="Registros filtrados" value={filtradas.length} color="#f97316" />
          <Kpi label="Diretorias atendidas" value={diretoriasAtendidas} color="#64748b" />
        </div>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Filtros rápidos</h2>
              <p style={styles.panelSubtitle}>
                Refine a visão por ano, diretoria, filial, setor ou status.
              </p>
            </div>

            <button onClick={limparFiltros} style={styles.cleanButton}>
              Limpar filtros
            </button>
          </div>

          <div style={styles.filterGrid}>
            <select
              value={anoFiltro}
              onChange={(e) => setAnoFiltro(e.target.value)}
              style={styles.select}
            >
              <option value="todos">Todos os anos</option>
              {anos.map((ano) => (
                <option key={ano} value={String(ano)}>
                  {ano}
                </option>
              ))}
            </select>

            <select
              value={filialFiltro}
              onChange={(e) => setFilialFiltro(e.target.value)}
              style={styles.select}
            >
              <option value="todos">Todas as filiais</option>
              {filiais.map(([id, nome]) => (
                <option key={id} value={id}>
                  {nome}
                </option>
              ))}
            </select>

            <select
              value={diretoriaFiltro}
              onChange={(e) => setDiretoriaFiltro(e.target.value)}
              style={styles.select}
            >
              <option value="todos">Todas as diretorias</option>
              {diretorias.map((diretoria) => (
                <option key={diretoria} value={diretoria}>
                  {diretoria}
                </option>
              ))}
            </select>

            <select
              value={setorFiltro}
              onChange={(e) => setSetorFiltro(e.target.value)}
              style={styles.select}
            >
              <option value="todos">Todos os setores</option>
              {setores.map(([id, nome]) => (
                <option key={id} value={id}>
                  {nome}
                </option>
              ))}
            </select>

            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              style={styles.select}
            >
              <option value="todos">Todos os status</option>
              {statusDisponiveis.map((status) => (
                <option key={status} value={status}>
                  {normalizar(status)}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div style={styles.gridThree}>
          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Itens orçados por diretoria</h2>
            <div style={styles.list}>
              {resumoPorDiretoria.map(([nome, dados]) => (
                <div key={nome} style={styles.listRow}>
                  <strong style={styles.listName}>{nome}</strong>
                  <span style={styles.listValue}>{moeda(dados.valor)}</span>
                  <span style={styles.badge}>{dados.qtd}</span>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Por filial</h2>
            <div style={styles.list}>
              {resumoPorFilial.slice(0, 10).map(([nome, dados]) => (
                <div key={nome} style={styles.listRow}>
                  <strong style={styles.listName}>{nome}</strong>
                  <span style={styles.listValue}>{moeda(dados.valor)}</span>
                  <span style={styles.badge}>{dados.qtd}</span>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Por setor</h2>
            <div style={styles.list}>
              {resumoPorSetor.slice(0, 10).map(([nome, dados]) => (
                <div key={nome} style={styles.listRow}>
                  <strong style={styles.listName}>{nome}</strong>
                  <span style={styles.listValue}>{moeda(dados.valor)}</span>
                  <span style={styles.badge}>{dados.qtd}</span>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Por status</h2>
            <div style={styles.list}>
              {resumoPorStatus.map(([status, qtd]) => (
                <div key={status} style={styles.listRow}>
                  <strong style={styles.listName}>{normalizar(status)}</strong>
                  <span />
                  <span style={styles.badge}>{qtd}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Top investimentos orçados</h2>
              <p style={styles.panelSubtitle}>
                Maiores valores com orçamento concluído, conforme os filtros aplicados.
              </p>
            </div>

            <span style={styles.badge}>{topInvestimentos.length} registros</span>
          </div>

          <div style={styles.tableWrap}>
            <div style={styles.tableScroller}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: 190 }}>Código</th>
                    <th style={{ ...styles.th, width: 180 }}>Diretoria</th>
                    <th style={{ ...styles.th, width: 210 }}>Filial</th>
                    <th style={{ ...styles.th, width: 150 }}>Setor</th>
                    <th style={styles.th}>Item</th>
                    <th style={{ ...styles.th, width: 170 }}>Status</th>
                    <th style={{ ...styles.th, width: 130 }}>Valor</th>
                    <th style={{ ...styles.th, width: 140 }}>Fornecedor</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td style={styles.td} colSpan={8}>
                        Carregando...
                      </td>
                    </tr>
                  ) : topInvestimentos.length === 0 ? (
                    <tr>
                      <td style={styles.td} colSpan={8}>
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  ) : (
                    topInvestimentos.map((s) => (
                      <tr key={s.id}>
                        <td style={{ ...styles.td, fontWeight: 900 }}>
                          {s.codigo || "-"}
                        </td>

                        <td style={styles.td}>
                          {s.filiais?.diretor_responsavel || "Sem diretoria"}
                        </td>

                        <td style={styles.td}>
                          {s.filiais?.nome_filial || "Sem filial"}
                        </td>

                        <td style={styles.td}>
                          {s.setores?.nome || "Sem setor"}
                        </td>

                        <td style={{ ...styles.td, fontWeight: 700 }}>
                          {s.itens_catalogo?.nome_item ||
                            s.descricao_item_manual ||
                            "Sem item"}
                        </td>

                        <td style={styles.td}>
                          <span style={styles.badge}>{normalizar(s.status)}</span>
                        </td>

                        <td style={{ ...styles.td, fontWeight: 900 }}>
                          {moeda(Number(s.valor_orcado || 0))}
                        </td>

                        <td style={styles.td}>
                          {s.fornecedor_orcamento || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
