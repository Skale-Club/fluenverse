"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

type ThankYouTrackerProps = {
  source: string;
  locale: string;
  gaEventName: string;
  fbEventName: string;
};


export function ThankYouTracker({ source, locale, gaEventName, fbEventName }: ThankYouTrackerProps) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) {
      return;
    }

    sentRef.current = true;
    const normalizedLocale = locale === "en" ? "en" : "pt";

    // Evento principal de conversao no GA4.
    trackEvent(gaEventName, {
      form_name: source,
      language: normalizedLocale,
      lead_source: "website"
    });

    // Evento de conversao no Facebook.
    trackEvent(fbEventName, {
      source: source,
      language: normalizedLocale
    });

    // Eventos auxiliares para analise de funil.
    trackEvent("thank_you_view", {
      form_name: source,
      language: normalizedLocale,
      page_type: "confirmation"
    });
  }, [locale, source, gaEventName, fbEventName]);


  return null;
}
