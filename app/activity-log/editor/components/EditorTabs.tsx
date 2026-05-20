import React, { useState } from "react";
import { PageTabBtn, InputField, S, PagePath } from "./SharedUI";
import { supabase } from "@/lib/supabase"; // 👈 Supabase をインポートしました！

// 🟢 共通の画像ドラッグ＆ドロップ・アップローダー
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

// 🌐 サイト文言編集タブ（一括保存ボタン ＆ 最新情報同期ボタンを追加）
export function ContentTab({ activePage, setActivePage, liveData, handleUpdateContent, onSave, onReload, publishing, userRole }: any) {
  const isVisitor = userRole === "visitor";

  return (
    <div>
      <h2 style={S.sectionTitle}>サイト文言の編集</h2>
      {isVisitor && (
        <div style={{ marginBottom: "24px", padding: "16px", borderRadius: "18px", background: "#fff7e6", border: "1px solid #ffe2b3", color: "#8a4b00" }}>
          👀 訪問者モード: 表示はできますが編集操作はできません。
        </div>
      )}
      
      {/* 🔄 更新/同期ボタン ＆ タブ切り替えエリア */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {(["home", "about", "guidelines", "privacy", "en"] as PagePath[]).map(p => (
            <PageTabBtn key={p} active={activePage === p} onClick={() => setActivePage(p)}>
              {p.toUpperCase()}
            </PageTabBtn>
          ))}
        </div>
        
        <button
          onClick={onReload}
          disabled={isVisitor}
          style={{
            background: "white", border: "1px solid #ddd", borderRadius: "8px",
            padding: "6px 12px", fontSize: "0.75rem", fontWeight: 800, color: isVisitor ? "#aaa" : "#666",
            cursor: isVisitor ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)", transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { if (!isVisitor) e.currentTarget.style.background = "#f5f5f5" }}
          onMouseLeave={(e) => { if (!isVisitor) e.currentTarget.style.background = "white" }}
        >
          🔄 最新のDB情報に同期 (編集を破棄)
        </button>
      </div>

      <div style={S.formStack}>
        {/* --- HOME ページ --- */}
        {activePage === "home" && (
          <>
            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>メイン（HERO）エリア</h3>
              <InputField label="メインキャッチコピー" value={liveData.hero_title || ""} onChange={(v: string) => handleUpdateContent("hero_title", v)} placeholder="つながる、生み出す、Nexus" disabled={isVisitor} />
              <InputField label="紹介サブテキスト" value={liveData.hero_copy || ""} onChange={(v: string) => handleUpdateContent("hero_copy", v)} textarea placeholder="意欲ある学生のためのコミュニティ..." disabled={isVisitor} />
            </div>

            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ABOUT（Nexusについて）エリア</h3>
              <InputField label="セクション見出し" value={liveData.about_title || ""} onChange={(v: string) => handleUpdateContent("about_title", v)} disabled={isVisitor} />
              <InputField label="本文段落 1" value={liveData.about_body_1 || ""} onChange={(v: string) => handleUpdateContent("about_body_1", v)} textarea disabled={isVisitor} />
              <InputField label="本文段落 2" value={liveData.about_body_2 || ""} onChange={(v: string) => handleUpdateContent("about_body_2", v)} textarea disabled={isVisitor} />
            </div>

            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ACTIVITY（活動内容）エリア</h3>
              <InputField label="セクション見出し" value={liveData.activity_title || ""} onChange={(v: string) => handleUpdateContent("activity_title", v)} disabled={isVisitor} />
              <InputField label="概要説明テキスト" value={liveData.activity_copy || ""} onChange={(v: string) => handleUpdateContent("activity_copy", v)} textarea disabled={isVisitor} />
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
                <InputField label="ブロックタイトル" value={liveData[`block_${i}_title`] || ""} onChange={(v: string) => handleUpdateContent(`block_${i}_title`, v)} disabled={isVisitor} />
                <InputField label="ブロック本文" value={liveData[`block_${i}_body`] || ""} onChange={(v: string) => handleUpdateContent(`block_${i}_body`, v)} textarea disabled={isVisitor} />
              </div>
            ))}
          </>
        )}

        {/* --- GUIDELINES ページ --- */}
        {activePage === "guidelines" && (
          <>
            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ヘッダー・導入設定</h3>
              <InputField label="大見出しタイトル" value={liveData.hero_title || ""} onChange={(v: string) => handleUpdateContent("hero_title", v)} disabled={isVisitor} />
              <InputField label="ガイドライン前文（導入テキスト）" value={liveData.intro_text || ""} onChange={(v: string) => handleUpdateContent("intro_text", v)} textarea disabled={isVisitor} />
            </div>

            {[1, 2, 3].map(num => (
              <div key={num} style={S.editorCard}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ガイドラインルール 0{num}</h3>
                <InputField label="ルールの見出し" value={liveData[`rule_${num}_title`] || ""} onChange={(v: string) => handleUpdateContent(`rule_${num}_title`, v)} disabled={isVisitor} />
                <InputField label="ルールの詳細本文" value={liveData[`rule_${num}_body`] || ""} onChange={(v: string) => handleUpdateContent(`rule_${num}_body`, v)} textarea disabled={isVisitor} />
              </div>
            ))}
          </>
        )}

        {/* --- PRIVACY ページ --- */}
        {activePage === "privacy" && (
          <>
            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>ヘッダー設定</h3>
              <InputField label="タイトル" value={liveData.hero_title || ""} onChange={(v: string) => handleUpdateContent("hero_title", v)} disabled={isVisitor} />
              <InputField label="最終更新日 (例: 最終更新日：2026年5月)" value={liveData.last_updated || ""} onChange={(v: string) => handleUpdateContent("last_updated", v)} disabled={isVisitor} />
            </div>

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
              <div key={num} style={S.editorCard}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>セクション {num}</h3>
                <InputField label="条項のタイトル" value={liveData[`section_${num}_title`] || ""} onChange={(v: string) => handleUpdateContent(`section_${num}_title`, v)} disabled={isVisitor} />
                <InputField label="条項の本文" value={liveData[`section_${num}_body`] || ""} onChange={(v: string) => handleUpdateContent(`section_${num}_body`, v)} textarea disabled={isVisitor} />
              </div>
            ))}
          </>
        )}

        {/* --- ENGLISH (EN) ページ --- */}
        {activePage === "en" && (
          <>
            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>👑 HERO AREA (ENGLISH)</h3>
              <InputField label="Hero Title" value={liveData.hero_title || ""} onChange={(v: string) => handleUpdateContent("hero_title", v)} placeholder="Connect, Create,\nGo Beyond." disabled={isVisitor} />
              <InputField label="Hero Copy Text" value={liveData.hero_copy || ""} onChange={(v: string) => handleUpdateContent("hero_copy", v)} textarea disabled={isVisitor} />
            </div>

            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>🌐 ABOUT AREA (ENGLISH)</h3>
              <InputField label="Section Title" value={liveData.about_title || ""} onChange={(v: string) => handleUpdateContent("about_title", v)} disabled={isVisitor} />
              <InputField label="About Paragraph 1" value={liveData.about_body_1 || ""} onChange={(v: string) => handleUpdateContent("about_body_1", v)} textarea disabled={isVisitor} />
              <InputField label="About Paragraph 2" value={liveData.about_body_2 || ""} onChange={(v: string) => handleUpdateContent("about_body_2", v)} textarea disabled={isVisitor} />
            </div>

            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>🙋 FOR WHO AREA (ENGLISH)</h3>
              <InputField label="Main Heading" value={liveData.forwho_title || ""} onChange={(v: string) => handleUpdateContent("forwho_title", v)} disabled={isVisitor} />
              {[1, 2, 3, 4].map(num => (
                <div key={num} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
                  <InputField label={`0${num}. Title`} value={liveData[`forwho_${num}_title`] || ""} onChange={(v: string) => handleUpdateContent(`forwho_${num}_title`, v)} disabled={isVisitor} />
                  <InputField label={`0${num}. Description`} value={liveData[`forwho_${num}_text`] || ""} onChange={(v: string) => handleUpdateContent(`forwho_${num}_text`, v)} disabled={isVisitor} />
                </div>
              ))}
            </div>

            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>⚡ ACTIVITIES AREA (ENGLISH)</h3>
              <InputField label="Section Title" value={liveData.activity_title || ""} onChange={(v: string) => handleUpdateContent("activity_title", v)} disabled={isVisitor} />
              <InputField label="Activities Main Copy" value={liveData.activity_copy || ""} onChange={(v: string) => handleUpdateContent("activity_copy", v)} textarea disabled={isVisitor} />
              {[1, 2, 3].map(num => (
                <div key={num} style={{ marginTop: "16px" }}>
                  <InputField label={`0${num}. Title`} value={liveData[`activity_${num}_title`] || ""} onChange={(v: string) => handleUpdateContent(`activity_${num}_title`, v)} disabled={isVisitor} />
                  <InputField label={`0${num}. Description`} value={liveData[`activity_${num}_text`] || ""} onChange={(v: string) => handleUpdateContent(`activity_${num}_text`, v)} textarea disabled={isVisitor} />
                </div>
              ))}
            </div>

            <div style={S.editorCard}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>💬 JOIN US AREA (ENGLISH)</h3>
              <InputField label="Join Title" value={liveData.join_title || ""} onChange={(v: string) => handleUpdateContent("join_title", v)} disabled={isVisitor} />
              <InputField label="Join Subtext" value={liveData.join_copy || ""} onChange={(v: string) => handleUpdateContent("join_copy", v)} textarea disabled={isVisitor} />
            </div>
          </>
        )}

        {/* 💾 一括保存・提案送信ボタン */}
        <div style={{ marginTop: "32px" }}>
          <button 
            onClick={onSave}
            disabled={publishing || isVisitor}
            style={{
              ...S.primaryBtn,
              background: userRole === "proposer" ? "#0055ff" : "#111",
              opacity: isVisitor ? 0.65 : 1,
              cursor: isVisitor ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {publishing ? "⌛ 処理を実行中..." : userRole === "proposer" ? "💡 編集提案を送信する" : "💾 変更内容を本番公開・保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ✍️ 活動記録管理タブ
export function ActivityTab({ state, setters, handlers, activities, userRole }: any) {
  const isVisitor = userRole === "visitor";
  const actionDisabled = isVisitor || state.publishing;

  return (
    <div>
      <h2 style={S.sectionTitle}>活動記録の管理</h2>

      <div style={{ ...S.editorCard, marginBottom: "40px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>
          {state.editingActivityId ? "📝 活動記録の編集" : "活動記録の作成"}
        </h3>
        
        <div style={S.formStack}>
          <InputField label="タイトル *" value={state.title} onChange={setters.setTitle} placeholder="第1回アイデア会議を開催しました" disabled={isVisitor} />
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <InputField label="日付 *" value={state.date} onChange={setters.setDate} disabled={isVisitor} />
            
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
                      onClick={() => !isVisitor && setters.setCategory(cat.value)}
                      disabled={isVisitor}
                      style={{
                        background: isSelected ? "var(--accent-pale)" : "white",
                        border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                        borderRadius: "14px",
                        padding: "16px",
                        textAlign: "left",
                        cursor: isVisitor ? "not-allowed" : "pointer",
                        opacity: isVisitor ? 0.55 : 1,
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
          
          <InputField label="要約 (一覧に表示されます) *" value={state.summary} onChange={setters.setSummary} textarea placeholder="**太字** や [リンク](URL) などのマークダウン記法が使えます" disabled={isVisitor} />
          
          <DragDropImageZone 
            label="サムネイル画像"
            imageUrl={state.imageUrl}
            uploading={state.uploading}
            onUpload={isVisitor ? () => {} : (file: File) => handlers.handleUpload(file, setters.setImageUrl)}
            onClear={() => { if (!isVisitor) setters.setImageUrl(""); }}
          />
          
          <InputField label="詳細内容 (本文) ※任意" value={state.content} onChange={setters.setContent} textarea large placeholder="## 大見出し&#13;### 中見出し&#13;- 箇条書き&#13;**太字** などが使用できます。" disabled={isVisitor} />
          <InputField label="URLスラッグ (例: project-kickoff) ※任意" value={state.slug} onChange={setters.setSlug} disabled={isVisitor} />
          
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button 
              onClick={() => handlers.handleSaveActivity(false)} 
              style={{...S.primaryBtn, background: "white", color: "#111", border: "2px solid #111", opacity: actionDisabled ? 0.65 : 1, cursor: actionDisabled ? "not-allowed" : "pointer"}} 
              disabled={actionDisabled || !state.title}
            >
              下書き保存する
            </button>
            <button 
              onClick={() => handlers.handleSaveActivity(true)} 
              style={{ ...S.primaryBtn, opacity: actionDisabled ? 0.65 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }} 
              disabled={actionDisabled || !state.title}
            >
              {state.editingActivityId ? "更新して公開" : "今すぐ公開する"}
            </button>
            {state.editingActivityId && (
              <button 
                onClick={handlers.cancelEditActivity} 
                style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white", opacity: actionDisabled ? 0.65 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }}
                disabled={actionDisabled}
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
                  onClick={() => !isVisitor && handlers.startEditActivity(act)} 
                  style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white", padding: "4px 8px", borderRadius: "6px", opacity: isVisitor ? 0.5 : 1, cursor: isVisitor ? "not-allowed" : "pointer" }}
                  disabled={isVisitor}
                >
                  📝 編集
                </button>
                <button 
                  onClick={() => !isVisitor && handlers.handleTogglePublish('activities', act.id, !act.is_published)} 
                  style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", padding: "4px 8px", borderRadius: "6px", opacity: isVisitor ? 0.5 : 1, cursor: isVisitor ? "not-allowed" : "pointer" }}
                  disabled={isVisitor}
                >
                  {act.is_published ? "非公開にする" : "公開する"}
                </button>
                <button onClick={() => !isVisitor && handlers.handleDelete('activities', act.id)} style={{ ...S.dangerBtn, opacity: isVisitor ? 0.5 : 1, cursor: isVisitor ? "not-allowed" : "pointer" }} disabled={isVisitor}>削除</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// 👤 メンバー管理タブ
export function MembersTab({ state, setters, handlers, userRole }: any) {
  const isVisitor = userRole === "visitor";
  const actionDisabled = isVisitor;

  return (
    <div>
      <h2 style={S.sectionTitle}>メンバー管理</h2>
      
      <div style={{ ...S.editorCard, marginBottom: "40px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>
          {state.editingMemberId ? "📝 メンバー情報の編集" : "メンバーの追加"}
        </h3>
        <div style={S.formStack}>
          <DragDropImageZone 
            label="顔写真 *"
            imageUrl={state.mPhotoUrl}
            uploading={state.uploading}
            onUpload={isVisitor ? () => {} : (file: File) => handlers.handleUpload(file, setters.setMPhotoUrl)}
            onClear={() => { if (!isVisitor) setters.setMPhotoUrl(""); }}
          />

          <InputField label="氏名 *" value={state.mName} onChange={setters.setMName} disabled={isVisitor} />
          <InputField label="役割 (例: Founder)" value={state.mRole} onChange={setters.setMRole} disabled={isVisitor} />
          <InputField label="所属 (例: 〇〇大学)" value={state.mAffiliation} onChange={setters.setMAffiliation} disabled={isVisitor} />
          <InputField label="活動領域/専門 (例: 量子物理、フロントエンド開発)" value={state.mField} onChange={setters.setMField} disabled={isVisitor} />
          <InputField label="保有スキルタグ (カンマ区切り。例: React, Python, UI/UX)" value={state.skills || ""} onChange={setters.setSkills} placeholder="スキルをカンマで並べます" disabled={isVisitor} />
          <InputField label="GitHub プロフィール URL (任意)" value={state.githubUrl || ""} onChange={setters.setGithubUrl} placeholder="https://github.com/..." disabled={isVisitor} />
          <InputField label="ポートフォリオ URL (任意)" value={state.portfolioUrl || ""} onChange={setters.setPortfolioUrl} placeholder="https://..." disabled={isVisitor} />
          <InputField label="自己紹介・メンバーへのメッセージ" value={state.mMessage} onChange={setters.setMMessage} textarea disabled={isVisitor} />
          
          <div style={{ display: "flex", gap: "12px" }}>
            <button 
              onClick={handlers.handleSaveMember} 
              style={{ ...S.primaryBtn, opacity: actionDisabled ? 0.65 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }} 
              disabled={actionDisabled || !state.mName}
            >
              {state.editingMemberId ? "更新して保存" : "追加する"}
            </button>
            {state.editingMemberId && (
              <button 
                onClick={handlers.cancelEditMember} 
                style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white", opacity: actionDisabled ? 0.65 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }}
                disabled={actionDisabled}
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
                    onClick={() => !isVisitor && handlers.handleMoveMember(index, 'up')} 
                    disabled={index === 0 || actionDisabled} 
                    style={{ background: index === 0 || actionDisabled ? "#f0f0f0" : "white", border: "1px solid #ddd", cursor: index === 0 || actionDisabled ? "not-allowed" : "pointer", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem", opacity: index === 0 || actionDisabled ? 0.5 : 1 }}
                  >
                    ⬆️
                  </button>
                  <button 
                    onClick={() => !isVisitor && handlers.handleMoveMember(index, 'down')} 
                    disabled={index === state.members.length - 1 || actionDisabled} 
                    style={{ background: index === state.members.length - 1 || actionDisabled ? "#f0f0f0" : "white", border: "1px solid #ddd", cursor: index === state.members.length - 1 || actionDisabled ? "not-allowed" : "pointer", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem", opacity: index === state.members.length - 1 || actionDisabled ? 0.5 : 1 }}
                  >
                    ⬇️
                  </button>

                  <button 
                    onClick={() => !isVisitor && handlers.startEditMember(m)} 
                    disabled={actionDisabled}
                    style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white", padding: "4px 8px", borderRadius: "6px", opacity: actionDisabled ? 0.5 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }}
                  >
                    📝 編集
                  </button>
                  <button 
                    onClick={() => !isVisitor && handlers.handleTogglePublish('members', m.id, !m.is_published)} 
                    disabled={actionDisabled}
                    style={{...S.dangerBtn, color: "#111", border: "1px solid #ddd", padding: "4px 8px", borderRadius: "6px", opacity: actionDisabled ? 0.5 : 1, cursor: actionDisabled ? "not-allowed" : "pointer"}}>
                    {m.is_published ? "非公開" : "公開"}
                  </button>
                </div>
                <button onClick={() => !isVisitor && handlers.handleDelete('members', m.id)} disabled={actionDisabled} style={{ ...S.dangerBtn, opacity: actionDisabled ? 0.5 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }}>削除</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// 🚀 共創プロジェクト管理タブ (CRUD)
export function ProjectsTab({ state, setters, handlers, projects, userRole }: any) {
  const isVisitor = userRole === "visitor";
  const actionDisabled = isVisitor;

  return (
    <div>
      <h2 style={S.sectionTitle}>共創プロジェクト管理</h2>

      <div style={{ ...S.editorCard, marginBottom: "40px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>
          {state.editingProjectId ? "📝 プロジェクトの編集" : "新規プロジェクトの登録"}
        </h3>
        <div style={S.formStack}>
          <InputField label="プロジェクトタイトル *" value={state.pTitle} onChange={setters.setPTitle} placeholder="学生向け量子計算体験ツールの開発" disabled={isVisitor} />
          <InputField label="プロジェクト詳細説明 * (マークダウン可)" value={state.pDescription} onChange={setters.setPDescription} textarea large placeholder="プロジェクトの概要、ゴール、求めている内容など" disabled={isVisitor} />
          <InputField label="使用する技術スタック (カンマ区切り)" value={state.pTechStack} onChange={setters.setPTechStack} placeholder="Next.js, Tailwind, Rust, Qiskit" disabled={isVisitor} />
          <InputField label="募集するメンバーの役割 (カンマ区切り)" value={state.pRolesNeeded} onChange={setters.setPRolesNeeded} placeholder="Frontend Developer, Quantum Researcher" disabled={isVisitor} />
          
          <div style={S.group}>
            <label style={S.fieldLabel}>募集ステータス *</label>
            <select 
              value={state.pStatus} 
              onChange={(e) => !isVisitor && setters.setPStatus(e.target.value)} 
              disabled={isVisitor}
              style={{ ...S.select, width: "100%", padding: "10px 16px", height: "auto", opacity: isVisitor ? 0.65 : 1, cursor: isVisitor ? "not-allowed" : "pointer" }}
            >
              <option value="open">🟢 メンバー募集中 (open)</option>
              <option value="closed">🔴 募集終了 (closed)</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button 
              onClick={handlers.handleSaveProject} 
              style={{ ...S.primaryBtn, opacity: actionDisabled ? 0.65 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }} 
              disabled={actionDisabled || !state.pTitle || !state.pDescription}
            >
              {state.editingProjectId ? "更新して保存" : "プロジェクトを登録する"}
            </button>
            {state.editingProjectId && (
              <button 
                onClick={handlers.cancelEditProject} 
                style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white", opacity: actionDisabled ? 0.65 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }}
                disabled={actionDisabled}
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
                    onClick={() => !isVisitor && handlers.handleMoveProject(index, 'up')} 
                    disabled={index === 0 || actionDisabled} 
                    style={{ background: index === 0 || actionDisabled ? "#f0f0f0" : "white", border: "1px solid #ddd", cursor: index === 0 || actionDisabled ? "not-allowed" : "pointer", padding: "2px 6px", borderRadius: "6px", fontSize: "0.75rem", opacity: index === 0 || actionDisabled ? 0.5 : 1 }}
                  >
                    ⬆️
                  </button>
                  <button 
                    onClick={() => !isVisitor && handlers.handleMoveProject(index, 'down')} 
                    disabled={index === projects.length - 1 || actionDisabled} 
                    style={{ background: index === projects.length - 1 || actionDisabled ? "#f0f0f0" : "white", border: "1px solid #ddd", cursor: index === projects.length - 1 || actionDisabled ? "not-allowed" : "pointer", padding: "2px 6px", borderRadius: "6px", fontSize: "0.75rem", opacity: index === projects.length - 1 || actionDisabled ? 0.5 : 1 }}
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
                  onClick={() => !isVisitor && handlers.startEditProject(proj)} 
                  disabled={actionDisabled}
                  style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white", padding: "4px 8px", borderRadius: "6px", opacity: actionDisabled ? 0.5 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }}
                >
                  📝 編集
                </button>
                <button onClick={() => !isVisitor && handlers.handleDelete('projects', proj.id)} disabled={actionDisabled} style={{ ...S.dangerBtn, opacity: actionDisabled ? 0.5 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }}>削除</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ❓ FAQ管理タブ
export function FaqTab({ state, setters, handlers, userRole }: any) {
  const isVisitor = userRole === "visitor";
  const actionDisabled = isVisitor;

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
            disabled={actionDisabled}
            style={{ ...S.primaryBtn, display: "inline-flex", width: "auto", padding: "10px 24px", opacity: actionDisabled ? 0.65 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }}
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
          <InputField label="質問 *" value={state.fQuestion} onChange={setters.setFQuestion} textarea disabled={isVisitor} />
          <InputField label="回答 *" value={state.fAnswer} onChange={setters.setFAnswer} textarea disabled={isVisitor} />
          
          <div style={{ display: "flex", gap: "12px" }}>
            <button 
              onClick={handlers.handleSaveFaq} 
              style={{ ...S.primaryBtn, opacity: actionDisabled ? 0.65 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }} 
              disabled={actionDisabled || !state.fQuestion || !state.fAnswer}
            >
              {state.editingFaqId ? "更新して保存" : "追加する"}
            </button>
            {state.editingFaqId && (
              <button 
                onClick={handlers.cancelEditFaq} 
                style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white", opacity: actionDisabled ? 0.65 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }}
                disabled={actionDisabled}
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
                  onClick={() => !isVisitor && handlers.startEditFaq(f)} 
                  disabled={actionDisabled}
                  style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", background: "white", padding: "4px 8px", borderRadius: "6px", opacity: actionDisabled ? 0.5 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }}
                >
                  📝 編集
                </button>
                <button 
                  onClick={() => !isVisitor && handlers.handleTogglePublish('faqs', f.id, !f.is_published)} 
                  disabled={actionDisabled}
                  style={{ ...S.dangerBtn, color: "#111", border: "1px solid #ddd", padding: "4px 8px", borderRadius: "6px", opacity: actionDisabled ? 0.5 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }}
                >
                  {f.is_published ? "非公開にする" : "公開する"}
                </button>
                <button onClick={() => !isVisitor && handlers.handleDelete('faqs', f.id)} disabled={actionDisabled} style={{ ...S.dangerBtn, opacity: actionDisabled ? 0.5 : 1, cursor: actionDisabled ? "not-allowed" : "pointer" }}>削除</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// 📩 お問い合わせ履歴タブ
// 📩 お問い合わせ・参加申請 統合管理タブ
export function InquiriesTab({ 
  inquiries, 
  handleUpdateStatus, 
  handleDelete, 
  showToast,
  hasPermission,
  userRole
}: { 
  inquiries: any[], 
  handleUpdateStatus: (id: string, status: string) => void, 
  handleDelete?: (table: string, id: string, bypassConfirm?: boolean) => void,
  showToast?: (msg: string, type?: 'success' | 'error') => void,
  hasPermission: (permission: string) => boolean,
  userRole?: string | null
}) {
  const isVisitor = userRole === "visitor";
  const [approveModal, setApproveModal] = useState<any>(null);
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<any>(null);
  const [emailBody, setEmailBody] = useState("");
  const [rejectEmailBody, setRejectEmailBody] = useState("");
  const [sending, setSending] = useState(false);

  const projectApplications = inquiries.filter(i => i.category === "プロジェクト参加希望");
  const otherInquiries = inquiries.filter(i => i.category !== "プロジェクト参加希望");

  const projectName = (content: string) => {
    const match = content?.match(/【参画希望プロジェクト】\n(.+)/);
    return match ? match[1].trim() : "プロジェクト";
  };

  const openApproveModal = (inq: any) => {
    const name = inq.name;
    const proj = projectName(inq.content);
    setEmailBody(`${name} さん\n\nおめでとうございます！Nexus 運営チームです。\n\nお送りいただいた志望理由を拝見し、ぜひ「${proj}」のコアメンバーとして一緒に未来を創っていただきたいと、メンバー全員の意見が一致いたしました！\n\n本日より、${name} さんは Nexus の正式メンバーです。これから一緒に最高のプロジェクトにしていきましょう！🚀\n\nこれからのコミュニケーションのため、公式Slackワークスペースへご入室をお願いいたします。\n\n▼ Nexus 公式Slack招待URL\nhttps://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA\n\nNexus 運営チーム\n連絡先: azalea.cape@gmail.com`);
    setApproveModal(inq);
  };

  const openRejectModal = (inq: any) => {
    const name = inq.name;
    setRejectEmailBody(`${name} さん\n\nお世話になっております。Nexus 運営チームです。\n\nこの度は、ご申請いただき誠にありがとうございました。\n慎重に選考を行わせていただきましたが、現在想定しているプロジェクトのキャパシティとのマッチングを検討した結果、誠に残念ながら、今回はご参画を見送らせていただく運びとなりました。\n\nご期待に沿えない結果となり大変恐縮ですが、何卒ご理解いただけますと幸いです。\n\nNexus 運営チーム\n連絡先: azalea.cape@gmail.com`);
    setRejectModal(inq);
  };

  const handleSendApproval = async () => {
    if (!approveModal) return;
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: { to: approveModal.email, subject: "🎉【Nexus】プロジェクト参加決定のお知らせ！", body: emailBody },
      });
      if (error) throw error;
      await handleUpdateStatus(approveModal.id, "completed");
      if (showToast) showToast("🎉 採用決定メールを送信しました！");
    } catch (e: any) {
      if (showToast) showToast(`メール送信エラー: ${e.message}`, "error");
    } finally {
      setSending(false);
      setApproveModal(null);
    }
  };

  const handleSendRejection = async () => {
    if (!rejectModal) return;
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: { to: rejectModal.email, subject: "【Nexus】プロジェクトご応募の結果について", body: rejectEmailBody },
      });
      if (error) throw error;
      await handleUpdateStatus(rejectModal.id, "rejected");
      if (showToast) showToast("⚫ お見送りメールを送信しました！");
    } catch (e: any) {
      if (showToast) showToast(`メール送信エラー: ${e.message}`, "error");
    } finally {
      setSending(false);
      setRejectModal(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal || !handleDelete) return;
    setSending(true);
    try {
      await handleDelete("inquiries", deleteModal.id, true);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
      setDeleteModal(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: any = {
      processing: <span style={{ background: "#e6f0ff", color: "#0066cc", padding: "3px 9px", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 800 }}>🔵 対応中/選考中</span>,
      completed:  <span style={{ background: "#e6ffe6", color: "#006600", padding: "3px 9px", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 800 }}>🟢 完了/採用済み</span>,
      rejected:   <span style={{ background: "#f0f0f0", color: "#666",    padding: "3px 9px", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 800 }}>⚫ お見送り済み</span>,
    };
    return map[status] || <span style={{ background: "#fff0e0", color: "#cc6600", padding: "3px 9px", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 800 }}>🟡 未対応</span>;
  };

  const ModalBase = ({ title, email, body, setBody, onSend, onClose, sendLabel, sendColor }: any) => (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: "20px", padding: "36px", maxWidth: "560px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontWeight: 900, fontSize: "1.1rem" }}>{title}</div>
        <div style={{ fontSize: "0.82rem", color: "#666" }}>宛先: <b>{email}</b> — 内容を確認・編集してから送信してください</div>
        <textarea value={body} onChange={e => setBody(e.target.value)} style={{ width: "100%", minHeight: "280px", borderRadius: "12px", border: "1px solid #ddd", padding: "14px", fontSize: "0.82rem", lineHeight: 1.7, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #ddd", background: "white", cursor: "pointer", fontWeight: 700 }}>キャンセル</button>
          <button onClick={onSend} disabled={sending} style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: sendColor, color: "white", cursor: "pointer", fontWeight: 800, fontSize: "0.9rem" }}>
            {sendLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {approveModal && <ModalBase title="🎉 採用決定メールの送信" email={approveModal.email} body={emailBody} setBody={setEmailBody} onSend={handleSendApproval} onClose={() => setApproveModal(null)} sendLabel="✉️ 採用決定メールを送信" sendColor="#111" />}
      {rejectModal && <ModalBase title="📩 お見送りメールの送信" email={rejectModal.email} body={rejectEmailBody} setBody={setRejectEmailBody} onSend={handleSendRejection} onClose={() => setRejectModal(null)} sendLabel="✉️ お見送りメールを送信" sendColor="#666" />}
      
      {/* 削除確認モーダル (ポップアップ) */}
      {deleteModal && (
        <div onClick={() => setDeleteModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: "20px", padding: "36px", maxWidth: "460px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem" }}>⚠️</div>
            <div style={{ fontWeight: 900, fontSize: "1.25rem", color: "#cc0000" }}>メッセージを完全に削除しますか？</div>
            <div style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.6 }}>
              <b>{deleteModal.name} 様</b> のデータ<br />
              （カテゴリ: {deleteModal.category}）<br />
              をデータベースから完全に消去します。この操作は取り消せません。
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
              <button onClick={() => setDeleteModal(null)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ddd", background: "white", cursor: "pointer", fontWeight: 700 }}>キャンセル</button>
              <button onClick={handleConfirmDelete} disabled={sending} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#cc0000", color: "white", cursor: "pointer", fontWeight: 800 }}>
                {sending ? "削除中..." : "本当に削除する"}
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 style={S.sectionTitle}>📬 お問い合わせ・参加申請の管理</h2>

      {/* 🚀 プロジェクト参加申請 セクション */}
      <div style={{ marginBottom: "50px" }}>
        <div style={{ fontWeight: 900, fontSize: "1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          🚀 プロジェクト参加申請
          <span style={{ background: "#fff0e0", color: "#cc6600", borderRadius: "99px", padding: "2px 10px", fontSize: "0.72rem", fontWeight: 800 }}>
            {projectApplications.filter(i => !i.status || i.status === "unprocessed").length} 件 未対応
          </span>
        </div>
        {projectApplications.length === 0 ? (
          <div style={S.emptyState}>参加申請はまだありません</div>
        ) : projectApplications.map((i: any) => (
          <div key={i.id} style={{ ...S.listItem, flexDirection: "column", alignItems: "flex-start", marginBottom: "20px", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "#e6f0ff", color: "#0044cc", padding: "3px 9px", borderRadius: "6px" }}>{projectName(i.content)}</span>
                {statusBadge(i.status)}
              </div>
              <span style={{ fontSize: "0.72rem", color: "#aaa" }}>{new Date(i.created_at).toLocaleString('ja-JP')}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: "1rem" }}>
              {i.name} 様 <span style={{ fontWeight: 400, fontSize: "0.82rem", color: "#666" }}>{i.organization && `（${i.organization}）`}</span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#444", lineHeight: 1.7, background: "#f8f7f4", padding: "14px", borderRadius: "10px", width: "100%", boxSizing: "border-box", whiteSpace: "pre-wrap" }}>
              {i.content}
            </div>
            <div style={{ display: "flex", gap: "8px", width: "100%", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "#666", marginRight: "auto" }}>✉️ {i.email}</span>
              
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "12px" }}>
                <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#888" }}>手動変更:</label>
                <select value={i.status || "unprocessed"} onChange={e => handleUpdateStatus(i.id, e.target.value)} disabled={!hasPermission("reply_inquiries")} style={{ width: "auto", padding: "4px 8px", fontSize: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", background: !hasPermission("reply_inquiries") ? "#f5f5f5" : "white" }}>
                  <option value="unprocessed">🟡 未対応</option>
                  <option value="processing">🔵 選考中</option>
                  <option value="completed">🟢 採用済み</option>
                  <option value="rejected">⚫ お見送り</option>
                </select>
              </div>

              {hasPermission("reply_inquiries") && i.status !== "completed" && i.status !== "rejected" && (
                <button onClick={() => openApproveModal(i)} style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: "#111", color: "white", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer" }}>
                  🎉 採用決定
                </button>
              )}
              {hasPermission("reply_inquiries") && i.status !== "completed" && i.status !== "rejected" && (
                <button onClick={() => openRejectModal(i)} style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid #ddd", background: "white", color: "#888", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                  📩 お見送り
                </button>
              )}
              {handleDelete && hasPermission("delete_inquiries") && (
                <button onClick={() => setDeleteModal(i)} style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid #ffcccc", background: "#fff0f0", color: "#cc0000", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer" }}>
                  🗑️ 削除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 📩 通常のお問い合わせ セクション */}
      <div>
        <div style={{ fontWeight: 900, fontSize: "1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          📩 通常のお問い合わせ
        </div>
        {otherInquiries.length === 0 ? (
          <div style={S.emptyState}>お問い合わせはありません</div>
        ) : otherInquiries.map((i: any) => {
          const subject = encodeURIComponent(`【Nexus】お問い合わせへのご返信（件名: ${i.category}）`);
          const body = encodeURIComponent(`${i.name} 様\n\nお問い合わせいただきありがとうございます。\nNexus運営チームです。\n\n---\n\n`);
          const mailtoLink = `mailto:${i.email}?subject=${subject}&body=${body}`;

          return (
            <div key={i.id} style={{ ...S.listItem, flexDirection: "column", alignItems: "flex-start", marginBottom: "20px", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.72rem", background: "#eee", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>{i.category}</span>
                  {statusBadge(i.status)}
                </div>
                <span style={{ fontSize: "0.72rem", color: "#aaa" }}>{new Date(i.created_at).toLocaleString('ja-JP')}</span>
              </div>
              <div style={{ fontWeight: 800 }}>{i.name} 様</div>
              <div style={{ fontSize: "0.85rem", color: "#444", lineHeight: 1.6, background: "#f8f7f4", padding: "12px", borderRadius: "8px", width: "100%", boxSizing: "border-box", whiteSpace: "pre-wrap" }}>
                {i.content}
              </div>
              <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.78rem", color: "#666", marginRight: "auto" }}>✉️ {i.email}</span>
                <select value={i.status || "unprocessed"} onChange={e => handleUpdateStatus(i.id, e.target.value)} disabled={!hasPermission("reply_inquiries")} style={{ width: "auto", padding: "4px 10px", fontSize: "0.78rem", borderRadius: "8px", border: "1px solid #ddd", background: !hasPermission("reply_inquiries") ? "#f5f5f5" : "white" }}>
                  <option value="unprocessed">🟡 未対応</option>
                  <option value="processing">🔵 対応中</option>
                  <option value="completed">🟢 対応完了</option>
                </select>
                <a href={mailtoLink} style={{ background: hasPermission("reply_inquiries") ? "#111" : "#ddd", color: hasPermission("reply_inquiries") ? "white" : "#999", padding: "6px 14px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", pointerEvents: hasPermission("reply_inquiries") ? "auto" : "none" }}>
                  ✉️ 返信する
                </a>
                {handleDelete && hasPermission("delete_inquiries") && (
                  <button onClick={() => setDeleteModal(i)} style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid #ffcccc", background: "#fff0f0", color: "#cc0000", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer" }}>
                    🗑️ 削除
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 📬 参加申請・通知センタータブ（採用 ＆ お見送りメール送信モーダル ＆ カスタム削除確認モーダル付き）
export function ApplicationsTab({ 
  inquiries, 
  handleUpdateStatus, 
  handleDelete, 
  showToast 
}: { 
  inquiries: any[], 
  handleUpdateStatus: (id: string, status: string) => void, 
  handleDelete?: (table: string, id: string, bypassConfirm?: boolean) => void,
  showToast?: (msg: string, type?: 'success' | 'error') => void 
}) {
  const [approveModal, setApproveModal] = useState<any>(null);
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<any>(null); // 👈 削除確認用ステートを追加！
  const [emailBody, setEmailBody] = useState("");
  const [rejectEmailBody, setRejectEmailBody] = useState("");
  const [sending, setSending] = useState(false);

  const projectApplications = inquiries.filter(i => i.category === "プロジェクト参加希望");
  const otherInquiries = inquiries.filter(i => i.category !== "プロジェクト参加希望");

  const projectName = (content: string) => {
    const match = content?.match(/【参画希望プロジェクト】\n(.+)/);
    return match ? match[1].trim() : "プロジェクト";
  };

  const openApproveModal = (inq: any) => {
    const name = inq.name;
    const proj = projectName(inq.content);
    setEmailBody(
`${name} さん

おめでとうございます！Nexus 運営チームです。

お送りいただいた志望理由やこれまでの活動内容を拝見し、ぜひ「${proj}」のコアメンバーとして一緒に未来を創っていただきたいと、メンバー全員の意見が一致いたしました！

本日より、${name} さんは Nexus の正式メンバーです。これから一緒に最高のプロジェクトにしていきましょう！🚀

これからの円滑なコミュニケーションと情報共有のため、コミュニティ公式のSlackワークスペースをご用意しています。
以下の招待URLより、まずはご入室をお願いいたします。

▼ Nexus 公式Slack招待URL
https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA

Slackに入室されましたら、まずは「#自己紹介」チャンネルにて一言ご挨拶をいただけますと幸いです。
また、今後の活動やキックオフMTGの日程調整などについては、Slack内のダイレクトメッセージやプロジェクト専用のプライベートチャンネルにて個別にご案内いたします。

もしご不明な点やご質問がございましたら、本メールへの返信、または公式Slackの運営メンバーまでお気軽にお問い合わせください。

${name} さんとプロジェクトを進められることを、チーム一同心より楽しみにしております！

Nexus 運営チーム
連絡先: azalea.cape@gmail.com`
    );
    setApproveModal(inq);
  };

  const openRejectModal = (inq: any) => {
    const name = inq.name;
    setRejectEmailBody(
`${name} さん

お世話になっております。Nexus 運営チームです。

この度は、Nexus のコミュニティおよび共創プロジェクトへの参加をご申請いただき、誠にありがとうございました。
また、お忙しい中、丁寧な志望理由やこれまでの学習内容・ご実績についてご記入いただきましたこと、重ねて御礼申し上げます。

お送りいただいた内容について、運営メンバー全員で慎重に選考を行わせていただきました。

大変心苦しいご案内となりますが、現在想定しているプロジェクトの進行フェーズや各役割における募集人員（キャパシティ）とのマッチングを総合的に検討いたしました結果、誠に残念ながら、今回はご参画を見送らせていただく運びとなりました。

せっかくの熱意あるご応募に対してご期待に沿えない結果となり、大変恐縮ではございますが、何卒ご理解いただけますと幸いです。

なお、今回のご参画は叶いませんでしたが、Nexus では今後も定期的に新しいプロジェクトの立ち上げや、どなたでも自由に参加できる公開勉強会・イベントなどを企画してまいります。
その際は公式サイトや公式SNS（あるいはご登録いただいた連絡先）にて告知を行いますので、もしよろしければ今後のイベントや次のプロジェクト募集の機会に、ぜひまた関わっていただけますと大変嬉しく思います。

末筆ではございますが、${name} さんの今後の学習や活動、ならびにご活躍を、運営チーム一同心より応援しております。

この度は素晴らしい志望理由をお送りいただき、本当にありがとうございました。

Nexus 運営チーム
連絡先: azalea.cape@gmail.com`
    );
    setRejectModal(inq);
  };

  const handleSendApproval = async () => {
    if (!approveModal) return;
    setSending(true);
    const subject = `🎉【Nexus】プロジェクト参加決定 ＆ メンバー登録のお知らせ！`;
    const body = emailBody;

    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: { to: approveModal.email, subject, body },
      });

      if (error) throw error;

      await handleUpdateStatus(approveModal.id, "completed");
      
      if (showToast) {
        showToast("🎉 メールが自動送信され、ステータスを「採用済み」に変更しました！");
      } else {
        alert("🎉 メールが自動送信され、ステータスを「採用済み」に変更しました！");
      }
    } catch (e: any) {
      if (showToast) {
        showToast(`メール送信エラー: ${e.message}`, "error");
      } else {
        alert(`⚠️ メール送信エラー: ${e.message}`);
      }
    } finally {
      setSending(false);
      setApproveModal(null);
    }
  };

  const handleSendRejection = async () => {
    if (!rejectModal) return;
    setSending(true);
    const subject = `【Nexus】プロジェクトご応募の結果について`;
    const body = rejectEmailBody;

    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: { to: rejectModal.email, subject, body },
      });

      if (error) throw error;

      await handleUpdateStatus(rejectModal.id, "rejected");
      
      if (showToast) {
        showToast("⚫ お見送りメールが自動送信され、ステータスを「お見送り済み」に変更しました！");
      } else {
        alert("⚫ お見送りメールが自動送信され、ステータスを「お見送り済み」に変更しました！");
      }
    } catch (e: any) {
      if (showToast) {
        showToast(`メール送信エラー: ${e.message}`, "error");
      } else {
        alert(`⚠️ メール送信エラー: ${e.message}`);
      }
    } finally {
      setSending(false);
      setRejectModal(null);
    }
  };

  // 👈 カスタム削除確認の実行処理
  const handleConfirmDelete = async () => {
    if (!deleteModal || !handleDelete) return;
    setSending(true);
    try {
      await handleDelete("inquiries", deleteModal.id, true);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
      setDeleteModal(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: any = {
      processing: <span style={{ background: "#e6f0ff", color: "#0066cc", padding: "3px 9px", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 800 }}>🔵 選考中</span>,
      completed:  <span style={{ background: "#e6ffe6", color: "#006600", padding: "3px 9px", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 800 }}>🟢 採用済み</span>,
      rejected:   <span style={{ background: "#f0f0f0", color: "#666",    padding: "3px 9px", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 800 }}>⚫ お見送り済み</span>,
    };
    return map[status] || <span style={{ background: "#fff0e0", color: "#cc6600", padding: "3px 9px", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 800 }}>🟡 新着</span>;
  };

  const ModalBase = ({ title, email, body, setBody, onSend, onClose, sendLabel, sendColor }: any) => (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: "20px", padding: "36px", maxWidth: "560px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontWeight: 900, fontSize: "1.1rem" }}>{title}</div>
        <div style={{ fontSize: "0.82rem", color: "#666" }}>宛先: <b>{email}</b> — 内容を確認・編集してから送信してください</div>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          style={{ width: "100%", minHeight: "280px", borderRadius: "12px", border: "1px solid #ddd", padding: "14px", fontSize: "0.82rem", lineHeight: 1.7, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #ddd", background: "white", cursor: "pointer", fontWeight: 700 }}>キャンセル</button>
          <button onClick={onSend} disabled={sending} style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: sendColor, color: "white", cursor: "pointer", fontWeight: 800, fontSize: "0.9rem" }}>
            {sendLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {approveModal && (
        <ModalBase
          title="🎉 採用決定メールの送信"
          email={approveModal.email}
          body={emailBody}
          setBody={setEmailBody}
          onSend={handleSendApproval}
          onClose={() => setApproveModal(null)}
          sendLabel="✉️ この内容で採用決定メールを送信する"
          sendColor="#111"
        />
      )}
      {rejectModal && (
        <ModalBase
          title="📩 お見送りメールの送信"
          email={rejectModal.email}
          body={rejectEmailBody}
          setBody={setRejectEmailBody}
          onSend={handleSendRejection}
          onClose={() => setRejectModal(null)}
          sendLabel="✉️ この内容でお見送りメールを送信する"
          sendColor="#666"
        />
      )}

      {/* 👈 プレミアムなカスタム削除確認モーダルを追加！ */}
      {deleteModal && (
        <div onClick={() => setDeleteModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: "20px", padding: "36px", maxWidth: "460px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem" }}>⚠️</div>
            <div style={{ fontWeight: 900, fontSize: "1.25rem", color: "#cc0000" }}>申請データを削除しますか？</div>
            <div style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.6 }}>
              <b>{deleteModal.name} 様</b> の申請データ<br />
              {deleteModal.category === "プロジェクト参加希望" 
                ? `（プロジェクト: ${projectName(deleteModal.content)}）` 
                : `（カテゴリ: ${deleteModal.category}）`
              }<br />
              をデータベースから完全に消去します。<br />
              この操作は取り消せません。本当に削除してもよろしいですか？
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
              <button onClick={() => setDeleteModal(null)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ddd", background: "white", cursor: "pointer", fontWeight: 700 }}>キャンセル</button>
              <button onClick={handleConfirmDelete} disabled={sending} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#cc0000", color: "white", cursor: "pointer", fontWeight: 800 }}>
                {sending ? "削除中..." : "本当に削除する"}
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 style={S.sectionTitle}>📬 参加申請・通知センター</h2>

      {/* 参加申請セクション */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ fontWeight: 900, fontSize: "1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          🚀 プロジェクト参加申請
          <span style={{ background: "#fff0e0", color: "#cc6600", borderRadius: "99px", padding: "2px 10px", fontSize: "0.72rem", fontWeight: 800 }}>
            {projectApplications.filter(i => !i.status || i.status === "new" || i.status === "unprocessed").length} 件 未対応
          </span>
        </div>

        {projectApplications.length === 0 ? (
          <div style={S.emptyState}>参加申請はまだありません</div>
        ) : projectApplications.map((i: any) => (
          <div key={i.id} style={{ ...S.listItem, flexDirection: "column", alignItems: "flex-start", marginBottom: "20px", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "#e6f0ff", color: "#0044cc", padding: "3px 9px", borderRadius: "6px" }}>
                  {projectName(i.content)}
                </span>
                {statusBadge(i.status)}
              </div>
              <span style={{ fontSize: "0.72rem", color: "#aaa" }}>{new Date(i.created_at).toLocaleString('ja-JP')}</span>
            </div>

            <div style={{ fontWeight: 800, fontSize: "1rem" }}>
              {i.name} 様{" "}
              <span style={{ fontWeight: 400, fontSize: "0.82rem", color: "#666" }}>{i.organization && `（${i.organization}）`}</span>
            </div>

            <div style={{ fontSize: "0.85rem", color: "#444", lineHeight: 1.7, background: "#f8f7f4", padding: "14px", borderRadius: "10px", width: "100%", boxSizing: "border-box", whiteSpace: "pre-wrap" }}>
              {i.content}
            </div>

            <div style={{ display: "flex", gap: "8px", width: "100%", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "#666", marginRight: "auto" }}>✉️ {i.email}</span>
              {i.status !== "processing" && i.status !== "completed" && i.status !== "rejected" && (
                <button onClick={() => handleUpdateStatus(i.id, "processing")}
                  style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid #99c0ff", background: "#e6f0ff", color: "#0044cc", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer" }}>
                  🔵 選考中へ
                </button>
              )}
              {i.status !== "completed" && i.status !== "rejected" && (
                <button onClick={() => openApproveModal(i)}
                  style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: "#111", color: "white", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer" }}>
                  🎉 採用決定
                </button>
              )}
              {i.status !== "completed" && i.status !== "rejected" && (
                <button onClick={() => openRejectModal(i)}
                  style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid #ddd", background: "white", color: "#888", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                  📩 お見送り
                </button>
              )}
              {/* 👈 溜まったデータをいつでも削除できる「ゴミ箱ボタン」を追加 */}
              {handleDelete && (
                <button onClick={() => setDeleteModal(i)}
                  style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid #ffcccc", background: "#fff0f0", color: "#cc0000", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer" }}>
                  🗑️ 削除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 通常お問い合わせ */}
      <div>
        <div style={{ fontWeight: 900, fontSize: "1rem", marginBottom: "16px" }}>📩 通常のお問い合わせ</div>
        {otherInquiries.length === 0 ? (
          <div style={S.emptyState}>お問い合わせはありません</div>
        ) : otherInquiries.map((i: any) => {
          const subject = encodeURIComponent(`【Nexus】お問い合わせへのご返信`);
          const body = encodeURIComponent(`${i.name} 様\n\nお問い合わせいただきありがとうございます。\nNexus運営チームです。\n\n`);
          return (
            <div key={i.id} style={{ ...S.listItem, flexDirection: "column", alignItems: "flex-start", marginBottom: "16px", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ fontSize: "0.72rem", background: "#eee", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>{i.category}</span>
                  {statusBadge(i.status)}
                </div>
                <span style={{ fontSize: "0.72rem", color: "#aaa" }}>{new Date(i.created_at).toLocaleString('ja-JP')}</span>
              </div>
              <div style={{ fontWeight: 800 }}>{i.name} 様</div>
              <div style={{ fontSize: "0.85rem", color: "#444", lineHeight: 1.6, background: "#f8f7f4", padding: "12px", borderRadius: "8px", width: "100%", boxSizing: "border-box", whiteSpace: "pre-wrap" }}>{i.content}</div>
              <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "flex-end", alignItems: "center" }}>
                <select value={i.status || "unprocessed"} onChange={e => handleUpdateStatus(i.id, e.target.value)}
                  style={{ ...S.select, width: "auto", padding: "4px 10px", fontSize: "0.78rem", height: "auto" }}>
                  <option value="unprocessed">🟡 未対応</option>
                  <option value="processing">🔵 対応中</option>
                  <option value="completed">🟢 対応完了</option>
                </select>
                <a href={`mailto:${i.email}?subject=${subject}&body=${body}`}
                  style={{ background: "#111", color: "white", padding: "7px 14px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 800, textDecoration: "none" }}>
                  ✉️ 返信する
                </a>
                {/* 👈 通常お問い合わせ側にも同様の削除ボタンを追加！ */}
                {handleDelete && (
                  <button onClick={() => setDeleteModal(i)}
                    style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid #ffcccc", background: "#fff0f0", color: "#cc0000", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer" }}>
                    🗑️ 削除
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
