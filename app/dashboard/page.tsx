import { KpiCard } from "@/components/KpiCard";
import { Shell } from "@/components/Shell";
import { brl } from "@/lib/data";
import { DEMO_QUERY_LIMIT, DEMO_TABLE_LIMIT, sampleRows } from "@/lib/demo";
import { supabase } from "@/lib/supabase";

const situacoes = [
  { label: "Em orçamento", value: "em_orcamento" },
  { label: "Comprado", value: "comprado" },
  { label: "Em obra", value: "em_obra" },
  { label: "Realizado", value: "realizado" },
  { label: "Transferido", value: "transferido" },
];

function normalizar(valor: unknown) {
  return String(valor ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll(" ", "_");
}

function nomeSituacao(valor: unknown) {
  const normalizado = normalizar(valor);

  const mapa: Record<string, string> = {
    em_orcamento: "Em orçamento",
    comprado: "Comprado",
    em_obra: "Em obra",
    realizado: "Realizado",
    transferido: "Transferido",
  };

  return mapa[normalizado] ?? "-";
}

function percentualSituacao(valor: unknown) {
  const normalizado = normalizar(valor);

  const mapa: Record<string, number> = {
    em_orcamento: 45,
    comprado: 70,
    em_obra: 85,
    realizado: 100,
    transferido: 100,
  };

  return mapa[normalizado] ?? 0;
}

function valorItem(item: any) {
  return Number(item.valor_orcado ?? item.valor_total_investimento ?? 0);
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

  const { data: central } = await supabase
    .from("vw_central_investimentos")
    .select("*")
    .limit(DEMO_QUERY_LIMIT);

  const base = sampleRows(central ?? []);
  const amostraTabela = base.slice(0, DEMO_TABLE_LIMIT);

  const itensEmOrcamento = base.filter(
    (item: any) => normalizar(item.situacao) === "em_orcamento"
  );

  const progressoMedio =
    base.length > 0
      ? Math.round(
          base.reduce((acc: number, item: any) => {
            return acc + percentualSituacao(item.situacao);
          }, 0) / base.length
        )
      : 0;

  const itensConcluidos = base.filter((item: any) => {
    const situacao = normalizar(item.situacao);
    return situacao === "realizado" || situacao === "transferido";
  });

  const valorAprovado = base.reduce((acc: number, item: any) => {
    return acc + valorItem(item);
  }, 0);

  const valorConcluido = itensConcluidos.reduce((acc: number, item: any) => {
    return acc + valorItem(item);
  }, 0);

  return (
    <Shell
      title="Dashboard"
      subtitle="Acompanhamento gerencial com amostra fictícia para apresentação"
    >
      <section className="demo-note">
        <strong>Modo apresentação:</strong> dados, filiais, responsáveis e valores
        foram reduzidos e anonimizados para preservar informações internas.
      </section>

      <section className="kpi-grid">
        <KpiCard label="Valor aprovado demo" value={brl(valorAprovado)} variant="blue" />

        <KpiCard
          label="Itens em orçamento"
          value={String(itensEmOrcamento.length)}
          variant="green"
        />

        <KpiCard
          label="Progresso médio"
          value={`${progressoMedio}%`}
          variant="purple"
          progress={progressoMedio}
        />

        <KpiCard label="Valor concluído" value={brl(valorConcluido)} variant="orange" />
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <h2>Central de Investimentos Demo</h2>

          <p>
            Amostra reduzida para demonstrar o fluxo de solicitação, aprovação,
            orçamento e acompanhamento gerencial, sem expor dados reais.
          </p>

          <p>
            Exibindo {amostraTabela.length} registros fictícios de uma base demo
            limitada a {base.length} itens.
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
                  <th>Status</th>
                  <th>%</th>
                </tr>
              </thead>

              <tbody>
                {amostraTabela.map((item: any, index: number) => (
                  <tr key={item.id ?? item.item_projeto_id ?? index}>
                    <td>{item.ano}</td>
                    <td>{item.semestre_sugerido ?? item.semestre}</td>
                    <td>{item.nome_filial ?? `Unidade ${String(index + 1).padStart(2, "0")}`}</td>
                    <td>{item.nome_projeto ?? "Projeto Demo"}</td>
                    <td>{item.item_nome ?? item.item_projeto ?? "Item demonstrativo"}</td>
                    <td>{brl(valorItem(item))}</td>
                    <td>
                      <span className={`status ${item.situacao ?? ""}`}>
                        {nomeSituacao(item.situacao)}
                      </span>
                    </td>
                    <td>{percentualSituacao(item.situacao)}%</td>
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
          <h2>Resumo da amostra</h2>

          <div className="status-list">
            {situacoes.map((situacao) => (
              <div key={situacao.value}>
                <span>{situacao.label}</span>

                <strong>
                  {base.filter((i: any) => normalizar(i.situacao) === situacao.value).length}
                </strong>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: 28 }}>Resumo geral</h2>

          <div className="status-list">
            <div>
              <span>Total da amostra</span>
              <strong>{base.length}</strong>
            </div>

            <div>
              <span>Em orçamento</span>
              <strong>{itensEmOrcamento.length}</strong>
            </div>

            <div>
              <span>Concluídos</span>
              <strong>{itensConcluidos.length}</strong>
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
