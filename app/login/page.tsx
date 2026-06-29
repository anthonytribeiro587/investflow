"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@investflowdemo.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!supabase) {
      setErro("Supabase não configurado.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    document.cookie = "investflow-auth=true; path=/; max-age=28800; SameSite=Lax; Secure";

    router.push("/dashboard");
    router.refresh();
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

        <h1>Login administrativo</h1>
        <p>Ambiente demonstrativo com dados fictícios. Não utilize dados reais nesta versão.</p>

        <form onSubmit={entrar} className="login-form">
          <label>
            E-mail
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {erro && <p className="error-text">{erro}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}