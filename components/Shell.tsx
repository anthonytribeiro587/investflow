"use client";

import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  BarChart3,
  Building2,
  CheckSquare,
  ClipboardList,
  FileBarChart,
  FolderKanban,
  LayoutDashboard,
  Package,
  Store,
  Target,
  Users,
} from "lucide-react";

const operacional = [
  ["/dashboard", LayoutDashboard, "Dashboard"],
  ["/solicitacoes", ClipboardList, "Solicitações"],
  ["/diretor", CheckSquare, "Aprovação Diretoria"],
  ["/patrimonio", Building2, "Patrimônio"],
  ["/projetos", FolderKanban, "Projetos"],
  ["/orcamentos", FileBarChart, "Orçamentos/Cotações"],
  ["/execucao", FileBarChart, "Evolução futura"],
  ["/relatorios", BarChart3, "Relatórios"],
] as const;

const cadastros = [
  ["/cadastros", FileBarChart, "Visão geral"],
  ["/cadastros/usuarios", Users, "Usuários"],
  ["/cadastros/filiais", Store, "Filiais"],
  ["/cadastros/diretorias", Target, "Diretorias"],
  ["/cadastros/catalogo", Package, "Catálogo de investimentos"],
] as const;

export function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function sair() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    document.cookie =
      "investflow-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";

    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="shell">
      <aside className="sidebar sidebar-fixed">
        <div className="sidebar-head">
          <Link href="/dashboard" className="brand side-brand">
            <div className="logo">↗</div>

            <div>
              <strong>InvestFlow</strong>
              <span>Gestão de Investimentos</span>
            </div>
          </Link>
        </div>

        <p className="side-title">Fluxo operacional</p>

        <nav className="nav-list">
          {operacional.map(([href, Icon, label]) => (
            <Link
              href={href}
              key={href}
              className={isActive(href) ? "nav-link active" : "nav-link"}
              title={label}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <p className="side-title cad">Cadastros</p>

        <nav className="nav-list">
          {cadastros.map(([href, Icon, label]) => (
            <Link
              href={href}
              key={href}
              className={isActive(href) ? "nav-link active" : "nav-link"}
              title={label}
            >
              <Icon size={20} />
              <span>{label}</span>
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

          <div className="topbar-actions">
            <span className="demo-badge">Ambiente demo</span>

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
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
