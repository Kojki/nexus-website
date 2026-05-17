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
import { ContentTab, ActivityTab, MembersTab, FaqTab, InquiriesTab } from "./components/EditorTabs";

import { SystemDashboardTab } from "./components/SystemDashboardTab";

export default function NexusStudioPro() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab | "system">("content"); 
  const [activePage, setActivePage] = useState<PagePath>("home");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // 🔑 Wikipedia運用のための権限ステート
  const [userRole, setUserRole] = useState<"owner" | "editor" | null>(null);
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

      const { data: aData } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
      setActivities(aData || []);

      const { data: mData } = await supabase.from('members').select('*').order('order_index', { ascending: true });
      setMembers(mData || []);

      const { data: fData } = await supabase.from('faqs').select('*').order('order_index');
      setFaqs(fData || []);

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

      // 🔐 ログイン権限＆ロールの自動検証
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
        logAdminAction("login", "管理システムにログイン（セッション開始）しました");
        sessionStorage.setItem(sessionKey, "true"); 
      }
    };
    init();
  }, [router]);

  useEffect(() => {
    setLiveData(siteContents[activePage] || {});
  }, [activePage, siteContents]);

  // 🔑 ログイン許可リストの追加操作
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

  // 🔑 ログイン許可リストの削除操作
  const handleRemoveAllowedUser = async (email: string) => {
    if (userRole !== "owner") {
      showToast("操作権限がありません", "error");
      return;
    }
    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      showToast("自分自身の権限を削除することはできません", "error");
      return;
    }
    if (confirm(`本当に「${email}」のログイン許可を剥奪しますか？\nこのユーザーは即座にログインできなくなります。`)) {
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

  // 🔑 ユーザー権限（Owner/Editor）の変更操作
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    let file = e.target.files?.[0];
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
    }
    setUploading(false);
  };

  const handleUpdateContentDirectly = async (key: string, value: string) => {
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

  // 活動記録の保存
  const handleSaveActivity = async (isPublished: boolean = true) => {
    setPublishing(true);
    try {
      const activityPayload = {
        title, date, category, summary, content, slug, image_url: imageUrl, has_detail: !!content, is_published: isPublished
      };

      if (editingActivityId) {
        const { error } = await supabase.from('activities').update(activityPayload).eq('id', editingActivityId);
        if (error) throw error;
        logAdminAction("update_activity", `活動記録「${title}」の内容を更新しました`);
        showToast("活動記録を更新しました");
      } else {
        const { error } = await supabase.from('activities').insert([activityPayload]);
        if (error) throw error;
        logAdminAction("create_activity", `新規の活動記録「${title}」を${isPublished ? '公開' : '下書き'}で作成しました`);
        showToast(isPublished ? "記事を公開しました！" : "下書きとして保存しました");
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

  // メンバーの保存
  const handleSaveMember = async () => {
    try {
      const memberPayload = {
        name: mName, role: mRole, affiliation: mAffiliation, field: mField, message: mMessage, photo_url: mPhotoUrl
      };

      if (editingMemberId) {
        const { error } = await supabase.from('members').update(memberPayload).eq('id', editingMemberId);
        if (error) throw error;
        logAdminAction("update_member", `メンバー「${mName}」のプロフィールを更新しました`);
        showToast("メンバー情報を更新しました");
      } else {
        const { error } = await supabase.from('members').insert([{ ...memberPayload, order_index: members.length + 1 }]);
        if (error) throw error;
        logAdminAction("create_member", `新メンバー「${mName}」を追加しました`);
        showToast("メンバーを追加しました");
      }

      await revalidateSite();
      setMName(""); setMRole(""); setMAffiliation(""); setMMessage(""); setMPhotoUrl(""); setEditingMemberId(null);
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
    setMMessage(m.message || "");
    setMPhotoUrl(m.photo_url || "");
    showToast("メンバー編集モードを開始しました");
  };

  const cancelEditMember = () => {
    setEditingMemberId(null);
    setMName("");
    setMRole("");
    setMAffiliation("");
    setMMessage("");
    setMPhotoUrl("");
  };

  // メンバー表示順の入れ替え処理
  const handleMoveMember = async (index: number, direction: 'up' | 'down') => {
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

    logAdminAction("reorder_members", `メンバーの表示順序を入れ替えました (${currentMember.name} ➔ ${direction === 'up' ? '上へ' : '下へ'})`);
    await revalidateSite();
    fetchData();
    showToast("表示順序を変更しました");
  };

  // お問い合わせの「対応ステータス」の変更処理
  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    try {
      const targetInquiry = inquiries.find(i => i.id === id);
      const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
      if (error) throw error;
      
      logAdminAction("update_inquiry", `お問合せ（送信者: ${targetInquiry?.name || '不明'}）のステータスを「${status}」に変更しました`);
      fetchData();
      showToast("対応ステータスを更新しました");
    } catch (e: any) {
      showToast("ステータスの更新に失敗しました", "error");
    }
  };

  // FAQ保存・更新
  const handleSaveFaq = async () => {
    try {
      if (editingFaqId) {
        const { error } = await supabase.from('faqs').update({ question: fQuestion, answer: fAnswer }).eq('id', editingFaqId);
        if (error) throw error;
        logAdminAction("update_faq", `FAQ「${fQuestion.slice(0, 15)}...」を更新しました`);
        showToast("FAQを更新しました");
      } else {
        const { error } = await supabase.from('faqs').insert([{ question: fQuestion, answer: fAnswer, order_index: faqs.length + 1 }]);
        if (error) throw error;
        logAdminAction("create_faq", `新しいFAQ「${fQuestion.slice(0, 15)}...」を追加しました`);
        showToast("FAQを追加しました");
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
    try {
      const { error } = await supabase.from(table).update({ is_published: isPublished }).eq('id', id);
      if (error) throw error;
      
      logAdminAction("toggle_publish", `${table} テーブルのID: ${id} の公開ステータスを ${isPublished ? '公開' : '非公開'} に切り替えました`);
      await revalidateSite();
      fetchData();
      showToast(isPublished ? "公開状態にしました" : "非公開にしました");
    } catch (e: any) {
      showToast("更新に失敗しました", "error");
    }
  };

  const handleDelete = async (table: string, id: string) => {
    if (confirm("本当に削除しますか？")) {
      try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        logAdminAction("delete_row", `${table} テーブルのID: ${id} を完全に削除しました`);
        await revalidateSite();
        fetchData();
        showToast("削除しました");
      } catch (e: any) {
        showToast("削除に失敗しました", "error");
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
        </div>
        <nav className="dashboard-nav" style={S.tabNav}>
          <NavBtn active={activeTab === "system"} onClick={() => setActiveTab("system")} icon="📊">システム情報</NavBtn>
          <NavBtn active={activeTab === "activity"} onClick={() => setActiveTab("activity")} icon="✍️">活動</NavBtn>
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
          {activeTab === "members" && (
            <MembersTab 
              state={{ members, mName, mRole, mAffiliation, mMessage, mPhotoUrl, editingMemberId }} 
              setters={{ setMName, setMRole, setMAffiliation, setMMessage, setMPhotoUrl }} 
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
          activeTab={activeTab === "system" ? "content" : activeTab}
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
