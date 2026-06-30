export type Status = "Em orçamento" | "Comprado" | "Em obra" | "Realizado" | "Cancelado" | "Transferido";
export type Priority = "Baixa" | "Média" | "Alta" | "Crítica";

export const investments = [
  { ano: 2026, semestre: "1º Semestre", filial: "Filial 01", diretor: "Diretor A", setor: "Padaria", projeto: "Equipamentos Padaria", item: "Forno turbo", quantidade: 1, valorUnitario: 120000, total: 120000, realizado: 120000, fornecedor: "Fornecedor Modelo A", situacao: "Realizado" as Status, sap: "SAP-001", pedido: "450001" },
  { ano: 2026, semestre: "1º Semestre", filial: "Filial 02", diretor: "Diretor B", setor: "Refrigeração", projeto: "Refrigeração 2026", item: "Expositor refrigerado", quantidade: 2, valorUnitario: 80000, total: 160000, realizado: 0, fornecedor: "Fornecedor Modelo B", situacao: "Comprado" as Status, sap: "", pedido: "" },
  { ano: 2026, semestre: "2º Semestre", filial: "Filial 03", diretor: "Diretor A", setor: "Açougue", projeto: "Equipamentos Açougue", item: "Serra fita", quantidade: 1, valorUnitario: 45000, total: 45000, realizado: 0, fornecedor: "Em cotação", situacao: "Em orçamento" as Status, sap: "", pedido: "" },
  { ano: 2026, semestre: "2º Semestre", filial: "Filial 04", diretor: "Diretor C", setor: "Reforma", projeto: "Reforma Loja 04", item: "Piso operacional", quantidade: 1, valorUnitario: 280000, total: 280000, realizado: 0, fornecedor: "Obra Modelo", situacao: "Em obra" as Status, sap: "", pedido: "" },
  { ano: 2026, semestre: "1º Semestre", filial: "Filial 05", diretor: "Diretor B", setor: "Área Externa", projeto: "Área Externa 2026", item: "Calçada", quantidade: 1, valorUnitario: 35000, total: 35000, realizado: 0, fornecedor: "-", situacao: "Transferido" as Status, sap: "", pedido: "" }
];

export const requests = [
  { id: "#154", tipo: "Planejamento anual", filial: "Filial 01", diretor: "Diretor A", setor: "Padaria", item: "Forno turbo", prioridade: "Alta" as Priority, semestre: "1º Semestre", status: "Aprovada diretoria", obs: "Enviar fotos do equipamento atual.", descricao: "Equipamento atual com falhas e impacto na produção." },
  { id: "#153", tipo: "Planejamento anual", filial: "Filial 02", diretor: "Diretor B", setor: "Refrigeração", item: "Expositor refrigerado", prioridade: "Crítica" as Priority, semestre: "1º Semestre", status: "Aprovado investimento", obs: "Validar se entra em compra conjunta.", descricao: "Risco de perda operacional no setor." },
  { id: "#152", tipo: "Extraordinária", filial: "Filial 03", diretor: "Diretor A", setor: "Açougue", item: "Serra fita", prioridade: "Média" as Priority, semestre: "2º Semestre", status: "Em orçamento", obs: "Demanda aberta fora do ciclo anual.", descricao: "Substituição por desgaste do equipamento." },
  { id: "#151", tipo: "Planejamento anual", filial: "Filial 04", diretor: "Diretor C", setor: "Área Externa", item: "Pintura de fachada", prioridade: "Baixa" as Priority, semestre: "Não definido", status: "Ajuste solicitado", obs: "Diretoria solicitou revisão.", descricao: "Melhoria visual e padronização da unidade." }
];

export const filiais = [
  { codigo: "U001", filial: "Unidade 01 — Centro", area: "Diretoria Operacional", diretor: "Diretor Operacional", gerente: "Solicitante Loja 01", cidade: "Metropolitana" },
  { codigo: "U002", filial: "Unidade 02 — Norte", area: "Diretoria Operacional", diretor: "Diretor Operacional", gerente: "Solicitante Loja 02", cidade: "Metropolitana" },
  { codigo: "U003", filial: "Unidade 03 — Sul", area: "Diretoria Expansão", diretor: "Diretor Expansão", gerente: "Solicitante Loja 03", cidade: "Metropolitana" },
  { codigo: "U004", filial: "Unidade 04 — Vale", area: "Diretoria Expansão", diretor: "Diretor Expansão", gerente: "Solicitante Loja 04", cidade: "Interior" },
  { codigo: "U005", filial: "Unidade 05 — Litoral", area: "Diretoria Administrativa", diretor: "Diretor Administrativo", gerente: "Solicitante Loja 05", cidade: "Litoral" },
  { codigo: "U006", filial: "Unidade 06 — Serra", area: "Diretoria Administrativa", diretor: "Diretor Administrativo", gerente: "Solicitante Loja 06", cidade: "Interior" },
  { codigo: "U007", filial: "Unidade 07 — Industrial", area: "Diretoria Financeira", diretor: "Diretor Financeiro", gerente: "Solicitante Loja 07", cidade: "Metropolitana" },
  { codigo: "U008", filial: "Unidade 08 — Comercial", area: "Diretoria Financeira", diretor: "Diretor Financeiro", gerente: "Solicitante Loja 08", cidade: "Interior" }
];

export const diretorias = [
  { area: "Diretoria Operacional", diretor: "Diretor Operacional", filiais: 2, status: "Ativa" },
  { area: "Diretoria Expansão", diretor: "Diretor Expansão", filiais: 2, status: "Ativa" },
  { area: "Diretoria Administrativa", diretor: "Diretor Administrativo", filiais: 2, status: "Ativa" },
  { area: "Diretoria Financeira", diretor: "Diretor Financeiro", filiais: 2, status: "Ativa" }
];

export const catalog = {
  setores: ["Obras e Reformas", "Manutenção Predial", "Tecnologia e Sistemas", "Segurança Patrimonial", "Climatização", "Operações"],
  projetos: ["Projeto 001 - Reforma de Loja", "Projeto 002 - Tecnologia e Sistemas", "Projeto 003 - Segurança Patrimonial", "Projeto 004 - Eficiência Energética", "Projeto 005 - Infraestrutura Predial", "Projeto 006 - Padronização Visual", "Projeto 007 - Climatização", "Projeto 008 - Expansão Comercial"],
  itens: ["Reforma de fachada", "Troca de piso", "Adequação de layout", "Manutenção predial", "Porta automática", "Rede lógica", "Nobreak", "Equipamento de atendimento", "Instalação de câmeras", "Sistema de alarme", "Climatização administrativa", "Expositor refrigerado", "Mobiliário operacional", "Comunicação visual", "Bancada de atendimento", "Adequação elétrica"]
};

export function brl(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

export function totals() {
  const total = investments.reduce((sum, item) => sum + item.total, 0);
  const realizado = investments.reduce((sum, item) => sum + item.realizado, 0);
  return { total, realizado, saldo: total - realizado, execucao: total ? Math.round((realizado / total) * 100) : 0 };
}
