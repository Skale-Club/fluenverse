import type { Metadata } from "next";
import { Section } from "@/components/section";
import { readIntegrationConfig } from "@/lib/integration-config";
import { parseSiteContentJson } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Sobre a Fluenverse",
  description: "Conheça a proposta da Fluenverse para evolução em inglês com foco em conversação e prática real.",
  alternates: {
    canonical: "/about"
  }
};

export default async function AboutPage() {
  const { config } = await readIntegrationConfig();
  const siteContent = parseSiteContentJson(config.SITE_CONTENT_JSON || "");
  const about = siteContent.about ?? {};
  const title = typeof about.title === "string" && about.title.trim() ? about.title : "Sobre esta base";
  const body = typeof about.body === "string" && about.body.trim()
    ? about.body
    : "Esta é uma página de exemplo para demonstrar rotas no App Router do Next.js.";

  return (
    <main className="container">
      <Section title={title}>
        <p>{body}</p>
      </Section>
    </main>
  );
}
