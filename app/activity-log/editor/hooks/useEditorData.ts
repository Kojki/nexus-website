"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { revalidateSite } from "@/app/actions";
import { compressImage } from "@/lib/image";
import { logAdminAction } from "@/lib/analytics";

export type PagePath = "home" | "about" | "guidelines" | "privacy" | "en";

// 🔑 厳格な型定義（インターフェース）
export interface NotificationItem {
  id: string;
  status: "read" | "unread";
  title: string;
  message: string;
  created_at: string;
  user_email: string;
}

export interface InquiryItem {
  id: string;
  name: string;
  email: string;
  category: string;
  content: string;
  status: string;
  created_at: string;
}

export interface AllowedUserItem {
  email: string;
  role: string;
  permissions: string[];
  /** 管理画面用の表示名（ログイン識別には使わない） */
  display_name?: string | null;
}

export interface AuditLogItem {
  id: string;
  actor_email: string;
  action: string;
  details: string;
  created_at: string;
}

/** Wikipediaモデルに基づく正規の5役職 */
export const CANONICAL_ROLES = ["owner", "admin", "reviewer", "proposer", "guest"] as const;

/** 旧データ互換（DBに残っている role 名 → 正規役職） */
export const ROLE_ALIASES: Record<string, string> = {
  editor: "reviewer",
  chief_editor: "reviewer",
  sysop: "admin",
  project_manager: "admin",
  public_relations: "proposer",
  visitor: "guest",
  autoconfirmed: "proposer",
};

// 🔑 役職の階層順序（数値が大きいほど上位）
export const ROLE_HIERARCHY: Record<string, number> = {
  owner: 5,
  admin: 4,
  reviewer: 3,
  proposer: 2,
  guest: 1,
  custom: 0,
  editor: 3,
  project_manager: 4,
  public_relations: 2,
  visitor: 1,
};

export const ROLE_LABELS: Record<string, string> = {
  owner: "ビューロクラット / オーナー",
  admin: "管理者 (sysop)",
  reviewer: "査読者・編集長",
  proposer: "自動承認利用者 / 提案者",
  guest: "ゲスト（閲覧のみ）",
  custom: "カスタム",
  editor: "編集者（→査読者）",
  project_manager: "PJマネージャー（→管理者）",
  public_relations: "広報担当（→提案者）",
  visitor: "訪問者（→ゲスト）",
};

/** 全12権限キー（approve_content は publish_content に統合済み） */
export const ALL_PERMISSION_KEYS = [
  "manage_roles_unlimited",
  "manage_subordinate_roles",
  "remove_users",
  "view_traffic_analytics",
  "view_audit_logs",
  "propose_content",
  "publish_content",
  "view_inquiries",
  "reply_inquiries",
  "delete_inquiries",
  "restore_trash",
  "empty_trash",
] as const;

// 🔑 ロールとデフォルト権限のマトリクス
export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  owner: [...ALL_PERMISSION_KEYS],
  admin: [
    "manage_subordinate_roles",
    "remove_users",
    "view_traffic_analytics",
    "view_audit_logs",
    "propose_content",
    "publish_content",
    "view_inquiries",
    "reply_inquiries",
    "delete_inquiries",
    "restore_trash",
    "empty_trash",
  ],
  reviewer: [
    "view_traffic_analytics",
    "publish_content",
    "reply_inquiries",
    "restore_trash",
  ],
  proposer: ["propose_content", "view_inquiries"],
  guest: ["view_traffic_analytics"],
  custom: [],
  editor: [
    "view_traffic_analytics",
    "publish_content",
    "reply_inquiries",
    "restore_trash",
  ],
  project_manager: [
    "manage_subordinate_roles",
    "remove_users",
    "view_traffic_analytics",
    "view_audit_logs",
    "propose_content",
    "publish_content",
    "view_inquiries",
    "reply_inquiries",
    "delete_inquiries",
    "restore_trash",
    "empty_trash",
  ],
  public_relations: ["propose_content", "view_inquiries"],
  visitor: ["view_traffic_analytics"],
};

export function normalizeRoleId(role: string): string {
  return ROLE_ALIASES[role] || role;
}

/** ゲスト相当：画面は見られるが保存・送信は不可 */
export function isReadOnlyBrowser(role: string | null): boolean {
  if (!role) return false;
  const n = normalizeRoleId(role);
  return n === "guest" || role === "visitor";
}

/** Gmail等の表記ゆれを吸収（許可リスト登録時は小文字化している） */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/** Googleログイン照合に使うメール形式か */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

/**
 * 役職テンプレートの権限を取得。
 * - DBに保存済み（キーが存在）なら空配列 [] もそのまま返す（明示的な「権限なし」）
 * - 未保存の役職のみコード内デフォルトにフォールバック
 */
export function resolveRolePermissions(
  rolePermsMap: Record<string, string[]>,
  role: string
): string[] {
  const roleKey = normalizeRoleId(role);
  if (roleKey in rolePermsMap) return rolePermsMap[roleKey];
  if (role in rolePermsMap) return rolePermsMap[role];
  return ROLE_DEFAULT_PERMISSIONS[roleKey] || ROLE_DEFAULT_PERMISSIONS[role] || [];
}

/** 役職設定UI用：保存済みテンプレートをそのまま表示 */
export function getEditorRolePermissions(
  rolePermsMap: Record<string, string[]>,
  roleId: string
): string[] {
  if (roleId in rolePermsMap) return rolePermsMap[roleId];
  return ROLE_DEFAULT_PERMISSIONS[roleId] || [];
}

/** DBの個別権限が空のときは役職デフォルトにフォールバック */
export function resolveUserPermissions(
  permissions: string[] | null | undefined,
  role: string,
  rolePermsMap: Record<string, string[]>
): string[] {
  if (permissions && permissions.length > 0) return permissions;
  return resolveRolePermissions(rolePermsMap, role);
}

function mergeRolePermissionsFromDb(
  rows: { role_id: string; permissions: string[] | null }[]
): Record<string, string[]> {
  const loaded: Record<string, string[]> = { ...ROLE_DEFAULT_PERMISSIONS };
  rows.forEach((row) => {
    if (row.role_id) {
      loaded[row.role_id] = row.permissions ?? [];
    }
  });
  return loaded;
}

// 🔑 日本語の権限表示ラベルマッピング
export const PERMISSION_LABELS: Record<string, { label: string; desc: string }> = {
  manage_roles_unlimited:   { label: "👑 全権限の付与・剥奪",       desc: "すべての役職・権限を自由に変更できる（オーナー専用）" },
  manage_subordinate_roles: { label: "🔧 下位役職の管理",           desc: "自分より下の役職のユーザーの役職変更・降格ができる" },
  remove_users:             { label: "🚫 アカウント剥奪",           desc: "ユーザーのアクセス権をシステムから削除できる" },
  view_traffic_analytics:   { label: "📊 アクセス状況の閲覧",       desc: "PV数・人気ページなどの統計データを見れる" },
  view_audit_logs:          { label: "🛡️ 監査ログの閲覧",          desc: "誰がいつ何をしたか（操作履歴）を見れる" },
  propose_content:          { label: "📝 編集提案",                 desc: "コンテンツの追加・編集を「提案（承認待ち）」として送信できる" },
  publish_content:          { label: "🚀 本番公開・提案反映",       desc: "直接本番へ反映できる。他人の提案を本番へ反映（承認）できる" },
  view_inquiries:           { label: "📩 問い合わせの閲覧",         desc: "届いたメッセージや申請を「読む」ことだけできる" },
  reply_inquiries:          { label: "✉️ 返信・メール送信",         desc: "採用/お見送り/返信メールの送信、ステータス変更ができる" },
  delete_inquiries:         { label: "🗑️ 問い合わせの削除",        desc: "届いた問い合わせ・申請データを削除できる" },
  restore_trash:            { label: "♻️ ゴミ箱からの復元",        desc: "削除されたデータをゴミ箱から元に戻せる" },
  empty_trash:              { label: "💥 データの永久消去",         desc: "ゴミ箱のデータを完全に消去できる（取り消し不可）" },
};

export function useEditorData() {
  const router = useRouter();
  
  // ナビゲーション ＆ UI 表示ステート
  const [activeTab, setActiveTab] = useState<string>("content");
  const [activePage, setActivePage] = useState<PagePath>("home");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // 🔑 アカウント・セキュリティステート
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [allowedUsers, setAllowedUsers] = useState<AllowedUserItem[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(ROLE_DEFAULT_PERMISSIONS);

  // モバイル表示トグル
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);

  // 提案・通知ステート
  const [pendingContentProposals, setPendingContentProposals] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // コンテンツ ＆ 各マスターデータ
  const [siteContents, setSiteContents] = useState<Record<string, Record<string, string>>>({});
  const [liveData, setLiveData] = useState<Record<string, string>>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);

  // 🗑️ ゴミ箱データ
  const [deletedActivities, setDeletedActivities] = useState<any[]>([]);
  const [deletedMembers, setDeletedMembers] = useState<any[]>([]);
  const [deletedProjects, setDeletedProjects] = useState<any[]>([]);
  const [deletedFaqs, setDeletedFaqs] = useState<any[]>([]);

  // 📬 承認待ち（提案中）データ
  const [pendingActivities, setPendingActivities] = useState<any[]>([]);
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  const [pendingFaqs, setPendingFaqs] = useState<any[]>([]);

  // アクセス解析 ＆ ログ
  const [analyticsData, setAnalyticsData] = useState<{ totalViews: number; todayViews: number; popularPages: any[] }>({
    totalViews: 0,
    todayViews: 0,
    popularPages: []
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // フォーム用入力ステート
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("ja-JP").replace(/\//g, "."));
  const [category, setCategory] = useState("NEWS");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  const [mName, setMName] = useState("");
  const [mRole, setMRole] = useState("");
  const [mAffiliation, setMAffiliation] = useState("");
  const [mField, setMField] = useState("");
  const [mMessage, setMMessage] = useState("");
  const [mPhotoUrl, setMPhotoUrl] = useState("");
  const [skills, setSkills] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const [pTitle, setPTitle] = useState("");
  const [pDescription, setPDescription] = useState("");
  const [pTechStack, setPTechStack] = useState("");
  const [pRolesNeeded, setPRolesNeeded] = useState("");
  const [pStatus, setPStatus] = useState("open");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const [fQuestion, setFQuestion] = useState("");
  const [fAnswer, setFAnswer] = useState("");
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getDefaultPermissionsForRole = (role: string) => {
    return resolveRolePermissions(rolePermissions, role);
  };

  const canManageRole = (targetRole: string) => {
    if (userRole === "owner") return true;
    if (!hasPermission("manage_subordinate_roles")) return false;
    const currentRank = ROLE_HIERARCHY[normalizeRoleId(userRole || "guest")] ?? 0;
    const targetRank = ROLE_HIERARCHY[normalizeRoleId(targetRole)] ?? 0;
    return targetRank < currentRank;
  };

  const hasPermission = (permission: string) => {
    if (userRole === "owner") return true;
    return userPermissions.includes(permission);
  };

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const { data: cData, error: cError } = await supabase.from("site_content").select("*");
      if (cError) throw cError;
      const cMap: any = { home: {}, about: {}, en: {}, guidelines: {}, privacy: {} };
      cData?.forEach((item) => {
        if (cMap[item.page_path]) cMap[item.page_path][item.content_key] = item.content_value;
      });
      setSiteContents(cMap);
      setLiveData(cMap[activePage] || {});

      const { data: aData } = await supabase
        .from("activities")
        .select("*")
        .eq("is_deleted", false)
        .eq("approval_status", "approved")
        .order("created_at", { ascending: false });
      setActivities(aData || []);

      const { data: mData } = await supabase
        .from("members")
        .select("*")
        .eq("is_deleted", false)
        .eq("approval_status", "approved")
        .order("order_index", { ascending: true });
      setMembers(mData || []);

      const { data: fData } = await supabase
        .from("faqs")
        .select("*")
        .eq("is_deleted", false)
        .eq("approval_status", "approved")
        .order("order_index");
      setFaqs(fData || []);

      const { data: pData } = await supabase
        .from("projects")
        .select("*")
        .eq("is_deleted", false)
        .eq("approval_status", "approved")
        .order("order_index", { ascending: true });
      setProjects(pData || []);

      const { data: delA } = await supabase.from("activities").select("*").eq("is_deleted", true);
      setDeletedActivities(delA || []);

      const { data: delM } = await supabase.from("members").select("*").eq("is_deleted", true);
      setDeletedMembers(delM || []);

      const { data: delP } = await supabase.from("projects").select("*").eq("is_deleted", true);
      setDeletedProjects(delP || []);

      const { data: delF } = await supabase.from("faqs").select("*").eq("is_deleted", true);
      setDeletedFaqs(delF || []);

      const { data: pendA } = await supabase.from("activities").select("*").eq("approval_status", "pending");
      setPendingActivities(pendA || []);

      const { data: pendM } = await supabase.from("members").select("*").eq("approval_status", "pending");
      setPendingMembers(pendM || []);

      const { data: pendP } = await supabase.from("projects").select("*").eq("approval_status", "pending");
      setPendingProjects(pendP || []);

      const { data: pendF } = await supabase.from("faqs").select("*").eq("approval_status", "pending");
      setPendingFaqs(pendF || []);

      const { data: iData } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
      setInquiries(iData || []);

      const { data: pvData } = await supabase.from("page_views").select("*");
      if (pvData) {
        const total = pvData.reduce((acc, curr) => acc + (curr.views || 0), 0);
        const todayStr = new Date().toISOString().split("T")[0];
        const today = pvData
          .filter((d) => d.viewed_at === todayStr)
          .reduce((acc, curr) => acc + (curr.views || 0), 0);

        const pathViews: Record<string, number> = {};
        pvData.forEach((d) => {
          pathViews[d.page_path] = (pathViews[d.page_path] || 0) + (d.views || 0);
        });
        const popular = Object.keys(pathViews)
          .map((p) => ({ path: p, views: pathViews[p] }))
          .sort((a, b) => b.views - a.views);

        setAnalyticsData({ totalViews: total, todayViews: today, popularPages: popular });
      }

      const { data: logs } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(20);
      setAuditLogs(logs || []);

      const { data: allowedList } = await supabase.from("allowed_users").select("*").order("email");
      setAllowedUsers(allowedList || []);

      const { data: pendC } = await supabase
        .from("content_proposals")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      setPendingContentProposals(pendC || []);

      if (currentUserEmail) {
        const { data: nData } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_email", currentUserEmail)
          .order("created_at", { ascending: false });
        setNotifications(nData || []);
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const email = normalizeEmail(session.user.email || "");
      setCurrentUserEmail(email);

      const { data: allowedRows, error: userError } = await supabase
        .from("allowed_users")
        .select("role, permissions, email")
        .ilike("email", email)
        .limit(1);

      const userData = allowedRows?.[0];

      if (userError || !userData) {
        alert(`アクセス権限がありません。\n登録メールアドレス: ${email}\n管理者に追加を依頼してください。`);
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      // 許可リストの表記を正規化（大文字小文字の不一致で再ログインできなくなるのを防ぐ）
      if (userData.email && userData.email !== email) {
        await supabase.from("allowed_users").update({ email }).eq("email", userData.email);
      }

      setIsAuthenticated(true);
      setUserRole(userData.role);

      const { data: rolePermRows, error: rolePermError } = await supabase
        .from("role_permissions")
        .select("role_id, permissions");

      let effectiveRolePermissions = rolePermissions;
      if (!rolePermError && rolePermRows && rolePermRows.length > 0) {
        effectiveRolePermissions = mergeRolePermissionsFromDb(rolePermRows);
        setRolePermissions(effectiveRolePermissions);
      }

      // custom 以外は役職テンプレートを優先（DBに空配列・古い権限が残っていても一致させる）
      const activePerms =
        userData.role === "custom"
          ? resolveUserPermissions(userData.permissions, userData.role, effectiveRolePermissions)
          : resolveRolePermissions(effectiveRolePermissions, userData.role);
      setUserPermissions(activePerms);

      const { data: nData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_email", email)
        .order("created_at", { ascending: false });
      setNotifications(nData || []);

      fetchData();

      const sessionKey = "nexus_admin_session_logged";
      if (!sessionStorage.getItem(sessionKey)) {
        logAdminAction("login", `管理システムにログインしました (権限: ${userData.role})`);
        sessionStorage.setItem(sessionKey, "true");
      }
    };
    init();
  }, [router]);

  useEffect(() => {
    setLiveData(siteContents[activePage] || {});
  }, [activePage, siteContents]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ status: "read" }).eq("id", id);
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "read" as const } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ status: "read" })
        .eq("user_email", currentUserEmail)
        .eq("status", "unread");
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" as const })));
      showToast("すべての通知を既読にしました");
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddAllowedUser = async (email: string, role: string, displayName?: string) => {
    if (!email) return;
    if (!isValidEmail(email)) {
      showToast("有効なGmailアドレスを入力してください（ログイン照合に使用します）", "error");
      return;
    }
    if (!hasPermission("manage_subordinate_roles")) {
      showToast("操作権限がありません", "error");
      return;
    }
    if (!canManageRole(role)) {
      showToast("この役職を付与する権限がありません", "error");
      return;
    }
    const cleanEmail = normalizeEmail(email);
    const cleanDisplayName = displayName?.trim() || null;
    try {
      const defaultPerms = getDefaultPermissionsForRole(role);
      const row: Record<string, unknown> = {
        email: cleanEmail,
        role,
        permissions: defaultPerms
      };
      if (cleanDisplayName) row.display_name = cleanDisplayName;

      const { error } = await supabase.from("allowed_users").insert([row]);
      if (error) throw error;

      logAdminAction("add_allowed_user", `ユーザー「${cleanEmail}」に「${role}」権限を付与して招待しました`);
      showToast(`${cleanEmail} を追加しました`);
      fetchData(true);
    } catch (e: any) {
      showToast("追加に失敗しました。すでに登録されている可能性があります。", "error");
    }
  };

  const handleRemoveAllowedUser = async (email: string) => {
    if (!hasPermission("remove_users")) {
      showToast("操作権限がありません", "error");
      return;
    }
    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      showToast("自分自身の権限を削除することはできません", "error");
      return;
    }
    const targetUser = allowedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser && !canManageRole(targetUser.role)) {
      showToast("このユーザーの権限を削除する権限がありません", "error");
      return;
    }
    if (confirm(`本当に「${email}」のログイン許可を剥奪しますか？`)) {
      try {
        const { error } = await supabase.from("allowed_users").delete().ilike("email", normalizeEmail(email));
        if (error) throw error;

        logAdminAction("remove_allowed_user", `ユーザー「${email}」のログイン権限を剥奪しました`);
        showToast(`${email} を削除しました`);
        fetchData(true);
      } catch (e: any) {
        showToast("削除に失敗しました", "error");
      }
    }
  };

  const handleChangeUserRole = async (email: string, role: string) => {
    if (!hasPermission("manage_subordinate_roles")) {
      showToast("操作権限がありません", "error");
      return;
    }
    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      showToast("自分自身のロールは変更できません", "error");
      return;
    }
    if (!canManageRole(role)) {
      showToast("この役職に変更する権限がありません", "error");
      return;
    }
    try {
      const defaultPerms = [...getDefaultPermissionsForRole(role)];
      const { error } = await supabase
        .from("allowed_users")
        .update({ role, permissions: defaultPerms })
        .ilike("email", normalizeEmail(email));
      if (error) throw error;

      logAdminAction("change_user_role", `ユーザー「${normalizeEmail(email)}」のロールを「${role}」に変更し、デフォルト権限を適用しました`);
      showToast(`${email} の権限を変更しました`);
      fetchData(true);
    } catch (e: any) {
      showToast("権限の変更に失敗しました", "error");
    }
  };

  const handleUpdateAllowedUserPermissions = async (email: string, permissions: string[]) => {
    if (!hasPermission("manage_subordinate_roles")) {
      showToast("操作権限がありません", "error");
      return;
    }
    const targetUser = allowedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser && !canManageRole(targetUser.role)) {
      showToast("このユーザーの権限を変更する権限がありません", "error");
      return;
    }
    try {
      let updatedRole = "custom";
      for (const roleKey of CANONICAL_ROLES) {
        const defaults = ROLE_DEFAULT_PERMISSIONS[roleKey] || [];
        if (
          defaults.length === permissions.length &&
          defaults.every((p) => permissions.includes(p))
        ) {
          updatedRole = roleKey;
          break;
        }
      }

      const { error } = await supabase
        .from("allowed_users")
        .update({ permissions, role: updatedRole })
        .ilike("email", normalizeEmail(email));
      if (error) throw error;

      logAdminAction("update_user_permissions", `ユーザー「${email}」の個別権限をカスタマイズしました (決定ロール: ${updatedRole})`);
      showToast(`${email} の権限を更新しました`);
      fetchData(true);
    } catch (e: any) {
      showToast("権限の更新に失敗しました", "error");
    }
  };

  const handleUpdateRolePermissions = async (roleId: string, permissions: string[]) => {
    if (userRole !== "owner") {
      showToast("役職設定を更新する権限がありません", "error");
      return;
    }

    // role_id は "owner" / "visitor" 等の text（uuid ではない）
    const permsToSave = permissions;
    const payload = { role_id: roleId, permissions: permsToSave };

    try {
      let { error } = await supabase
        .from("role_permissions")
        .upsert([payload], { onConflict: "role_id" });

      if (error) {
        const { data: existing, error: selectError } = await supabase
          .from("role_permissions")
          .select("role_id")
          .eq("role_id", roleId)
          .maybeSingle();

        if (selectError) throw selectError;

        if (existing) {
          const { error: updateError } = await supabase
            .from("role_permissions")
            .update({ permissions: permsToSave })
            .eq("role_id", roleId);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase.from("role_permissions").insert([payload]);
          if (insertError) throw insertError;
        }
        error = null;
      }

      setRolePermissions((prev) => ({
        ...prev,
        [roleId]: [...permsToSave]
      }));
      showToast(`${roleId} のデフォルト権限を保存しました`);
    } catch (e: any) {
      console.error("role_permissions save failed:", e);
      const detail = e?.message || e?.details || e?.hint || "";
      const isUuidTypeError = /invalid input syntax for type uuid/i.test(String(detail));
      showToast(
        isUuidTypeError
          ? "役職設定の保存に失敗しました: role_id が UUID 型です。Supabase で role_id を text 型に直す SQL を実行してください。"
          : detail
            ? `役職設定の保存に失敗しました: ${detail}`
            : "役職設定の保存に失敗しました（role_permissions テーブル・RLSを確認）",
        "error"
      );
    }
  };

  const handleUpdateAllowedUserDisplayName = async (email: string, displayName: string) => {
    if (!hasPermission("manage_subordinate_roles")) {
      showToast("操作権限がありません", "error");
      return;
    }
    const cleanDisplayName = displayName.trim();
    try {
      const { error } = await supabase
        .from("allowed_users")
        .update({ display_name: cleanDisplayName || null })
        .ilike("email", normalizeEmail(email));
      if (error) throw error;

      logAdminAction(
        "update_allowed_user_display_name",
        `ユーザー「${normalizeEmail(email)}」の表示名を「${cleanDisplayName || "(未設定)"}」に変更しました`
      );
      showToast("ニックネームを更新しました");
      fetchData(true);
    } catch (e: any) {
      showToast("ニックネームの更新に失敗しました", "error");
    }
  };

  /** 誤ってニックネーム等が入った場合のみ。通常は変更しない */
  const handleFixAllowedUserEmail = async (oldEmail: string, newEmail: string) => {
    if (!hasPermission("manage_subordinate_roles")) {
      showToast("操作権限がありません", "error");
      return;
    }
    const cleanNewEmail = normalizeEmail(newEmail);
    if (!isValidEmail(cleanNewEmail)) {
      showToast("ログイン用には有効なメールアドレス（例: name@gmail.com）を入力してください", "error");
      return;
    }
    try {
      const { error } = await supabase
        .from("allowed_users")
        .update({ email: cleanNewEmail })
        .ilike("email", normalizeEmail(oldEmail));
      if (error) throw error;

      logAdminAction("fix_allowed_user_email", `ログイン用メールを「${oldEmail}」から「${cleanNewEmail}」に修正しました`);
      showToast(`ログイン用メールを ${cleanNewEmail} に修正しました`);
      fetchData(true);
    } catch (e: any) {
      showToast("変更に失敗しました。すでに登録されている可能性があります。", "error");
    }
  };

  const handleSignOut = async () => {
    logAdminAction("logout", "管理システムからサインアウトしました");
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleUpload = async (fileOrEvent: File | React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    let file: File | undefined;
    if (fileOrEvent instanceof File) {
      file = fileOrEvent;
    } else {
      file = fileOrEvent.target.files?.[0];
    }
    if (!file) return;
    setUploading(true);

    try {
      file = await compressImage(file, 1000, 0.75);
    } catch (err) {
      console.error("画像の圧縮に失敗しました:", err);
    }

    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("activity-images").upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from("activity-images").getPublicUrl(fileName);
      setUrl(data.publicUrl);
      showToast("画像をアップロードしました！");
    } else {
      showToast("画像の送信に失敗しました", "error");
    }
    setUploading(false);
  };

  const handleUpdateContentLocally = (key: string, value: string) => {
    setLiveData((prev) => ({ ...prev, [key]: value }));
  };

  const handleReloadOriginalContent = async () => {
    if (confirm("編集中の内容をすべて破棄し、最後に保存された最新のデータに戻しますか？")) {
      setLoading(true);
      await fetchData();
      showToast("最新データを読み込みました");
    }
  };

  const handleSaveAllContentChanges = async () => {
    setPublishing(true);
    try {
      const original = siteContents[activePage] || {};
      const changedKeys = Object.keys(liveData).filter((key) => liveData[key] !== original[key]);

      if (changedKeys.length === 0) {
        showToast("変更された項目がありません", "error");
        setPublishing(false);
        return;
      }

      if (!hasPermission("publish_content")) {
        for (const key of changedKeys) {
          const value = liveData[key];

          const { data: existing } = await supabase
            .from("content_proposals")
            .select("id")
            .eq("page_path", activePage)
            .eq("content_key", key)
            .eq("status", "pending")
            .limit(1);

          if (existing && existing.length > 0) {
            const { error } = await supabase
              .from("content_proposals")
              .update({ proposed_value: value, proposer_email: currentUserEmail })
              .eq("id", existing[0].id);
            if (error) throw error;
          } else {
            const { error } = await supabase.from("content_proposals").insert([
              {
                page_path: activePage,
                content_key: key,
                proposed_value: value,
                proposer_email: currentUserEmail,
                status: "pending"
              }
            ]);
            if (error) throw error;
          }
        }
        showToast("テキスト変更提案を一括送信しました！");
        await fetchData(true);
        return;
      }

      const upsertRows = changedKeys.map((key) => ({
        page_path: activePage,
        content_key: key,
        content_value: liveData[key]
      }));

      const { error } = await supabase.from("site_content").upsert(upsertRows, { onConflict: "page_path,content_key" });
      if (error) throw error;

      setSiteContents((prev) => ({
        ...prev,
        [activePage]: {
          ...(prev[activePage] || {}),
          ...liveData
        }
      }));

      logAdminAction("update_content", `${activePage} ページのテキストを変更し本番保存しました`);
      await revalidateSite();
      await fetchData(true);
      showToast("変更内容を本番に一括反映・保存しました！");
    } catch (e: any) {
      showToast("保存に失敗しました", "error");
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveActivity = async (isPublished: boolean = true) => {
    if (!hasPermission("propose_content")) {
      showToast("操作権限がありません", "error");
      return;
    }
    setPublishing(true);
    try {
      const finalPublishState = hasPermission("publish_content") ? isPublished : false;
      const finalApprovalState = hasPermission("publish_content") ? "approved" : "pending";

      const activityPayload = {
        title,
        date,
        category,
        summary,
        content,
        slug,
        image_url: imageUrl,
        has_detail: !!content,
        is_published: finalPublishState,
        approval_status: finalApprovalState
      };

      if (editingActivityId) {
        const { error } = await supabase.from("activities").update(activityPayload).eq("id", editingActivityId);
        if (error) throw error;
        logAdminAction("update_activity", `活動記録「${title}」を編集しました (承認状況: ${finalApprovalState})`);
        showToast(!hasPermission("publish_content") ? "編集の提案を送信しました！" : "活動記録を更新しました");
      } else {
        const { error } = await supabase.from("activities").insert([activityPayload]);
        if (error) throw error;
        logAdminAction("create_activity", `新規活動記録「${title}」を作成しました (承認状況: ${finalApprovalState})`);
        showToast(!hasPermission("publish_content") ? "新規作成の提案を送信しました！" : "活動記録を保存しました");
      }

      await revalidateSite();
      setTitle("");
      setImageUrl("");
      setSummary("");
      setContent("");
      setSlug("");
      setEditingActivityId(null);
      fetchData(true);
    } catch (e: any) {
      showToast("保存に失敗しました", "error");
    } finally {
      setPublishing(false);
    }
  };

  const startEditActivity = (act: any) => {
    setEditingActivityId(act.id);
    setTitle(act.title);
    setDate(act.date);
    setCategory(act.category);
    setSummary(act.summary);
    setContent(act.content || "");
    setSlug(act.slug || "");
    setImageUrl(act.image_url || "");
    showToast("記事の編集モードを開始しました");
  };

  const cancelEditActivity = () => {
    setEditingActivityId(null);
    setTitle("");
    setDate(new Date().toLocaleDateString("ja-JP").replace(/\//g, "."));
    setCategory("NEWS");
    setSummary("");
    setContent("");
    setSlug("");
    setImageUrl("");
  };

  const handleSaveMember = async () => {
    if (!hasPermission("propose_content")) {
      showToast("操作権限がありません", "error");
      return;
    }
    try {
      const finalApprovalState = hasPermission("publish_content") ? "approved" : "pending";
      const finalPublishState = hasPermission("publish_content") ? true : false;

      const memberPayload = {
        name: mName,
        role: mRole,
        affiliation: mAffiliation,
        field: mField,
        message: mMessage,
        photo_url: mPhotoUrl,
        skills,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
        approval_status: finalApprovalState,
        is_published: finalPublishState
      };

      if (editingMemberId) {
        const { error } = await supabase.from("members").update(memberPayload).eq("id", editingMemberId);
        if (error) throw error;
        logAdminAction("update_member", `メンバー「${mName}」の編集を送信しました (承認状況: ${finalApprovalState})`);
        showToast(!hasPermission("publish_content") ? "プロフィールの修正提案を送信しました！" : "メンバー情報を更新しました");
      } else {
        const { error } = await supabase.from("members").insert([{ ...memberPayload, order_index: members.length + 1 }]);
        if (error) throw error;
        logAdminAction("create_member", `メンバー「${mName}」の追加を送信しました (承認状況: ${finalApprovalState})`);
        showToast(!hasPermission("publish_content") ? "新規メンバーの登録提案を送信しました！" : "メンバーを追加しました");
      }

      await revalidateSite();
      setMName("");
      setMRole("");
      setMAffiliation("");
      setMField("");
      setMMessage("");
      setMPhotoUrl("");
      setSkills("");
      setGithubUrl("");
      setPortfolioUrl("");
      setEditingMemberId(null);
      fetchData(true);
    } catch (e: any) {
      showToast("保存に失敗しました", "error");
    }
  };

  const startEditMember = (m: any) => {
    setEditingMemberId(m.id);
    setMName(m.name);
    setMRole(m.role || "");
    setMAffiliation(m.affiliation || "");
    setMField(m.field || "");
    setMMessage(m.message || "");
    setMPhotoUrl(m.photo_url || "");
    setSkills(m.skills || "");
    setGithubUrl(m.github_url || "");
    setPortfolioUrl(m.portfolio_url || "");
    showToast("メンバー編集モードを開始しました");
  };

  const cancelEditMember = () => {
    setEditingMemberId(null);
    setMName("");
    setMRole("");
    setMAffiliation("");
    setMField("");
    setMMessage("");
    setMPhotoUrl("");
    setSkills("");
    setGithubUrl("");
    setPortfolioUrl("");
  };

  const handleMoveMember = async (index: number, direction: "up" | "down") => {
    if (!hasPermission("publish_content")) {
      showToast("順序変更を行う権限がありません", "error");
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const currentMember = members[index];
    const targetMember = members[targetIndex];

    const currentOrder = currentMember.order_index ?? index + 1;
    const targetOrder = targetMember.order_index ?? targetIndex + 1;

    const { error: err1 } = await supabase.from("members").update({ order_index: targetOrder }).eq("id", currentMember.id);
    const { error: err2 } = await supabase.from("members").update({ order_index: currentOrder }).eq("id", targetMember.id);

    if (err1 || err2) {
      showToast("順序の入れ替えに失敗しました", "error");
      return;
    }

    logAdminAction("reorder_members", `メンバーの表示順序を入れ替えました (${currentMember.name})`);
    await revalidateSite();
    fetchData(true);
    showToast("表示順序を変更しました");
  };

  const handleSaveProject = async () => {
    if (!hasPermission("propose_content")) {
      showToast("操作権限がありません", "error");
      return;
    }
    try {
      const finalApprovalState = hasPermission("publish_content") ? "approved" : "pending";
      const finalPublishState = hasPermission("publish_content") ? pStatus : "closed";

      const payload = {
        title: pTitle,
        description: pDescription,
        tech_stack: pTechStack,
        roles_needed: pRolesNeeded,
        status: finalPublishState,
        approval_status: finalApprovalState
      };

      if (editingProjectId) {
        const { error } = await supabase.from("projects").update(payload).eq("id", editingProjectId);
        if (error) throw error;
        logAdminAction("update_project", `プロジェクト「${pTitle}」の編集を送信しました (承認状況: ${finalApprovalState})`);
        showToast(!hasPermission("publish_content") ? "プロジェクトの修正提案を送信しました！" : "プロジェクトを更新しました");
      } else {
        const { error } = await supabase.from("projects").insert([{ ...payload, order_index: projects.length + 1 }]);
        if (error) throw error;
        logAdminAction("create_project", `新規プロジェクト「${pTitle}」の登録を送信しました (承認状況: ${finalApprovalState})`);
        showToast(!hasPermission("publish_content") ? "新規プロジェクトの登録提案を送信しました！" : "プロジェクトを登録しました！");
      }

      await revalidateSite();
      setPTitle("");
      setPDescription("");
      setPTechStack("");
      setPRolesNeeded("");
      setPStatus("open");
      setEditingProjectId(null);
      fetchData(true);
    } catch (e: any) {
      showToast("保存に失敗しました", "error");
    }
  };

  const startEditProject = (proj: any) => {
    setEditingProjectId(proj.id);
    setPTitle(proj.title);
    setPDescription(proj.description);
    setPTechStack(proj.tech_stack || "");
    setPRolesNeeded(proj.roles_needed || "");
    setPStatus(proj.status || "open");
    showToast("プロジェクト編集モードを開始しました");
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
    setPTitle("");
    setPDescription("");
    setPTechStack("");
    setPRolesNeeded("");
    setPStatus("open");
  };

  const handleMoveProject = async (index: number, direction: "up" | "down") => {
    if (!hasPermission("publish_content")) {
      showToast("表示順序の変更権限がありません", "error");
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const currentProj = projects[index];
    const targetProj = projects[targetIndex];

    const currentOrder = currentProj.order_index ?? index + 1;
    const targetOrder = targetProj.order_index ?? targetIndex + 1;

    const { error: err1 } = await supabase.from("projects").update({ order_index: targetOrder }).eq("id", currentProj.id);
    const { error: err2 } = await supabase.from("projects").update({ order_index: currentOrder }).eq("id", targetProj.id);

    if (err1 || err2) {
      showToast("順序の入れ替えに失敗しました", "error");
      return;
    }

    logAdminAction("reorder_projects", `プロジェクトの表示順序を入れ替えました (${currentProj.title})`);
    await revalidateSite();
    fetchData(true);
    showToast("表示順序を変更しました");
  };

  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    if (!hasPermission("reply_inquiries")) {
      showToast("お問合せステータスの変更権限がありません", "error");
      return;
    }
    try {
      const targetInquiry = inquiries.find((i) => i.id === id);
      const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
      if (error) throw error;

      logAdminAction("update_inquiry", `お問合せ (送信者: ${targetInquiry?.name}) のステータスを「${status}」に変更しました`);
      fetchData(true);
      showToast("対応ステータスを更新しました");
    } catch (e: any) {
      showToast("ステータスの更新に失敗しました", "error");
    }
  };

  const handleSaveFaq = async () => {
    if (!hasPermission("propose_content")) {
      showToast("操作権限がありません", "error");
      return;
    }
    try {
      const finalApprovalState = hasPermission("publish_content") ? "approved" : "pending";
      const finalPublishState = hasPermission("publish_content") ? true : false;

      if (editingFaqId) {
        const { error } = await supabase
          .from("faqs")
          .update({
            question: fQuestion,
            answer: fAnswer,
            approval_status: finalApprovalState,
            is_published: finalPublishState
          })
          .eq("id", editingFaqId);
        if (error) throw error;
        logAdminAction("update_faq", `FAQの編集提案を送信しました (承認状況: ${finalApprovalState})`);
        showToast(!hasPermission("publish_content") ? "FAQの修正提案を送信しました！" : "FAQを更新しました");
      } else {
        const { error } = await supabase.from("faqs").insert([
          {
            question: fQuestion,
            answer: fAnswer,
            order_index: faqs.length + 1,
            approval_status: finalApprovalState,
            is_published: finalPublishState
          }
        ]);
        if (error) throw error;
        logAdminAction("create_faq", `新規FAQの追加提案を送信しました (承認状況: ${finalApprovalState})`);
        showToast(!hasPermission("publish_content") ? "新規FAQの登録提案を送信しました！" : "FAQを追加しました");
      }
      await revalidateSite();
      setFQuestion("");
      setFAnswer("");
      setEditingFaqId(null);
      fetchData(true);
    } catch (e: any) {
      showToast("保存に失敗しました", "error");
    }
  };

  const startEditFaq = (faq: any) => {
    setEditingFaqId(faq.id);
    setFQuestion(faq.question);
    setFAnswer(faq.answer);
    showToast("FAQ編集モードを開始しました");
  };

  const cancelEditFaq = () => {
    setEditingFaqId(null);
    setFQuestion("");
    setFAnswer("");
  };

  const handleInsertDefaultFaqs = async () => {
    if (!hasPermission("publish_content")) {
      showToast("デフォルトFAQの自動投入権限がありません", "error");
      return;
    }
    try {
      const defaults = [
        {
          question: "Nexus とは何ですか？",
          answer:
            "意欲ある学生たちが集まり、専門性や興味を持ち寄ってつながる共創型のコミュニティです。Slackでの議論やプロジェクト活動を行っています。",
          order_index: 1
        },
        {
          question: "参加費用はかかりますか？",
          answer: "完全無料です。学生のコミュニティであるため、どなたでも一切の費用をかけずに参加いただけます。",
          order_index: 2
        },
        {
          question: "誰でも参加できますか？",
          answer:
            "高校生、専門学校生、大学生、大学院生など、学びやものづくりに意欲のあるすべての学生の方々が参加対象です。",
          order_index: 3
        }
      ];
      const { error } = await supabase.from("faqs").insert(defaults);
      if (error) throw error;
      logAdminAction("seed_faqs", "初期テンプレートFAQを投入しました");
      await revalidateSite();
      fetchData(true);
      showToast("初期データを投入しました！");
    } catch (e: any) {
      showToast("データの投入に失敗しました", "error");
    }
  };

  const handleTogglePublish = async (table: string, id: string, isPublished: boolean) => {
    if (!hasPermission("publish_content")) {
      showToast("公開ステータスの直接変更権限がありません", "error");
      return;
    }

    try {
      const { error } = await supabase.from(table).update({ is_published: isPublished }).eq("id", id);
      if (error) throw error;

      logAdminAction("toggle_publish", `${table} (ID: ${id}) の公開状態を ${isPublished ? "公開" : "非公開"} にしました`);
      await revalidateSite();
      fetchData(true);
      showToast(isPublished ? "公開状態にしました" : "非公開にしました");
    } catch (e: any) {
      showToast("更新に失敗しました", "error");
    }
  };

  const handleDelete = async (table: string, id: string, bypassConfirm = false) => {
    if (table === "inquiries") {
      if (!hasPermission("delete_inquiries")) {
        showToast("お問合せの削除権限がありません", "error");
        return;
      }
      if (bypassConfirm || confirm("お問合せ履歴を永久に消去しますか？")) {
        try {
          const { error } = await supabase.from(table).delete().eq("id", id);
          if (error) throw error;
          logAdminAction("delete_row", `お問合せ (ID: ${id}) を完全に削除しました`);
          fetchData(true);
          showToast("削除しました");
        } catch (e) {
          showToast("削除に失敗しました", "error");
        }
      }
      return;
    }

    if (!hasPermission("propose_content")) {
      showToast("削除権限がありません", "error");
      return;
    }

    if (confirm("本当に削除しますか？\n(データは一旦ゴミ箱へ移動され、後から安全に復元可能です)")) {
      try {
        const { error } = await supabase.from(table).update({ is_deleted: true }).eq("id", id);
        if (error) throw error;

        logAdminAction("soft_delete", `${table} のアイテム (ID: ${id}) をゴミ箱に移動しました`);
        await revalidateSite();
        fetchData(true);
        showToast("ゴミ箱へ移動しました");
      } catch (e: any) {
        showToast("削除に失敗しました", "error");
      }
    }
  };

  const handleRestoreItem = async (table: string, id: string) => {
    if (!hasPermission("restore_trash")) {
      showToast("ゴミ箱操作権限がありません", "error");
      return;
    }
    try {
      const { error } = await supabase.from(table).update({ is_deleted: false }).eq("id", id);
      if (error) throw error;

      logAdminAction("restore_item", `${table} のアイテム (ID: ${id}) をゴミ箱から復元しました`);
      await revalidateSite();
      fetchData(true);
      showToast("データを復元しました！");
    } catch (e) {
      showToast("復元に失敗しました", "error");
    }
  };

  const handlePermanentDelete = async (table: string, id: string) => {
    if (!hasPermission("empty_trash")) {
      showToast("永久消去権限がありません", "error");
      return;
    }
    if (confirm("🚨警告: この操作は取り消せません。\nこのデータを完全に消去しますか？")) {
      try {
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw error;

        logAdminAction("hard_delete", `${table} のアイテム (ID: ${id}) を完全に消去しました`);
        await revalidateSite();
        fetchData(true);
        showToast("データを永久消去しました");
      } catch (e) {
        showToast("消去に失敗しました", "error");
      }
    }
  };

  const handleApproveProposal = async (table: string, id: string) => {
    if (!hasPermission("publish_content")) {
      showToast("承認を行う権限がありません", "error");
      return;
    }
    try {
      if (table === "content_proposals") {
        const { data: prop, error: fetchErr } = await supabase
          .from("content_proposals")
          .select("*")
          .eq("id", id)
          .single();
        if (fetchErr || !prop) throw fetchErr || new Error("提案が見つかりませんでした");

        const { error: upsertErr } = await supabase.from("site_content").upsert(
          { page_path: prop.page_path, content_key: prop.content_key, content_value: prop.proposed_value },
          { onConflict: "page_path,content_key" }
        );
        if (upsertErr) throw upsertErr;

        const { error: updateErr } = await supabase.from("content_proposals").update({ status: "approved" }).eq("id", id);
        if (updateErr) throw updateErr;

        if (prop.proposer_email) {
          await supabase.from("notifications").insert([
            {
              user_email: prop.proposer_email,
              title: "🟢 変更提案が承認されました",
              message: `${prop.page_path.toUpperCase()}ページの「${prop.content_key}」の変更提案が承認され、本番サイトに反映されました！`
            }
          ]);
        }

        logAdminAction(
          "approve_proposal",
          `一般テキスト変更提案 (ページ: ${prop.page_path}, キー: ${prop.content_key}) を承認し本番反映しました`
        );
        await revalidateSite();
        fetchData(true);
        showToast("テキスト変更を承認・公開しました！");
      } else {
        const { data: prop } = await supabase.from(table).select("*").eq("id", id).single();

        const { error } = await supabase.from(table).update({ approval_status: "approved", is_published: true }).eq("id", id);
        if (error) throw error;

        if (prop && prop.created_by) {
          await supabase.from("notifications").insert([
            {
              user_email: prop.created_by,
              title: "🟢 作成提案が承認されました",
              message: `${table === "activities" ? "活動記録" : "コンテンツ"}の申請が承認され、本番サイトに公開されました！`
            }
          ]);
        }

        logAdminAction("approve_proposal", `${table} の提案 (ID: ${id}) を承認し本番公開しました`);
        await revalidateSite();
        fetchData(true);
        showToast("提案を承認・公開しました！");
      }
    } catch (e) {
      showToast("承認に失敗しました", "error");
    }
  };

  const handleRejectProposal = async (table: string, id: string) => {
    if (!hasPermission("publish_content")) {
      showToast("却下を行う権限がありません", "error");
      return;
    }
    if (confirm("この提案を却下して削除しますか？")) {
      try {
        if (table === "content_proposals") {
          const { data: prop } = await supabase.from("content_proposals").select("*").eq("id", id).single();

          const { error } = await supabase.from("content_proposals").delete().eq("id", id);
          if (error) throw error;

          if (prop && prop.proposer_email) {
            await supabase.from("notifications").insert([
              {
                user_email: prop.proposer_email,
                title: "🔴 変更提案が却下されました",
                message: `${prop.page_path.toUpperCase()}ページの「${prop.content_key}」の変更提案は却下されました。`
              }
            ]);
          }

          logAdminAction("reject_proposal", `テキスト変更提案 (ID: ${id}) を却下しました`);
        } else {
          const { data: prop } = await supabase.from(table).select("*").eq("id", id).single();
          const { error } = await supabase.from(table).delete().eq("id", id);
          if (error) throw error;

          if (prop && prop.created_by) {
            await supabase.from("notifications").insert([
              {
                user_email: prop.created_by,
                title: "🔴 作成提案が却下されました",
                message: `${table === "activities" ? "活動記録" : "コンテンツ"}の申請は却下されました。`
              }
            ]);
          }

          logAdminAction("reject_proposal", `${table} の提案 (ID: ${id}) を却下しました`);
        }
        fetchData(true);
        showToast("提案を却下・削除しました");
      } catch (e) {
        showToast("却下処理に失敗しました", "error");
      }
    }
  };

  return {
    activeTab,
    setActiveTab,
    activePage,
    setActivePage,
    loading,
    publishing,
    uploading,
    errorMsg,
    isAuthenticated,
    userRole,
    currentUserEmail,
    allowedUsers,
    rolePermissions,
    hasPermission,
    isHeaderCollapsed,
    setIsHeaderCollapsed,
    pendingContentProposals,
    notifications,
    showNotifications,
    setShowNotifications,
    toast,
    showToast,
    liveData,
    activities,
    members,
    faqs,
    projects,
    inquiries,
    deletedActivities,
    deletedMembers,
    deletedProjects,
    deletedFaqs,
    pendingActivities,
    pendingMembers,
    pendingProjects,
    pendingFaqs,
    analyticsData,
    auditLogs,
    form: {
      activities: { title, setTitle, date, setDate, category, setCategory, summary, setSummary, content, setContent, slug, setSlug, imageUrl, setImageUrl, editingActivityId, setEditingActivityId },
      members: { mName, setMName, mRole, setMRole, mAffiliation, setMAffiliation, mField, setMField, mMessage, setMMessage, mPhotoUrl, setMPhotoUrl, skills, setSkills, githubUrl, setGithubUrl, portfolioUrl, setPortfolioUrl, editingMemberId, setEditingMemberId },
      projects: { pTitle, setPTitle, pDescription, setPDescription, pTechStack, setPTechStack, pRolesNeeded, setPRolesNeeded, pStatus, setPStatus, editingProjectId, setEditingProjectId },
      faqs: { fQuestion, setFQuestion, fAnswer, setFAnswer, editingFaqId, setEditingFaqId }
    },
    actions: {
      fetchData,
      handleMarkAsRead,
      handleMarkAllAsRead,
      handleAddAllowedUser,
      handleRemoveAllowedUser,
      handleChangeUserRole,
      handleUpdateAllowedUserPermissions,
      handleUpdateAllowedUserDisplayName,
      handleFixAllowedUserEmail,
      handleUpdateRolePermissions,
      handleSignOut,
      handleUpload,
      handleUpdateContentLocally,
      handleReloadOriginalContent,
      handleSaveAllContentChanges,
      handleSaveActivity,
      startEditActivity,
      cancelEditActivity,
      handleSaveMember,
      startEditMember,
      cancelEditMember,
      handleMoveMember,
      handleSaveProject,
      startEditProject,
      cancelEditProject,
      handleMoveProject,
      handleUpdateInquiryStatus,
      handleSaveFaq,
      startEditFaq,
      cancelEditFaq,
      handleInsertDefaultFaqs,
      handleTogglePublish,
      handleDelete,
      handleRestoreItem,
      handlePermanentDelete,
      handleApproveProposal,
      handleRejectProposal
    }
  };
}
