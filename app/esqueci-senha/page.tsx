import Link from "next/link";
import { PUBLIC_ASSETS } from "@/lib/public-assets";

export default function ForgotPasswordPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/">
          <img src={PUBLIC_ASSETS.logo} alt="Fluenverse" className="auth-logo" />
        </Link>
        <p className="form-kicker">Recuperação</p>
        <h1>Esqueci a senha</h1>
        <p>Informe seu e-mail para receber instruções de redefinição de senha.</p>

        <form className="session-form">
          <label className="field">
            E-mail
            <input type="email" name="email" placeholder="voce@email.com" required />
          </label>

          <button type="submit" className="primary-button full-width">
            Enviar instruções
          </button>
        </form>

        <div className="auth-links">
          <Link href="/login" className="header-link">
            Voltar para login
          </Link>
          <Link href="/" className="secondary-button">
            Voltar para home
          </Link>
        </div>
      </section>
    </main>
  );
}
