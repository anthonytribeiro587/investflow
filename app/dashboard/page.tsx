import { KpiCard } from "@/components/KpiCard";
import { Shell } from "@/components/Shell";
import { brl } from "@/lib/data";
import { DEMO_QUERY_LIMIT, DEMO_TABLE_LIMIT, sampleRows } from "@/lib/demo";
import { getDemoDirectorScopeByEmail, normalizeRole, rowMatchesUserScope } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const etapas = [
  { label: "Diretoria", statuses: ["enviada", "ajuste_solicitado", "aprovada_diretoria", "rejeitada_diretoria"] },
  { label: "Patrimônio", statuses: ["aprovada_diretoria", "pendente_orcamento", "rejeitada_patrimonio"] },
  { label: "Projetos", statuses: ["pendente_orcamento", "aguardando_cotacao"] },
  { label: "Orçamento", statuses: ["aguardando_cotacao", "orcamento_concluido"] },
] as const;

function normalizar(valor: unknown) {
  return String(valor ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll(" ", "_");
}

function nomeEtapa(valor: unknown) {
  const normalizado = normalizar(valor);

  const mapa: Record<string, string> = {
    enviada: "Aguardando diretoria",
    ajuste_solicitado: "Ajuste solicitado",
    aprovada_diretoria: "Em patrimônio",
    rejeitada_diretoria: "Rejeitada diretoria",
    pendente_orcamento: "Definir projeto",
    rejeitada_patrimonio: "Rejeitada patrimônio",
    aguardando_cotacao: "Aguardando cotação",
    orcamento_concluido: "Cotação concluída",
  };

  return mapa[normalizado] ?? "Em análise";
}

function percentualEtapa(valor: unknown) {
  const normalizado = normalizar(valor);

  const mapa: Record<string, number> = {
    enviada: 15,
    ajuste_solicitado: 10,
    rejeitada_diretoria: 0,
    aprovada_diretoria: 35,
    rejeitada_patrimonio: 0,
    pendente_orcamento: 55,
    aguardando_cotacao: 70,
    orcamento_concluido: 85,
  };

  return mapa[normalizado] ?? 0;
}

function valorItem(item: any) {
  return Number(item.valor_orcado ?? item.valor_total_investimento ?? 0);
}

function contarStatus(base: any[], statuses: readonly string[]) {
  return base.filter((item) => statuses.includes(normalizar(item.status))).length;
}

function decodificar(valor?: string) {
  try {
    return decodeURIComponent(valor ?? "");
  } catch {
    return valor ?? "";
  }
}

export default async function Dashboard() {
  if (!supabase) {
    return (
      <Shell
        title="Dashboard"
        subtitle="Acompanhamento gerencial de investimentos demonstrativos"
      >
        <section className="panel">
          <h2>Supabase não configurado</h2>
          <p>Verifique as variáveis de ambiente do projeto.</p>
        </section>
      </Shell>
    );
  }

  const cookieStore = await cookies();
  const emailCookie = decodificar(cookieStore.get("investflow-user-email")?.value);
  const diretoriaFallback = getDemoDirectorScopeByEmail(emailCookie);
  const escopo = {
    perfil: normalizeRole(cookieStore.get("investflow-role")?.value || "admin"),
    email: emailCookie,
    filialId: decodificar(cookieStore.get("investflow-filial-id")?.value),
    diretoriaId: decodificar(cookieStore.get("investflow-diretoria-id")?.value) || diretoriaFallback?.id || "",
    diretoriaNome: decodificar(cookieStore.get("investflow-diretoria-nome")?.value) || diretoriaFallback?.nome || "",
  };

  const { data: central } = await supabase
    .from("vw_central_investimentos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(DEMO_QUERY_LIMIT);

  const baseCompleta = sampleRows(central ?? []);
  const base = baseCompleta.filter((item: any) => rowMatchesUserScope(item, escopo));
  const amostraTabela = base.slice(0, DEMO_TABLE_LIMIT);

  const aguardandoDiretoria = contarStatus(base, ["enviada"]);
  const emOrcamento = contarStatus(base, [
    "pendente_orcamento",
    "aguardando_cotacao",
    "orcamento_concluido",
  ]);

  const progressoMedio =
    base.length > 0
      ? Math.round(
          base.reduce((acc: number, item: any) => {
            return acc + percentualEtapa(item.status);
          }, 0) / base.length
        )
      : 0;

  const valorEstimado = base.reduce((acc: number, item: any) => {
    return acc + valorItem(item);
  }, 0);

  return (
    <Shell
      title="Dashboard"
      subtitle="Acompanhamento gerencial conectado à base demo do fluxo"
    >
      <section className="demo-note">
        <strong>Modo apresentação:</strong> este painel respeita o perfil logado.
        Diretores enxergam somente as unidades da própria diretoria; o admin enxerga a base demo completa.
      </section>

      <section className="kpi-grid">
        <KpiCard label="Total em fluxo" value={String(base.length)} variant="blue" />

        <KpiCard
          label="Aguardando diretoria"
          value={String(aguardandoDiretoria)}
          variant="orange"
        />

        <KpiCard
          label="Em projeto/orçamento"
          value={String(emOrcamento)}
          variant="green"
        />

        <KpiCard
          label="Valor estimado demo"
          value={brl(valorEstimado)}
          variant="purple"
          progress={progressoMedio}
        />
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <h2>Central de Investimentos Demo</h2>

          <p>
            Estes registros são fictícios e foram criados para aparecerem nas
            telas reais do fluxo: solicitações, aprovação da diretoria,
            patrimônio, projetos e orçamentos.
          </p>

          <p>
            Exibindo {amostraTabela.length} registros de uma base demo limitada
            a {base.length} itens.
          </p>

          <div className="table-scroll limited compact-dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Ano</th>
                  <th>Sem.</th>
                  <th>Unidade</th>
                  <th>Projeto</th>
                  <th>Item</th>
                  <th>Valor</th>
                  <th>Etapa</th>
                  <th>%</th>
                </tr>
              </thead>

              <tbody>
                {amostraTabela.map((item: any, index: number) => (
                  <tr key={item.solicitacao_id ?? item.id ?? index}>
                    <td>{item.ano}</td>
                    <td>{item.semestre_sugerido ?? item.semestre_aprovado ?? "2º Sem."}</td>
                    <td>{item.nome_filial ?? `Unidade ${String(index + 1).padStart(2, "0")}`}</td>
                    <td>{item.nome_projeto ?? "Sem projeto definido"}</td>
                    <td>{item.item_nome ?? "Item demonstrativo"}</td>
                    <td>{brl(valorItem(item))}</td>
                    <td>
                      <span className={`status ${normalizar(item.status)}`}>
                        {nomeEtapa(item.status)}
                      </span>
                    </td>
                    <td>{percentualEtapa(item.status)}%</td>
                  </tr>
                ))}

                {amostraTabela.length === 0 && (
                  <tr>
                    <td colSpan={8}>Nenhum item encontrado na central demo.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="panel">
          <h2>Resumo por etapa</h2>

          <div className="status-list">
            {etapas.map((etapa) => (
              <div key={etapa.label}>
                <span>{etapa.label}</span>
                <strong>{contarStatus(base, etapa.statuses)}</strong>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: 28 }}>Resumo geral</h2>

          <div className="status-list">
            <div>
              <span>Base demo</span>
              <strong>{base.length}</strong>
            </div>

            <div>
              <span>Em andamento</span>
              <strong>
                {contarStatus(base, [
                  "enviada",
                  "aprovada_diretoria",
                  "pendente_orcamento",
                  "aguardando_cotacao",
                ])}
              </strong>
            </div>

            <div>
              <span>Concluídos na cotação</span>
              <strong>{contarStatus(base, ["orcamento_concluido"])}</strong>
            </div>

            <div>
              <span>Progresso médio</span>
              <strong>{progressoMedio}%</strong>
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
