import { KpiCard } from "@/components/KpiCard";
import { Shell } from "@/components/Shell";
import { brl } from "@/lib/data";
import { supabase } from "@/lib/supabase";

const VALOR_APROVADO = 21838699.7;

const situacoes = [
  { label: "Em orçamento", value: "em_orcamento" },
  { label: "Comprado", value: "comprado" },
  { label: "Em obra", value: "em_obra" },
  { label: "Realizado", value: "realizado" },
  { label: "Transferido", value: "transferido" },
];

function normalizar(valor: unknown) {
  return String(valor ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll(" ", "_");
}

function nomeSituacao(valor: unknown) {
  const normalizado = normalizar(valor);

  const mapa: Record<string, string> = {
    em_orcamento: "Em orçamento",
    comprado: "Comprado",
    em_obra: "Em obra",
    realizado: "Realizado",
    transferido: "Transferido",
  };

  return mapa[normalizado] ?? "-";
}

function percentualSituacao(valor: unknown) {
  const normalizado = normalizar(valor);

  const mapa: Record<string, number> = {
    em_orcamento: 50,
    comprado: 75,
    em_obra: 90,
    realizado: 100,
    transferido: 100,
  };

  return mapa[normalizado] ?? 0;
}

export default async function Dashboard() {
  if (!supabase) {
    return (
      <Shell
        title="Dashboard"
        subtitle="Acompanhamento da execução dos investimentos aprovados"
      >
        <section className="panel">
          <h2>Supabase não configurado</h2>
          <p>Verifique as variáveis de ambiente do projeto.</p>
        </section>
      </Shell>
    );
  }

  const { data: central } = await supabase
    .from("vw_central_investimentos")
    .select("*");

  const base = central ?? [];

  const itensEmOrcamento = base.filter(
    (item: any) => normalizar(item.situacao) === "em_orcamento"
  );

  const progressoMedio =
    base.length > 0
      ? Math.round(
          base.reduce((acc: number, item: any) => {
            return acc + percentualSituacao(item.situacao);
          }, 0) / base.length
        )
      : 0;

  const itensConcluidos = base.filter((item: any) => {
    const situacao = normalizar(item.situacao);
    return situacao === "realizado" || situacao === "transferido";
  });

  const valorConcluido = itensConcluidos.reduce((acc: number, item: any) => {
    return acc + Number(item.valor_orcado ?? item.valor_total_investimento ?? 0);
  }, 0);

  const amostraTabela = base.slice(0, 50);

  return (
    <Shell
      title="Dashboard"
      subtitle="Acompanhamento da execução dos investimentos aprovados"
    >
      <section className="kpi-grid">
        <KpiCard
          label="Valor aprovado"
          value={brl(VALOR_APROVADO)}
          variant="blue"
        />

        <KpiCard
          label="Itens em orçamento"
          value={String(itensEmOrcamento.length)}
          variant="green"
        />

        <KpiCard
          label="Progresso execução"
          value={`${progressoMedio}%`}
          variant="purple"
          progress={progressoMedio}
        />

        <KpiCard
          label="Valor concluído"
          value={brl(valorConcluido)}
          variant="orange"
        />
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <h2>Central de Investimentos</h2>

          <p>
            Itens aprovados pela diretoria, usados como base para acompanhamento
            de orçamento, execução, SAP e realização.
          </p>

          <p>
            Exibindo os primeiros {amostraTabela.length} registros da view{" "}
            <strong>vw_central_investimentos</strong>.
          </p>

          <div className="table-scroll limited">
            <table>
              <thead>
                <tr>
                  <th>Ano</th>
                  <th>Semestre</th>
                  <th>Filial</th>
                  <th>Diretor</th>
                  <th>Setor</th>
                  <th>Projeto</th>
                  <th>Item</th>
                  <th>Qtd.</th>
                  <th>Valor aprovado</th>
                  <th>Execução</th>
                  <th>%</th>
                </tr>
              </thead>

              <tbody>
                {amostraTabela.map((item: any, index: number) => (
                  <tr key={item.id ?? item.item_projeto_id ?? index}>
                    <td>{item.ano}</td>
                    <td>{item.semestre_sugerido ?? item.semestre}</td>
                    <td>{item.nome_filial ?? "-"}</td>
                    <td>{item.diretor_responsavel ?? item.diretoria ?? "-"}</td>
                    <td>{item.setor ?? "-"}</td>
                    <td>{item.nome_projeto ?? "-"}</td>
                    <td>{item.item_nome ?? item.item_projeto ?? "-"}</td>
                    <td>{item.quantidade ?? 1}</td>
                    <td>
                      {brl(
                        Number(
                          item.valor_orcado ??
                            item.valor_total_investimento ??
                            0
                        )
                      )}
                    </td>
                    <td>
                      <span className={`status ${item.situacao ?? ""}`}>
                        {nomeSituacao(item.situacao)}
                      </span>
                    </td>
                    <td>{percentualSituacao(item.situacao)}%</td>
                  </tr>
                ))}

                {amostraTabela.length === 0 && (
                  <tr>
                    <td colSpan={11}>
                      Nenhum item encontrado na central de investimentos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="panel">
          <h2>Resumo da execução</h2>

          <div className="status-list">
            {situacoes.map((situacao) => (
              <div key={situacao.value}>
                <span>{situacao.label}</span>

                <strong>
                  {
                    base.filter(
                      (i: any) => normalizar(i.situacao) === situacao.value
                    ).length
                  }
                </strong>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: 28 }}>Resumo geral</h2>

          <div className="status-list">
            <div>
              <span>Total de itens</span>
              <strong>{base.length}</strong>
            </div>

            <div>
              <span>Itens em orçamento</span>
              <strong>{itensEmOrcamento.length}</strong>
            </div>

            <div>
              <span>Itens concluídos</span>
              <strong>{itensConcluidos.length}</strong>
            </div>

            <div>
              <span>Progresso médio</span>
              <strong>{progressoMedio}%</strong>
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}