"use client";

import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { readConsent } from "@/lib/cookie-consent";

export function MetaPixel() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const skipFirstPageView = useRef(true);

  useEffect(() => {
    const fbq = window.fbq;
    if (typeof fbq !== "function") return;
    if (readConsent() === "essential") return;
    if (skipFirstPageView.current) skipFirstPageView.current = false;
    else fbq("track", "PageView");
    if (path === "/start") fbq("track", "ViewContent", { content_name: "Campaign landing" });
  }, [path]);

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        alt=""
        src="https://www.facebook.com/tr?id=1851734376258650&ev=PageView&noscript=1"
      />
    </noscript>
  );
}
