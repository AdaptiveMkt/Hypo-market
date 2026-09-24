"use client";

import { useEffect, useState } from "react";
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { ScrollToHeaderOnLoad } from "@/components/scroll-to-header";
import { ContentGuard } from "@/components/content-guard";
import { ThemeToggle, useDarkMode } from "@/components/theme-toggle";
import { VoiceControls } from "@/components/voice-controls";
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
      className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg border border-gold bg-gold px-4 py-2 text-sm font-semibold text-masthead hover:brightness-105"
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
          "Long-term care asset utilization model: compare care settings and insurance against a pool of assets.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
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
        children: `(function(){try{document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light";localStorage.setItem("aum-theme","light");}catch(e){}})();`,
      },
      {
        async: true,
        src: "https://www.googletagmanager.com/gtag/js?id=G-C34YXPEQM1",
      },
      {
        children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-C34YXPEQM1');`,
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
                  Long Term Care Hypothetical -Client | Family | Web Based Self Assessment
                </p>
                <h1 className="font-display text-2xl font-medium leading-tight sm:text-3xl lg:text-4xl">
                  Long Term Care Asset Utilization Modeling
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-masthead-fg/85 sm:text-base">
                  Enter assets that could pay for care. Compare nursing, assisted living,
                  and 24-hour home care — and see how long-term care insurance inflation
                  riders change how the assets are used. Care costs grow by CPI; unused
                  assets compound at your assumed return.
                </p>
                <nav className="mt-4 flex flex-wrap gap-4 text-sm" aria-label="Site">
                  <Link to="/" className="text-masthead-fg underline underline-offset-4 hover:text-gold">
                    Calculator
                  </Link>
                  <Link to="/about" className="text-masthead-fg underline underline-offset-4 hover:text-gold">
                    How this works
                  </Link>
                  <Link
                    to="/suitability"
                    className="text-masthead-fg underline underline-offset-4 hover:text-gold"
                  >
                    Suitability worksheet
                  </Link>
                  <DisclosureTermsLink className="text-masthead-fg underline underline-offset-4 hover:text-gold" />
                </nav>
                <div className="mt-4">
                  <VoiceControls>
                    <ThemeToggle />
                  </VoiceControls>
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
            <footer className="bg-masthead px-4 py-5 text-center text-sm text-masthead-fg/70">
                <p>
                  <CopyrightMark linkClass="text-gold underline underline-offset-4 hover:underline" />{" "}
                  <DisclosureTermsLink className="text-gold underline-offset-4 hover:underline" />
                </p>
                <FooterDownloadPdf />
              </footer>
          </ContentGuard>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
