"use client";

import { useEffect, useState } from "react";
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { ScrollToHeaderOnLoad } from "@/components/scroll-to-header";
import { ContentGuard } from "@/components/content-guard";
import { ThemeToggle, useDarkMode } from "@/components/theme-toggle";
import { CookieConsent } from "@/components/cookie-consent";
import { HypoChatbot } from "@/components/hypo-chatbot";
import { DisclosureTermsLink } from "@/components/disclosure-link";
import { CopyrightMark } from "@/components/source-links";
import { HOLD_HARMLESS_ACK, HOLD_HARMLESS_SHORT } from "@/lib/disclaimer";
import appCss from "../styles.css?url";

const APP_NAME = "Long Term Care Asset Utilization Modeling";

function FooterDownloadPdf() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setReady(document.documentElement.dataset.pdfReady === "1");
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-pdf-ready"] });
    return () => obs.disconnect();
  }, []);
  if (!ready) return null;
  return (
    <button
      type="button"
      className="ml-auto inline-flex min-h-11 items-center justify-center rounded-lg border border-gold bg-gold px-4 py-2 text-sm font-semibold text-masthead hover:brightness-105"
      onClick={() => window.dispatchEvent(new Event("aum-download-pdf"))}
    >
      Download PDF
    </button>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#1b3a4b" },
      {
        name: "description",
        content:
          "A client-ready long-term care hypothetical for licensed insurance professionals. Run it incognito, or with the client.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Preserve Your Assets" },
      { property: "og:title", content: APP_NAME },
      {
        property: "og:description",
        content:
          "Show a client how quickly long-term care could use the assets they have accumulated, and what changes if insurance pays first.",
      },
      { property: "og:url", content: "https://www.preserve-your-assets.com/" },
      { property: "og:image", content: "https://www.preserve-your-assets.com/cover/share.jpg" },
      { property: "og:image:secure_url", content: "https://www.preserve-your-assets.com/cover/share.jpg" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "A couple sitting on a sofa reviewing a long-term care plan",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: APP_NAME },
      {
        name: "twitter:description",
        content:
          "Show a client how quickly long-term care could use the assets they have accumulated, and what changes if insurance pays first.",
      },
      { name: "twitter:image", content: "https://www.preserve-your-assets.com/cover/share.jpg" },
      {
        name: "twitter:image:alt",
        content: "A couple sitting on a sofa reviewing a long-term care plan",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "image_src", href: "https://www.preserve-your-assets.com/cover/share.jpg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,650&family=Source+Sans+3:wght@400;600;700&display=swap",
      },
    ],
    scripts: [
      {
        children: `(function(){try{var r=document.documentElement;r.classList.add("dark","antialiased");r.style.colorScheme="dark";if(document.body)document.body.classList.add("dark");var m=document.querySelector('meta[name=\"theme-color\"]');if(m)m.setAttribute("content","#0f1c24");localStorage.setItem("aum-theme","dark");}catch(e){}})();`,
      },
      {
        children: `(function(){window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;var analytics="denied";try{var m=document.cookie.match(/(?:^|; )aum-consent=([^;]+)/);if(m&&decodeURIComponent(m[1])==="analytics")analytics="granted";}catch(e){}gtag("consent","default",{ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",analytics_storage:analytics,functionality_storage:"granted",security_storage:"granted"});gtag("js",new Date());gtag("config","G-C34YXPEQM1");})();`,
      },
      {
        async: true,
        src: "https://www.googletagmanager.com/gtag/js?id=G-C34YXPEQM1",
      },
    ],
  }),
  component: Root,
});

function Root() {
  const dark = useDarkMode();
  return (
    <html lang="en" className={dark ? "antialiased dark" : "antialiased"} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-cream text-ink">
        <PreviewHostBridge />
        <ScrollToHeaderOnLoad />
        <AuthProvider>
          <ContentGuard>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <header id="page-header" className="bg-masthead text-masthead-fg">
              <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                <p className="mb-1 text-xs tracking-[0.14em] text-gold">
                  For licensed insurance professionals
                </p>
                <h1 className="font-display text-2xl font-medium leading-tight sm:text-3xl lg:text-4xl">
                  Long Term Care Asset Utilization Modeling
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-masthead-fg/85 sm:text-base">
                  Show a client how quickly long-term care could use the assets they have
                  accumulated, and what changes if insurance pays first.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
                <nav className="flex flex-wrap gap-4 text-sm" aria-label="Site">
                  <Link to="/" className="text-masthead-fg underline underline-offset-4 hover:text-gold">
                    Calculator
                  </Link>
                  <Link to="/about" className="text-masthead-fg underline underline-offset-4 hover:text-gold">
                    How this works
                  </Link>
                  <Link to="/sources" className="text-masthead-fg underline underline-offset-4 hover:text-gold">
                    Sources
                  </Link>
                  <Link
                    to="/suitability"
                    className="text-masthead-fg underline underline-offset-4 hover:text-gold"
                  >
                    Suitability worksheet
                  </Link>
                  <DisclosureTermsLink className="text-masthead-fg underline underline-offset-4 hover:text-gold" />
                </nav>
                <FooterDownloadPdf />
                </div>
                <div className="mt-4 max-w-xs">
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <Outlet />
            <section className="site-print-terms" aria-hidden="true">
              <h2>Disclosure and Terms of Use</h2>
              <p>{HOLD_HARMLESS_SHORT}</p>
              <p>{HOLD_HARMLESS_ACK}</p>
              <p>
                <CopyrightMark /> Educational hypothetical only. Not a quote, illustration, or advice.
              </p>
            </section>
            <HypoChatbot />
            <CookieConsent />
            <footer className="bg-masthead px-4 py-5 text-center text-sm text-masthead-fg sm:text-left">
              <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  <CopyrightMark linkClass="text-gold underline underline-offset-4 hover:underline" />
                </p>
                <nav aria-label="Legal" className="flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end">
                  <DisclosureTermsLink className="text-gold underline underline-offset-4 hover:underline" />
                  <a
                    href="/copyright#privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold underline underline-offset-4 hover:underline"
                  >
                    Privacy
                  </a>
                  <button
                    type="button"
                    className="text-gold underline underline-offset-4 hover:underline"
                    onClick={() => window.dispatchEvent(new Event("aum-cookie-settings"))}
                  >
                    Cookie settings
                  </button>
                </nav>
              </div>
            </footer>
          </ContentGuard>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
