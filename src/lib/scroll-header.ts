/** Put the window (and any overflow parent) back at the top. */
export function scrollToHeader(smooth = false) {
  const behavior: ScrollBehavior = smooth ? "smooth" : "auto";
  window.scrollTo({ top: 0, left: 0, behavior });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  let node: HTMLElement | null = document.getElementById("page-header") ?? document.body;
  while (node) {
    if (node.scrollTop) node.scrollTop = 0;
    node = node.parentElement;
  }
}

/** First paint / refresh: stay on the header, ignore leftover hashes and restored scroll. */
export function pinToHeaderOnLoad() {
  try {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  } catch {
    /* ignore */
  }
  if (window.location.hash) {
    const path = `${window.location.pathname}${window.location.search}`;
    try {
      window.history.replaceState(null, "", path);
    } catch {
      /* ignore */
    }
  }
  scrollToHeader(false);
}