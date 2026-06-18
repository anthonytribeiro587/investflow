import { KpiCard } from "@/components/KpiCard";
import { Shell } from "@/components/Shell";

export default function Cadastros() {
  return <Shell title="Cadastros mestres" subtitle="Base de filiais, diretorias, setores, itens e projetos que alimenta o fluxo."><section className="kpi-grid"><KpiCard label="Usuários" value="5" /><KpiCard label="Filiais" value="3" variant="green" /><KpiCard label="Diretorias" value="3" variant="orange" /><KpiCard label="Itens catálogo" value="6" variant="purple" /></section><section className="panel"><h2>Regra de roteamento</h2><div className="flow-row"><span>Gerente</span><b>→</b><span>Filial</span><b>→</b><span>Área/Diretoria</span><b>→</b><span>Diretor responsável</span></div><p>Quando a filial cria uma solicitação, o sistema envia automaticamente para o diretor responsável pela área daquela filial.</p></section><section className="kpi-grid spaced"><KpiCard label="Setores" value="7" /><KpiCard label="Projetos padrão" value="6" variant="green" /><KpiCard label="Planos anuais" value="2" variant="orange" /><KpiCard label="Anexos permitidos" value="PDF/Imagem" variant="purple" /></section></Shell>;
}
