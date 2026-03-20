import type { Metadata } from "next";
import { Poppins, Space_Grotesk, Pacifico } from "next/font/google";
import {
  GoogleAnalyticsScript,
  GoogleTagManagerNoScript,
  GoogleTagManagerScript
} from "@/components/google-tag-manager";
import { FacebookPixel } from "@/components/facebook-pixel";
import { readIntegrationConfig } from "@/lib/integration-config";
import { absoluteAssetUrl, assetUrl } from "@/lib/public-assets";
import { readLandingPageContent } from "@/lib/site-content";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fluenverse.com";
const siteName = "Fluenverse";
const defaultTitle = "Fluenverse | Sessões Conversacionais de Inglês";
const defaultDescription =
  "Pratique inglês com sessões conversacionais online e individuais para ganhar fluência, pronúncia e confiança para se comunicar.";

const bodyFont = Poppins({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"]
});

const pacificoFont = Pacifico({
  subsets: ["latin"],
  variable: "--font-pacifico",
  weight: "400"
});

export async function generateMetadata(): Promise<Metadata> {
  const { config } = await readIntegrationConfig();
  const lpContent = await readLandingPageContent();
  const favicons = (lpContent as any).favicons || {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fluenverse.com";
  const siteName = config.OG_SITE_NAME || "Fluenverse";
  const title = config.SEO_TITLE || "Fluenverse | Sessões Conversacionais de Inglês";
  const description = config.SEO_DESCRIPTION || "Pratique inglês com sessões conversacionais online e individuais para ganhar fluência, pronúncia e confiança para se comunicar.";
  const keywords = config.SEO_KEYWORDS ? config.SEO_KEYWORDS.split(",").map(k => k.trim()) : [
    "inglês conversação",
    "sessão conversacional",
    "aulas de inglês online",
    "fluência em inglês",
    "pronúncia em inglês",
    "Fluenverse"
  ];
  const author = config.SEO_AUTHOR || siteName;
  const ogImage = absoluteAssetUrl(config.OG_IMAGE_URL || "/hero-people.png", siteUrl);
  const ogType = (config.OG_TYPE as any) || "website";
  const robotsIndex = config.SEO_ROBOTS_INDEX !== "false";
  const robotsFollow = config.SEO_ROBOTS_FOLLOW !== "false";
  const twitterCard = (config.SEO_TWITTER_CARD as any) || "summary_large_image";
  const twitterSite = config.SEO_TWITTER_SITE || undefined;
  const twitterCreator = config.SEO_TWITTER_CREATOR || undefined;
  const googleVerification = config.SEO_GOOGLE_SITE_VERIFICATION || undefined;
  const fbAppId = config.FACEBOOK_APP_ID || undefined;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${siteName}`
    },
    description,
    applicationName: siteName,
    manifest: "/manifest.webmanifest",
    category: "education",
    creator: author,
    keywords,
    alternates: {
      canonical: "/"
    },
    robots: {
      index: robotsIndex,
      follow: robotsFollow
    },
    verification: {
      google: googleVerification
    },
    other: fbAppId ? {
      "fb:app_id": fbAppId
    } : {},
    openGraph: {
      type: ogType,
      locale: "pt_BR",
      url: siteUrl,
      siteName,
      title,
      description,
      images: [
        {
          url: ogImage,
          alt: `Sessão conversacional na ${siteName}`
        }
      ]
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      images: [ogImage],
      site: twitterSite,
      creator: twitterCreator
    },
    icons: {
      icon: assetUrl(favicons.favicon || "/favicon-f.png"),
      shortcut: assetUrl(favicons.favicon || "/favicon-f.png"),
      apple: assetUrl(favicons.appleTouchIcon || "/favicon-f.png"),
      other: [
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          url: assetUrl(favicons.icon32 || "/favicon-f.png"),
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          url: assetUrl(favicons.icon16 || "/favicon-f.png"),
        },
      ],
    }
  };
}


export const dynamic = "force-dynamic";

type RootLayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const { config } = await readIntegrationConfig();
  const gtmId = config.NEXT_PUBLIC_GTM_ID || "";
  const gaId = config.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "";

  return (
    <html lang="pt-BR">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <GoogleTagManagerScript gtmId={gtmId} />
        <GoogleAnalyticsScript gaId={gaId} />
        <FacebookPixel datasetId={config.FACEBOOK_ENABLED === "true" ? config.FACEBOOK_DATASET_ID : ""} />
        <GoogleTagManagerNoScript gtmId={gtmId} />

        {children}
      </body>
    </html>
  );
}
