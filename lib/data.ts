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
  { codigo: "001", filial: "Filial 01", area: "Área A", diretor: "Diretor A", gerente: "Gerente Loja 01", cidade: "Cidade Modelo" },
  { codigo: "002", filial: "Filial 02", area: "Área B", diretor: "Diretor B", gerente: "Gerente Loja 02", cidade: "Cidade Modelo" },
  { codigo: "003", filial: "Filial 03", area: "Área A", diretor: "Diretor A", gerente: "Gerente Loja 03", cidade: "Cidade Modelo" }
];

export const diretorias = [
  { area: "Área A", diretor: "Diretor A", filiais: 2, status: "Ativa" },
  { area: "Área B", diretor: "Diretor B", filiais: 1, status: "Ativa" },
  { area: "Área C", diretor: "Diretor C", filiais: 1, status: "Ativa" }
];

export const catalog = {
  setores: ["Padaria", "Açougue", "Refrigeração", "Área Externa", "Reforma", "Logística", "Segurança"],
  projetos: ["Equipamentos Padaria", "Equipamentos Açougue", "Refrigeração 2026", "Reforma Loja", "Área Externa 2026", "Logística"],
  itens: ["Forno turbo", "Expositor refrigerado", "Serra fita", "Piso operacional", "Calçada", "Empilhadeira"]
};

export function brl(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

export function totals() {
  const total = investments.reduce((sum, item) => sum + item.total, 0);
  const realizado = investments.reduce((sum, item) => sum + item.realizado, 0);
  return { total, realizado, saldo: total - realizado, execucao: total ? Math.round((realizado / total) * 100) : 0 };
}
