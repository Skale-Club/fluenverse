import type { Metadata } from "next";
import Link from "next/link";
import { readIntegrationConfig } from "@/lib/integration-config";
import { PUBLIC_ASSETS } from "@/lib/public-assets";
import { parseSiteContentJson } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Agende Sua Sessão",
  description: "Agende sua sessão conversacional de inglês com a Fluenverse e pratique com foco em fluência e confiança.",
  alternates: {
    canonical: "/agende-sessao"
  }
};

type AgendeSessaoProps = {
  searchParams?: {
    lang?: string;
  };
};

export default async function AgendeSessaoPage({ searchParams }: AgendeSessaoProps) {
  const { config } = await readIntegrationConfig();
  const siteContent = parseSiteContentJson(config.SITE_CONTENT_JSON || "");
  const schedule = siteContent.schedule ?? {};

  const locale = searchParams?.lang || "pt";
  const isPt = locale === "pt";
  
  const copy = {
    kicker: typeof schedule.kicker === "string" && schedule.kicker.trim() ? schedule.kicker : (isPt ? "Agendamento" : "Scheduling"),
    title:
      typeof schedule.title === "string" && schedule.title.trim()
        ? schedule.title
        : (isPt ? "Agende sua Sessão Conversacional" : "Schedule your Conversation Session"),
    description:
      typeof schedule.description === "string" && schedule.description.trim()
        ? schedule.description
        : (isPt ? "Preencha o formulário e nossa equipe entra em contato para combinar dia e horário da sua sessão." : "Fill out the form and our team will contact you to arrange the day and time for your session."),
    fullNameLabel:
      typeof schedule.fullNameLabel === "string" && schedule.fullNameLabel.trim()
        ? schedule.fullNameLabel
        : (isPt ? "Nome completo" : "Full name"),
    fullNamePlaceholder:
      typeof schedule.fullNamePlaceholder === "string" && schedule.fullNamePlaceholder.trim()
        ? schedule.fullNamePlaceholder
        : (isPt ? "Seu nome" : "Your name"),
    emailLabel:
      typeof schedule.emailLabel === "string" && schedule.emailLabel.trim()
        ? schedule.emailLabel
        : (isPt ? "E-mail" : "Email"),
    emailPlaceholder:
      typeof schedule.emailPlaceholder === "string" && schedule.emailPlaceholder.trim()
        ? schedule.emailPlaceholder
        : (isPt ? "você@email.com" : "you@email.com"),
    goalLabel:
      typeof schedule.goalLabel === "string" && schedule.goalLabel.trim()
        ? schedule.goalLabel
        : (isPt ? "Objetivo com o inglês" : "Goal with English"),
    goalPlaceholder:
      typeof schedule.goalPlaceholder === "string" && schedule.goalPlaceholder.trim()
        ? schedule.goalPlaceholder
        : (isPt ? "Ex: melhorar pronúncia para entrevistas" : "E.g.: improve pronunciation for interviews"),
    submitButton:
      typeof schedule.submitButton === "string" && schedule.submitButton.trim()
        ? schedule.submitButton
        : (isPt ? "Enviar agendamento" : "Submit schedule"),
    backButton:
      typeof schedule.backButton === "string" && schedule.backButton.trim()
        ? schedule.backButton
        : (isPt ? "Voltar para a home" : "Back to home")
  };

  return (
    <div className="landing-shell">
      <header className="site-header">
        <Link href="/" className="brand-link">
          <img src={PUBLIC_ASSETS.logo} alt="Fluenverse" className="site-logo" />
        </Link>
        <nav className="header-actions" aria-label="Ações do cabeçalho">
          <Link href="/" className="home-button">
            HOME
          </Link>
        </nav>
      </header>

      <main className="form-page">
        <section className="form-card">
        <Link href="/">
          <img src={PUBLIC_ASSETS.logo} alt="Fluenverse" className="form-logo" />
        </Link>
          <p className="form-kicker">{copy.kicker}</p>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>

          <div className="session-form">
            <Link href={`/?openSurvey=1&lang=${isPt ? "pt" : "en"}`} className="primary-button full-width">
              {copy.submitButton}
            </Link>
          </div>

          <Link href="/" className="secondary-button back-link">
            {copy.backButton}
          </Link>
        </section>
      </main>
    </div>
  );
}
