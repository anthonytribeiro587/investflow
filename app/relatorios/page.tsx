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
  } | null;
  setores: {
    nome: string | null;
  } | null;
  itens_catalogo: {
    nome_item: string | null;
  } | null;
};

const styles: Record<string, CSSProperties> = {
  page: { display: "flex", flexDirection: "column", gap: 24 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  title: { fontSize: 30, fontWeight: 800, color: "#0f172a", margin: 0 },
  subtitle: { marginTop: 6, color: "#64748b", fontSize: 14 },
  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 10px 25px rgba(15,23,42,.06)",
  },
  button: {
    border: "none",
    background: "#0f172a",
    color: "white",
    padding: "10px 16px",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 16,
  },
  kpiLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
  },
  kpiValue: { marginTop: 8, fontSize: 30, fontWeight: 900 },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
    gap: 12,
    marginTop: 16,
  },
  select: {
    height: 44,
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: "0 12px",
    background: "white",
    fontWeight: 700,
    color: "#0f172a",
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: 900, color: "#0f172a", margin: 0 },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gap: 12,
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #e2e8f0",
  },
  badge: {
    display: "inline-flex",
    padding: "6px 11px",
    borderRadius: 999,
    background: "#e2e8f0",
    color: "#334155",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  tableWrap: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(15,23,42,.06)",
  },
  th: {
    background: "#f8fafc",
    color: "#334155",
    textAlign: "left",
    padding: "14px 16px",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #e2e8f0",
    color: "#0f172a",
    verticalAlign: "middle",
  },
};

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function normalizar(texto: string | null | undefined) {
  return texto ? texto.replaceAll("_", " ") : "-";
}

function Kpi({
  label,
  value,
  color = "#0f172a",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div style={styles.card}>
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
  const [setorFiltro, setSetorFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState("todos");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
  if (!supabase) {
    console.error("Supabase não configurado.");
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
      filiais ( nome_filial ),
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

  const filtradas = useMemo(() => {
    return solicitacoes.filter((s) => {
      return (
        (anoFiltro === "todos" || String(s.ano) === anoFiltro) &&
        (filialFiltro === "todos" || s.filial_id === filialFiltro) &&
        (setorFiltro === "todos" || s.setor_id === setorFiltro) &&
        (statusFiltro === "todos" || s.status === statusFiltro)
      );
    });
  }, [solicitacoes, anoFiltro, filialFiltro, setorFiltro, statusFiltro]);

  const total = filtradas.length;

  const emOrcamento = filtradas.filter((s) =>
    String(s.status).includes("orcamento")
  ).length;

  const orcamentosConcluidos = filtradas.filter(
    (s) => s.status === "orcamento_concluido"
  ).length;

  const valorTotal = filtradas.reduce(
    (acc, s) => acc + Number(s.valor_orcado || 0),
    0
  );

  const filiaisAtendidas = new Set(
    filtradas.filter((s) => s.filial_id).map((s) => s.filial_id)
  ).size;

  const setoresAtendidos = new Set(
    filtradas.filter((s) => s.setor_id).map((s) => s.setor_id)
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

  const resumoPorStatus = useMemo(() => {
    const mapa = new Map<string, number>();

    filtradas.forEach((s) => {
      const nome = s.status || "Sem status";
      mapa.set(nome, (mapa.get(nome) || 0) + 1);
    });

    return Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]);
  }, [filtradas]);

  const topInvestimentos = useMemo(() => {
    return [...filtradas]
      .sort((a, b) => Number(b.valor_orcado || 0) - Number(a.valor_orcado || 0))
      .slice(0, 10);
  }, [filtradas]);

  function limparFiltros() {
    setAnoFiltro("todos");
    setFilialFiltro("todos");
    setSetorFiltro("todos");
    setStatusFiltro("todos");
  }

  function exportarCsv() {
    const linhas = filtradas.map((s) => ({
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

    if (!linhas.length) return;

    const cabecalho = Object.keys(linhas[0]).join(";");
    const corpo = linhas
      .map((linha) =>
        Object.values(linha)
          .map((valor) => `"${String(valor).replaceAll('"', "'")}"`)
          .join(";")
      )
      .join("\n");

    const blob = new Blob([`${cabecalho}\n${corpo}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "relatorio-investflow.csv";
    link.click();

    URL.revokeObjectURL(url);
  }
    return (
  <Shell
    title="Relatórios"
    subtitle="Visão geral dos investimentos por filial, setor, orçamento e valor."
  >
    <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Relatórios</h1>
            <p style={styles.subtitle}>
              Visão geral dos investimentos por filial, setor, orçamento e valor.
            </p>
          </div>

          <button onClick={exportarCsv} style={styles.button}>
            Exportar CSV
          </button>
        </div>

        <div style={styles.kpiGrid}>
          <Kpi label="Solicitações" value={total} />
          <Kpi label="Em orçamento" value={emOrcamento} color="#2563eb" />
          <Kpi
            label="Orçamentos concluídos"
            value={orcamentosConcluidos}
            color="#059669"
          />
          <Kpi label="Filiais atendidas" value={filiaisAtendidas} color="#7c3aed" />
          <Kpi label="Valor orçado" value={moeda(valorTotal)} />
        </div>

        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.sectionTitle}>Filtros rápidos</h2>

            <button
              onClick={limparFiltros}
              style={{
                border: "1px solid #cbd5e1",
                background: "white",
                borderRadius: 10,
                padding: "8px 12px",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Limpar filtros
            </button>
          </div>

          <div style={styles.filtersGrid}>
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
              {resumoPorStatus.map(([status]) => (
                <option key={status} value={status}>
                  {normalizar(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.dashboardGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Investimentos por filial</h2>

            <div style={{ marginTop: 12 }}>
              {resumoPorFilial.slice(0, 12).map(([nome, dados]) => (
                <div key={nome} style={styles.row}>
                  <strong>{nome}</strong>
                  <span>{moeda(dados.valor)}</span>
                  <span style={styles.badge}>{dados.qtd}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Investimentos por setor</h2>

            <div style={{ marginTop: 12 }}>
              {resumoPorSetor.slice(0, 12).map(([nome, dados]) => (
                <div key={nome} style={styles.row}>
                  <strong>{nome}</strong>
                  <span>{moeda(dados.valor)}</span>
                  <span style={styles.badge}>{dados.qtd}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Distribuição por status</h2>

            <div style={{ marginTop: 12 }}>
              {resumoPorStatus.map(([status, qtd]) => (
                <div key={status} style={styles.row}>
                  <strong style={{ textTransform: "capitalize" }}>
                    {normalizar(status)}
                  </strong>
                  <span></span>
                  <span style={styles.badge}>{qtd}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.tableWrap}>
          <div
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={styles.sectionTitle}>Top investimentos</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                Maiores valores orçados encontrados no filtro atual.
              </p>
            </div>

            <span style={styles.badge}>
              {setoresAtendidos} setores atendidos
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 1100,
                borderCollapse: "separate",
                borderSpacing: 0,
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  <th style={styles.th}>Código</th>
                  <th style={styles.th}>Filial</th>
                  <th style={styles.th}>Setor</th>
                  <th style={styles.th}>Item</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Valor</th>
                  <th style={styles.th}>Fornecedor</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td style={styles.td} colSpan={7}>
                      Carregando...
                    </td>
                  </tr>
                ) : topInvestimentos.length === 0 ? (
                  <tr>
                    <td style={styles.td} colSpan={7}>
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
                        {s.filiais?.nome_filial || "Sem filial"}
                      </td>

                      <td style={styles.td}>{s.setores?.nome || "Sem setor"}</td>

                      <td style={{ ...styles.td, minWidth: 240 }}>
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

                      <td style={styles.td}>{s.fornecedor_orcamento || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
  );
}