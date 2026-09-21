"use client";

import { useEffect } from "react";
import { pinToHeaderOnLoad, scrollToHeader } from "@/lib/scroll-header";

/** Mount once in the document shell so refresh and revive always open at the header. */
export function ScrollToHeaderOnLoad() {
  useEffect(() => {
    pinToHeaderOnLoad();
    const delays = [0, 50, 150, 400, 900];
    const ids = delays.map((ms) => window.setTimeout(() => scrollToHeader(false), ms));
    const onShow = () => scrollToHeader(false);
    window.addEventListener("pageshow", onShow);
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("pageshow", onShow);
    };
  }, []);
  return null;
}