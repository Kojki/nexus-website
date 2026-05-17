"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";

/**
 * ページ遷移（URLパスの変更）を検知して自動でPVを集計する
 * 完全なクライアントサイド専用のトラッカーです。
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return null; // 画面上には何も描画しません
}
