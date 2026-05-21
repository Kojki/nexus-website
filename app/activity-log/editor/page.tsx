"use client";

import type { NotificationItem } from "./hooks/useEditorData";
import { useEditorData, getAccessibleTabs, ROLE_LABELS, isGuestRole } from "./hooks/useEditorData";
import { NavBtn, S } from "./components/SharedUI";
import { PreviewPanel } from "./components/PreviewPanel";
import { 
  ContentTab, 
  ActivityTab, 
  MembersTab, 
  FaqTab, 
  InquiriesTab, 
  ProjectsTab 
} from "./components/EditorTabs";
import { SystemDashboardTab } from "./components/SystemDashboardTab";
import { RoleSettingsTab } from "./components/RoleSettingsTab";

export default function NexusStudioPro() {
  const {
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
    userPermissions,
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
    form,
    actions
  } = useEditorData();

  const visibleTabs = getAccessibleTabs(userRole, hasPermission);

  if (isAuthenticated === null || loading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", height: "100vh", width: "100vw",
        alignItems: "center", justifyContent: "center", background: "#FAF8F5", gap: "20px"
      }}>
        <div style={{
          width: "48px", height: "48px", border: "4px solid #E65C00",
          borderTopColor: "transparent", borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <p style={{ fontSize: "0.9rem", color: "#666", fontWeight: 800 }}>
          Nexus Studio Pro セッション検証中...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ActivityTab が期待する state/setters/handlers
  const activityState = {
    ...form.activities,
    uploading,
    publishing,
  };
  const activitySetters = {
    setTitle: form.activities.setTitle,
    setDate: form.activities.setDate,
    setCategory: form.activities.setCategory,
    setSummary: form.activities.setSummary,
    setContent: form.activities.setContent,
    setSlug: form.activities.setSlug,
    setImageUrl: form.activities.setImageUrl,
  };
  const activityHandlers = {
    handleSaveActivity: actions.handleSaveActivity,
    startEditActivity: actions.startEditActivity,
    cancelEditActivity: actions.cancelEditActivity,
    handleDelete: actions.handleDelete,
    handleTogglePublish: actions.handleTogglePublish,
    handleUpload: actions.handleUpload,
  };

  // MembersTab が期待する state/setters/handlers
  const memberState = {
    ...form.members,
    members,
    pendingMembers,
    uploading,
  };
  const memberSetters = {
    setMName: form.members.setMName,
    setMRole: form.members.setMRole,
    setMAffiliation: form.members.setMAffiliation,
    setMField: form.members.setMField,
    setMMessage: form.members.setMMessage,
    setMPhotoUrl: form.members.setMPhotoUrl,
    setSkills: form.members.setSkills,
    setGithubUrl: form.members.setGithubUrl,
    setPortfolioUrl: form.members.setPortfolioUrl,
  };
  const memberHandlers = {
    handleSaveMember: actions.handleSaveMember,
    startEditMember: actions.startEditMember,
    cancelEditMember: actions.cancelEditMember,
    handleMoveMember: actions.handleMoveMember,
    handleDelete: actions.handleDelete,
    handleTogglePublish: actions.handleTogglePublish,
    handleUpload: actions.handleUpload,
  };

  // ProjectsTab が期待する state/setters/handlers
  const projectState = { ...form.projects };
  const projectSetters = {
    setPTitle: form.projects.setPTitle,
    setPDescription: form.projects.setPDescription,
    setPTechStack: form.projects.setPTechStack,
    setPRolesNeeded: form.projects.setPRolesNeeded,
    setPStatus: form.projects.setPStatus,
  };
  const projectHandlers = {
    handleSaveProject: actions.handleSaveProject,
    startEditProject: actions.startEditProject,
    cancelEditProject: actions.cancelEditProject,
    handleMoveProject: actions.handleMoveProject,
    handleDelete: actions.handleDelete,
  };

  // FaqTab が期待する state/setters/handlers
  const faqState = {
    ...form.faqs,
    faqs,
  };
  const faqSetters = {
    setFQuestion: form.faqs.setFQuestion,
    setFAnswer: form.faqs.setFAnswer,
  };
  const faqHandlers = {
    handleSaveFaq: actions.handleSaveFaq,
    startEditFaq: actions.startEditFaq,
    cancelEditFaq: actions.cancelEditFaq,
    handleInsertDefaultFaqs: actions.handleInsertDefaultFaqs,
    handleTogglePublish: actions.handleTogglePublish,
    handleDelete: actions.handleDelete,
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F5F3EF", overflow: "hidden" }}>
      
      {/* 左側ナビゲーションサイドバー */}
      <aside style={{
        width: "280px", background: "var(--ink)", padding: "40px 24px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        borderRight: "1px solid rgba(255,255,255,0.05)", zIndex: 10
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
          <div>
            <h1 style={{ fontSize: "1.15rem", fontWeight: 900, color: "white", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <span>🎛️</span> NEXUS STUDIO <span style={{ fontSize: "0.6rem", background: "var(--accent)", color: "white", padding: "2px 6px", borderRadius: "4px" }}>PRO</span>
            </h1>
            <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginTop: "6px", fontWeight: 700, letterSpacing: "0.05em" }}>
              COMMUNITY CONSOLE /{" "}
              <span style={{ color: "var(--accent)", textTransform: "uppercase" }}>
                {ROLE_LABELS[userRole || ""] || userRole}
              </span>
              {isGuestRole(userRole) && (
                <span style={{ marginLeft: "6px", fontSize: "0.6rem", color: "#aaa" }}>(閲覧のみ)</span>
              )}
            </p>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {visibleTabs.includes("content") && (
              <NavBtn active={activeTab === "content"} label="🌐 一般テキスト編集" icon="✍️" onClick={() => setActiveTab("content")} />
            )}
            {visibleTabs.includes("activities") && (
              <NavBtn active={activeTab === "activities"} label="✍️ 活動記録管理" icon="📝" onClick={() => setActiveTab("activities")} />
            )}
            {visibleTabs.includes("members") && (
              <NavBtn active={activeTab === "members"} label="👤 メンバー情報管理" icon="👥" onClick={() => setActiveTab("members")} />
            )}
            {visibleTabs.includes("projects") && (
              <NavBtn active={activeTab === "projects"} label="🚀 コラボ PJ 管理" icon="💼" onClick={() => setActiveTab("projects")} />
            )}
            {visibleTabs.includes("faqs") && (
              <NavBtn active={activeTab === "faqs"} label="❓ FAQ 質問管理" icon="💬" onClick={() => setActiveTab("faqs")} />
            )}
            {visibleTabs.includes("inquiries") && (
              <NavBtn active={activeTab === "inquiries"} label="📬 申請・お問い合わせ管理" icon="📬" onClick={() => setActiveTab("inquiries")} />
            )}
            {visibleTabs.includes("system") && (
              <NavBtn active={activeTab === "system"} label="📊 システム・解析" icon="⚙️" onClick={() => setActiveTab("system")} />
            )}
            {visibleTabs.includes("role-settings") && (
              <NavBtn active={activeTab === "role-settings"} label="👑 役職設定" icon="🧩" onClick={() => setActiveTab("role-settings")} />
            )}
          </nav>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#48bb78" }} />
            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontFamily: "monospace" }}>
              {currentUserEmail}
            </span>
          </div>
        </div>
      </aside>

      {/* メインコンテンツエリア */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* ヘッダー */}
        <header style={{
          height: "80px", background: "white", borderBottom: "1px solid var(--border)",
          padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
          zIndex: 9
        }}>
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 900, color: "var(--ink)", margin: 0 }}>
              {activeTab === "content" && `🌐 サイト表示文言の編集 — ${activePage.toUpperCase()} ページ`}
              {activeTab === "activities" && "✍️ 活動記録 (Activity Log) の追加・編集・公開"}
              {activeTab === "members" && "👤 コミュニティメンバー情報の並び替え・管理"}
              {activeTab === "projects" && "🚀 共創コラボレーションプロジェクトの管理"}
              {activeTab === "faqs" && "❓ よくある質問 (FAQ) テンプレート管理"}
              {activeTab === "inquiries" && "📬 お問い合わせ・参加申請の管理"}
              {activeTab === "system" && "📊 アクセス統計解析・セキュリティ監視ログ"}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", position: "relative" }}>
            
            {/* 通知ベル */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", position: "relative", padding: "6px" }}
            >
              🔔
              {notifications.filter((n: NotificationItem) => n.status === 'unread').length > 0 && (
                <span style={{
                  position: "absolute", top: 0, right: 0, background: "#ff4d4d",
                  color: "white", fontSize: "0.6rem", fontWeight: 900, width: "16px",
                  height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {notifications.filter((n: NotificationItem) => n.status === 'unread').length}
                </span>
              )}
            </button>

            {/* 通知ドロップダウン */}
            {showNotifications && (
              <div style={{
                position: "absolute", top: "45px", right: "120px", width: "320px",
                background: "white", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                border: "1px solid #e2ede4", padding: "20px", zIndex: 100, maxHeight: "400px", overflowY: "auto"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 900 }}>🔔 お知らせ・承認通知</span>
                  {notifications.filter((n: NotificationItem) => n.status === 'unread').length > 0 && (
                    <button onClick={actions.handleMarkAllAsRead} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer" }}>
                      すべて既読
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "#aaa", fontSize: "0.75rem" }}>新着のお知らせはありません</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {notifications.map((n: NotificationItem) => (
                      <div key={n.id} onClick={() => actions.handleMarkAsRead(n.id)} style={{
                        padding: "10px 12px", background: n.status === 'unread' ? "#fffaf5" : "#fafafa",
                        borderRadius: "10px", border: n.status === 'unread' ? "1px solid #ffe6d9" : "1px solid #eee",
                        fontSize: "0.75rem", cursor: "pointer"
                      }}>
                        <div style={{ fontWeight: 800, color: n.status === 'unread' ? "var(--accent)" : "#555", marginBottom: "2px" }}>{n.title}</div>
                        <div style={{ color: "#666", lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: "0.6rem", color: "#aaa", marginTop: "4px" }}>{new Date(n.created_at).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* サインアウト */}
            <button 
              onClick={actions.handleSignOut}
              style={{ background: "transparent", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 800, color: "var(--ink-soft)", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--ink-soft)"; }}
            >
              🚪 サインアウト
            </button>
          </div>
        </header>

        {/* トースト */}
        {toast && (
          <div style={{
            position: "fixed", bottom: "30px", right: "30px",
            background: toast.type === "success" ? "#2f855a" : "#c53030",
            color: "white", padding: "14px 24px", borderRadius: "12px",
            fontSize: "0.8rem", fontWeight: 800, zIndex: 1000, display: "flex", alignItems: "center", gap: "8px"
          }}>
            <span>{toast.type === "success" ? "✅" : "🚨"}</span>
            {toast.msg}
          </div>
        )}

        {/* エラー表示 */}
        {errorMsg && (
          <div style={{ background: "#FFEBEB", color: "#CC0000", padding: "16px 40px", fontSize: "0.85rem", fontWeight: 700, borderBottom: "1px solid #FFA3A3" }}>
            ⚠️ データベース通信エラー: {errorMsg}
          </div>
        )}

        {/* コンテンツエリア */}
        <div style={{ flex: 1, display: "flex", flexDirection: activeTab === "content" ? "column" : "row", overflow: "hidden" }}>
          <div style={{ flex: activeTab === "content" ? "0 0 62%" : 1, minHeight: 0, padding: "40px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "30px" }}>
            
            {activeTab === "content" && (
              <ContentTab
                activePage={activePage}
                setActivePage={setActivePage}
                liveData={liveData}
                handleUpdateContent={actions.handleUpdateContentLocally}
                onSave={actions.handleSaveAllContentChanges}
                onReload={actions.handleReloadOriginalContent}
                publishing={publishing}
                userRole={userRole}
                hasPermission={hasPermission}
              />
            )}

            {activeTab === "activities" && (
              <ActivityTab
                state={activityState}
                setters={activitySetters}
                handlers={activityHandlers}
                activities={activities}
                userRole={userRole}
                hasPermission={hasPermission}
              />
            )}

            {activeTab === "members" && (
              <MembersTab
                state={memberState}
                setters={memberSetters}
                handlers={memberHandlers}
                userRole={userRole}
                hasPermission={hasPermission}
              />
            )}

            {activeTab === "projects" && (
              <ProjectsTab
                state={projectState}
                setters={projectSetters}
                handlers={projectHandlers}
                projects={projects}
                userRole={userRole}
                hasPermission={hasPermission}
              />
            )}

            {activeTab === "faqs" && (
              <FaqTab
                state={faqState}
                setters={faqSetters}
                handlers={faqHandlers}
                userRole={userRole}
                hasPermission={hasPermission}
              />
            )}

            {activeTab === "inquiries" && (
              <InquiriesTab
                inquiries={inquiries}
                handleUpdateStatus={actions.handleUpdateInquiryStatus}
                handleDelete={actions.handleDelete}
                showToast={showToast}
                hasPermission={hasPermission}
                userRole={userRole}
              />
            )}

            {activeTab === "system" && (
              <SystemDashboardTab
                analytics={analyticsData}
                logs={auditLogs}
                userRole={userRole}
                allowedUsers={allowedUsers}
                rolePermissions={rolePermissions}
                currentUserEmail={currentUserEmail}
                onAddUser={actions.handleAddAllowedUser}
                onRemoveUser={actions.handleRemoveAllowedUser}
                onChangeRole={actions.handleChangeUserRole}
                onUpdateDisplayName={actions.handleUpdateAllowedUserDisplayName}
                onFixUserEmail={actions.handleFixAllowedUserEmail}
                onUpdateUserPermissions={actions.handleUpdateAllowedUserPermissions}
                hasPermission={hasPermission}
                trashItems={{
                  activities: deletedActivities,
                  members: deletedMembers,
                  projects: deletedProjects,
                  faqs: deletedFaqs
                }}
                onRestoreItem={actions.handleRestoreItem}
                onPermanentDelete={actions.handlePermanentDelete}
                pendingProposals={{
                  activities: pendingActivities,
                  members: pendingMembers,
                  projects: pendingProjects,
                  faqs: pendingFaqs,
                  content: pendingContentProposals
                }}
                onApproveProposal={actions.handleApproveProposal}
                onRejectProposal={actions.handleRejectProposal}
              />
            )}

            {activeTab === "role-settings" && (
              <RoleSettingsTab
                rolePermissions={rolePermissions}
                onSaveRolePermissions={actions.handleUpdateRolePermissions}
                hasPermission={hasPermission}
              />
            )}
          </div>

          {/* 🔑 PreviewPanel に必要な全propsを正しく渡す */}
          {activeTab === "content" && (
            <div style={{ flex: "0 0 38%", minHeight: 0, padding: "0 40px 40px", background: "#f5f3ef", overflow: "auto" }}>
              <PreviewPanel
                stacked
                activeTab={activeTab as any}
                activePage={activePage}
                liveData={liveData}
                title={form.activities.title}
                imageUrl={form.activities.imageUrl}
                summary={form.activities.summary}
                faqs={faqs}
                fQuestion={form.faqs.fQuestion}
                fAnswer={form.faqs.fAnswer}
                members={members}
                mName={form.members.mName}
                mRole={form.members.mRole}
                mMessage={form.members.mMessage}
                mPhotoUrl={form.members.mPhotoUrl}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

