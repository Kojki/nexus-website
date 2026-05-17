import React from "react";
import { S } from "./SharedUI";

interface Props {
  analytics: {
    totalViews: number;
    todayViews: number;
    popularPages: any[];
  };
  logs: any[];
  userRole: "owner" | "editor" | null;
  allowedUsers: any[];
  currentUserEmail: string;
  onAddUser: (email: string, role: string) => Promise<void>;
  onRemoveUser: (email: string) => Promise<void>;
  onChangeRole: (email: string, role: string) => Promise<void>;
}

export function SystemDashboardTab({ 
  analytics, 
  logs,
  userRole,
  allowedUsers,
  currentUserEmail,
  onAddUser,
  onRemoveUser,
  onChangeRole
}: Props) {
  return (
    <div>
      <h2 style={S.sectionTitle}>システム情報 ＆ アクセス解析</h2>
      
      {/* 1. アクセス数概要カード */}
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
        
        {/* 2. 👑 【オーナー専用】権限・ログイン許可リスト管理 */}
        {userRole === "owner" && (
          <div style={{ background: "white", padding: "32px", borderRadius: "24px", border: "2px solid var(--accent)", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px", color: "var(--accent)" }}>
              🔑 権限・ログイン許可リスト管理 (オーナー専用)
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "24px" }}>
              管理画面にログインを許可するGoogleアカウントの登録、および操作権限の強さをコントロールします。
            </p>
            
            {/* 新規追加フォーム */}
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
                <option value="editor">📝 一般編集者 (editor)</option>
                <option value="owner">👑 共同オーナー (owner)</option>
              </select>
              <button type="submit" style={{ ...S.primaryBtn, width: "auto", padding: "10px 24px" }}>
                ➕ 許可リストに追加
              </button>
            </form>

            {/* 登録ユーザー一覧 */}
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
                      {/* ロール変更セレクタ */}
                      <select 
                        value={u.role} 
                        disabled={isSelf} // 自身のロックアウトを防ぐ
                        onChange={(e) => onChangeRole(u.email, e.target.value)}
                        style={{ ...S.select, width: "auto", padding: "6px 12px", fontSize: "0.8rem", height: "auto", background: u.role === "owner" ? "#fff0f0" : "white" }}
                      >
                        <option value="editor">📝 編集者</option>
                        <option value="owner">👑 オーナー</option>
                      </select>

                      {/* 削除ボタン */}
                      <button 
                        onClick={() => onRemoveUser(u.email)}
                        disabled={isSelf} // 自身のロックアウトを防ぐ
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

        {/* 3. 人気ページランキング */}
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

        {/* 4. セキュリティ操作履歴 (監査ログタイムライン) */}
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

