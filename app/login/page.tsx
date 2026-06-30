"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getProfileForAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

function cookieOptions() {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  return `path=/; max-age=28800; SameSite=Lax${secure}`;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@investflowdemo.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function gravarSessao(params: {
    nome: string;
    perfil: string;
    email: string;
    filial_id?: string | null;
    diretoria_id?: string | null;
    diretoria_nome?: string | null;
  }) {
    const options = cookieOptions();
    document.cookie = `investflow-auth=true; ${options}`;
    document.cookie = `investflow-role=${params.perfil}; ${options}`;
    document.cookie = `investflow-user-name=${encodeURIComponent(params.nome)}; ${options}`;
    document.cookie = `investflow-user-email=${encodeURIComponent(params.email)}; ${options}`;
    document.cookie = `investflow-filial-id=${encodeURIComponent(params.filial_id ?? "")}; ${options}`;
    document.cookie = `investflow-diretoria-id=${encodeURIComponent(params.diretoria_id ?? "")}; ${options}`;
    document.cookie = `investflow-diretoria-nome=${encodeURIComponent(params.diretoria_nome ?? "")}; ${options}`;
  }

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado || !password) {
      setErro("Informe e-mail e senha para entrar.");
      return;
    }

    if (!supabase) {
      setErro("Supabase não configurado. Confira as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailNormalizado,
        password,
      });

      if (error || !data.user) {
        setErro("E-mail ou senha inválidos.");
        return;
      }

      const perfil = await getProfileForAuthUser(supabase, data.user);

      if (!perfil) {
        await supabase.auth.signOut();
        setErro("Usuário autenticado, mas sem perfil ativo no cadastro do InvestFlow.");
        return;
      }

      gravarSessao({
        nome: perfil.nome,
        perfil: perfil.perfil,
        email: perfil.email,
        filial_id: perfil.filial_id,
        diretoria_id: perfil.diretoria_id,
        diretoria_nome: perfil.diretoria_nome,
      });
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand">
          <div className="logo">↗</div>

          <div>
            <strong>InvestFlow</strong>
            <span>Gestão de Investimentos</span>
          </div>
        </div>

        <h1>Acesso ao InvestFlow</h1>
        <p>
          Entre com o usuário cadastrado no Supabase Auth. Cada conta carrega apenas o fluxo permitido para o perfil.
        </p>

        <form onSubmit={entrar} className="login-form">
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha do Supabase Auth"
              autoComplete="current-password"
            />
          </label>

          {erro && <p className="error-text">{erro}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar no sistema"}
          </button>
        </form>
      </section>
    </main>
  );
}
