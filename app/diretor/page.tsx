import { RequestTable } from "@/components/RequestTable";
import { Shell } from "@/components/Shell";

export default function Diretor() {
  return <Shell title="Aprovação Diretoria" subtitle="Grade estilo Excel para aprovar, rejeitar, pedir ajuste, alterar prioridade e definir semestre."><section className="panel"><div className="panel-top"><div><h2>Solicitações da área</h2><p>O diretor visualiza apenas as filiais vinculadas à sua área/diretoria.</p></div><button className="action-button">Aprovar selecionadas</button></div><RequestTable /></section></Shell>;
}
