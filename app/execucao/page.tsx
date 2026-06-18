import { InvestmentTable } from "@/components/InvestmentTable";
import { Shell } from "@/components/Shell";

export default function Execucao() {
  return <Shell title="Execução e SAP" subtitle="Acompanhamento após aprovação externa do conselho e lançamento pela controladoria."><section className="panel"><div className="panel-top"><div><h2>Situações de execução</h2><p>Comprado não conta como realizado. Realizado só quando entregue, obra concluída ou serviço finalizado.</p></div><button className="action-button">Marcar realizado</button></div><div className="form-grid compact"><label>Código SAP<input placeholder="Projeto SAP" /></label><label>Pedido SAP<input placeholder="Pedido/OC" /></label><label>Valor realizado<input placeholder="R$ 0,00" /></label><label>Data realização<input type="date" /></label></div><InvestmentTable /></section></Shell>;
}
