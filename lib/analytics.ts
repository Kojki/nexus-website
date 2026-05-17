import { supabase } from "./supabase";


export const trackPageView = async (path: string) => {
  if (typeof window === "undefined" || !path) return;
  // 管理画面（/activity-log/editor）のアクセスは計測から除外する
  if (path.includes("/activity-log/editor") || path.includes("/login")) return;

  try {
    const { error } = await supabase.rpc("increment_page_view", { p_path: path });
    if (error) console.error("PV計測エラー:", error.message);
  } catch (e) {
    console.error("Analytics Error:", e);
  }
};

export const logAdminAction = async (action: string, details: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const actorEmail = session?.user?.email || "システム管理者";
    
    await supabase.from("audit_logs").insert([
      { actor_email: actorEmail, action, details }
    ]);
  } catch (e) {
    console.error("ログ記録エラー:", e);
  }
};
