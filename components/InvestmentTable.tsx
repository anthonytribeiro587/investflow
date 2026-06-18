import { brl, investments } from "@/lib/data";
import { StatusBadge } from "./StatusBadge";

export function InvestmentTable() {
  return <div className="table-wrap"><table><thead><tr><th>Ano</th><th>Semestre</th><th>Filial</th><th>Diretor</th><th>Setor</th><th>Projeto</th><th>Item</th><th>Qtd.</th><th>Valor Unit.</th><th>Total Invest.</th><th>Realizado</th><th>Fornecedor</th><th>Situação</th></tr></thead><tbody>{investments.map((item) => <tr key={`${item.filial}-${item.item}`}><td>{item.ano}</td><td>{item.semestre}</td><td>{item.filial}</td><td>{item.diretor}</td><td>{item.setor}</td><td><strong>{item.projeto}</strong></td><td>{item.item}</td><td>{item.quantidade}</td><td>{brl(item.valorUnitario)}</td><td>{brl(item.total)}</td><td>{brl(item.realizado)}</td><td>{item.fornecedor}</td><td><StatusBadge value={item.situacao} /></td></tr>)}</tbody></table></div>;
}
