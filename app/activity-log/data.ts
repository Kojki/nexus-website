import { Activity } from "./types";
import { post_2025_05_10 } from "./entries/2026-05-04-website-launch";
import { post_2025_05_01 } from "./entries/2026-05-03-pre-open";

export const activities: Activity[] = [
  post_2025_05_10,
  post_2025_05_01,
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // 日付順に自動ソート
