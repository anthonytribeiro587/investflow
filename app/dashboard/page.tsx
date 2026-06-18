import { InvestmentTable } from "@/components/InvestmentTable";
import { KpiCard } from "@/components/KpiCard";
import { Shell } from "@/components/Shell";
import { brl, investments, totals } from "@/lib/data";

export default function Dashboard() {
  const t = totals();
  const statuses = ["Em orçamento", "Comprado", "Em obra", "Realizado", "Transferido"];
  return <Shell title="Dashboard" subtitle="Acompanhamento pós-aprovação do plano de investimentos"><section className="kpi-grid"><KpiCard label="Valor total investimento" value={brl(t.total)} variant="blue" /><KpiCard label="Valor realizado" value={brl(t.realizado)} variant="green" /><KpiCard label="Saldo" value={brl(t.saldo)} variant="orange" /><KpiCard label="Execução" value={`${t.execucao}%`} variant="purple" /></section><div className="dashboard-grid"><section className="panel"><h2>Central de Investimentos</h2><p>Visão por item. O projeto agrupa, mas cada item tem execução própria.</p><InvestmentTable /></section><aside className="panel"><h2>Resumo por situação</h2><div className="status-list">{statuses.map(status => <div key={status}><span>{status}</span><strong>{investments.filter(i => i.situacao === status).length}</strong></div>)}</div></aside></div></Shell>;
}
