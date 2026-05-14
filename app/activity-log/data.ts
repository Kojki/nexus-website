import { Activity } from "./types";
import { post_2026_05_03 } from "./entries/2026-05-03-pre-open";
import { post_2026_05_04 } from "./entries/2026-05-04-website-launch";
export const activities: Activity[] = [
  post_2026_05_04,
  post_2026_05_03,
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // 日付順に自動ソート
