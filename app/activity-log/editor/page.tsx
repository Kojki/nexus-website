"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { revalidateSite } from "@/app/actions";
import { compressImage } from "@/lib/image";
import { logAdminAction } from "@/lib/analytics"; 

import { Tab, PagePath, S, NavBtn } from "./components/SharedUI";
import { PreviewPanel } from "./components/PreviewPanel";
import { ContentTab, ActivityTab, MembersTab, FaqTab, InquiriesTab, ProjectsTab, ApplicationsTab } from "./components/EditorTabs";

import { SystemDashboardTab } from "./components/SystemDashboardTab";

export default function NexusStudioPro() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<any>("content"); 
  const [activePage, setActivePage] = useState<PagePath>("home");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // 🔑 ログイン権限ステート (owner | editor | proposer)
  const [userRole, setUserRole] = useState<"owner" | "editor" | "proposer" | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [allowedUsers, setAllowedUsers] = useState<any[]>([]);

  // 📱 モバイル用ヘッダー開閉ステート（初期状態：折りたたむ）
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);

  // 📬 届いたテキスト変更提案用ステート
  const [pendingContentProposals, setPendingContentProposals] = useState<any[]>([]);

  // 🔔 通知センターステート
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [siteContents, setSiteContents] = useState<Record<string, Record<string, string>>>({});
  const [liveData, setLiveData] = useState<Record<string, string>>({});
  
  const [activities, setActivities] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]); 

  // 🗑️ ゴミ箱用ステート
  const [deletedActivities, setDeletedActivities] = useState<any[]>([]);
  const [deletedMembers, setDeletedMembers] = useState<any[]>([]);
  const [deletedProjects, setDeletedProjects] = useState<any[]>([]);
  const [deletedFaqs, setDeletedFaqs] = useState<any[]>([]);

  // 📬 承認待ち（提案中）データ用ステート
  const [pendingActivities, setPendingActivities] = useState<any[]>([]);
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  const [pendingFaqs, setPendingFaqs] = useState<any[]>([]);

  const [analyticsData, setAnalyticsData] = useState<{ totalViews: number; todayViews: number; popularPages: any[] }>({ totalViews: 0, todayViews: 0, popularPages: [] });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // 入力フォーム用ステート
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString('ja-JP').replace(/\//g, '.'));
  const [category, setCategory] = useState("NEWS");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mName, setMName] = useState("");
  const [mRole, setMRole] = useState("");
  const [mAffiliation, setMAffiliation] = useState("");
  const [mField, setMField] = useState("");
  const [mMessage, setMMessage] = useState("");
  const [mPhotoUrl, setMPhotoUrl] = useState("");
  const [fQuestion, setFQuestion] = useState("");
  const [fAnswer, setFAnswer] = useState("");

  // プロジェクト管理用ステート
  const [pTitle, setPTitle] = useState("");
  const [pDescription, setPDescription] = useState("");
  const [pTechStack, setPTechStack] = useState("");
  const [pRolesNeeded, setPRolesNeeded] = useState("");
  const [pStatus, setPStatus] = useState("open");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // メンバープロフィール拡張ステート
  const [skills, setSkills] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  // 🔄 silent 引数を追加し、バックグラウンドでのデータ更新をサポート
  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const { data: cData, error: cError } = await supabase.from('site_content').select('*');
      if (cError) throw cError;
      const cMap: any = { home: {}, about: {}, en: {}, guidelines: {}, privacy: {} };
      cData?.forEach(item => { if (cMap[item.page_path]) cMap[item.page_path][item.content_key] = item.content_value; });
      setSiteContents(cMap);
      setLiveData(cMap[activePage] || {});

      const { data: aData } = await supabase.from('activities').select('*').eq('is_deleted', false).eq('approval_status', 'approved').order('created_at', { ascending: false });
      setActivities(aData || []);

      const { data: mData } = await supabase.from('members').select('*').eq('is_deleted', false).eq('approval_status', 'approved').order('order_index', { ascending: true });
      setMembers(mData || []);

      const { data: fData } = await supabase.from('faqs').select('*').eq('is_deleted', false).eq('approval_status', 'approved').order('order_index');
      setFaqs(fData || []);

      const { data: pData } = await supabase.from('projects').select('*').eq('is_deleted', false).eq('approval_status', 'approved').order('order_index', { ascending: true });
      setProjects(pData || []);

      const { data: delA } = await supabase.from('activities').select('*').eq('is_deleted', true);
      setDeletedActivities(delA || []);

      const { data: delM } = await supabase.from('members').select('*').eq('is_deleted', true);
      setDeletedMembers(delM || []);

      const { data: delF } = await supabase.from('faqs').select('*').eq('is_deleted', true);
      setDeletedFaqs(delF || []);

      const { data: delP } = await supabase.from('projects').select('*').eq('is_deleted', true);
      setDeletedProjects(delP || []);

      const { data: pendA } = await supabase.from('activities').select('*').eq('approval_status', 'pending');
      setPendingActivities(pendA || []);

      const { data: pendM } = await supabase.from('members').select('*').eq('approval_status', 'pending');
      setPendingMembers(pendM || []);

      const { data: pendP } = await supabase.from('projects').select('*').eq('approval_status', 'pending');
      setPendingProjects(pendP || []);

      const { data: pendF } = await supabase.from('faqs').select('*').eq('approval_status', 'pending');
      setPendingFaqs(pendF || []);

      const { data: iData } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      console.log("【デバッグ】取得されたお問い合わせ一覧:", iData);
      setInquiries(iData || []);

      const { data: pvData } = await supabase.from('page_views').select('*');
      if (pvData) {
        const total = pvData.reduce((acc, curr) => acc + (curr.views || 0), 0);
        const todayStr = new Date().toISOString().split('T')[0];
        const today = pvData.filter(d => d.viewed_at === todayStr).reduce((acc, curr) => acc + (curr.views || 0), 0);
        
        const pathViews: Record<string, number> = {};
        pvData.forEach(d => {
          pathViews[d.page_path] = (pathViews[d.page_path] || 0) + (d.views || 0);
        });
        const popular = Object.keys(pathViews).map(p => ({ path: p, views: pathViews[p] })).sort((a,b) => b.views - a.views);

        setAnalyticsData({ totalViews: total, todayViews: today, popularPages: popular });
      }

      const { data: logs } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20);
      setAuditLogs(logs || []);

      const { data: allowedList } = await supabase.from('allowed_users').select('*').order('email');
      setAllowedUsers(allowedList || []);

      const { data: pendC } = await supabase.from('content_proposals').select('*').eq('status', 'pending').order('created_at', { ascending: false });
      setPendingContentProposals(pendC || []);

      // 🔔 通知ベルデータの取得
      if (currentUserEmail) {
        const { data: nData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_email', currentUserEmail)
          .order('created_at', { ascending: false });
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      
      const email = session.user.email || "";
      setCurrentUserEmail(email);

      const { data: userData, error: userError } = await supabase
        .from('allowed_users')
        .select('role')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        alert(`アクセス権限がありません。\n登録メールアドレス: ${email}\n管理者に追加を依頼してください。`);
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      setIsAuthenticated(true);
      setUserRole(userData.role);
      
      // メールアドレスが取得できている状態で初回のデータフェッチを実行
      const { data: nData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false });
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

  // 🔔 通知の既読処理
  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
    } catch (e) {
      console.error(e);
    }
  };

  // 🔔 通知の一括既読処理
  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('user_email', currentUserEmail)
        .eq('status', 'unread');
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
      showToast("すべての通知を既読にしました");
    } catch (e) {
      console.error(e);
    }
  };

  // 🔑 ログイン許可リストの操作ハンドラー
  const handleAddAllowedUser = async (email: string, role: string) => {
    if (!email) return;
    if (userRole !== "owner") {
      showToast("操作権限がありません", "error");
      return;
    }
    const cleanEmail = email.toLowerCase().trim();
    try {
      const { error } = await supabase.from('allowed_users').insert([{ email: cleanEmail, role }]);
      if (error) throw error;
      
      logAdminAction("add_allowed_user", `ユーザー「${cleanEmail}」に「${role}」権限を付与してログインを許可しました`);
      showToast(`${cleanEmail} を追加しました`);
      fetchData(true);
    } catch (e: any) {
      showToast("追加に失敗しました。すでに登録されている可能性があります。", "error");
    }
  };

  const handleRemoveAllowedUser = async (email: string) => {
    if (userRole !== "owner") {
      showToast("操作権限がありません", "error");
      return;
    }
    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      showToast("自分自身の権限を削除することはできません", "error");
      return;
    }
    if (confirm(`本当に「${email}」のログイン許可を剥奪しますか？`)) {
      try {
        const { error } = await supabase.from('allowed_users').delete().eq('email', email);
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
    if (userRole !== "owner") {
      showToast("操作権限がありません", "error");
      return;
    }
    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      showToast("自分自身のロールは変更できません", "error");
      return;
    }
    try {
      const { error } = await supabase.from('allowed_users').update({ role }).eq('email', email);
      if (error) throw error;

      logAdminAction("change_user_role", `ユーザー「${email}」のロールを「${role}」に変更しました`);
      showToast(`${email} の権限を変更しました`);
      fetchData(true);
    } catch (e: any) {
      showToast("権限の変更に失敗しました", "error");
    }
  };

  const handleUpdateAllowedUserEmail = async (oldEmail: string, newEmail: string) => {
    if (userRole !== "owner") {
      showToast("操作権限がありません", "error");
      return;
    }
    const cleanNewEmail = newEmail.toLowerCase().trim();
    if (!cleanNewEmail) return;
    try {
      const { error } = await supabase
        .from('allowed_users')
        .update({ email: cleanNewEmail })
        .eq('email', oldEmail);
      if (error) throw error;

      logAdminAction("update_allowed_user_email", `登録メールアドレスを「${oldEmail}」から「${cleanNewEmail}」に変更しました`);
      showToast(`メールアドレスを ${cleanNewEmail} に変更しました`);
      fetchData(true);
    } catch (e: any) {
      showToast("変更に失敗しました。すでに登録されている可能性があります。", "error");
    }
  };

  // 画像アップローダー
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
    const { error } = await supabase.storage.from('activity-images').upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from('activity-images').getPublicUrl(fileName);
      setUrl(data.publicUrl);
      showToast("画像をアップロードしました！");
    } else {
      showToast("画像の送信に失敗しました", "error");
    }
    setUploading(false);
  };

  // 🌐 キー入力時は React ローカルのステートだけを高速更新（DBアクセスしない ＝ 超快適に入力可能）
  const handleUpdateContentLocally = (key: string, value: string) => {
    setLiveData(prev => ({ ...prev, [key]: value }));
  };

  // 🔄 ご要望の「最新DB情報への同期・リセット」ボタン用ハンドラー
  const handleReloadOriginalContent = async () => {
    if (confirm("編集中の内容をすべて破棄し、最後に保存された最新のデータに戻しますか？")) {
      setLoading(true);
      await fetchData();
      showToast("最新データを読み込みました");
    }
  };

  // 💾 変更内容の「一括本番公開保存 / 提案一括送信」処理
  const handleSaveAllContentChanges = async () => {
    setPublishing(true);
    try {
      const original = siteContents[activePage] || {};
      const changedKeys = Object.keys(liveData).filter(key => liveData[key] !== original[key]);

      if (changedKeys.length === 0) {
        showToast("変更された項目がありません", "error");
        setPublishing(false);
        return;
      }

      if (userRole === "proposer") {
        for (const key of changedKeys) {
          const value = liveData[key];
          
          const { data: existing } = await supabase
            .from('content_proposals')
            .select('id')
            .eq('page_path', activePage)
            .eq('content_key', key)
            .eq('status', 'pending')
            .limit(1);

          if (existing && existing.length > 0) {
            const { error } = await supabase
              .from('content_proposals')
              .update({ proposed_value: value, proposer_email: currentUserEmail })
              .eq('id', existing[0].id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('content_proposals')
              .insert([{
                page_path: activePage,
                content_key: key,
                proposed_value: value,
                proposer_email: currentUserEmail,
                status: 'pending'
              }]);
            if (error) throw error;
          }
        }
        showToast("テキスト変更提案を一括送信しました！");
        await fetchData(true);
        return;
      }

      const upsertRows = changedKeys.map(key => ({
        page_path: activePage,
        content_key: key,
        content_value: liveData[key]
      }));

      const { error } = await supabase.from('site_content').upsert(
        upsertRows,
        { onConflict: 'page_path,content_key' }
      );
      if (error) throw error;

      setSiteContents(prev => ({
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

  // 活動記録の保存
  const handleSaveActivity = async (isPublished: boolean = true) => {
    setPublishing(true);
    try {
      const finalPublishState = userRole === "proposer" ? false : isPublished;
      const finalApprovalState = userRole === "proposer" ? "pending" : "approved";

      const activityPayload = {
        title, date, category, summary, content, slug, image_url: imageUrl, 
        has_detail: !!content, 
        is_published: finalPublishState,
        approval_status: finalApprovalState
      };

      if (editingActivityId) {
        const { error } = await supabase.from('activities').update(activityPayload).eq('id', editingActivityId);
        if (error) throw error;
        logAdminAction("update_activity", `活動記録「${title}」を編集しました (承認状況: ${finalApprovalState})`);
        showToast(userRole === "proposer" ? "編集の提案を送信しました！" : "活動記録を更新しました");
      } else {
        const { error } = await supabase.from('activities').insert([activityPayload]);
        if (error) throw error;
        logAdminAction("create_activity", `新規活動記録「${title}」を作成しました (承認状況: ${finalApprovalState})`);
        showToast(userRole === "proposer" ? "新規作成の提案を送信しました！" : "活動記録を保存しました");
      }

      await revalidateSite();
      setTitle(""); setImageUrl(""); setSummary(""); setContent(""); setSlug(""); setEditingActivityId(null);
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
    setDate(new Date().toLocaleDateString('ja-JP').replace(/\//g, '.'));
    setCategory("NEWS");
    setSummary("");
    setContent("");
    setSlug("");
    setImageUrl("");
  };

  // メンバーの保存
  const handleSaveMember = async () => {
    try {
      const finalApprovalState = userRole === "proposer" ? "pending" : "approved";
      const finalPublishState = userRole === "proposer" ? false : true;

      const memberPayload = {
        name: mName, role: mRole, affiliation: mAffiliation, field: mField, message: mMessage, photo_url: mPhotoUrl,
        skills, github_url: githubUrl, portfolio_url: portfolioUrl,
        approval_status: finalApprovalState,
        is_published: finalPublishState
      };

      if (editingMemberId) {
        const { error } = await supabase.from('members').update(memberPayload).eq('id', editingMemberId);
        if (error) throw error;
        logAdminAction("update_member", `メンバー「${mName}」の編集を送信しました (承認状況: ${finalApprovalState})`);
        showToast(userRole === "proposer" ? "プロフィールの修正提案を送信しました！" : "メンバー情報を更新しました");
      } else {
        const { error } = await supabase.from('members').insert([{ ...memberPayload, order_index: members.length + 1 }]);
        if (error) throw error;
        logAdminAction("create_member", `メンバー「${mName}」の追加を送信しました (承認状況: ${finalApprovalState})`);
        showToast(userRole === "proposer" ? "新規メンバーの登録提案を送信しました！" : "メンバーを追加しました");
      }

      await revalidateSite();
      setMName(""); setMRole(""); setMAffiliation(""); setMField(""); setMMessage(""); setMPhotoUrl("");
      setSkills(""); setGithubUrl(""); setPortfolioUrl("");
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

  const handleMoveMember = async (index: number, direction: 'up' | 'down') => {
    if (userRole === "proposer") {
      showToast("表示順序の変更は提案者権限では実行できません", "error");
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return; 

    const currentMember = members[index];
    const targetMember = members[targetIndex];

    const currentOrder = currentMember.order_index ?? (index + 1);
    const targetOrder = targetMember.order_index ?? (targetIndex + 1);

    const { error: err1 } = await supabase.from('members').update({ order_index: targetOrder }).eq('id', currentMember.id);
    const { error: err2 } = await supabase.from('members').update({ order_index: currentOrder }).eq('id', targetMember.id);

    if (err1 || err2) {
      showToast("順序の入れ替えに失敗しました", "error");
      return;
    }

    logAdminAction("reorder_members", `メンバーの表示順序を入れ替えました (${currentMember.name})`);
    await revalidateSite();
    fetchData(true);
    showToast("表示順序を変更しました");
  };

  // プロジェクト保存処理
  const handleSaveProject = async () => {
    try {
      const finalApprovalState = userRole === "proposer" ? "pending" : "approved";
      const finalPublishState = userRole === "proposer" ? "closed" : pStatus; 

      const payload = {
        title: pTitle, description: pDescription, tech_stack: pTechStack, roles_needed: pRolesNeeded, 
        status: finalPublishState,
        approval_status: finalApprovalState
      };

      if (editingProjectId) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingProjectId);
        if (error) throw error;
        logAdminAction("update_project", `プロジェクト「${pTitle}」の編集を送信しました (承認状況: ${finalApprovalState})`);
        showToast(userRole === "proposer" ? "プロジェクトの修正提案を送信しました！" : "プロジェクトを更新しました");
      } else {
        const { error } = await supabase.from('projects').insert([{ ...payload, order_index: projects.length + 1 }]);
        if (error) throw error;
        logAdminAction("create_project", `新規プロジェクト「${pTitle}」の登録を送信しました (承認状況: ${finalApprovalState})`);
        showToast(userRole === "proposer" ? "新規プロジェクトの登録提案を送信しました！" : "プロジェクトを登録しました！");
      }

      await revalidateSite();
      setPTitle(""); setPDescription(""); setPTechStack(""); setPRolesNeeded(""); setPStatus("open"); setEditingProjectId(null);
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

  const handleMoveProject = async (index: number, direction: 'up' | 'down') => {
    if (userRole === "proposer") {
      showToast("表示順序の変更は提案者権限では実行できません", "error");
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return; 

    const currentProj = projects[index];
    const targetProj = projects[targetIndex];

    const currentOrder = currentProj.order_index ?? (index + 1);
    const targetOrder = targetProj.order_index ?? (targetIndex + 1);

    const { error: err1 } = await supabase.from('projects').update({ order_index: targetOrder }).eq('id', currentProj.id);
    const { error: err2 } = await supabase.from('projects').update({ order_index: currentOrder }).eq('id', targetProj.id);

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
    if (userRole === "proposer") {
      showToast("お問合せステータスの変更権限がありません", "error");
      return;
    }
    try {
      const targetInquiry = inquiries.find(i => i.id === id);
      const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
      if (error) throw error;
      
      logAdminAction("update_inquiry", `お問合せ (送信者: ${targetInquiry?.name}) のステータスを「${status}」に変更しました`);
      fetchData(true);
      showToast("対応ステータスを更新しました");
    } catch (e: any) {
      showToast("ステータスの更新に失敗しました", "error");
    }
  };

  // FAQ保存・更新
  const handleSaveFaq = async () => {
    try {
      const finalApprovalState = userRole === "proposer" ? "pending" : "approved";
      const finalPublishState = userRole === "proposer" ? false : true;

      if (editingFaqId) {
        const { error } = await supabase.from('faqs').update({ question: fQuestion, answer: fAnswer, approval_status: finalApprovalState, is_published: finalPublishState }).eq('id', editingFaqId);
        if (error) throw error;
        logAdminAction("update_faq", `FAQの編集提案を送信しました (承認状況: ${finalApprovalState})`);
        showToast(userRole === "proposer" ? "FAQの修正提案を送信しました！" : "FAQを更新しました");
      } else {
        const { error } = await supabase.from('faqs').insert([{ question: fQuestion, answer: fAnswer, order_index: faqs.length + 1, approval_status: finalApprovalState, is_published: finalPublishState }]);
        if (error) throw error;
        logAdminAction("create_faq", `新規FAQの追加提案を送信しました (承認状況: ${finalApprovalState})`);
        showToast(userRole === "proposer" ? "新規FAQの登録提案を送信しました！" : "FAQを追加しました");
      }
      await revalidateSite();
      setFQuestion(""); setFAnswer(""); setEditingFaqId(null); 
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
    if (userRole === "proposer") {
      showToast("デフォルトFAQの自動投入権限がありません", "error");
      return;
    }
    try {
      const defaults = [
        { question: "Nexus とは何ですか？", answer: "意欲ある学生たちが集まり、専門性や興味を持ち寄ってつながる共創型のコミュニティです。Slackでの議論やプロジェクト活動を行っています。", order_index: 1 },
        { question: "参加費用はかかりますか？", answer: "完全無料です。学生のコミュニティであるため、どなたでも一切の費用をかけずに参加いただけます。", order_index: 2 },
        { question: "誰でも参加できますか？", answer: "高校生、専門学校生、大学生、大学院生など、学びやものづくりに意欲のあるすべての学生の方々が参加対象です。", order_index: 3 }
      ];
      const { error } = await supabase.from('faqs').insert(defaults);
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
    if (userRole === "proposer") {
      showToast("公開ステータスの直接変更はできません", "error");
      return;
    }
    try {
      const { error } = await supabase.from(table).update({ is_published: isPublished }).eq('id', id);
      if (error) throw error;
      
      logAdminAction("toggle_publish", `${table} (ID: ${id}) の公開状態を ${isPublished ? '公開' : '非公開'} にしました`);
      await revalidateSite();
      fetchData(true);
      showToast(isPublished ? "公開状態にしました" : "非公開にしました");
    } catch (e: any) {
      showToast("更新に失敗しました", "error");
    }
  };

  // 🗑️ 【論理削除 / 完全削除】処理
  const handleDelete = async (table: string, id: string, bypassConfirm = false) => {
    if (userRole === "proposer") {
      showToast("削除権限がありません", "error");
      return;
    }

    if (table === 'inquiries') {
      if (bypassConfirm || confirm("お問合せ履歴を永久に消去しますか？")) {
        try {
          const { error } = await supabase.from(table).delete().eq('id', id);
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

    if (confirm("本当に削除しますか？\n(データは一旦ゴミ箱へ移動され、後から安全に復元可能です)")) {
      try {
        const { error } = await supabase.from(table).update({ is_deleted: true }).eq('id', id);
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

  // 🗑️ ゴミ箱復元処理
  const handleRestoreItem = async (table: string, id: string) => {
    if (userRole === "proposer") return;
    try {
      const { error } = await supabase.from(table).update({ is_deleted: false }).eq('id', id);
      if (error) throw error;

      logAdminAction("restore_item", `${table} のアイテム (ID: ${id}) をゴミ箱から復元しました`);
      await revalidateSite();
      fetchData(true);
      showToast("データを復元しました！");
    } catch (e) {
      showToast("復元に失敗しました", "error");
    }
  };

  // 🗑️ ゴミ箱完全消去
  const handlePermanentDelete = async (table: string, id: string) => {
    if (userRole === "proposer") return;
    if (confirm("🚨警告: この操作は取り消せません。\nこのデータを完全に消去しますか？")) {
      try {
        const { error } = await supabase.from(table).delete().eq('id', id);
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

  // 📬 提案の「承認（公開承認）」処理
  const handleApproveProposal = async (table: string, id: string) => {
    if (userRole === "proposer") return;
    try {
      if (table === 'content_proposals') {
        const { data: prop, error: fetchErr } = await supabase
          .from('content_proposals')
          .select('*')
          .eq('id', id)
          .single();
        if (fetchErr || !prop) throw fetchErr || new Error("提案が見つかりませんでした");

        const { error: upsertErr } = await supabase.from('site_content').upsert(
          { page_path: prop.page_path, content_key: prop.content_key, content_value: prop.proposed_value },
          { onConflict: 'page_path,content_key' }
        );
        if (upsertErr) throw upsertErr;

        const { error: updateErr } = await supabase
          .from('content_proposals')
          .update({ status: 'approved' })
          .eq('id', id);
        if (updateErr) throw updateErr;

        // 🔔 提案者への「承認通知」を作成して保存
        if (prop.proposer_email) {
          await supabase.from('notifications').insert([{
            user_email: prop.proposer_email,
            title: "🟢 変更提案が承認されました",
            message: `${prop.page_path.toUpperCase()}ページの「${prop.content_key}」の変更提案が承認され、本番サイトに反映されました！`
          }]);
        }

        logAdminAction("approve_proposal", `一般テキスト変更提案 (ページ: ${prop.page_path}, キー: ${prop.content_key}) を承認し本番反映しました`);
        await revalidateSite();
        fetchData(true);
        showToast("テキスト変更を承認・公開しました！");
      } else {
        // activities, members などの承認処理
        const { data: prop } = await supabase.from(table).select('*').eq('id', id).single();
        
        const { error } = await supabase
          .from(table)
          .update({ approval_status: 'approved', is_published: true })
          .eq('id', id);
        if (error) throw error;

        // 🔔 提案者宛て通知の送信
        if (prop && prop.created_by) {
          await supabase.from('notifications').insert([{
            user_email: prop.created_by,
            title: "🟢 作成提案が承認されました",
            message: `${table === 'activities' ? '活動記録' : 'コンテンツ'}の申請が承認され、本番サイトに公開されました！`
          }]);
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

  // 📬 提案の「却下」処理
  const handleRejectProposal = async (table: string, id: string) => {
    if (userRole === "proposer") return;
    if (confirm("この提案を却下して削除しますか？")) {
      try {
        if (table === 'content_proposals') {
          const { data: prop } = await supabase.from('content_proposals').select('*').eq('id', id).single();
          
          const { error } = await supabase.from('content_proposals').delete().eq('id', id);
          if (error) throw error;

          // 🔔 提案者への「却下通知」を作成して保存
          if (prop && prop.proposer_email) {
            await supabase.from('notifications').insert([{
              user_email: prop.proposer_email,
              title: "🔴 変更提案が却下されました",
              message: `${prop.page_path.toUpperCase()}ページの「${prop.content_key}」の変更提案は却下されました。`
            }]);
          }

          logAdminAction("reject_proposal", `テキスト変更提案 (ID: ${id}) を却下しました`);
        } else {
          const { data: prop } = await supabase.from(table).select('*').eq('id', id).single();
          const { error } = await supabase.from(table).delete().eq('id', id);
          if (error) throw error;

          if (prop && prop.created_by) {
            await supabase.from('notifications').insert([{
              user_email: prop.created_by,
              title: "🔴 作成提案が却下されました",
              message: `${table === 'activities' ? '活動記録' : 'コンテンツ'}の申請は却下されました。`
            }]);
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

  if (isAuthenticated === null) return <div style={S.loading}>NEXUS STUDIO INITIALIZING...</div>;
  if (isAuthenticated === false) return null;
  if (loading) return <div style={S.loading}>NEXUS STUDIO INITIALIZING...</div>;

  return (
    <main style={{ background: "#f8f7f4", minHeight: "100vh", color: "#1a1a1a" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 900px) {
          .dashboard-header { 
            flex-direction: column !important; 
            padding: ${isHeaderCollapsed ? "8px 16px" : "16px 20px"} !important; 
            gap: ${isHeaderCollapsed ? "0" : "16px"} !important; 
          }
          .dashboard-header-left {
            display: ${isHeaderCollapsed ? "none" : "flex"} !important;
            width: 100%;
            justify-content: space-between;
            align-items: center;
          }
          .dashboard-nav { 
            display: ${isHeaderCollapsed ? "none" : "flex"} !important; 
            flex-wrap: wrap !important; 
            justify-content: center !important; 
            width: 100%;
          }
          .dashboard-header-right {
            display: ${isHeaderCollapsed ? "none" : "flex"} !important;
            width: 100%;
            justify-content: center;
          }
          .mobile-header-toggle {
            display: block !important;
          }
          .dashboard-layout { grid-template-columns: 1fr !important; height: auto !important; }
          .dashboard-editor { padding: 20px !important; border-right: none !important; overflow-y: visible !important; }
          .dashboard-preview { position: static !important; height: auto !important; padding: 20px !important; border-top: 4px dashed #ddd !important; }
        }
      `}</style>
      <header className="dashboard-header" style={S.header}>
        {/* 左側：ロゴ ＆ 通知 */}
        <div className="dashboard-header-left" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Image src="/nexus-icon.png" alt="Logo" width={28} height={28} />
          <h1 style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "0.05em" }}>NEXUS STUDIO</h1>
          
          <span style={{ 
            fontSize: "0.7rem", 
            fontWeight: 800, 
            padding: "3px 9px", 
            borderRadius: "6px",
            background: userRole === "owner" ? "#fff0f0" : userRole === "editor" ? "#f0f5ff" : "#f5f5f5",
            color: userRole === "owner" ? "#cc0000" : userRole === "editor" ? "#0055ff" : "#666",
            border: userRole === "owner" ? "1px solid #ffcccc" : userRole === "editor" ? "1px solid #ccd9ff" : "1px solid #ddd",
            marginLeft: "8px",
            letterSpacing: "0.05em"
          }}>
            {userRole === "owner" ? "👑 OWNER" : userRole === "editor" ? "📝 EDITOR" : "💡 PROPOSER"}
          </span>

          {/* 🔔 通知ベル（ドロップダウン付き） */}
          <div style={{ position: "relative", marginLeft: "16px" }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: "none", border: "none", cursor: "pointer", position: "relative",
                fontSize: "1.2rem", padding: "6px", display: "flex", alignItems: "center"
              }}
            >
              🔔
              {notifications.filter(n => n.status === 'unread').length > 0 && (
                <span style={{
                  position: "absolute", top: "2px", right: "2px",
                  background: "#ff4d4d", color: "white", borderRadius: "50%",
                  width: "16px", height: "16px", fontSize: "0.6rem", fontWeight: 900,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {notifications.filter(n => n.status === 'unread').length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: "absolute", top: "40px", left: "0", background: "white",
                minWidth: "320px", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                border: "1px solid #e5e0d8", zIndex: 1000, padding: "16px", display: "flex",
                flexDirection: "column", gap: "12px", animation: "fadeIn 0.2s"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                  <span style={{ fontWeight: 900, fontSize: "0.85rem" }}>🔔 通知センター</span>
                  {notifications.filter(n => n.status === 'unread').length > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      style={{ background: "none", border: "none", color: "#0055ff", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer" }}
                    >
                      すべて既読にする
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "#999", fontSize: "0.8rem" }}>
                      通知はまだありません。
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => handleMarkAsRead(n.id)}
                        style={{
                          padding: "10px 12px", borderRadius: "10px",
                          background: n.status === 'unread' ? "#f5f9ff" : "#fafafa",
                          border: n.status === 'unread' ? "1px solid #d9e8ff" : "1px solid #eee",
                          cursor: "pointer", transition: "0.2s", display: "flex", flexDirection: "column", gap: "4px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 800, fontSize: "0.8rem", color: n.status === 'unread' ? "#0055ff" : "#333" }}>
                            {n.title}
                          </span>
                          {n.status === 'unread' && (
                            <span style={{ width: "6px", height: "6px", background: "#0055ff", borderRadius: "50%" }} />
                          )}
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "#666", margin: 0, lineHeight: 1.4 }}>
                          {n.message}
                        </p>
                        <span style={{ fontSize: "0.6rem", color: "#aaa", alignSelf: "flex-end" }}>
                          {new Date(n.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 中央：タブ切り替え */}
        <nav className="dashboard-nav" style={S.tabNav}>
          <NavBtn active={activeTab === "system"} onClick={() => { setActiveTab("system"); setIsHeaderCollapsed(true); }} icon="📊">システム情報</NavBtn>
          <NavBtn active={activeTab === "activity"} onClick={() => { setActiveTab("activity"); setIsHeaderCollapsed(true); }} icon="✍️">活動</NavBtn>
          <NavBtn active={activeTab === "projects"} onClick={() => { setActiveTab("projects"); setIsHeaderCollapsed(true); }} icon="🚀">プロジェクト</NavBtn> 
          <NavBtn active={activeTab === "content"} onClick={() => { setActiveTab("content"); setIsHeaderCollapsed(true); }} icon="🌐">編集</NavBtn>
          <NavBtn active={activeTab === "members"} onClick={() => { setActiveTab("members"); setIsHeaderCollapsed(true); }} icon="👤">メンバー</NavBtn>
          <NavBtn active={activeTab === "faq"} onClick={() => { setActiveTab("faq"); setIsHeaderCollapsed(true); }} icon="❓">FAQ</NavBtn>
          <NavBtn active={activeTab === "applications"} onClick={() => { setActiveTab("applications"); setIsHeaderCollapsed(true); }} icon="📬">参加申請</NavBtn>
          <NavBtn active={activeTab === "inquiries"} onClick={() => { setActiveTab("inquiries"); setIsHeaderCollapsed(true); }} icon="📩">問い合わせ</NavBtn>
        </nav>

        {/* 右側：同期 ＆ サインアウト */}
        <div className="dashboard-header-right" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button 
            onClick={async () => { 
              await fetchData(true); 
              showToast("データベースから最新情報を取得しました！"); 
            }} 
            style={{ ...S.logoutBtn, color: "var(--accent)", borderColor: "var(--accent-light)" }}
          >
            🔄 最新同期
          </button>
          <button 
            onClick={() => { 
              logAdminAction("logout", "管理システムからサインアウトしました"); 
              supabase.auth.signOut(); 
              router.push("/"); 
            }} 
            style={S.logoutBtn}
          >
            SIGN OUT
          </button>
        </div>

        {/* 📱 モバイル用アコーディオン開閉トグルボタン */}
        <button
          onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
          className="mobile-header-toggle"
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--accent)",
            fontWeight: 800,
            fontSize: "0.75rem",
            cursor: "pointer",
            width: "100%",
            textAlign: "center",
            padding: "6px 0",
            borderTop: isHeaderCollapsed ? "none" : "1px solid #eee",
            marginTop: isHeaderCollapsed ? "0" : "8px",
          }}
        >
          {isHeaderCollapsed ? "🔽 メニューを展開する (タップ)" : "🔼 メニューを折りたたむ (タップ)"}
        </button>
      </header>

      {errorMsg && <div style={{ color: "red", padding: "10px" }}>{errorMsg}</div>}

      <div className="dashboard-layout" style={{ display: "grid", gridTemplateColumns: "1fr 450px", height: "calc(100vh - 70px)" }}>
        <div className="dashboard-editor" style={{ padding: "40px", overflowY: "auto", borderRight: "1px solid #e5e0d8", boxSizing: "border-box" }}>
          {activeTab === "system" && (
            <SystemDashboardTab 
              analytics={analyticsData} 
              logs={auditLogs}
              userRole={userRole}
              allowedUsers={allowedUsers}
              currentUserEmail={currentUserEmail}
              onAddUser={handleAddAllowedUser}
              onRemoveUser={handleRemoveAllowedUser}
              onChangeRole={handleChangeUserRole}
              onUpdateUserEmail={handleUpdateAllowedUserEmail}
              trashItems={{
                activities: deletedActivities,
                members: deletedMembers,
                projects: deletedProjects,
                faqs: deletedFaqs
              }}
              onRestoreItem={handleRestoreItem}
              onPermanentDelete={handlePermanentDelete}
              pendingProposals={{
                activities: pendingActivities,
                members: pendingMembers,
                projects: pendingProjects,
                faqs: pendingFaqs,
                content: pendingContentProposals
              }}
              onApproveProposal={handleApproveProposal}
              onRejectProposal={handleRejectProposal}
            />
          )}
          {activeTab === "content" && (
            <ContentTab 
              activePage={activePage} 
              setActivePage={setActivePage} 
              liveData={liveData} 
              handleUpdateContent={handleUpdateContentLocally} 
              onSave={handleSaveAllContentChanges}
              onReload={handleReloadOriginalContent}
              publishing={publishing}
              userRole={userRole}
            />
          )}
          {activeTab === "activity" && (
            <ActivityTab 
              state={{ title, date, category, slug, summary, content, imageUrl, publishing, uploading, editingActivityId }} 
              setters={{ setTitle, setDate, setCategory, setSlug, setSummary, setContent, setImageUrl }} 
              handlers={{ handleUpload, handleSaveActivity, startEditActivity, cancelEditActivity, handleDelete, handleTogglePublish }} 
              activities={activities}
            />
          )}
          {activeTab === "projects" && (
            <ProjectsTab 
              state={{ pTitle, pDescription, pTechStack, pRolesNeeded, pStatus, editingProjectId }}
              setters={{ setPTitle, setPDescription, setPTechStack, setPRolesNeeded, setPStatus }}
              handlers={{ handleSaveProject, startEditProject, cancelEditProject, handleDelete, handleMoveProject }}
              projects={projects}
            />
          )}
          {activeTab === "members" && (
            <MembersTab 
              state={{ members, mName, mRole, mAffiliation, mMessage, mPhotoUrl, editingMemberId, skills, githubUrl, portfolioUrl, uploading }} 
              setters={{ setMName, setMRole, setMAffiliation, setMMessage, setMPhotoUrl, setSkills, setGithubUrl, setPortfolioUrl }} 
              handlers={{ handleSaveMember, handleUpload, handleDelete, handleTogglePublish, startEditMember, cancelEditMember, handleMoveMember }} 
            />
          )}
          {activeTab === "faq" && (
            <FaqTab 
              state={{ faqs, fQuestion, fAnswer, editingFaqId }} 
              setters={{ setFQuestion, setFAnswer }} 
              handlers={{ handleSaveFaq, handleDelete, handleTogglePublish, startEditFaq, cancelEditFaq, handleInsertDefaultFaqs }} 
            />
          )}
          {activeTab === "applications" && (
           <ApplicationsTab
              inquiries={inquiries}
              handleUpdateStatus={handleUpdateInquiryStatus}
              handleDelete={handleDelete}
              showToast={showToast}
            />
          )}
        </div>
        <PreviewPanel 
          activeTab={activeTab === "system" || activeTab === "projects" ? "content" : activeTab}
          activePage={activePage} liveData={liveData} title={title} imageUrl={imageUrl} summary={summary}
          faqs={faqs} fQuestion={fQuestion} fAnswer={fAnswer} members={members} mName={mName} mRole={mRole} mMessage={mMessage} mPhotoUrl={mPhotoUrl}
        />
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: "30px", right: "30px", background: toast.type === "success" ? "#1a1a1a" : "#e53e3e", color: "white", padding: "16px 24px", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", fontWeight: 700, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "10px", zIndex: 9999, transition: "all 0.3s ease" }}>
          {toast.type === "success" ? "✅" : "⚠️"} {toast.msg}
        </div>
      )}
    </main>
  );
}
