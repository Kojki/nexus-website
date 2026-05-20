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
}

export interface AuditLogItem {
  id: string;
  actor_email: string;
  action: string;
  details: string;
  created_at: string;
}

// 🔑 ロールとデフォルト権限のマトリクス
export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  owner: [
    "manage_users",
    "manage_bulletin",
    "view_analytics",
    "edit_content",
    "publish_content",
    "manage_activities",
    "manage_members",
    "manage_projects",
    "manage_faqs",
    "manage_inquiries",
    "manage_trash"
  ],
  editor: [
    "view_analytics",
    "edit_content",
    "publish_content",
    "manage_activities",
    "manage_members",
    "manage_projects",
    "manage_faqs",
    "manage_inquiries",
    "manage_trash"
  ],
  public_relations: [
    "view_analytics",
    "edit_content",
    "publish_content",
    "manage_activities",
    "manage_members",
    "manage_faqs"
  ],
  project_manager: [
    "view_analytics",
    "edit_content",
    "publish_content",
    "manage_members",
    "manage_projects"
  ],
  proposer: [
    "edit_content",
    "manage_activities",
    "manage_members",
    "manage_projects",
    "manage_faqs"
  ],
  custom: []
};

// 🔑 日本語の権限表示ラベルマッピング
export const PERMISSION_LABELS: Record<string, { label: string; desc: string }> = {
  manage_users: { label: "👥 ユーザー招待・権限管理", desc: "他の管理者の招待・削除・権限変更" },
  manage_bulletin: { label: "📌 伝言板編集", desc: "運営伝言板のピン留め・更新" },
  view_analytics: { label: "📊 システム・解析閲覧", desc: "システム情報、アクセス解析、セキュリティ監査ログの閲覧" },
  edit_content: { label: "📝 文言の下書き", desc: "サイト文言の編集（提案・下書き保存）" },
  publish_content: { label: "🚀 文言の本番公開", desc: "サイト文言の直接本番保存、他人の提案の承認・却下" },
  manage_activities: { label: "✍️ 活動記録管理", desc: "活動記録の作成・編集・削除・公開" },
  manage_members: { label: "👤 メンバー情報管理", desc: "メンバーの追加・編集・並び替え・削除・公開" },
  manage_projects: { label: "🚀 プロジェクト管理", desc: "共創プロジェクトの追加・編集・並び替え・削除・公開" },
  manage_faqs: { label: "❓ FAQ管理", desc: "FAQの追加・編集・削除・公開" },
  manage_inquiries: { label: "📩 問い合わせ管理", desc: "問い合わせや参加申請のステータス変更・削除" },
  manage_trash: { label: "🗑️ ゴミ箱・リカバリー", desc: "ゴミ箱内のデータの復元や、永久消去" }
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

      const email = session.user.email || "";
      setCurrentUserEmail(email);

      const { data: userData, error: userError } = await supabase
        .from("allowed_users")
        .select("role, permissions")
        .eq("email", email)
        .single();

      if (userError || !userData) {
        alert(`アクセス権限がありません。\n登録メールアドレス: ${email}\n管理者に追加を依頼してください。`);
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      setIsAuthenticated(true);
      setUserRole(userData.role);

      const activePerms = userData.permissions || ROLE_DEFAULT_PERMISSIONS[userData.role] || [];
      setUserPermissions(activePerms);

      const { data: nData } = await supabase
        .from("notifications")
        .select("*")
        .eq("email", email)
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

  const handleAddAllowedUser = async (email: string, role: string) => {
    if (!email) return;
    if (!hasPermission("manage_users")) {
      showToast("操作権限がありません", "error");
      return;
    }
    const cleanEmail = email.toLowerCase().trim();
    try {
      const defaultPerms = ROLE_DEFAULT_PERMISSIONS[role] || [];
      const { error } = await supabase.from("allowed_users").insert([
        {
          email: cleanEmail,
          role,
          permissions: defaultPerms
        }
      ]);
      if (error) throw error;

      logAdminAction("add_allowed_user", `ユーザー「${cleanEmail}」に「${role}」権限を付与して招待しました`);
      showToast(`${cleanEmail} を追加しました`);
      fetchData(true);
    } catch (e: any) {
      showToast("追加に失敗しました。すでに登録されている可能性があります。", "error");
    }
  };

  const handleRemoveAllowedUser = async (email: string) => {
    if (!hasPermission("manage_users")) {
      showToast("操作権限がありません", "error");
      return;
    }
    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      showToast("自分自身の権限を削除することはできません", "error");
      return;
    }
    if (confirm(`本当に「${email}」のログイン許可を剥奪しますか？`)) {
      try {
        const { error } = await supabase.from("allowed_users").delete().eq("email", email);
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
    if (!hasPermission("manage_users")) {
      showToast("操作権限がありません", "error");
      return;
    }
    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      showToast("自分自身のロールは変更できません", "error");
      return;
    }
    try {
      const defaultPerms = ROLE_DEFAULT_PERMISSIONS[role] || [];
      const { error } = await supabase
        .from("allowed_users")
        .update({ role, permissions: defaultPerms })
        .eq("email", email);
      if (error) throw error;

      logAdminAction("change_user_role", `ユーザー「${email}」のロールを「${role}」に変更し、デフォルト権限を適用しました`);
      showToast(`${email} の権限を変更しました`);
      fetchData(true);
    } catch (e: any) {
      showToast("権限の変更に失敗しました", "error");
    }
  };

  const handleUpdateAllowedUserPermissions = async (email: string, permissions: string[]) => {
    if (!hasPermission("manage_users")) {
      showToast("操作権限がありません", "error");
      return;
    }
    try {
      let updatedRole = "custom";
      for (const [roleKey, perms] of Object.entries(ROLE_DEFAULT_PERMISSIONS)) {
        if (roleKey !== "custom" && perms.length === permissions.length && perms.every((p) => permissions.includes(p))) {
          updatedRole = roleKey;
          break;
        }
      }

      const { error } = await supabase
        .from("allowed_users")
        .update({ permissions, role: updatedRole })
        .eq("email", email);
      if (error) throw error;

      logAdminAction("update_user_permissions", `ユーザー「${email}」の個別権限をカスタマイズしました (決定ロール: ${updatedRole})`);
      showToast(`${email} の権限を更新しました`);
      fetchData(true);
    } catch (e: any) {
      showToast("権限の更新に失敗しました", "error");
    }
  };

  const handleUpdateAllowedUserEmail = async (oldEmail: string, newEmail: string) => {
    if (!hasPermission("manage_users")) {
      showToast("操作権限がありません", "error");
      return;
    }
    const cleanNewEmail = newEmail.toLowerCase().trim();
    if (!cleanNewEmail) return;
    try {
      const { error } = await supabase.from("allowed_users").update({ email: cleanNewEmail }).eq("email", oldEmail);
      if (error) throw error;

      logAdminAction("update_allowed_user_email", `登録メールアドレスを「${oldEmail}」から「${cleanNewEmail}」に変更しました`);
      showToast(`メールアドレスを ${cleanNewEmail} に変更しました`);
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
    if (!hasPermission("manage_activities")) {
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
    if (!hasPermission("manage_members")) {
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
    if (!hasPermission("manage_members") || !hasPermission("publish_content")) {
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
    if (!hasPermission("manage_projects")) {
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
    if (!hasPermission("manage_projects") || !hasPermission("publish_content")) {
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
    if (!hasPermission("manage_inquiries")) {
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
    if (!hasPermission("manage_faqs")) {
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
    if (!hasPermission("manage_faqs") || !hasPermission("publish_content")) {
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
    let pKey = "";
    if (table === "activities") pKey = "manage_activities";
    else if (table === "members") pKey = "manage_members";
    else if (table === "faqs") pKey = "manage_faqs";
    else if (table === "projects") pKey = "manage_projects";

    if (!hasPermission(pKey) || !hasPermission("publish_content")) {
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
      if (!hasPermission("manage_inquiries")) {
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

    let pKey = "";
    if (table === "activities") pKey = "manage_activities";
    else if (table === "members") pKey = "manage_members";
    else if (table === "faqs") pKey = "manage_faqs";
    else if (table === "projects") pKey = "manage_projects";

    if (!hasPermission(pKey)) {
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
    if (!hasPermission("manage_trash")) {
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
    if (!hasPermission("manage_trash")) {
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
      handleUpdateAllowedUserEmail,
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
