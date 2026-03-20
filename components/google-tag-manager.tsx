import Script from "next/script";

type GoogleTagManagerProps = {
  gtmId?: string;
  gaId?: string;
};

export function GoogleTagManagerScript({ gtmId }: GoogleTagManagerProps) {
  const containerId = gtmId?.trim();

  if (!containerId) {
    return null;
  }

  return (
    <Script id="google-tag-manager" strategy="afterInteractive">
      {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${containerId}');
      `}
    </Script>
  );
}

export function GoogleTagManagerNoScript({ gtmId }: GoogleTagManagerProps) {
  const containerId = gtmId?.trim();

  if (!containerId) {
    return null;
  }

  const iframeSrc = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(containerId)}`;

  return (
    <noscript>
      <iframe
        src={iframeSrc}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="google-tag-manager-noscript"
      />
    </noscript>
  );
}

export function GoogleAnalyticsScript({ gaId }: { gaId?: string }) {
  const measurementId = gaId?.trim();

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id={`google-analytics-${measurementId}`} strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
