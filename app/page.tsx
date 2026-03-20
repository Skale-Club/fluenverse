import HomePageClient from "@/app/home-page-client";
import { absoluteAssetUrl } from "@/lib/public-assets";
import { readLandingPageContent } from "@/lib/site-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fluenverse.com";

const homeJsonLd = {
  // ... rest of JsonLd remains the same
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Fluenverse",
      url: siteUrl,
      logo: absoluteAssetUrl("/logo.png", siteUrl),
      email: "info@fluenverse.com"
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Fluenverse",
      inLanguage: ["pt-BR", "en-US"],
      publisher: {
        "@id": `${siteUrl}/#organization`
      }
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#service`,
      name: "Sessões Conversacionais de Inglês",
      serviceType: "Sessões de conversação em inglês online",
      provider: {
        "@id": `${siteUrl}/#organization`
      },
      areaServed: "BR",
      availableLanguage: ["Portuguese", "English"],
      url: siteUrl
    }
  ]
};

export default async function HomePage() {
  const siteContent = await readLandingPageContent();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <HomePageClient contentOverride={siteContent as any} />
    </>
  );
}
