import { RequestTable } from "@/components/RequestTable";
import { Shell } from "@/components/Shell";

export default function Patrimonio() {
  return <Shell title="Patrimônio" subtitle="Validação simples: aprovado investimento ou recusado investimento."><div className="two-col"><section className="panel"><h2>Pendentes de validação</h2><RequestTable /></section><section className="panel"><h2>Parecer patrimonial</h2><p>A etapa de patrimônio funciona como um gate antes do orçamento.</p><label>Solicitação<input value="#154 Forno turbo - Filial 01" readOnly /></label><div className="form-grid"><label>Decisão<select><option>Aprovado investimento</option><option>Recusado investimento</option></select></label><label>Motivo de recusa<select><option>Não aplicável</option><option>Não é investimento</option><option>É manutenção</option><option>Deve seguir outro fluxo</option></select></label></div><label>Observação<textarea defaultValue="Aprovado para orçamento/compras avaliar valores e projeto." /></label><button className="action-button">Aprovar investimento</button></section></div></Shell>;
}
