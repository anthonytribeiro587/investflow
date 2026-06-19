import { KpiCard } from "@/components/KpiCard";
import { Shell } from "@/components/Shell";
import { brl } from "@/lib/data";
import { supabase } from "@/lib/supabase";

const statuses = [
  { label: "Em orçamento", value: "em_orcamento" },
  { label: "Comprado", value: "comprado" },
  { label: "Em obra", value: "em_obra" },
  { label: "Realizado", value: "realizado" },
  { label: "Transferido", value: "transferido" }
];

export default async function Dashboard() {
  const { data: filiais } = await supabase!
    .from("filiais")
    .select("id");

  const { data: central } = await supabase!
    .from("vw_central_investimentos")
    .select("*")
    .limit(50);

  const base = central ?? [];

  const total = base.reduce((acc: number, item: any) => {
    return acc + Number(item.valor_total_investimento ?? 0);
  }, 0);

  const realizado = base.reduce((acc: number, item: any) => {
    return acc + Number(item.valor_realizado ?? 0);
  }, 0);

  const saldo = total - realizado;
  const execucao = total > 0 ? Math.round((realizado / total) * 100) : 0;

  return (
    <Shell
      title="Dashboard"
      subtitle="Acompanhamento pós-aprovação do plano de investimentos"
    >
      <section className="kpi-grid">
        <KpiCard
          label="Filiais cadastradas"
          value={String(filiais?.length ?? 0)}
          variant="blue"
        />

        <KpiCard
          label="Valor realizado"
          value={brl(realizado)}
          variant="green"
        />

        <KpiCard label="Saldo" value={brl(saldo)} variant="orange" />

        <KpiCard
  label="Execução"
  value={`${execucao}%`}
  variant="purple"
  progress={execucao}
/>
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <h2>Central de Investimentos</h2>

          <p>
            Itens aprovados do plano de investimentos importado, usados como
            base para acompanhamento de orçamento, execução, SAP e realização.
          </p>

          <p>
            Exibindo os primeiros {base.length} registros da view{" "}
            <strong>vw_central_investimentos</strong>.
          </p>

          <div className="table-scroll limited">
            <table>
              <thead>
                <tr>
                  <th>Ano</th>
                  <th>Semestre</th>
                  <th>Filial</th>
                  <th>Diretor</th>
                  <th>Setor</th>
                  <th>Projeto</th>
                  <th>Item</th>
                  <th>Qtd.</th>
                  <th>Total Invest.</th>
                  <th>Realizado</th>
                  <th>Situação</th>
                </tr>
              </thead>

              <tbody>
                {base.map((item: any, index: number) => (
                  <tr key={item.id ?? item.item_projeto_id ?? index}>
                    <td>{item.ano}</td>
                    <td>{item.semestre_sugerido ?? item.semestre}</td>
                    <td>{item.nome_filial ?? "-"}</td>
                    <td>{item.diretor_responsavel ?? "-"}</td>
                    <td>{item.setor ?? "-"}</td>
                    <td>{item.nome_projeto ?? "-"}</td>
                    <td>{item.item_nome ?? item.item_projeto ?? "-"}</td>
                    <td>{item.quantidade ?? 1}</td>
                    <td>
                      {brl(Number(item.valor_total_investimento ?? 0))}
                    </td>
                    <td>{brl(Number(item.valor_realizado ?? 0))}</td>
                    <td>
                      <span className={`status ${item.situacao ?? ""}`}>
                        {String(item.situacao ?? "-").replaceAll("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}

                {base.length === 0 && (
                  <tr>
                    <td colSpan={11}>
                      Nenhum item aprovado encontrado na central de
                      investimentos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="panel">
          <h2>Resumo por situação</h2>

          <div className="status-list">
            {statuses.map((status) => (
              <div key={status.value}>
                <span>{status.label}</span>

                <strong>
                  {
                    base.filter(
                      (i: any) =>
                        String(i.situacao ?? "").toLowerCase() ===
                        status.value.toLowerCase()
                    ).length
                  }
                </strong>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </Shell>
  );
}