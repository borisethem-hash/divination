"use client";
import { useEffect, useRef } from "react";

/** 横スクロールするタイムラインを、初期表示で現在時刻あたりまでスクロールさせる */
export default function TimelineScroller({ nowRatio, children }: { nowRatio: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const nameW = el.querySelector<HTMLElement>(".tl-row .tl-name")?.offsetWidth ?? 0;
    const barW = el.scrollWidth - nameW - 32;
    el.scrollLeft = Math.max(0, 16 + barW * nowRatio - (el.clientWidth - nameW) / 2);
  }, [nowRatio]);
  return <div className="tl-scroll" ref={ref}>{children}</div>;
}
