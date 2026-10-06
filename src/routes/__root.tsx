"use client";

import { useEffect, useState } from "react";
import { createRootRoute, HeadContent, Link, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
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

function SubscriptionLinks() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (path !== "/communication") return;
    const reveal = () => setShow(true);
    window.addEventListener("aum-license-reveal", reveal);
    return () => window.removeEventListener("aum-license-reveal", reveal);
  }, [path]);
  if (path !== "/communication") return null;
  const button =
    "inline-flex h-11 items-center justify-center rounded-lg bg-teal px-4 text-center text-sm font-semibold text-cream hover:brightness-110";
  return (
    <div
      className={`flex max-w-full flex-wrap items-center gap-2 overflow-hidden transition-all duration-700 ease-out ${
        show ? "max-h-40 opacity-100" : "pointer-events-none max-h-0 opacity-0"
      }`}
      aria-hidden={!show}
      inert={show ? undefined : true}
    >
      <a className={button} href="https://buy.stripe.com/6oU4gydFo8PkgO68zx4Ja01" tabIndex={show ? 0 : -1}>
        Monthly Subscription ($9.98/month)
      </a>
      <a className={button} href="https://buy.stripe.com/aFa5kC9p8e9E9lEg1Z4Ja00" tabIndex={show ? 0 : -1}>
        Annual Subscription ($99/year)
      </a>
    </div>
  );
}

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
      {
        children: `(function(){var ADVISOR="20f78d66-2c90-479e-b20c-b92d5939d396";var LICENSE="6b36b610-ae40-4878-841e-384b0c07bc84";function reportUrl(){var key="aum-report-code",existing="";try{existing=sessionStorage.getItem(key)||"";}catch(e){}if(!/^[a-z0-9]{16}$/.test(existing)){var alphabet="abcdefghijkmnopqrstuvwxyz23456789",bytes=new Uint8Array(16);crypto.getRandomValues(bytes);existing=Array.from(bytes,function(b){return alphabet[b%alphabet.length];}).join("");try{sessionStorage.setItem(key,existing);}catch(e){}}return "https://preserve-your-assets.com/incognito-"+existing;}function apply(event){try{var detail=(event&&event.detail)||{};var formId=detail.formId||"";if(formId&&formId!==ADVISOR&&formId!==LICENSE)return;var hs=window.HubSpotFormsV4;if(!hs)return;var url=reportUrl();var forms=[];if(hs.getFormFromEvent){var one=hs.getFormFromEvent(event);if(one)forms.push(one);}if(hs.getForms)forms=forms.concat(hs.getForms()||[]);function idOf(form){try{return(form.getFormId&&form.getFormId())||form.formId||"";}catch(e){return"";}}function keyOf(name){return String(name||"").split("/").pop().replace(/[\s_|-]+/g,"").toLowerCase();}function write(form,name){try{form.setFieldValue(name,[url]);}catch(e){try{form.setFieldValue(name,url);}catch(err){}}}function stamp(form,kind){if(!form||!form.setFieldValue)return;if(kind==="advisor")write(form,"0-1/landing_page");else{write(form,"0-1/lead_form");write(form,"lead_form");}if(!form.getFormFieldValues)return;form.getFormFieldValues().then(function(rows){(rows||[]).forEach(function(row){var name=String((row&&row.name)||"");var key=keyOf(name);if(kind==="advisor"&&key==="landingpage")write(form,name);if(kind==="license"&&key==="leadform")write(form,name);});}).catch(function(){});}forms.forEach(function(form){var id=idOf(form)||formId;if(id===ADVISOR)stamp(form,"advisor");else if(id===LICENSE)stamp(form,"license");else if(!id){stamp(form,"advisor");stamp(form,"license");}});}catch(e){}}window.addEventListener("hs-form-event:on-ready",apply);window.addEventListener("hs-form-event:on-interaction:navigate",apply);})();`,
      },
      {
        defer: true,
        src: "https://js.hsforms.net/forms/embed/8744592.js",
      },
      {
        id: "hs-script-loader",
        async: true,
        defer: true,
        src: "https://js.hs-scripts.com/8744592.js",
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
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Link to="/" aria-label="Preserve Your Assets, home" className="shrink-0 rounded-lg">
                      <img
                        src="/brand-icon.svg"
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-lg"
                      />
                    </Link>
                    <p className="text-xs tracking-[0.14em] text-gold">
                      For licensed insurance professionals
                    </p>
                  </div>
                  <Link
                    to="/"
                    className="shrink-0 rounded-lg bg-[#0072b2] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
                  >
                    Home
                  </Link>
                </div>
                <h1 className="mt-3 font-display text-2xl font-medium leading-tight sm:text-3xl lg:text-4xl">
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
                  <Link to="/communication" className="text-masthead-fg underline underline-offset-4 hover:text-gold">
                    Communication
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
                <div className="mt-4 flex max-w-5xl flex-wrap items-center gap-2">
                  <div className="w-full max-w-xs">
                    <ThemeToggle />
                  </div>
                  <SubscriptionLinks />
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
