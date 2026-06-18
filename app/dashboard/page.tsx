import { KpiCard } from "@/components/KpiCard";
import { Shell } from "@/components/Shell";
import { brl, investments } from "@/lib/data";
import { supabase } from "@/lib/supabase";

const statuses = ["Em orçamento", "Comprado", "Em obra", "Realizado", "Transferido"];

export default async function Dashboard() {
  const { data: filiais } = await supabase!
    .from("filiais")
    .select("*");

  const { data: central } = await supabase!
    .from("vw_central_investimentos")
    .select("*")
    .limit(50);

  const base = central && central.length > 0 ? central : investments;

  const total = base.reduce((acc: number, item: any) => {
    return acc + Number(item.valor_total_investimento ?? item.total ?? 0);
  }, 0);

  const realizado = base.reduce((acc: number, item: any) => {
    return acc + Number(item.valor_realizado ?? item.realizado ?? 0);
  }, 0);

  const saldo = total - realizado;
  const execucao = total > 0 ? Math.round((realizado / total) * 100) : 0;

  return (
    <Shell title="Dashboard" subtitle="Acompanhamento pós-aprovação do plano de investimentos">
      <section className="kpi-grid">
        <KpiCard label="Filiais cadastradas" value={String(filiais?.length ?? 0)} variant="blue" />
        <KpiCard label="Valor realizado" value={brl(realizado)} variant="green" />
        <KpiCard label="Saldo" value={brl(saldo)} variant="orange" />
        <KpiCard label="Execução" value={`${execucao}%`} variant="purple" />
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <h2>Central de Investimentos</h2>
          <p>
            {central && central.length > 0
              ? "Dados reais da view vw_central_investimentos."
              : "Sem itens reais ainda; exibindo dados modelo enquanto itens_projeto está vazio."}
          </p>

          <div className="table-scroll">
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
                    <td>{item.nome_filial ?? item.filial}</td>
                    <td>{item.diretor_responsavel ?? item.diretor}</td>
                    <td>{item.setor}</td>
                    <td>{item.nome_projeto ?? item.projeto}</td>
                    <td>{item.item_nome ?? item.item_projeto ?? item.item}</td>
                    <td>{item.quantidade ?? item.qtd ?? 1}</td>
                    <td>{brl(Number(item.valor_total_investimento ?? item.total ?? 0))}</td>
                    <td>{brl(Number(item.valor_realizado ?? item.realizado ?? 0))}</td>
                    <td>{item.situacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="panel">
          <h2>Resumo por situação</h2>
          <div className="status-list">
            {statuses.map((status) => (
              <div key={status}>
                <span>{status}</span>
                <strong>
                  {
                    base.filter((i: any) =>
                      String(i.situacao ?? "").toLowerCase() === status.toLowerCase()
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