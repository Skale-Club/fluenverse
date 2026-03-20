import type { Metadata } from "next";
import Link from "next/link";
import { ThankYouTracker } from "@/app/thank-you/thank-you-tracker";
import { readIntegrationConfig } from "@/lib/integration-config";
import { PUBLIC_ASSETS } from "@/lib/public-assets";
import { parseSiteContentJson } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Obrigado",
  description: "Confirmação de envio do formulário da Fluenverse.",
  alternates: {
    canonical: "/thank-you"
  },
  robots: {
    index: false,
    follow: false
  }
};


type ThankYouPageProps = {
  searchParams?: {
    source?: string;
    lang?: string;
  };
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { config } = await readIntegrationConfig();
  const siteContent = parseSiteContentJson(config.SITE_CONTENT_JSON || "");
  const thankYou = siteContent.thankYou ?? {};
  const source = searchParams?.source || "website_form";
  const locale = searchParams?.lang || "pt";
  const isPt = locale !== "en";

  const eventGa = config.EVENT_THANK_YOU_GA || "generate_lead";
  const eventFb = config.EVENT_THANK_YOU_FB || "Schedule";

  const copy = {
    titlePt:
      typeof thankYou.titlePt === "string" && thankYou.titlePt.trim()
        ? thankYou.titlePt
        : "Obrigado. Recebemos seu survey.",
    titleEn:
      typeof thankYou.titleEn === "string" && thankYou.titleEn.trim()
        ? thankYou.titleEn
        : "Thank you. We received your survey.",
    descriptionPt:
      typeof thankYou.descriptionPt === "string" && thankYou.descriptionPt.trim()
        ? thankYou.descriptionPt
        : "Nossa equipe vai entrar em contato em breve para os próximos passos.",
    descriptionEn:
      typeof thankYou.descriptionEn === "string" && thankYou.descriptionEn.trim()
        ? thankYou.descriptionEn
        : "Our team will contact you shortly with the next steps.",
    backButtonPt:
      typeof thankYou.backButtonPt === "string" && thankYou.backButtonPt.trim()
        ? thankYou.backButtonPt
        : "Voltar para home",
    backButtonEn:
      typeof thankYou.backButtonEn === "string" && thankYou.backButtonEn.trim()
        ? thankYou.backButtonEn
        : "Back to home"
  };

  return (
    <div className="thank-you-shell">
      <ThankYouTracker
        source={source}
        locale={locale}
        gaEventName={eventGa}
        fbEventName={eventFb}
      />


      <main className="thank-you-page">
        <section className="thank-you-card">
          <header className="chat-header">
          <Link href="/" className="chat-header-brand">
            <img src={PUBLIC_ASSETS.logo} alt="Fluenverse" className="chat-header-logo" />
          </Link>
          </header>
          <div className="thank-you-content">
            <h1>{isPt ? copy.titlePt : copy.titleEn}</h1>
            <p>
              {isPt
                ? copy.descriptionPt
                : copy.descriptionEn}
            </p>
            <Link href="/" className="primary-button thank-you-button">
              {isPt ? copy.backButtonPt : copy.backButtonEn}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
