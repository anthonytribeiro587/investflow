import Link from "next/link";

const operacional = [
  ["/dashboard", "▦", "Dashboard"],
  ["/solicitacoes", "▣", "Solicitações"],
  ["/diretor", "⌁", "Aprovação Diretoria"],
  ["/patrimonio", "▱", "Patrimônio"],
  ["/orcamento", "▰", "Projetos e Orçamento"],
  ["/execucao", "▤", "Execução e SAP"],
  ["/relatorios", "▥", "Relatórios"]
];

const cadastros = [
  ["/cadastros", "⌂", "Visão geral"],
  ["/cadastros/usuarios", "☷", "Usuários"],
  ["/cadastros/filiais", "▧", "Filiais"],
  ["/cadastros/diretorias", "⌁", "Diretorias"],
  ["/cadastros/catalogo", "⚙", "Catálogo de investimentos"]
];

export function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/" className="brand side-brand">
          <div className="logo">↗</div>
          <div><strong>InvestFlow</strong><span>Gestão de Investimentos</span></div>
        </Link>
        <p className="side-title">Fluxo operacional</p>
        <nav className="nav-list">
          {operacional.map(([href, icon, label]) => <Link href={href} key={href} className="nav-link"><span>{icon}</span>{label}</Link>)}
        </nav>
        <p className="side-title cad">Cadastros</p>
        <nav className="nav-list">
          {cadastros.map(([href, icon, label]) => <Link href={href} key={href} className="nav-link"><span>{icon}</span>{label}</Link>)}
        </nav>
      </aside>
      <main className="content">
        <header className="topbar">
          <div><h1>{title}</h1><p>{subtitle}</p></div>
          <div className="user-pill"><div className="avatar">A</div><div><strong>Admin Modelo</strong><span>Perfil administrador</span></div></div>
        </header>
        {children}
      </main>
    </div>
  );
}
