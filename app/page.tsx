import Link from "next/link";

export default function Home() {
  return (
    <main className="landing">
      <section className="landing-left">
        <div className="brand">
          <div className="logo">↗</div>

          <div>
            <strong>InvestFlow</strong>
            <span>Portal de gestão de investimentos</span>
          </div>
        </div>

        <div className="hero">
          <h1>
            Transforme solicitações de investimento em um fluxo claro,
            rastreável e estratégico.
          </h1>

          <p>
            Planejamento anual, priorização por diretoria, validação
            patrimonial, orçamento, aprovação final e acompanhamento
            gerencial.
          </p>

          <Link href="/login" className="primary-button">
            Entrar no sistema →
          </Link>
        </div>
      </section>

      <section className="landing-right">
        <div className="feature-card">
          <span>⌁</span>

          <div>
            <strong>Workflow multinível</strong>

            <p>
              Loja, diretoria, patrimônio, projetos e orçamento.
            </p>
          </div>
        </div>

        <div className="feature-card">
          <span>▣</span>

          <div>
            <strong>Governança</strong>

            <p>
              Histórico e rastreabilidade para decisões corporativas.
            </p>
          </div>
        </div>

        <div className="feature-card">
          <span>▥</span>

          <div>
            <strong>Visão executiva</strong>

            <p>
              Dashboards por status, diretoria, filial, semestre e valor.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}