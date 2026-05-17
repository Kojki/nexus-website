import React from "react";
import { S, PagePath, PageTabBtn, InputField } from "./SharedUI";

// 1. 文言編集タブ
export function ContentTab({ activePage, setActivePage, siteContents, liveData, setLiveData, handleUpdateContent }: any) {
  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <h2 style={S.sectionTitle}>文言管理</h2>
        <div style={S.pageToggle}>
          {(["home", "about", "en", "guidelines", "privacy"] as PagePath[]).map(p => (
            <PageTabBtn key={p} active={activePage === p} onClick={() => setActivePage(p)}>{p.toUpperCase()}</PageTabBtn>
          ))}
        </div>
      </div>
      <div style={S.formStack}>
        {Object.keys(siteContents[activePage] || {}).map(key => (
          <div key={`${activePage}-${key}`} style={S.editorCard}>
            <label style={S.fieldLabel}>{key}</label>
            <textarea 
              style={S.textArea} 
              value={liveData[key] || ""} 
              onChange={(e) => setLiveData((prev: any) => ({ ...prev, [key]: e.target.value }))}
              onBlur={(e) => handleUpdateContent(key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. 活動記録タブ
export function ActivityTab({ state, setters, handlers }: any) {
  return (
    <div style={{ maxWidth: "700px" }}>
      <h2 style={S.sectionTitle}>活動記録を投稿</h2>
      <div style={S.formStack}>
        <InputField label="タイトル" value={state.title} onChange={setters.setTitle} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <InputField label="日付" value={state.date} onChange={setters.setDate} />
          <div style={S.group}>
            <label style={S.fieldLabel}>カテゴリ</label>
            <select style={S.select} value={state.category} onChange={e => setters.setCategory(e.target.value)}>
              <option value="NEWS">NEWS</option>
              <option value="PROJECT">PROJECT</option>
              <option value="DIALOGUE">DIALOGUE</option>
            </select>
            {/* ▼ カテゴリの説明を追加 ▼ */}
            <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "8px", lineHeight: 1.5 }}>
              ※ <b>NEWS</b>: 運営からのお知らせや全体への周知<br/>
              ※ <b>PROJECT</b>: メンバー発のプロジェクトや企画の進捗<br/>
              ※ <b>DIALOGUE</b>: 対話や議論の内容、イベントレポートなど
            </p>
          </div>
        </div>
        <div style={S.group}>
          <label style={S.fieldLabel}>画像</label>
          <input type="file" onChange={(e) => handlers.handleUpload(e, setters.setImageUrl)} style={S.input} />
        </div>
        <InputField label="スラッグ (URL用)" value={state.slug} onChange={setters.setSlug} />
        <InputField label="要約" value={state.summary} onChange={setters.setSummary} textarea />
        <InputField label="本文" value={state.content} onChange={setters.setContent} textarea large />
        <button onClick={handlers.handlePublishActivity} disabled={state.publishing || state.uploading} style={S.primaryBtn}>
          {state.publishing ? "公開中..." : "公開する"}
        </button>
      </div>
    </div>
  );
}

// 3. メンバー管理タブ
export function MembersTab({ state, setters, handlers }: any) {
  return (
    <div style={{ maxWidth: "700px" }}>
      <h2 style={S.sectionTitle}>メンバー管理</h2>
      <div style={S.editorCard}>
        <div style={S.formStack}>
          <InputField label="氏名" value={state.mName} onChange={setters.setMName} />
          <InputField label="役割" value={state.mRole} onChange={setters.setMRole} />
          <InputField label="所属" value={state.mAffiliation} onChange={setters.setMAffiliation} />
          <div style={S.group}>
            <label style={S.fieldLabel}>写真</label>
            <input type="file" onChange={(e) => handlers.handleUpload(e, setters.setMPhotoUrl)} style={S.input} />
          </div>
          <InputField label="メッセージ" value={state.mMessage} onChange={setters.setMMessage} textarea />
          <button onClick={handlers.handleAddMember} style={S.primaryBtn}>保存</button>
        </div>
      </div>
      <div style={{ marginTop: "40px", ...S.listContainer }}>
        {state.members.map((m: any) => (
          <div key={m.id} style={S.listItem}>
            <img src={m.photo_url || "/nexus-icon.png"} alt={m.name} style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }} />
            <div style={{ flex: 1 }}><strong>{m.name}</strong></div>
            <button onClick={() => handlers.handleDelete('members', m.id)} style={S.dangerBtn}>削除</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. FAQタブ
export function FaqTab({ state, setters, handlers }: any) {
  return (
    <div style={{ maxWidth: "700px" }}>
      <h2 style={S.sectionTitle}>FAQ管理</h2>
      <div style={S.editorCard}>
        <div style={S.formStack}>
          <InputField label="質問" value={state.fQuestion} onChange={setters.setFQuestion} />
          <InputField label="回答" value={state.fAnswer} onChange={setters.setFAnswer} textarea />
          <button onClick={handlers.handleAddFaq} style={S.primaryBtn}>追加</button>
        </div>
      </div>
      <div style={{ marginTop: "40px", ...S.listContainer }}>
        {state.faqs.map((f: any) => (
          <div key={f.id} style={{ ...S.listItem, flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <strong>Q: {f.question}</strong>
              <button onClick={() => handlers.handleDelete('faqs', f.id)} style={S.dangerBtn}>削除</button>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "8px" }}>A: {f.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. お問い合わせタブ
export function InquiriesTab({ inquiries }: { inquiries: any[] }) {
  return (
    <div>
      <h2 style={S.sectionTitle}>お問い合わせ履歴</h2>
      {inquiries.length === 0 ? (
        <div style={S.emptyState}>メッセージはありません。</div>
      ) : inquiries.map((i: any) => {
        // ▼ メーラー起動用のリンク作成 ▼
        const mailSubject = encodeURIComponent("【Nexus】お問い合わせへのご返信");
        const mailBody = encodeURIComponent(
          `${i.name} 様\n\nお問い合わせありがとうございます。\n\n` +
          `---- お問い合わせ内容 ----\n${i.content}\n--------------------------\n\n` +
          `（※ここに返信をご記入ください）`
        );
        const mailtoLink = `mailto:${i.email}?subject=${mailSubject}&body=${mailBody}`;

        return (
          <div key={i.id} style={{ ...S.editorCard, marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <span style={{ fontWeight: 800 }}>{i.name} 様</span>
                <span style={{ marginLeft: "8px", fontSize: "0.75rem", color: "#aaa" }}>
                  {new Date(i.created_at).toLocaleString()}
                </span>
              </div>
              
              {/* ▼ 返信ボタンを追加 ▼ */}
              <a 
                href={mailtoLink}
                style={{
                  background: "#1a1a1a", color: "white", padding: "6px 16px",
                  borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700,
                  textDecoration: "none", display: "inline-block"
                }}
              >
                ✉️ メールで返信する
              </a>

            </div>
            <div style={{ color: "#4285F4", fontSize: "0.85rem", marginBottom: "12px" }}>{i.email}</div>
            <p style={{ lineHeight: 1.7, fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>{i.content}</p>
          </div>
        );
      })}
    </div>
  );
}
