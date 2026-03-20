"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasSupabasePublicConfig, supabase } from "@/lib/supabase";
import { PUBLIC_ASSETS } from "@/lib/public-assets";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285f4" />
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34a853" />
    <path d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.177 0 7.55 0 9s.347 2.823.957 4.038l3.007-2.332z" fill="#fbbc05" />
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.017.957 4.963l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#ea4335" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2-2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (document.cookie.includes("fluenverse_admin_auth=1")) {
      router.push("/admin/workspace");
    }
  }, [router]);

  const persistAdminSession = (name: string, role = "Admin") => {
    const maxAge = 60 * 60 * 24 * 30;
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    document.cookie = `fluenverse_admin_auth=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    document.cookie = `fluenverse_admin_user=${encodeURIComponent(name)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    document.cookie = `fluenverse_user_role=${encodeURIComponent(role)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    document.cookie = `fluenverse_user_initials=${encodeURIComponent(initials)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  };

  const handleGoogleLogin = async () => {
    setError("");
    if (!hasSupabasePublicConfig || !supabase) {
      setError("Login com Google indisponível no momento. Use e-mail e senha.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const normalizedIdentifier = identifier.trim().toLowerCase();
    const pass = password.trim();

    if (!normalizedIdentifier || !pass) {
      setError("Informe seu e-mail e senha.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: normalizedIdentifier, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao validar acesso.");

      if (data.role === "Admin") {
        persistAdminSession(data.name, data.role);
        router.push("/admin/chat-config");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="sk-auth-wrapper">
      <div className="sk-auth-shell">
        <Link href="/" className="sk-back-link">
          &lt;- Voltar para home
        </Link>

        <section className="sk-auth-container">
          <Link href="/" className="sk-logo-wrap">
            <img src={PUBLIC_ASSETS.logo} alt="Fluenverse" className="sk-fluen-logo" />
          </Link>

          <h1 className="sk-brand-name">Entrar na plataforma</h1>
          <button type="button" className="sk-google-btn" onClick={handleGoogleLogin}>
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <div className="sk-separator">OU CONTINUE COM</div>

          {error ? <p className="sk-error">{error}</p> : null}

          <form className="sk-form" onSubmit={handleSubmit}>
            <label className="sk-label" htmlFor="email">E-mail ou usuário</label>
            <div className="sk-input-wrapper">
              <span className="sk-input-icon"><MailIcon /></span>
              <input
                id="email"
                type="text"
                placeholder="voce@email.com"
                className="sk-input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <label className="sk-label" htmlFor="password">Senha</label>
            <div className="sk-input-wrapper">
              <span className="sk-input-icon"><LockIcon /></span>
              <input
                id="password"
                type="password"
                placeholder="Sua senha"
                className="sk-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="sk-submit-btn" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="sk-auth-footer">
            <Link href="/esqueci-senha" className="sk-link">
              Esqueci a senha
            </Link>
            <span className="sk-auth-footer-text">
              Ainda não tem uma conta? <Link href="/criar-conta" className="sk-link">Criar conta</Link>
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
