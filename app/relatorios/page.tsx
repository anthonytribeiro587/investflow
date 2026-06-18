import { Shell } from "@/components/Shell";

const porDiretor = [["Diretor A", "2", "R$ 165.000", "R$ 120.000"], ["Diretor B", "2", "R$ 195.000", "R$ 0"], ["Diretor C", "1", "R$ 280.000", "R$ 0"]];
const porSituacao = [["Realizado", "1", "R$ 120.000", "R$ 120.000"], ["Comprado", "1", "R$ 160.000", "R$ 0"], ["Em orçamento", "1", "R$ 45.000", "R$ 0"], ["Em obra", "1", "R$ 280.000", "R$ 0"], ["Transferido", "1", "R$ 35.000", "R$ 0"]];

function SimpleReport({ title, rows }: { title: string; rows: string[][] }) { return <section className="panel"><h2>{title}</h2><table><thead><tr><th>Descrição</th><th>Itens</th><th>Investimento</th><th>Realizado</th></tr></thead><tbody>{rows.map(row => <tr key={row.join()}>{row.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></section>; }

export default function Relatorios() {
  return <Shell title="Relatórios" subtitle="Consultas consolidadas por diretor, filial, projeto, situação e SAP."><div className="two-col"><SimpleReport title="Por diretor" rows={porDiretor} /><SimpleReport title="Por situação" rows={porSituacao} /></div></Shell>;
}
