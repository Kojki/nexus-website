import React from "react";
import { PagePath, Tab, S } from "./SharedUI";

interface Props {
  activeTab: Tab;
  activePage: PagePath;
  liveData: Record<string, string>;
  title: string;
  imageUrl: string;
  summary: string;
  // ▼ 追加 ▼
  faqs?: any[];
  fQuestion?: string;
  fAnswer?: string;
  members?: any[];
  mName?: string;
  mRole?: string;
  mMessage?: string;
  mPhotoUrl?: string;
}

const renderText = (text?: string | null) => {
  if (!text) return null;
  return text.split(/(?:\r\n|\r|\n|\\n)/).map((line, i) => (
    <span key={i}>{line}<br /></span>
  ));
};


export function PreviewPanel({ 
  activeTab, activePage, liveData, title, imageUrl, summary,
  faqs, fQuestion, fAnswer, members, mName, mRole, mMessage, mPhotoUrl
}: Props) {
  return (
    <div style={{ background: "#f0efeb", padding: "24px", position: "sticky", top: "70px", height: "calc(100vh - 70px)", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <span style={{ fontSize: "0.65rem", fontWeight: 900, color: "#999", letterSpacing: "0.15em" }}>LIVE PREVIEW</span>
        <span style={{ background: "#111", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "0.6rem", fontWeight: 800 }}>
          {activeTab === "content" ? activePage.toUpperCase() : activeTab.toUpperCase()}
        </span>
      </div>
      
      <div style={S.previewWindow}>
        <div style={{ animation: "fadeIn 0.4s" }}>
          
          {/* =========================================
              1. 文言編集タブのプレビュー
             ========================================= */}
          {activeTab === "content" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {/* --- HOME プレビュー --- */}
              {activePage === "home" && (
                <>
                  <div style={{ paddingBottom: "24px", borderBottom: "1px dashed #ddd" }}>
                    <p style={{ fontSize: "0.55rem", fontWeight: 900, color: "var(--accent)", marginBottom: "10px" }}>HERO SECTION</p>
                    <h3 style={{ fontSize: "1.6rem", fontWeight: 900, lineHeight: 1.25, marginBottom: "16px" }}>{renderText(liveData.hero_title)}</h3>
                    <div style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.8 }}>{renderText(liveData.hero_copy)}</div>
                  </div>
                  <div style={{ paddingBottom: "24px", borderBottom: "1px dashed #ddd" }}>
                    <p style={{ fontSize: "0.55rem", fontWeight: 900, color: "var(--accent)", marginBottom: "10px" }}>ABOUT SECTION</p>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 900, lineHeight: 1.25, marginBottom: "16px" }}>{renderText(liveData.about_title)}</h3>
                    <div style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.8, marginBottom: "12px" }}>{renderText(liveData.about_body_1)}</div>
                    <div style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.8 }}>{renderText(liveData.about_body_2)}</div>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.55rem", fontWeight: 900, color: "var(--accent)", marginBottom: "10px" }}>ACTIVITY SECTION</p>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 900, lineHeight: 1.25, marginBottom: "16px" }}>{renderText(liveData.activity_title)}</h3>
                    <div style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.8 }}>{renderText(liveData.activity_copy)}</div>
                  </div>
                </>
              )}

              {/* --- ABOUT プレビュー --- */}
              {activePage === "about" && (
                <>
                  <div style={{ paddingBottom: "24px", borderBottom: "1px dashed #ddd" }}>
                    <h3 style={{ fontSize: "1.6rem", fontWeight: 900, lineHeight: 1.25, marginBottom: "16px" }}>{renderText(liveData.hero_title)}</h3>
                  </div>
                  {[1, 2, 3].map(i => (
                    liveData[`block_${i}_title`] && (
                      <div key={i} style={{ paddingBottom: "24px", borderBottom: i !== 3 ? "1px dashed #ddd" : "none" }}>
                        <h4 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "12px" }}>{renderText(liveData[`block_${i}_title`])}</h4>
                        <div style={{ fontSize: "0.85rem", color: "#555", lineHeight: 1.8 }}>{renderText(liveData[`block_${i}_body`])}</div>
                      </div>
                    )
                  ))}
                </>
              )}

              {/* --- GUIDELINES / PRIVACY プレビュー --- */}
              {(activePage === "guidelines" || activePage === "privacy") && (
                <>
                  <h3 style={{ fontSize: "1.6rem", fontWeight: 900, lineHeight: 1.25, marginBottom: "16px" }}>{renderText(liveData.hero_title)}</h3>
                  <div style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.8, marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px dashed #ddd" }}>
                    {renderText(liveData.intro_text || liveData.last_updated)}
                  </div>
                  {Object.keys(liveData)
                    .filter(k => k.includes('_title') && k !== 'hero_title')
                    .sort()
                    .map(titleKey => {
                      const bodyKey = titleKey.replace('_title', '_body');
                      return (
                        <div key={titleKey} style={{ marginBottom: "24px" }}>
                          <h4 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "8px" }}>{renderText(liveData[titleKey])}</h4>
                          <div style={{ fontSize: "0.85rem", color: "#555", lineHeight: 1.8 }}>{renderText(liveData[bodyKey])}</div>
                        </div>
                      );
                  })}
                </>
              )}

              {/* --- EN プレビュー --- */}
              {activePage === "en" && (
                <>
                  <h3 style={{ fontSize: "1.6rem", fontWeight: 900, lineHeight: 1.25, marginBottom: "16px" }}>{renderText(liveData.hero_title)}</h3>
                  <div style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.8 }}>{renderText(liveData.hero_copy)}</div>
                </>
              )}
            </div>
          )}

          {/* =========================================
              2. 活動記録タブのプレビュー
             ========================================= */}
          {activeTab === "activity" && (
            <div style={{ marginTop: "10px" }}>
              {imageUrl ? (
                <img src={imageUrl} alt="preview" style={{ width: "100%", borderRadius: "8px", marginBottom: "16px", objectFit: "cover", aspectRatio: "16/9" }} />
              ) : (
                <div style={{ width: "100%", aspectRatio: "16/9", background: "#eee", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: "0.8rem", border: "1px dashed #ccc" }}>
                  メイン画像プレビュー
                </div>
              )}
              <h3 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "12px", lineHeight: 1.4 }}>
                {renderText(title) || "記事のタイトルがここに表示されます"}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.6 }}>
                {renderText(summary) || "ここに要約テキストが表示されます。"}
              </p>
            </div>
          )}

          {/* =========================================
              3. メンバータブのプレビュー (NEW)
             ========================================= */}
          {activeTab === "members" && (
            <div style={{ marginTop: "10px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: "20px", color: "var(--accent)" }}>MEMBER PROFILE</h3>
              
              {/* 入力中のプレビュー */}
              {(mName || mRole || mMessage) && (
                <div style={{ marginBottom: "32px", padding: "20px", background: "#fdfbf8", border: "1px dashed #ccc", borderRadius: "8px" }}>
                  <p style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 800, marginBottom: "12px", letterSpacing: "0.1em" }}>▶ 登録プレビュー</p>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
                    <img src={mPhotoUrl || "/nexus-icon.png"} alt="preview" style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover" }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.2rem" }}>{mName || "氏名"}</div>
                      <div style={{ fontSize: "0.8rem", color: "#888", fontWeight: 600 }}>{mRole || "役割"}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#444", lineHeight: 1.7 }}>{renderText(mMessage) || "メッセージ文"}</div>
                </div>
              )}

              {/* 登録済みリスト */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {members?.map(m => (
                  <div key={m.id} style={{ display: "flex", gap: "16px", paddingBottom: "24px", borderBottom: "1px solid #eee" }}>
                    <img src={m.photo_url || "/nexus-icon.png"} alt={m.name} style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
                    <div>
                      <div style={{ fontWeight: 800 }}>{m.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#888", marginBottom: "8px" }}>{m.role}</div>
                      <div style={{ fontSize: "0.85rem", color: "#444", lineHeight: 1.7 }}>{renderText(m.message)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================
              4. FAQタブのプレビュー (NEW)
             ========================================= */}
          {activeTab === "faq" && (
            <div style={{ marginTop: "10px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: "20px", color: "var(--accent)" }}>FAQ (よくある質問)</h3>
              
              {/* 入力中のプレビュー */}
              {(fQuestion || fAnswer) && (
                <div style={{ marginBottom: "32px", padding: "20px", background: "#fdfbf8", border: "1px dashed #ccc", borderRadius: "8px" }}>
                  <p style={{ fontSize: "0.7rem", color: "#e53e3e", fontWeight: 800, marginBottom: "12px", letterSpacing: "0.1em" }}>▶ 登録プレビュー</p>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "8px" }}>Q: {fQuestion || "質問を入力..."}</div>
                  <div style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.7 }}>A: {renderText(fAnswer) || "回答を入力..."}</div>
                </div>
              )}

              {/* 登録済みリスト */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {faqs?.map(f => (
                  <div key={f.id} style={{ paddingBottom: "20px", borderBottom: "1px solid #eee" }}>
                    <div style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "8px" }}>Q: {f.question}</div>
                    <div style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.7 }}>A: {renderText(f.answer)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* その他のタブ（お問い合わせ等） */}
          {activeTab === "inquiries" && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#ccc", fontSize: "0.85rem" }}>
              お問い合わせは左側のリストから確認できます
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
