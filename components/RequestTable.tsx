import { requests } from "@/lib/data";
import { StatusBadge } from "./StatusBadge";

export function RequestTable() {
  return <div className="table-wrap"><table><thead><tr><th>ID</th><th>Tipo</th><th>Filial</th><th>Diretor</th><th>Setor</th><th>Item solicitado</th><th>Prioridade</th><th>Semestre</th><th>Status</th><th>Observação</th></tr></thead><tbody>{requests.map((item) => <tr key={item.id}><td>{item.id}</td><td>{item.tipo}</td><td>{item.filial}</td><td>{item.diretor}</td><td>{item.setor}</td><td><strong>{item.item}</strong><small>{item.descricao}</small></td><td>{item.prioridade}</td><td>{item.semestre}</td><td><StatusBadge value={item.status} /></td><td>{item.obs}</td></tr>)}</tbody></table></div>;
}
