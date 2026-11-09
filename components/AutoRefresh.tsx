"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** リクエストの承認やステータス変更を反映するため、一定間隔でサーバーコンポーネントを再取得 */
export default function AutoRefresh({ seconds = 15 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => {
      const el = document.activeElement;
      const typing = el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
      if (!typing && document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
