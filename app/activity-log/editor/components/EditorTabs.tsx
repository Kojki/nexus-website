import React from "react";
import { PageTabBtn, InputField, S, PagePath } from "./SharedUI";

export function ContentTab({ activePage, setActivePage, siteContents, liveData, setLiveData, handleUpdateContent }: any) {
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
        {Object.keys(siteContents[activePage] || {}).map((key) => (
          <div key={key} style={S.group}>
            <label style={S.fieldLabel}>{key.toUpperCase()}</label>
            {key.includes('body') || key.includes('copy') || key.includes('text') ? (
              <textarea style={S.textArea} value={liveData[key] || ""} onChange={(e) => setLiveData({ ...liveData, [key]: e.target.value })} onBlur={() => handleUpdateContent(key, liveData[key])} />
            ) : (
              <input style={S.input} value={liveData[key] || ""} onChange={(e) => setLiveData({ ...liveData, [key]: e.target.value })} onBlur={() => handleUpdateContent(key, liveData[key])} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityTab({ state, setters, handlers }: any) {
  return (
    <div>
      <h2 style={S.sectionTitle}>活動記録の作成</h2>
      
      {/* 運用者向けの説明メモ */}
      <div style={{ background: "#fdfbf8", borderLeft: "4px solid var(--accent)", padding: "16px", marginBottom: "32px", fontSize: "0.8rem", color: "#666", lineHeight: 1.6 }}>
        <strong style={{ color: "#333" }}>💡 カテゴリの使い分け</strong><br />
        ・<strong>NEWS</strong> : イベントの告知やメディア掲載などのお知らせ。<br />
        ・<strong>PROJECT</strong> : 新しい企画の立ち上げや、プロジェクトの進行状況。<br />
        ・<strong>DIALOGUE</strong> : 対談、インタビュー、日常の議論などの記録。
      </div>

      <div style={S.formStack}>
        <InputField label="タイトル *" value={state.title} onChange={setters.setTitle} placeholder="第1回アイデア会議を開催しました" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <InputField label="日付 *" value={state.date} onChange={setters.setDate} />
          <div style={S.group}>
            <label style={S.fieldLabel}>カテゴリ *</label>
            <select style={S.select} value={state.category} onChange={(e) => setters.setCategory(e.target.value)}>
              <option value="NEWS">NEWS</option>
              <option value="PROJECT">PROJECT</option>
              <option value="DIALOGUE">DIALOGUE</option>
            </select>
          </div>
        </div>
        <InputField label="要約 (一覧に表示されます) *" value={state.summary} onChange={setters.setSummary} textarea />
        <div style={S.group}>
          <label style={S.fieldLabel}>サムネイル画像</label>
          <input type="file" accept="image/*" onChange={(e) => handlers.handleUpload(e, setters.setImageUrl)} style={{ fontSize: "0.85rem" }} />
          {state.uploading && <span style={{ fontSize: "0.75rem", color: "#888" }}>アップロード中...</span>}
        </div>
        <InputField label="詳細内容 (本文) ※任意" value={state.content} onChange={setters.setContent} textarea large placeholder="活動の詳しい内容を記述します..." />
        <InputField label="URLスラッグ (例: project-kickoff) ※任意" value={state.slug} onChange={setters.setSlug} />
        
        {/* ▼ 新規機能：下書き保存ボタンを追加 ▼ */}
        <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
          <button onClick={() => handlers.handlePublishActivity(false)} style={{...S.primaryBtn, background: "white", color: "#111", border: "2px solid #111"}} disabled={state.publishing || !state.title}>
            {state.publishing ? "処理中..." : "下書き保存する"}
          </button>
          <button onClick={() => handlers.handlePublishActivity(true)} style={S.primaryBtn} disabled={state.publishing || !state.title}>
            {state.publishing ? "処理中..." : "今すぐ公開する"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MembersTab({ state, setters, handlers }: any) {
  return (
    <div>
      <h2 style={S.sectionTitle}>メンバー管理</h2>
      <div style={{ ...S.editorCard, marginBottom: "40px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>メンバーの追加</h3>
        <div style={S.formStack}>
          <div style={S.group}>
            <label style={S.fieldLabel}>顔写真</label>
            <input type="file" accept="image/*" onChange={(e) => handlers.handleUpload(e, setters.setMPhotoUrl)} />
          </div>
          <InputField label="氏名 *" value={state.mName} onChange={setters.setMName} />
          <InputField label="役割 (例: Founder)" value={state.mRole} onChange={setters.setMRole} />
          <InputField label="所属 (例: 〇〇大学)" value={state.mAffiliation} onChange={setters.setMAffiliation} />
          <InputField label="メッセージ" value={state.mMessage} onChange={setters.setMMessage} textarea />
          <button onClick={handlers.handleAddMember} style={S.primaryBtn} disabled={!state.mName}>追加する</button>
        </div>
      </div>
      <div style={S.listContainer}>
        {state.members.length === 0 ? <div style={S.emptyState}>登録メンバーがいません</div> : 
          state.members.map((m: any) => (
            <div key={m.id} style={S.listItem}>
              <img src={m.photo_url || "/nexus-icon.png"} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{m.name}</div>
                {/* ▼ 新規機能：公開状態ラベル ▼ */}
                <div style={{ fontSize: "0.75rem", color: "#888", marginBottom: "4px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <span>{m.role}</span>
                  <span style={{ background: m.is_published ? "#e6ffe6" : "#f0f0f0", color: m.is_published ? "#006600" : "#666", padding: "2px 6px", borderRadius: "8px", fontSize: "0.6rem", fontWeight: 800 }}>
                    {m.is_published ? "🟢 公開中" : "⚪️ 非公開"}
                  </span>
                </div>
              </div>
              {/* ▼ 新規機能：公開/非公開トグルボタン ▼ */}
              <div style={{ display: "flex", gap: "8px", flexDirection: "column", alignItems: "flex-end" }}>
                <button onClick={() => handlers.handleTogglePublish('members', m.id, !m.is_published)} style={{...S.dangerBtn, color: "#111", border: "1px solid #ddd", padding: "4px 8px", borderRadius: "6px"}}>
                  {m.is_published ? "非公開にする" : "公開する"}
                </button>
                <button onClick={() => handlers.handleDelete('members', m.id)} style={S.dangerBtn}>削除</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export function FaqTab({ state, setters, handlers }: any) {
  return (
    <div>
      <h2 style={S.sectionTitle}>FAQ管理</h2>
      <div style={{ ...S.editorCard, marginBottom: "40px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "20px" }}>FAQの追加</h3>
        <div style={S.formStack}>
          <InputField label="質問 *" value={state.fQuestion} onChange={setters.setFQuestion} textarea />
          <InputField label="回答 *" value={state.fAnswer} onChange={setters.setFAnswer} textarea />
          <button onClick={handlers.handleAddFaq} style={S.primaryBtn} disabled={!state.fQuestion || !state.fAnswer}>追加する</button>
        </div>
      </div>
      <div style={S.listContainer}>
        {state.faqs.length === 0 ? <div style={S.emptyState}>登録FAQがありません</div> : 
          state.faqs.map((f: any) => (
            <div key={f.id} style={{ ...S.listItem, flexDirection: "column", alignItems: "flex-start" }}>
              {/* ▼ 新規機能：公開状態ラベル ▼ */}
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>Q: {f.question}</div>
                <span style={{ background: f.is_published ? "#e6ffe6" : "#f0f0f0", color: f.is_published ? "#006600" : "#666", padding: "2px 6px", borderRadius: "8px", fontSize: "0.6rem", fontWeight: 800 }}>
                  {f.is_published ? "🟢 公開中" : "⚪️ 非公開"}
                </span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.5, marginTop: "8px" }}>A: {f.answer}</div>
              
              {/* ▼ 新規機能：公開/非公開トグルボタン ▼ */}
              <div style={{ display: "flex", gap: "12px", marginTop: "12px", width: "100%", justifyContent: "flex-end" }}>
                <button onClick={() => handlers.handleTogglePublish('faqs', f.id, !f.is_published)} style={{...S.dangerBtn, color: "#111", border: "1px solid #ddd", padding: "4px 8px", borderRadius: "6px"}}>
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

export function InquiriesTab({ inquiries }: { inquiries: any[] }) {
  return (
    <div>
      <h2 style={S.sectionTitle}>お問い合わせ履歴</h2>
      {inquiries.length === 0 ? (
        <div style={S.emptyState}>メッセージはありません。</div>
      ) : inquiries.map((i: any) => {
        // メーラー起動用のリンク作成
        const subject = encodeURIComponent(`【Nexus】お問い合わせへのご返信（件名: ${i.category}）`);
        const body = encodeURIComponent(`${i.name} 様\n\nお問い合わせいただきありがとうございます。\nNexus運営チームです。\n\n---\n\n`);
        const mailtoLink = `mailto:${i.email}?subject=${subject}&body=${body}`;

        return (
          <div key={i.id} style={{ ...S.listItem, flexDirection: "column", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "#eee", padding: "4px 8px", borderRadius: "6px" }}>{i.category}</span>
              <span style={{ fontSize: "0.75rem", color: "#888" }}>{new Date(i.created_at).toLocaleString('ja-JP')}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "4px" }}>{i.name} 様</div>
            {i.organization && <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "12px" }}>{i.organization}</div>}
            <div style={{ fontSize: "0.9rem", color: "#333", lineHeight: 1.6, background: "#f8f7f4", padding: "16px", borderRadius: "8px", width: "100%", boxSizing: "border-box", whiteSpace: "pre-wrap" }}>
              {i.content}
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: "16px", alignItems: "center" }}>
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
        );
      })}
    </div>
  );
}
