import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import { S } from "./SharedUI";

interface Props {
  analytics: {
    totalViews: number;
    todayViews: number;
    popularPages: any[];
  };
  logs: any[];
  userRole: "owner" | "editor" | "proposer" | null;
  allowedUsers: any[];
  currentUserEmail: string;
  onAddUser: (email: string, role: string) => Promise<void>;
  onRemoveUser: (email: string) => Promise<void>;
  onChangeRole: (email: string, role: string) => Promise<void>;
  
  // 🗑️ ゴミ箱用Props
  trashItems?: {
    activities: any[];
    members: any[];
    projects: any[];
    faqs: any[];
  };
  onRestoreItem?: (table: string, id: string) => Promise<void>;
  onPermanentDelete?: (table: string, id: string) => Promise<void>;

  // 📬 承認待ち（提案ボックス）用Props
  pendingProposals?: {
    activities: any[];
    members: any[];
    projects: any[];
    faqs: any[];
    content?: any[]; // 🌟 テキスト提案を追加
  };
  onApproveProposal?: (table: string, id: string) => Promise<void>;
  onRejectProposal?: (table: string, id: string) => Promise<void>;
}

export function SystemDashboardTab({ 
  analytics, 
  logs,
  userRole,
  allowedUsers,
  currentUserEmail,
  onAddUser,
  onRemoveUser,
  onChangeRole,
  trashItems = { activities: [], members: [], projects: [], faqs: [] },
  onRestoreItem,
  onPermanentDelete,
  pendingProposals = { activities: [], members: [], projects: [], faqs: [], content: [] },
  onApproveProposal,
  onRejectProposal
}: Props) {
  const [bulletin, setBulletin] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState("");
  const [updating, setUpdating] = useState(false);

  const [clickStats, setClickStats] = useState<{
    projects: { name: string; clicks: number }[];
    members: { name: string; type: string; clicks: number }[];
  }>({ projects: [], members: [] });

  // 📢 伝言板の読み込み
  const fetchBulletin = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_bulletins')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setBulletin(data[0].content);
        setTempContent(data[0].content);
      } else {
        const defaultMsg = "📢 運営伝言板へようこそ！ここにはオーナーからの重要な連絡事項や指示がピン留め表示されます。";
        setBulletin(defaultMsg);
        setTempContent(defaultMsg);
      }
    } catch (err) {
      console.error("伝言板の取得に失敗しました:", err);
    }
  };

  // 📈 クリックイベント統計の集計
  const fetchClickStats = async () => {
    try {
      const { data, error } = await supabase.from('click_events').select('*');
      if (error) throw error;
      if (!data) return;

      const projMap: Record<string, number> = {};
      const memMap: Record<string, { type: string; clicks: number }> = {};

      data.forEach((evt) => {
        if (evt.event_type === 'project_apply') {
          projMap[evt.target_name] = (projMap[evt.target_name] || 0) + 1;
        } else if (evt.event_type.startsWith('member_')) {
          const typeLabel = evt.event_type === 'member_github' ? '🐙 GitHub' : '🌐 Site';
          const key = `${evt.target_name} (${typeLabel})`;
          if (!memMap[key]) {
            memMap[key] = { type: typeLabel, clicks: 0 };
          }
          memMap[key].clicks += 1;
        }
      });

      const sortedProjs = Object.keys(projMap)
        .map(name => ({ name, clicks: projMap[name] }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5);

      const sortedMems = Object.keys(memMap)
        .map(key => ({ name: key.replace(/ \(.*\)/, ""), type: memMap[key].type, clicks: memMap[key].clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5);

      setClickStats({ projects: sortedProjs, members: sortedMems });
    } catch (err) {
      console.error("統計データの取得に失敗しました:", err);
    }
  };

  useEffect(() => {
    fetchBulletin();
    fetchClickStats();
  }, []);

  const handleSaveBulletin = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('admin_bulletins')
        .insert([{ content: tempContent, is_pinned: true }]);

      if (error) throw error;
      setBulletin(tempContent);
      setIsEditing(false);
      
      await supabase.from('audit_logs').insert([{
        actor_email: currentUserEmail,
        action: "bulletin_update",
        details: "運営伝言板の内容を更新しました"
      }]);
    } catch (err) {
      alert("伝言の更新に失敗しました");
    } finally {
      setUpdating(false);
    }
  };

  // ゴミ箱のアイテム総数
  const totalTrashCount = 
    (trashItems.activities?.length || 0) + 
    (trashItems.members?.length || 0) + 
    (trashItems.projects?.length || 0) + 
    (trashItems.faqs?.length || 0);

  // 📬 届いた提案（承認待ち）のアイテム総数
  const totalProposalCount = 
    (pendingProposals.activities?.length || 0) + 
    (pendingProposals.members?.length || 0) + 
    (pendingProposals.projects?.length || 0) + 
    (pendingProposals.faqs?.length || 0) +
    (pendingProposals.content?.length || 0); // 🌟 テキスト提案分も集計

  const maxProjClicks = Math.max(...clickStats.projects.map(p => p.clicks), 1);
  const maxMemClicks = Math.max(...clickStats.members.map(m => m.clicks), 1);

  return (
    <div>
      <h2 style={S.sectionTitle}>システム情報 ＆ アクセス解析</h2>
      
      {/* 📌 運営伝言板 */}
      <div style={{ 
        background: "linear-gradient(135deg, #fffaf0, #fff5e6)", 
        border: "1px solid #ffe0b3", 
        borderRadius: "24px", 
        padding: "30px", 
        marginBottom: "40px",
        boxShadow: "0 10px 25px rgba(230, 92, 0, 0.03)",
        position: "relative"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.3rem" }}>📌</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "#e65c00", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Admin Bulletin Board / 運営伝言板
            </span>
          </div>
          
          {userRole === "owner" && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              style={{
                background: "white", border: "1px solid #ffe0b3", padding: "6px 14px",
                borderRadius: "10px", fontSize: "0.75rem", fontWeight: 800, color: "#e65c00",
                cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#e65c00"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#e65c00"; }}
            >
              📝 伝言を編集する
            </button>
          )}
        </div>

        {isEditing ? (
          <div>
            <textarea 
              value={tempContent}
              onChange={(e) => setTempContent(e.target.value)}
              style={{
                width: "100%", minHeight: "120px", padding: "14px", borderRadius: "14px",
                border: "1px solid #ffe0b3", outline: "none", fontSize: "0.95rem",
                fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box", marginBottom: "16px"
              }}
              placeholder="伝言内容を記入してください"
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={handleSaveBulletin}
                disabled={updating}
                style={{
                  background: "#e65c00", color: "white", border: "none", padding: "8px 20px",
                  borderRadius: "10px", fontSize: "0.8rem", fontWeight: 800, cursor: "pointer"
                }}
              >
                {updating ? "保存中..." : "保存してピン留め"}
              </button>
              <button 
                onClick={() => { setIsEditing(false); setTempContent(bulletin); }}
                style={{
                  background: "white", color: "#666", border: "1px solid #ddd", padding: "8px 20px",
                  borderRadius: "10px", fontSize: "0.8rem", fontWeight: 800, cursor: "pointer"
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div style={{ 
            fontSize: "0.95rem", color: "#5c3d14", lineHeight: 1.8, 
            whiteSpace: "pre-wrap", background: "rgba(255, 255, 255, 0.5)", 
            padding: "20px", borderRadius: "16px", border: "1px solid rgba(230, 92, 0, 0.05)" 
          }}>
            {bulletin}
          </div>
        )}
      </div>

      {/* 📊 届いた提案ボックス (管理者 ＆ 編集者のみ表示) */}
      {(userRole === "owner" || userRole === "editor") && (
        <div style={{ 
          background: "white", 
          padding: "32px", 
          borderRadius: "24px", 
          border: totalProposalCount > 0 ? "2px solid #0055ff" : "1px solid var(--border)",
          boxShadow: totalProposalCount > 0 ? "0 10px 30px rgba(0, 85, 255, 0.05)" : "none",
          marginBottom: "40px"
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            📬 届いた編集提案・承認待ちリスト ({totalProposalCount} 件)
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "20px" }}>
            提案者（proposer）から届いた作成・編集申請です。承認されると本番サイトに自動公開されます。
          </p>

          {totalProposalCount === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: "0.85rem", background: "#fcfcfa", borderRadius: "16px", border: "1px solid #f2ede4" }}>
              ☕ 承認待ちの提案はありません。すべて最新です。
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { table: 'activities', label: '✍️ 活動記録', items: pendingProposals.activities },
                { table: 'members', label: '👤 メンバー', items: pendingProposals.members },
                { table: 'projects', label: '🚀 プロジェクト', items: pendingProposals.projects },
                { table: 'faqs', label: '❓ FAQ質問', items: pendingProposals.faqs },
                { table: 'content_proposals', label: '🌐 一般テキスト', items: pendingProposals.content || [] } // 🌟 追加！
              ].map(({ table, label, items }) => {
                if (!items || items.length === 0) return null;
                return items.map((item: any) => {
                  const displayTitle = table === 'content_proposals'
                    ? `ページ: ${item.page_path.toUpperCase()} (項目キー: ${item.content_key})`
                    : (item.title || item.name || item.question || "提案データ");
                  
                  return (
                     <div 
                       key={table + item.id} 
                       style={{ 
                         display: "flex", justifyContent: "space-between", alignItems: "center", 
                         padding: "18px 24px", background: "#f5f9ff", borderRadius: "14px", 
                         border: "1px solid #d9e8ff", flexWrap: "wrap", gap: "12px" 
                       }}
                     >
                       <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: "280px" }}>
                         <span style={{ fontSize: "0.7rem", fontWeight: 900, background: "#e1eeff", color: "#0055ff", padding: "3px 8px", borderRadius: "6px", whiteSpace: "nowrap", marginTop: "2px" }}>
                           {label}
                         </span>
                         <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
                           <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#111" }}>
                             {displayTitle}
                           </span>
                           {table === 'content_proposals' && (
                             <div style={{ fontSize: "0.8rem", color: "#444", background: "white", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e1e8f0", marginTop: "6px", lineHeight: 1.5 }}>
                               提案値: <span style={{ fontWeight: 800, color: "#0055ff" }}>「{item.proposed_value}」</span>
                               <span style={{ display: "block", fontSize: "0.7rem", color: "#888", marginTop: "4px" }}>提案者: {item.proposer_email}</span>
                             </div>
                           )}
                         </div>
                       </div>

                       <div style={{ display: "flex", gap: "10px" }}>
                         <button 
                           onClick={() => onApproveProposal && onApproveProposal(table, item.id)}
                           style={{
                             background: "#0055ff", color: "white", border: "none",
                             padding: "8px 14px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800,
                             cursor: "pointer"
                           }}
                         >
                           ✅ 承認して公開
                         </button>
                         <button 
                           onClick={() => onRejectProposal && onRejectProposal(table, item.id)}
                           style={{
                             background: "white", color: "#666", border: "1px solid #ccc",
                             padding: "8px 14px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800,
                             cursor: "pointer"
                           }}
                         >
                           ❌ 却下する
                         </button>
                       </div>
                     </div>
                  );
                });
              })}
            </div>
          )}
        </div>
      )}

      {/* アクセス数概要カード */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
        <div style={{ background: "white", padding: "28px", borderRadius: "20px", border: "1px solid var(--border)", boxShadow: "0 4px 15px rgba(0,0,0,0.01)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--muted)", letterSpacing: "0.1em", marginBottom: "8px" }}>TODAY'S VIEWS</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--accent)" }}>{analytics.todayViews}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>PV</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#888", margin: "12px 0 0" }}>本日一般公開サイトに訪れたPV数です</p>
        </div>

        <div style={{ background: "white", padding: "28px", borderRadius: "20px", border: "1px solid var(--border)", boxShadow: "0 4px 15px rgba(0,0,0,0.01)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--muted)", letterSpacing: "0.1em", marginBottom: "8px" }}>TOTAL VIEWS</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "#111" }}>{analytics.totalViews}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>PV</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#888", margin: "12px 0 0" }}>計測開始からの累計PV数です</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>

        {/* 📈 ユーザーエンゲージメント分析 */}
        <div style={{ background: "white", padding: "32px", borderRadius: "24px", border: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            📈 ユーザーアクション・エンゲージメント分析
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "24px" }}>
            公開サイトで学生たちが実際にとった行動ログを匿名で集計しています。
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--muted)", marginBottom: "16px" }}>🚀 参画申請の多いプロジェクト</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {clickStats.projects.length === 0 ? (
                  <div style={{ fontSize: "0.8rem", color: "#ccc", padding: "10px 0" }}>クリックデータがありません</div>
                ) : (
                  clickStats.projects.map((item) => {
                    const pct = (item.clicks / maxProjClicks) * 100;
                    return (
                      <div key={item.name}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "6px" }}>
                          <span style={{ color: "#333" }}>{item.name}</span>
                          <span style={{ color: "#e65c00" }}>{item.clicks} 回申請</span>
                        </div>
                        <div style={{ width: "100%", height: "8px", background: "#f2ede4", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #e65c00, #ff8000)", borderRadius: "4px" }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--muted)", marginBottom: "16px" }}>👤 訪問の多いメンバーリンク</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {clickStats.members.length === 0 ? (
                  <div style={{ fontSize: "0.8rem", color: "#ccc", padding: "10px 0" }}>クリックデータがありません</div>
                ) : (
                  clickStats.members.map((item) => {
                    const pct = (item.clicks / maxMemClicks) * 100;
                    return (
                      <div key={item.name + item.type}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "6px" }}>
                          <span style={{ color: "#333" }}>{item.name} <span style={{ fontSize: "0.7rem", color: "#888", fontWeight: 400 }}>[{item.type}]</span></span>
                          <span style={{ color: "#111" }}>{item.clicks} クリック</span>
                        </div>
                        <div style={{ width: "100%", height: "8px", background: "#f2ede4", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #333, #666)", borderRadius: "4px" }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 🗑️ データ回復用ゴミ箱 */}
        <div style={{ 
          background: "white", 
          padding: "32px", 
          borderRadius: "24px", 
          border: totalTrashCount > 0 ? "2px dashed #ffb3b3" : "1px solid var(--border)",
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            🗑️ データゴミ箱 (論理削除データのリカバリー)
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "20px" }}>
            間違って削除されたデータはここに一時保存されます。いつでも復元できます。
          </p>

          {totalTrashCount === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: "0.85rem", background: "#fcfcfa", borderRadius: "16px", border: "1px solid #f2ede4" }}>
              ✨ 現在、ゴミ箱は空っぽです。データは安全に保護されています！
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { table: 'activities', label: '✍️ 活動記録', items: trashItems.activities },
                { table: 'members', label: '👤 メンバー', items: trashItems.members },
                { table: 'projects', label: '🚀 プロジェクト', items: trashItems.projects },
                { table: 'faqs', label: '❓ FAQ質問', items: trashItems.faqs }
              ].map(({ table, label, items }) => {
                if (!items || items.length === 0) return null;
                return items.map((item: any) => {
                  const displayTitle = item.title || item.name || item.question || "無題のコンテンツ";
                  return (
                    <div 
                      key={table + item.id} 
                      style={{ 
                        display: "flex", justifyContent: "space-between", alignItems: "center", 
                        padding: "14px 20px", background: "#fffafa", borderRadius: "14px", 
                        border: "1px solid #ffebeb", flexWrap: "wrap", gap: "12px" 
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 900, background: "#ffe6e6", color: "#ff4d4d", padding: "3px 8px", borderRadius: "6px" }}>
                          {label}
                        </span>
                        <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#333" }}>
                          {displayTitle.length > 25 ? `${displayTitle.slice(0, 25)}...` : displayTitle}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button 
                          onClick={() => onRestoreItem && onRestoreItem(table, item.id)}
                          style={{
                            background: "#e6ffe6", color: "#008000", border: "1px solid #b3ffb3",
                            padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800,
                            cursor: "pointer"
                          }}
                        >
                          ↩️ 復元する
                        </button>
                        <button 
                          onClick={() => onPermanentDelete && onPermanentDelete(table, item.id)}
                          style={{
                            background: "#ffe6e6", color: "#cc0000", border: "1px solid #ffb3b3",
                            padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800,
                            cursor: "pointer"
                          }}
                        >
                          🚨 永久消去
                        </button>
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          )}
        </div>
        
        {/* 👑 権限・ログイン許可リスト管理 */}
        {userRole === "owner" && (
          <div style={{ background: "white", padding: "32px", borderRadius: "24px", border: "2px solid var(--accent)", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px", color: "var(--accent)" }}>
              🔑 権限・ログイン許可リスト管理 (オーナー専用)
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "24px" }}>
              ログインを許可するGoogleアカウントの管理および権限割当を行います。
            </p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const emailInput = form.elements.namedItem("email") as HTMLInputElement;
              const roleSelect = form.elements.namedItem("role") as HTMLSelectElement;
              onAddUser(emailInput.value, roleSelect.value);
              emailInput.value = "";
            }} style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="追加するメンバーのGmailアドレス" 
                style={{ ...S.select, flex: 1, minWidth: "220px", padding: "10px 16px", height: "auto" }}
              />
              <select name="role" style={{ ...S.select, width: "auto", padding: "10px 16px", height: "auto" }}>
                <option value="proposer">💡 提案者 (proposer)</option>
                <option value="editor">📝 編集者 (editor)</option>
                <option value="owner">👑 オーナー (owner)</option>
              </select>
              <button type="submit" style={{ ...S.primaryBtn, width: "auto", padding: "10px 24px" }}>
                ➕ 許可リストに追加
              </button>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {allowedUsers.map((u) => {
                const isSelf = u.email.toLowerCase() === currentUserEmail.toLowerCase();
                return (
                  <div key={u.email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: "#fdfbf8", borderRadius: "12px", border: "1px solid #f2ede4", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#333", fontFamily: "monospace" }}>{u.email}</span>
                      {isSelf && (
                        <span style={{ background: "var(--accent-pale)", color: "var(--accent)", padding: "2px 8px", borderRadius: "6px", fontSize: "0.65rem", fontWeight: 800 }}>あなた</span>
                      )}
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <select 
                        value={u.role} 
                        disabled={isSelf} 
                        onChange={(e) => onChangeRole(u.email, e.target.value)}
                        style={{ ...S.select, width: "auto", padding: "6px 12px", fontSize: "0.8rem", height: "auto", background: u.role === "owner" ? "#fff0f0" : "white" }}
                      >
                        <option value="proposer">💡 提案者</option>
                        <option value="editor">📝 編集者</option>
                        <option value="owner">👑 オーナー</option>
                      </select>

                      <button 
                        onClick={() => onRemoveUser(u.email)}
                        disabled={isSelf} 
                        style={{ 
                          ...S.dangerBtn, 
                          padding: "6px 12px", 
                          opacity: isSelf ? 0.3 : 1,
                          cursor: isSelf ? "not-allowed" : "pointer"
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 人気ページランキング */}
        <div style={{ background: "white", padding: "32px", borderRadius: "24px", border: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            🔥 人気ページランキング
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {analytics.popularPages.length === 0 ? (
              <div style={{ color: "#aaa", fontSize: "0.85rem", textAlign: "center", padding: "20px" }}>まだアクセスデータが蓄積されていません。</div>
            ) : (
              analytics.popularPages.map((p, idx) => (
                <div key={p.path} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: idx !== analytics.popularPages.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ background: idx === 0 ? "var(--accent-pale)" : "#eee", color: idx === 0 ? "var(--accent)" : "#666", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 900 }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: "0.9rem", fontFamily: "monospace", color: "#333" }}>{p.path}</span>
                  </div>
                  <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>{p.views} PV</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* セキュリティ操作履歴 */}
        <div style={{ background: "white", padding: "32px", borderRadius: "24px", border: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            🛡️ セキュリティ監査ログ (操作履歴)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "300px", overflowY: "auto", paddingRight: "10px" }}>
            {logs.length === 0 ? (
              <div style={{ color: "#aaa", fontSize: "0.85rem", textAlign: "center", padding: "20px" }}>操作履歴はまだありません。</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{ display: "flex", flexDirection: "column", gap: "4px", paddingBottom: "12px", borderBottom: "1px solid #f5f5f5" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#888" }}>
                    <span style={{ fontWeight: 800, color: "var(--accent)" }}>{log.actor_email}</span>
                    <span>{new Date(log.created_at).toLocaleString('ja-JP')}</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#333", lineHeight: 1.5 }}>
                    <span style={{ background: "#f0f0f0", padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 900, marginRight: "8px", textTransform: "uppercase" }}>
                      {log.action}
                    </span>
                    {log.details}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

