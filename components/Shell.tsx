"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { canAccessPath, getProfileForAuthUser, normalizeRole, roleLabel, type UserRole } from "@/lib/auth";
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
  ["/execucao", FileBarChart, "Realizações"],
  ["/relatorios", BarChart3, "Relatórios"],
] as const;

const cadastros = [
  ["/cadastros", FileBarChart, "Visão geral"],
  ["/cadastros/usuarios", Users, "Usuários"],
  ["/cadastros/filiais", Store, "Filiais"],
  ["/cadastros/diretorias", Target, "Diretorias"],
  ["/cadastros/catalogo", Package, "Catálogo de investimentos"],
] as const;

function lerCookie(nome: string) {
  if (typeof document === "undefined") return "";
  return document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${nome}=`))
    ?.split("=")
    .slice(1)
    .join("=") ?? "";
}

function decodificarCookie(valor: string) {
  try {
    return decodeURIComponent(valor);
  } catch {
    return valor;
  }
}

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
  const [perfil, setPerfil] = useState<UserRole>("solicitante");
  const [nomeUsuario, setNomeUsuario] = useState("Usuário");

  useEffect(() => {
    let ativo = true;

    async function validarSessao() {
      if (!supabase) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push("/login");
        return;
      }

      const perfilAutenticado = await getProfileForAuthUser(supabase, data.user);

      if (!ativo) return;

      if (!perfilAutenticado) {
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      setPerfil(perfilAutenticado.perfil);
      setNomeUsuario(perfilAutenticado.nome);

      const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
      const options = `path=/; max-age=28800; SameSite=Lax${secure}`;
      document.cookie = `investflow-auth=true; ${options}`;
      document.cookie = `investflow-role=${perfilAutenticado.perfil}; ${options}`;
      document.cookie = `investflow-user-name=${encodeURIComponent(perfilAutenticado.nome)}; ${options}`;
      document.cookie = `investflow-user-email=${encodeURIComponent(perfilAutenticado.email)}; ${options}`;
      document.cookie = `investflow-filial-id=${encodeURIComponent(perfilAutenticado.filial_id ?? "")}; ${options}`;
      document.cookie = `investflow-diretoria-id=${encodeURIComponent(perfilAutenticado.diretoria_id ?? "")}; ${options}`;
      document.cookie = `investflow-diretoria-nome=${encodeURIComponent(perfilAutenticado.diretoria_nome ?? "")}; ${options}`;

      if (!canAccessPath(perfilAutenticado.perfil, pathname)) {
        router.push("/dashboard");
      }
    }

    const roleCookie = lerCookie("investflow-role");
    const nameCookie = lerCookie("investflow-user-name");
    if (roleCookie) setPerfil(normalizeRole(roleCookie));
    if (nameCookie) setNomeUsuario(decodificarCookie(nameCookie));

    validarSessao();

    return () => {
      ativo = false;
    };
  }, [pathname, router]);

  const linksOperacionais = useMemo(() => {
    return operacional.filter(([href]) => canAccessPath(perfil, href));
  }, [perfil]);

  const linksCadastros = useMemo(() => {
    if (perfil !== "admin") return [];
    return cadastros;
  }, [perfil]);

  async function sair() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
    const expirado = `path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secure}`;
    document.cookie = `investflow-auth=; ${expirado}`;
    document.cookie = `investflow-role=; ${expirado}`;
    document.cookie = `investflow-user-name=; ${expirado}`;
    document.cookie = `investflow-user-email=; ${expirado}`;
    document.cookie = `investflow-filial-id=; ${expirado}`;
    document.cookie = `investflow-diretoria-id=; ${expirado}`;
    document.cookie = `investflow-diretoria-nome=; ${expirado}`;

    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/dashboard" || href === "/cadastros") return pathname === href;
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
          {linksOperacionais.map(([href, Icon, label]) => (
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

        {linksCadastros.length > 0 && (
          <>
            <p className="side-title cad">Cadastros</p>

            <nav className="nav-list">
              {linksCadastros.map(([href, Icon, label]) => (
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
          </>
        )}
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
              <div className="avatar">{nomeUsuario.charAt(0).toUpperCase()}</div>

              <div className="user-info">
                <strong>{nomeUsuario}</strong>
                <span>Perfil {roleLabel(perfil).toLowerCase()}</span>
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
