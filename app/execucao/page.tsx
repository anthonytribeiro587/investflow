import { Shell } from "@/components/Shell";

export default function Execucao() {
  return (
    <Shell
      title="Evolução futura"
      subtitle="Módulo previsto para etapas posteriores, sem promessa de integração neste MVP."
    >
      <section className="panel">
        <div className="panel-top">
          <div>
            <h2>Pós-aprovação e integrações</h2>
            <p>
              Esta área fica como possibilidade futura. Para a apresentação, o
              escopo principal termina em solicitação, aprovação, projeto,
              orçamento e acompanhamento gerencial.
            </p>
          </div>
        </div>

        <div className="roadmap-grid">
          <div>
            <strong>Fase 1</strong>
            <span>Fluxo CAPEX e aprovações</span>
          </div>

          <div>
            <strong>Fase 2</strong>
            <span>Orçamentos, histórico e relatórios</span>
          </div>

          <div>
            <strong>Fase futura</strong>
            <span>Execução, integração ERP/SAP ou lançamentos externos</span>
          </div>
        </div>
      </section>
    </Shell>
  );
}
