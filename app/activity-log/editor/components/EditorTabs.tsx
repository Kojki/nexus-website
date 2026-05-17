import React, { useState } from "react";
import { PageTabBtn, InputField, S, PagePath } from "./SharedUI";

// 🟢 [新設] 共通の超プレミアム画像ドラッグ＆ドロップ・アップローダー
function DragDropImageZone({ label, imageUrl, uploading, onUpload, onClear }: any) {
  const [dragging, setDragging] = useState(false);
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onUpload(file);
    }
  };

  return (
    <div style={S.group}>
      <label style={S.fieldLabel}>{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: dragging ? "2px dashed var(--accent)" : "2px dashed var(--border)",
          background: dragging ? "var(--accent-pale)" : "white",
          borderRadius: "16px",
          padding: "24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
          position: "relative"
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            opacity: 0, cursor: "pointer", zIndex: 5
          }}
        />
        {uploading ? (
          <span style={{ fontSize: "0.85rem", color: "#888" }}>⚡ 画像を圧縮してアップロード中...</span>
        ) : imageUrl ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", position: "relative", zIndex: 10 }}>
            <img src={imageUrl} style={{ height: "100px", borderRadius: "10px", objectFit: "cover" }} alt="Uploaded" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClear(); }}
              style={{ ...S.dangerBtn, padding: "6px 14px", fontSize: "0.75rem", background: "white", border: "1px solid #ddd" }}
            >
              🗑️ 画像を削除する
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", pointerEvents: "none" }}>
            <span style={{ fontSize: "1.8rem" }}>🖼️</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--ink)" }}>画像をドラッグ＆ドロップ</span>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>または、ここをクリックしてファイルを選択</span>
          </div>
        )}
      </div>
    </div>
  );
}

// 🌐 サイト文言編集タブ
export function ContentTab({ activePage, setActivePage, liveData, handleUpdateContent }: any) {
  return (
    <div>
      <h2 style={S.sectionTitle}>サイト文言の編集</h2>
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
        {(["home", "about", "guidelines", "privacy", "en"] as PagePath[]).map(p => (
          <PageTabBtn key={p} active={activePage === p} onClick={() => setActivePage(p)}>
            {p.toUpperCase()}
          </PageTabBtn>
        ))}
      </div>

      <div style={S.formStack}>
        {/* --- HOME ページ --- */}
        {activePage === "home" && (
          <>
            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>メイン（HERO）エリア</h3>
              <InputField label="メインキャッチコピー" value={liveData.hero_title || ""} onChange={(v: string) => handleUpdateContent("hero_title", v)} placeholder="つながる、生み出す、Nexus" />
              <InputField label="紹介サブテキスト" value={liveData.hero_copy || ""} onChange={(v: string) => handleUpdateContent("hero_copy", v)} textarea placeholder="意欲ある学生のためのコミュニティ..." />
            </div>

            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ABOUT（Nexusについて）エリア</h3>
              <InputField label="セクション見出し" value={liveData.about_title || ""} onChange={(v: string) => handleUpdateContent("about_title", v)} />
              <InputField label="本文段落 1" value={liveData.about_body_1 || ""} onChange={(v: string) => handleUpdateContent("about_body_1", v)} textarea />
              <InputField label="本文段落 2" value={liveData.about_body_2 || ""} onChange={(v: string) => handleUpdateContent("about_body_2", v)} textarea />
            </div>

            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ACTIVITY（活動内容）エリア</h3>
              <InputField label="セクション見出し" value={liveData.activity_title || ""} onChange={(v: string) => handleUpdateContent("activity_title", v)} />
              <InputField label="概要説明テキスト" value={liveData.activity_copy || ""} onChange={(v: string) => handleUpdateContent("activity_copy", v)} textarea />
            </div>
          </>
        )}

        {/* --- ABOUT ページ --- */}
        {activePage === "about" && (
          <>
            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ヘッダー</h3>
              <InputField label="ヘッダータイトル" value={liveData.hero_title || ""} onChange={(v: string) => handleUpdateContent("hero_title", v)} />
            </div>

            {[1, 2, 3].map(i => (
              <div key={i} style={S.editorCard}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ブロック {i}</h3>
                <InputField label="ブロックタイトル" value={liveData[`block_${i}_title`] || ""} onChange={(v: string) => handleUpdateContent(`block_${i}_title`, v)} />
                <InputField label="ブロック本文" value={liveData[`block_${i}_body`] || ""} onChange={(v: string) => handleUpdateContent(`block_${i}_body`, v)} textarea />
              </div>
            ))}
          </>
        )}

        {/* --- GUIDELINES ページ --- */}
        {activePage === "guidelines" && (
          <>
            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ヘッダー・導入設定</h3>
              <InputField label="大見出しタイトル" value={liveData.hero_title || ""} onChange={(v: string) => handleUpdateContent("hero_title", v)} />
              <InputField label="ガイドライン前文（導入テキスト）" value={liveData.intro_text || ""} onChange={(v: string) => handleUpdateContent("intro_text", v)} textarea />
            </div>

            {[1, 2, 3].map(num => (
              <div key={num} style={S.editorCard}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ガイドラインルール 0{num}</h3>
                <InputField label="ルールの見出し" value={liveData[`rule_${num}_title`] || ""} onChange={(v: string) => handleUpdateContent(`rule_${num}_title`, v)} />
                <InputField label="ルールの詳細本文" value={liveData[`rule_${num}_body`] || ""} onChange={(v: string) => handleUpdateContent(`rule_${num}_body`, v)} textarea />
              </div>
            ))}
          </>
        )}

        {/* --- PRIVACY ページ --- */}
        {activePage === "privacy" && (
          <>
            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ヘッダー設定</h3>
              <InputField label="タイトル" value={liveData.hero_title || ""} onChange={(v: string) => handleUpdateContent("hero_title", v)} />
              <InputField label="最終更新日 (例: 最終更新日：2026年5月)" value={liveData.last_updated || ""} onChange={(v: string) => handleUpdateContent("last_updated", v)} />
            </div>

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
              <div key={num} style={S.editorCard}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>セクション {num}</h3>
                <InputField label="条項のタイトル" value={liveData[`section_${num}_title`] || ""} onChange={(v: string) => handleUpdateContent(`section_${num}_title`, v)} />
                <InputField label="条項の本文" value={liveData[`section_${num}_body`] || ""} onChange={(v: string) => handleUpdateContent(`section_${num}_body`, v)} textarea />
              </div>
            ))}
          </>
        )}

        {/* --- ENGLISH (EN) ページ --- */}
        {activePage === "en" && (
          <>
            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>👑 HERO AREA (ENGLISH)</h3>
              <InputField label="Hero Title" value={liveData.hero_title || ""} onChange={(v: string) => handleUpdateContent("hero_title", v)} placeholder="Connect, Create,\nGo Beyond." />
              <InputField label="Hero Copy Text" value={liveData.hero_copy || ""} onChange={(v: string) => handleUpdateContent("hero_copy", v)} textarea />
            </div>

            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>🌐 ABOUT AREA (ENGLISH)</h3>
              <InputField label="Section Title" value={liveData.about_title || ""} onChange={(v: string) => handleUpdateContent("about_title", v)} />
              <InputField label="About Paragraph 1" value={liveData.about_body_1 || ""} onChange={(v: string) => handleUpdateContent("about_body_1", v)} textarea />
              <InputField label="About Paragraph 2" value={liveData.about_body_2 || ""} onChange={(v: string) => handleUpdateContent("about_body_2", v)} textarea />
            </div>

            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>🙋 FOR WHO AREA (ENGLISH)</h3>
              <InputField label="Main Heading" value={liveData.forwho_title || ""} onChange={(v: string) => handleUpdateContent("forwho_title", v)} />
              {[1, 2, 3, 4].map(num => (
                <div key={num} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
                  <InputField label={`0${num}. Title`} value={liveData[`forwho_${num}_title`] || ""} onChange={(v: string) => handleUpdateContent(`forwho_${num}_title`, v)} />
                  <InputField label={`0${num}. Description`} value={liveData[`forwho_${num}_text`] || ""} onChange={(v: string) => handleUpdateContent(`forwho_${num}_text`, v)} />
                </div>
              ))}
            </div>

            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>⚡ ACTIVITIES AREA (ENGLISH)</h3>
              <InputField label="Section Title" value={liveData.activity_title || ""} onChange={(v: string) => handleUpdateContent("activity_title", v)} />
              <InputField label="Activities Main Copy" value={liveData.activity_copy || ""} onChange={(v: string) => handleUpdateContent("activity_copy", v)} textarea />
              {[1, 2, 3].map(num => (
                <div key={num} style={{ marginTop: "16px" }}>
                  <InputField label={`0${num}. Title`} value={liveData[`activity_${num}_title`] || ""} onChange={(v: string) => handleUpdateContent(`activity_${num}_title`, v)} />
                  <InputField label={`0${num}. Description`} value={liveData[`activity_${num}_text`] || ""} onChange={(v: string) => handleUpdateContent(`activity_${num}_text`, v)} textarea />
                </div>
              ))}
            </div>

            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>💬 JOIN US AREA (ENGLISH)</h3>
              <InputField label="Join Title" value={liveData.join_title || ""} onChange={(v: string) => handleUpdateContent("join_title", v)} />
              <InputField label="Join Subtext" value={liveData.join_copy || ""} onChange={(v: string) => handleUpdateContent("join_copy", v)} textarea />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ✍️ 活動記録管理タブ
export function ActivityTab({ state, setters, handlers, activities }: any) {
  return (
    <div>
      <h2 style={S.sectionTitle}>活動記録の管理</h2>

      <div style={{ ...S.editorCard, marginBottom: "40px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>
          {state.editingActivityId ? "📝 活動記録の編集" : "活動記録の作成"}
        </h3>
        
        <div style={S.formStack}>
          <InputField label="タイトル *" value={state.title} onChange={setters.setTitle} placeholder="第1回アイデア会議を開催しました" />
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <InputField label="日付 *" value={state.date} onChange={setters.setDate} />
            
            {/* カテゴリビジュアルカード */}
            <div style={{ marginBottom: "8px" }}>
              <label style={{ ...S.fieldLabel, marginBottom: "12px", display: "block" }}>カテゴリ選択 *</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                {[
                  { value: "NEWS", emoji: "📰", title: "NEWS", desc: "お知らせ・活動速報・イベント告知など" },
                  { value: "PROJECT", emoji: "🚀", title: "PROJECT", desc: "共同開発・ものづくりの進捗・成果報告" },
                  { value: "DIALOGUE", emoji: "💬", title: "DIALOGUE", desc: "対談・インタビュー・メンバー議論の記録" }
                ].map(cat => {
                  const isSelected = state.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setters.setCategory(cat.value)}
                      style={{
                        background: isSelected ? "var(--accent-pale)" : "white",
                        border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                        borderRadius: "14px",
                        padding: "16px",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.03)" : "none"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.2rem" }}>{cat.emoji}</span>
                        <span style={{ fontSize: "0.95rem", fontWeight: 800, color: isSelected ? "var(--accent)" : "var(--ink)" }}>
                          {cat.title}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: isSelected ? "var(--ink)" : "var(--ink-soft)", lineHeight: 1.4 }}>
                        {cat.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <InputField label="要約 (一覧に表示されます) *" value={state.summary} onChange={setters.setSummary} textarea placeholder="**太字** や [リンク](URL) などのマークダウン記法が使えます" />
          
          {/* ✅ ドラッグ＆ドロップアップローダーにアップグレード */}
          <DragDropImageZone 
            label="サムネイル画像"
            imageUrl={state.imageUrl}
            uploading={state.uploading}
            onUpload={(file: File) => handlers.handleUpload(file, setters.setImageUrl)}
            onClear={() => setters.setImageUrl("")}
          />
          
          <InputField label="詳細内容 (本文) ※任意" value={state.content} onChange={setters.setContent} textarea large placeholder="## 大見出し&#13;### 中見出し&#13;- 箇流書き&#13;**太字** などが使用できます。" />
          <InputField label="URLスラッグ (例: project-kickoff) ※任意" value={state.slug} onChange={setters.setSlug} />
          
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button 
              onClick={() => handlers.handleSaveActivity(false)} 
              style={{...S.primaryBtn, background: "white", color: "#111", border: "2px solid #111"}} 
              disabled={state.publishing || !state.title}
            >
              下書き保存する
            </button>
            <button 
              onClick={() => handlers.handleSaveActivity(true)} 
              style={S.primaryBtn} 
              disabled={state.publishing || !state.title}
            >
              {state.editingActivityId ? "更新して公開" : "今すぐ公開する"}
            </button>
            {state.editingActivityId && (
              <button 
                onClick={handlers.cancelEditActivity} 
                style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white" }}
              >
                キャンセル
              </button>
            )}
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "16px" }}>投稿済みの活動記録一覧</h3>
      <div style={S.listContainer}>
        {!activities || activities.length === 0 ? <div style={S.emptyState}>投稿された活動記録はありません。</div> : 
          activities.map((act: any) => (
            <div key={act.id} style={{ ...S.listItem, flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ display: "flex", width: "100%", gap: "16px" }}>
                {act.image_url ? (
                  <img src={act.image_url} style={{ width: "90px", height: "50px", objectFit: "cover", borderRadius: "6px" }} alt="Thumb" />
                ) : (
                  <div style={{ width: "90px", height: "50px", background: "#eee", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#999" }}>No Image</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 800, background: "#eee", padding: "2px 6px", borderRadius: "4px" }}>{act.category}</span>
                    <span style={{ fontSize: "0.75rem", color: "#888" }}>{act.date}</span>
                    <span style={{ background: act.is_published ? "#e6ffe6" : "#f0f0f0", color: act.is_published ? "#006600" : "#666", padding: "2px 6px", borderRadius: "8px", fontSize: "0.6rem", fontWeight: 800 }}>
                      {act.is_published ? "公開中" : "下書き"}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{act.title}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", width: "100%", justifyContent: "flex-end" }}>
                <button 
                  onClick={() => handlers.startEditActivity(act)} 
                  style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white", padding: "4px 8px", borderRadius: "6px" }}
                >
                  📝 編集
                </button>
                <button 
                  onClick={() => handlers.handleTogglePublish('activities', act.id, !act.is_published)} 
                  style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", padding: "4px 8px", borderRadius: "6px" }}
                >
                  {act.is_published ? "非公開にする" : "公開する"}
                </button>
                <button onClick={() => handlers.handleDelete('activities', act.id)} style={S.dangerBtn}>削除</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// 👤 メンバー管理タブ
export function MembersTab({ state, setters, handlers }: any) {
  return (
    <div>
      <h2 style={S.sectionTitle}>メンバー管理</h2>
      
      <div style={{ ...S.editorCard, marginBottom: "40px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>
          {state.editingMemberId ? "📝 メンバー情報の編集" : "メンバーの追加"}
        </h3>
        <div style={S.formStack}>
          {/* ✅ ドラッグ＆ドロップアップローダーにアップグレード */}
          <DragDropImageZone 
            label="顔写真 *"
            imageUrl={state.mPhotoUrl}
            uploading={state.uploading}
            onUpload={(file: File) => handlers.handleUpload(file, setters.setMPhotoUrl)}
            onClear={() => setters.setMPhotoUrl("")}
          />

          <InputField label="氏名 *" value={state.mName} onChange={setters.setMName} />
          <InputField label="役割 (例: Founder)" value={state.mRole} onChange={setters.setMRole} />
          <InputField label="所属 (例: 〇〇大学)" value={state.mAffiliation} onChange={setters.setMAffiliation} />
          <InputField label="活動領域/専門 (例: 量子物理、フロントエンド開発)" value={state.mField} onChange={setters.setMField} />
          
          {/* ✅ スキル・GitHub・ポートフォリオ入力欄の拡張 */}
          <InputField label="保有スキルタグ (カンマ区切り。例: React, Python, UI/UX)" value={state.skills || ""} onChange={setters.setSkills} placeholder="スキルをカンマで並べます" />
          <InputField label="GitHub プロフィール URL (任意)" value={state.githubUrl || ""} onChange={setters.setGithubUrl} placeholder="https://github.com/..." />
          <InputField label="ポートフォリオ URL (任意)" value={state.portfolioUrl || ""} onChange={setters.setPortfolioUrl} placeholder="https://..." />

          <InputField label="自己紹介・メンバーへのメッセージ" value={state.mMessage} onChange={setters.setMMessage} textarea />
          
          <div style={{ display: "flex", gap: "12px" }}>
            <button 
              onClick={handlers.handleSaveMember} 
              style={S.primaryBtn} 
              disabled={!state.mName}
            >
              {state.editingMemberId ? "更新して保存" : "追加する"}
            </button>
            {state.editingMemberId && (
              <button 
                onClick={handlers.cancelEditMember} 
                style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white" }}
              >
                キャンセル
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={S.listContainer}>
        {state.members.length === 0 ? <div style={S.emptyState}>登録メンバーがいません</div> : 
          state.members.map((m: any, index: number) => (
            <div key={m.id} style={S.listItem}>
              <img src={m.photo_url || "/nexus-icon.png"} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} alt="Photo" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{m.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#888", marginBottom: "4px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <span>{m.role}</span>
                  <span style={{ background: m.is_published ? "#e6ffe6" : "#f0f0f0", color: m.is_published ? "#006600" : "#666", padding: "2px 6px", borderRadius: "8px", fontSize: "0.6rem", fontWeight: 800 }}>
                    {m.is_published ? "公開中" : "非公開"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <button 
                    onClick={() => handlers.handleMoveMember(index, 'up')} 
                    disabled={index === 0} 
                    style={{ background: index === 0 ? "#f0f0f0" : "white", border: "1px solid #ddd", cursor: index === 0 ? "not-allowed" : "pointer", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem" }}
                  >
                    ⬆️
                  </button>
                  <button 
                    onClick={() => handlers.handleMoveMember(index, 'down')} 
                    disabled={index === state.members.length - 1} 
                    style={{ background: index === state.members.length - 1 ? "#f0f0f0" : "white", border: "1px solid #ddd", cursor: index === state.members.length - 1 ? "not-allowed" : "pointer", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem" }}
                  >
                    ⬇️
                  </button>

                  <button 
                    onClick={() => handlers.startEditMember(m)} 
                    style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white", padding: "4px 8px", borderRadius: "6px" }}
                  >
                    📝 編集
                  </button>
                  <button 
                    onClick={() => handlers.handleTogglePublish('members', m.id, !m.is_published)} 
                    style={{...S.dangerBtn, color: "#111", border: "1px solid #ddd", padding: "4px 8px", borderRadius: "6px"}}>
                    {m.is_published ? "非公開" : "公開"}
                  </button>
                </div>
                <button onClick={() => handlers.handleDelete('members', m.id)} style={S.dangerBtn}>削除</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// 🚀 [新設] プロジェクト募集管理タブ (CRUD)
export function ProjectsTab({ state, setters, handlers, projects }: any) {
  return (
    <div>
      <h2 style={S.sectionTitle}>共創プロジェクト管理</h2>

      <div style={{ ...S.editorCard, marginBottom: "40px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>
          {state.editingProjectId ? "📝 プロジェクトの編集" : "新規プロジェクトの登録"}
        </h3>
        <div style={S.formStack}>
          <InputField label="プロジェクトタイトル *" value={state.pTitle} onChange={setters.setPTitle} placeholder="学生向け量子計算体験ツールの開発" />
          <InputField label="プロジェクト詳細説明 * (マークダウン可)" value={state.pDescription} onChange={setters.setPDescription} textarea large placeholder="プロジェクトの概要、ゴール、求めている内容など" />
          <InputField label="使用する技術スタック (カンマ区切り)" value={state.pTechStack} onChange={setters.setPTechStack} placeholder="Next.js, Tailwind, Rust, Qiskit" />
          <InputField label="募集するメンバーの役割 (カンマ区切り)" value={state.pRolesNeeded} onChange={setters.setPRolesNeeded} placeholder="Frontend Developer, Quantum Researcher" />
          
          <div style={S.group}>
            <label style={S.fieldLabel}>募集ステータス *</label>
            <select 
              value={state.pStatus} 
              onChange={(e) => setters.setPStatus(e.target.value)} 
              style={{ ...S.select, width: "100%", padding: "10px 16px", height: "auto" }}
            >
              <option value="open">🟢 メンバー募集中 (open)</option>
              <option value="closed">🔴 募集終了 (closed)</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button 
              onClick={handlers.handleSaveProject} 
              style={S.primaryBtn} 
              disabled={!state.pTitle || !state.pDescription}
            >
              {state.editingProjectId ? "更新して保存" : "プロジェクトを登録する"}
            </button>
            {state.editingProjectId && (
              <button 
                onClick={handlers.cancelEditProject} 
                style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white" }}
              >
                キャンセル
              </button>
            )}
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "16px" }}>登録プロジェクト一覧</h3>
      <div style={S.listContainer}>
        {projects.length === 0 ? <div style={S.emptyState}>登録されているプロジェクトはありません</div> : 
          projects.map((proj: any, index: number) => (
            <div key={proj.id} style={{ ...S.listItem, flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <div>
                  <span style={{ 
                    fontSize: "0.65rem", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", marginRight: "8px",
                    background: proj.status === 'open' ? "#e6ffe6" : "#f5f5f5", color: proj.status === 'open' ? "#006600" : "#666" 
                  }}>
                    {proj.status === 'open' ? "募集中" : "募集終了"}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: "1.05rem" }}>{proj.title}</span>
                </div>
                
                <div style={{ display: "flex", gap: "6px" }}>
                  <button 
                    onClick={() => handlers.handleMoveProject(index, 'up')} 
                    disabled={index === 0} 
                    style={{ background: index === 0 ? "#f0f0f0" : "white", border: "1px solid #ddd", cursor: index === 0 ? "not-allowed" : "pointer", padding: "2px 6px", borderRadius: "6px", fontSize: "0.75rem" }}
                  >
                    ⬆️
                  </button>
                  <button 
                    onClick={() => handlers.handleMoveProject(index, 'down')} 
                    disabled={index === projects.length - 1} 
                    style={{ background: index === projects.length - 1 ? "#f0f0f0" : "white", border: "1px solid #ddd", cursor: index === projects.length - 1 ? "not-allowed" : "pointer", padding: "2px 6px", borderRadius: "6px", fontSize: "0.75rem" }}
                  >
                    ⬇️
                  </button>
                </div>
              </div>

              {proj.tech_stack && (
                <div style={{ fontSize: "0.75rem", color: "#666" }}>
                  <strong>Tech:</strong> {proj.tech_stack}
                </div>
              )}

              <div style={{ display: "flex", gap: "8px", width: "100%", justifyContent: "flex-end" }}>
                <button 
                  onClick={() => handlers.startEditProject(proj)} 
                  style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white", padding: "4px 8px", borderRadius: "6px" }}
                >
                  📝 編集
                </button>
                <button onClick={() => handlers.handleDelete('projects', proj.id)} style={S.dangerBtn}>削除</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ❓ FAQ管理タブ
export function FaqTab({ state, setters, handlers }: any) {
  return (
    <div>
      <h2 style={S.sectionTitle}>FAQ管理</h2>

      {state.faqs.length === 0 && (
        <div style={{ background: "#fdfbf8", border: "1px dashed var(--accent)", padding: "20px", borderRadius: "12px", marginBottom: "32px", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "#555", marginBottom: "16px" }}>
            💡 現在、FAQデータが1件もありません。初期の標準テンプレートを自動投入しますか？
          </p>
          <button 
            onClick={handlers.handleInsertDefaultFaqs} 
            style={{ ...S.primaryBtn, display: "inline-flex", width: "auto", padding: "10px 24px" }}
          >
            初期データ（3件）を投入する
          </button>
        </div>
      )}

      <div style={{ ...S.editorCard, marginBottom: "40px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>
          {state.editingFaqId ? "📝 FAQの編集" : "FAQの追加"}
        </h3>
        <div style={S.formStack}>
          <InputField label="質問 *" value={state.fQuestion} onChange={setters.setFQuestion} textarea />
          <InputField label="回答 *" value={state.fAnswer} onChange={setters.setFAnswer} textarea />
          
          <div style={{ display: "flex", gap: "12px" }}>
            <button 
              onClick={handlers.handleSaveFaq} 
              style={S.primaryBtn} 
              disabled={!state.fQuestion || !state.fAnswer}
            >
              {state.editingFaqId ? "更新して保存" : "追加する"}
            </button>
            {state.editingFaqId && (
              <button 
                onClick={handlers.cancelEditFaq} 
                style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white" }}
              >
                キャンセル
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={S.listContainer}>
        {state.faqs.length === 0 ? <div style={S.emptyState}>登録FAQがありません</div> : 
          state.faqs.map((f: any) => (
            <div key={f.id} style={{ ...S.listItem, flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>Q: {f.question}</div>
                <span style={{ background: f.is_published ? "#e6ffe6" : "#f0f0f0", color: f.is_published ? "#006600" : "#666", padding: "2px 6px", borderRadius: "8px", fontSize: "0.6rem", fontWeight: 800 }}>
                  {f.is_published ? "公開中" : "非公開"}
                </span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.5, marginTop: "8px" }}>A: {f.answer}</div>
              
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", width: "100%", justifyContent: "flex-end" }}>
                <button 
                  onClick={() => handlers.startEditFaq(f)} 
                  style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white", padding: "4px 8px", borderRadius: "6px" }}
                >
                  📝 編集
                </button>
                <button 
                  onClick={() => handlers.handleTogglePublish('faqs', f.id, !f.is_published)} 
                  style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", padding: "4px 8px", borderRadius: "6px" }}
                >
                  {f.is_published ? "非公開にする" : "公開する"}
                </button>
                <button onClick={() => handlers.handleDelete('faqs', f.id)} style={S.dangerBtn}>削除</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// 📩 お問い合わせ履歴タブ
export function InquiriesTab({ inquiries, handleUpdateStatus }: { inquiries: any[], handleUpdateStatus: (id: string, status: string) => void }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return <span style={{ background: "#e6f0ff", color: "#0066cc", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800 }}>🔵 対応中</span>;
      case "completed":
        return <span style={{ background: "#e6ffe6", color: "#006600", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800 }}>🟢 対応完了</span>;
      default:
        return <span style={{ background: "#fff0f0", color: "#cc0000", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800 }}>🟡 未対応</span>;
    }
  };

  return (
    <div>
      <h2 style={S.sectionTitle}>お問い合わせ履歴</h2>
      {inquiries.length === 0 ? (
        <div style={{ ...S.emptyState, textAlign: "center" }}>メッセージはありません。</div>
      ) : inquiries.map((i: any) => {
        const subject = encodeURIComponent(`【Nexus】お問い合わせへのご返信（件名: ${i.category}）`);
        const body = encodeURIComponent(`${i.name} 様\n\nお問い合わせいただきありがとうございます。\nNexus運営チームです。\n\n---\n\n`);
        const mailtoLink = `mailto:${i.email}?subject=${subject}?body=${body}`;

        return (
          <div key={i.id} style={{ ...S.listItem, flexDirection: "column", alignItems: "flex-start", marginBottom: "24px", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "#eee", padding: "4px 8px", borderRadius: "6px" }}>{i.category}</span>
                {getStatusBadge(i.status)}
              </div>
              <span style={{ fontSize: "0.75rem", color: "#888" }}>{new Date(i.created_at).toLocaleString('ja-JP')}</span>
            </div>
            
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{i.name} 様</div>
            {i.organization && <div style={{ fontSize: "0.85rem", color: "#666" }}>{i.organization}</div>}
            
            <div style={{ fontSize: "0.9rem", color: "#333", lineHeight: 1.6, background: "#f8f7f4", padding: "16px", borderRadius: "8px", width: "100%", boxSizing: "border-box", whiteSpace: "pre-wrap" }}>
              {i.content}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: "8px", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#666" }}>ステータス変更:</label>
                <select 
                  value={i.status || "unprocessed"} 
                  onChange={(e) => handleUpdateStatus(i.id, e.target.value)} 
                  style={{ ...S.select, width: "auto", padding: "4px 10px", fontSize: "0.8rem", height: "auto" }}
                >
                  <option value="unprocessed">🟡 未対応</option>
                  <option value="processing">🔵 対応中</option>
                  <option value="completed">🟢 対応完了</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ fontSize: "0.8rem", color: "#666" }}>✉️ {i.email}</div>
                <a 
                  href={mailtoLink} 
                  style={{ 
                    background: "#111", color: "white", padding: "8px 16px", 
                    borderRadius: "8px", fontSize: "0.85rem", fontWeight: 800, 
                    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" 
                  }}
                >
                  ✉️ メールで返信する
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

