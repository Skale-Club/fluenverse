"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { PUBLIC_ASSETS } from "@/lib/public-assets";

export default function CriarContaPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const nextUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim().toLowerCase(),
      password: password.trim()
    };

    if (!nextUser.name || !nextUser.email || !nextUser.username || !nextUser.password) {
      setError("Preencha todos os campos.");
      return;
    }

    if (nextUser.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (nextUser.password !== confirmPassword.trim()) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nextUser.name,
          email: nextUser.email,
          username: nextUser.username,
          password: nextUser.password,
          is_active: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Não foi possível criar a conta.");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta.");
      return;
    }

    setSuccess("Conta criada com sucesso. Seu acesso é de usuário normal.");
    setName("");
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/">
          <img src={PUBLIC_ASSETS.logo} alt="Fluenverse" className="auth-logo" />
        </Link>
        <p className="form-kicker">Novo Acesso</p>
        <h1>Criar conta</h1>
        <p>Crie seu acesso para entrar no ambiente administrativo.</p>

        <form className="session-form" onSubmit={handleSubmit}>
          <label className="field">
            Nome
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" required />
          </label>

          <label className="field">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
              required
            />
          </label>

          <label className="field">
            Usuário
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="seu.usuario"
              required
            />
          </label>

          <label className="field">
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </label>

          <label className="field">
            Confirmar senha
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repita a senha"
              required
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}
          {success ? <p className="auth-success">{success}</p> : null}

          <button type="submit" className="primary-button full-width">Criar conta</button>
        </form>

        <div className="auth-links">
          <Link href="/login" className="header-link">
            Já tenho conta
          </Link>
          <Link href="/" className="secondary-button">
            Voltar para home
          </Link>
        </div>
      </section>
    </main>
  );
}
