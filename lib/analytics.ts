type AnalyticsValue = string | number | boolean | null | undefined;

type AnalyticsEventParams = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, AnalyticsValue>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params: AnalyticsEventParams = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    page_path: window.location.pathname,
    ...params
  });

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }

  // Support for Facebook Pixel
  if (typeof (window as any).fbq === "function") {
    // If it's a standard event name, we track it as standard, otherwise as Custom
    const standardEvents = ["AddPaymentInfo", "AddToCart", "AddToWishlist", "CompleteRegistration", "Contact", "CustomizeProduct", "Donate", "FindLocation", "InitiateCheckout", "Lead", "PageView", "Purchase", "Schedule", "Search", "StartTrial", "SubmitApplication", "Subscribe", "ViewContent"];

    if (standardEvents.includes(eventName)) {
      (window as any).fbq("track", eventName, params);
    } else {
      (window as any).fbq("trackCustom", eventName, params);
    }
  }
}

