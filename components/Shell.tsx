"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Building2,
  CheckSquare,
  ClipboardList,
  FileBarChart,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  Store,
  Target,
  Users,
  X
} from "lucide-react";

const operacional = [
  ["/dashboard", LayoutDashboard, "Dashboard"],
  ["/solicitacoes", ClipboardList, "Solicitações"],
  ["/diretor", CheckSquare, "Aprovação Diretoria"],
  ["/patrimonio", Building2, "Patrimônio"],
  ["/orcamento", FolderKanban, "Projetos e Orçamento"],
  ["/execucao", Settings, "Execução e SAP"],
  ["/relatorios", BarChart3, "Relatórios"]
] as const;

const cadastros = [
  ["/cadastros", FileBarChart, "Visão geral"],
  ["/cadastros/usuarios", Users, "Usuários"],
  ["/cadastros/filiais", Store, "Filiais"],
  ["/cadastros/diretorias", Target, "Diretorias"],
  ["/cadastros/catalogo", Package, "Catálogo de investimentos"]
] as const;

export function Shell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const router = useRouter();

async function sair() {
  if (supabase) {
    await supabase.auth.signOut();
  }

  document.cookie =
    "investflow-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

  router.push("/login");
  router.refresh();
}

  useEffect(() => {
    const saved = localStorage.getItem("investflow-sidebar-open");
    setOpen(saved === "true");
  }, []);

  function toggleSidebar() {
    const next = !open;
    setOpen(next);
    localStorage.setItem("investflow-sidebar-open", String(next));
  }

  return (
    <div className={open ? "shell" : "shell shell-collapsed"}>
      <aside className="sidebar">
        <div className="sidebar-head">
          {open && (
            <Link href="/" className="brand side-brand">
              <div className="logo">↗</div>

              <div>
                <strong>InvestFlow</strong>
                <span>Gestão de Investimentos</span>
              </div>
            </Link>
          )}

          <button
            type="button"
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={open ? "Recolher menu" : "Abrir menu"}
          >
            <Menu size={20} />
          </button>
        </div>

        {open && <p className="side-title">Fluxo operacional</p>}

        <nav className="nav-list">
          {operacional.map(([href, Icon, label]) => (
            <Link href={href} key={href} className="nav-link" title={label}>
              <Icon size={20} />
              {open && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {open && <p className="side-title cad">Cadastros</p>}

        <nav className="nav-list">
          {cadastros.map(([href, Icon, label]) => (
            <Link href={href} key={href} className="nav-link" title={label}>
              <Icon size={20} />
              {open && <span>{label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="user-pill">
  <div className="avatar">A</div>

  <div className="user-info">
    <strong>Admin Modelo</strong>
    <span>Perfil administrador</span>
  </div>

  <button className="logout-button" onClick={sair}>
  Sair
</button>
</div>
        </header>

        {children}
      </main>
    </div>
  );
  
}

