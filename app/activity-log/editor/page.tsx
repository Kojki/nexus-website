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
import { ContentTab, ActivityTab, MembersTab, FaqTab, InquiriesTab, ProjectsTab } from "./components/EditorTabs"; 

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

  // 🗑️ ゴミ箱（論理削除済みデータ）用ステート
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

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: cData, error: cError } = await supabase.from('site_content').select('*');
      if (cError) throw cError;
      const cMap: any = { home: {}, about: {}, en: {}, guidelines: {}, privacy: {} };
      cData?.forEach(item => { if (cMap[item.page_path]) cMap[item.page_path][item.content_key] = item.content_value; });
      setSiteContents(cMap);
      setLiveData(cMap[activePage] || {});

      // 🗑️ アクティブ ＆ 承認済みのデータのみをフェッチするように変更
      const { data: aData } = await supabase.from('activities').select('*').eq('is_deleted', false).eq('approval_status', 'approved').order('created_at', { ascending: false });
      setActivities(aData || []);

      const { data: mData } = await supabase.from('members').select('*').eq('is_deleted', false).eq('approval_status', 'approved').order('order_index', { ascending: true });
      setMembers(mData || []);

      const { data: fData } = await supabase.from('faqs').select('*').eq('is_deleted', false).eq('approval_status', 'approved').order('order_index');
      setFaqs(fData || []);

      const { data: pData } = await supabase.from('projects').select('*').eq('is_deleted', false).eq('approval_status', 'approved').order('order_index', { ascending: true });
      setProjects(pData || []);

      // 🗑️ ゴミ箱用データ（is_deleted = true）のフェッチ
      const { data: delA } = await supabase.from('activities').select('*').eq('is_deleted', true);
      setDeletedActivities(delA || []);

      const { data: delM } = await supabase.from('members').select('*').eq('is_deleted', true);
      setDeletedMembers(delM || []);

      const { data: delF } = await supabase.from('faqs').select('*').eq('is_deleted', true);
      setDeletedFaqs(delF || []);

      const { data: delP } = await supabase.from('projects').select('*').eq('is_deleted', true);
      setDeletedProjects(delP || []);

      // 📬 承認待ち（approval_status = pending）データのフェッチ
      const { data: pendA } = await supabase.from('activities').select('*').eq('approval_status', 'pending');
      setPendingActivities(pendA || []);

      const { data: pendM } = await supabase.from('members').select('*').eq('approval_status', 'pending');
      setPendingMembers(pendM || []);

      const { data: pendP } = await supabase.from('projects').select('*').eq('approval_status', 'pending');
      setPendingProjects(pendP || []);

      const { data: pendF } = await supabase.from('faqs').select('*').eq('approval_status', 'pending');
      setPendingFaqs(pendF || []);

      // お問い合わせ一覧
      const { data: iData } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      setInquiries(iData || []);

      // アクセス統計データの集計
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

      // 操作監査ログの読み込み
      const { data: logs } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20);
      setAuditLogs(logs || []);

      // 🔑 ログイン許可メンバーのリストを取得
      const { data: allowedList } = await supabase.from('allowed_users').select('*').order('email');
      setAllowedUsers(allowedList || []);

    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
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
      fetchData();
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
        fetchData();
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
      fetchData();
    } catch (e: any) {
      showToast("権限の変更に失敗しました", "error");
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

  const handleUpdateContentDirectly = async (key: string, value: string) => {
    if (userRole === "proposer") {
      showToast("一般テキスト編集の提案は現在未対応です", "error");
      return;
    }
    try {
      const updatedLiveData = { ...liveData, [key]: value };
      setLiveData(updatedLiveData);
      
      const updatedSiteContents = {
        ...siteContents,
        [activePage]: {
          ...(siteContents[activePage] || {}),
          [key]: value
        }
      };
      setSiteContents(updatedSiteContents);

      const { error } = await supabase.from('site_content').upsert(
        { page_path: activePage, content_key: key, content_value: value },
        { onConflict: 'page_path,content_key' }
      );
      if (error) throw error;
      
      logAdminAction("update_content", `${activePage} ページの「${key}」の文言を更新しました`);
      await revalidateSite();
      showToast("変更を一時保存しました");
    } catch (e: any) {
      showToast("保存に失敗しました", "error");
    }
  };

  // 活動記録の保存 (提案者対応)
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
      fetchData();
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

  // メンバーの保存 (提案者対応)
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
      fetchData();
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
    fetchData();
    showToast("表示順序を変更しました");
  };

  // プロジェクト保存処理 (提案者対応)
  const handleSaveProject = async () => {
    try {
      const finalApprovalState = userRole === "proposer" ? "pending" : "approved";
      const finalPublishState = userRole === "proposer" ? "closed" : pStatus; // 提案中の場合はクローズド仮状態にするなど

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
      fetchData();
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
    fetchData();
    showToast("表示順序を変更しました");
  };

  // お問い合わせの対応ステータス
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
      fetchData();
      showToast("対応ステータスを更新しました");
    } catch (e: any) {
      showToast("ステータスの更新に失敗しました", "error");
    }
  };

  // FAQ保存・更新 (提案者対応)
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
      setFQuestion(""); setFAnswer(""); setEditingFaqId(null); fetchData();
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
      fetchData();
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
      fetchData();
      showToast(isPublished ? "公開状態にしました" : "非公開にしました");
    } catch (e: any) {
      showToast("更新に失敗しました", "error");
    }
  };

  // 🗑️ 【論理削除】処理
  const handleDelete = async (table: string, id: string) => {
    if (userRole === "proposer") {
      showToast("削除権限がありません", "error");
      return;
    }

    if (table === 'inquiries') {
      if (confirm("お問合せ履歴を永久に消去しますか？")) {
        try {
          const { error } = await supabase.from(table).delete().eq('id', id);
          if (error) throw error;
          logAdminAction("delete_row", `お問合せ (ID: ${id}) を完全に削除しました`);
          fetchData();
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
        fetchData();
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
      fetchData();
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
        fetchData();
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
      const { error } = await supabase
        .from(table)
        .update({ approval_status: 'approved', is_published: true })
        .eq('id', id);

      if (error) throw error;
      logAdminAction("approve_proposal", `${table} の提案 (ID: ${id}) を承認し本番公開しました`);
      await revalidateSite();
      fetchData();
      showToast("提案を承認・公開しました！");
    } catch (e) {
      showToast("承認に失敗しました", "error");
    }
  };

  // 📬 提案の「却下」処理
  const handleRejectProposal = async (table: string, id: string) => {
    if (userRole === "proposer") return;
    if (confirm("この提案を却下して削除しますか？")) {
      try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        
        logAdminAction("reject_proposal", `${table} の提案 (ID: ${id}) を却下しました`);
        fetchData();
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
        @media (max-width: 900px) {
          .dashboard-header { flex-direction: column !important; padding: 16px 20px !important; gap: 16px !important; }
          .dashboard-nav { flex-wrap: wrap !important; justify-content: center !important; }
          .dashboard-layout { grid-template-columns: 1fr !important; height: auto !important; }
          .dashboard-editor { padding: 20px !important; border-right: none !important; overflow-y: visible !important; }
          .dashboard-preview { position: static !important; height: auto !important; padding: 20px !important; border-top: 4px dashed #ddd !important; }
        }
      `}</style>
      <header className="dashboard-header" style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Image src="/nexus-icon.png" alt="Logo" width={28} height={28} />
          <h1 style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "0.05em" }}>NEXUS STUDIO</h1>
          
          {/* 👑 ログイン中の権限バッジ */}
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
        </div>
        <nav className="dashboard-nav" style={S.tabNav}>
          <NavBtn active={activeTab === "system"} onClick={() => setActiveTab("system")} icon="📊">システム情報</NavBtn>
          <NavBtn active={activeTab === "activity"} onClick={() => setActiveTab("activity")} icon="✍️">活動</NavBtn>
          <NavBtn active={activeTab === "projects"} onClick={() => setActiveTab("projects")} icon="🚀">プロジェクト</NavBtn> 
          <NavBtn active={activeTab === "content"} onClick={() => setActiveTab("content")} icon="🌐">編集</NavBtn>
          <NavBtn active={activeTab === "members"} onClick={() => setActiveTab("members")} icon="👤">メンバー</NavBtn>
          <NavBtn active={activeTab === "faq"} onClick={() => setActiveTab("faq")} icon="❓">FAQ</NavBtn>
          <NavBtn active={activeTab === "inquiries"} onClick={() => setActiveTab("inquiries")} icon="📩">問い合わせ</NavBtn>
        </nav>
        <button onClick={() => { logAdminAction("logout", "管理システムからサインアウトしました"); supabase.auth.signOut(); router.push("/"); }} style={S.logoutBtn}>SIGN OUT</button>
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
              // 🗑️ ゴミ箱引き渡し
              trashItems={{
                activities: deletedActivities,
                members: deletedMembers,
                projects: deletedProjects,
                faqs: deletedFaqs
              }}
              onRestoreItem={handleRestoreItem}
              onPermanentDelete={handlePermanentDelete}
              // 📬 承認待ちデータ ＆ ハンドラーの引き渡し
              pendingProposals={{
                activities: pendingActivities,
                members: pendingMembers,
                projects: pendingProjects,
                faqs: pendingFaqs
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
              handleUpdateContent={handleUpdateContentDirectly} 
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
          {activeTab === "inquiries" && (
            <InquiriesTab 
              inquiries={inquiries} 
              handleUpdateStatus={handleUpdateInquiryStatus} 
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


