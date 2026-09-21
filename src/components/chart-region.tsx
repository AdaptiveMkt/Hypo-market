import { useEffect, useState, type ReactNode } from "react";

/** Visual chart plus a screen-reader caption (WCAG 1.1.1). */
export function ChartRegion({
  title,
  summary,
  className,
  children,
}: {
  title: string;
  summary: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure className="m-0 min-w-0 w-full">
      <figcaption className="sr-only">{`${title}. ${summary}`}</figcaption>
      <div
        className={`chart-frame min-h-64 min-w-0 w-full ${className ?? "h-64"}`}
        aria-hidden="true"
      >
        {children}
      </div>
    </figure>
  );
}

export function useNarrow(maxPx = 640) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxPx}px)`);
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [maxPx]);
  return narrow;
}