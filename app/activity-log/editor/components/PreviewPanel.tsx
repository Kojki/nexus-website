import React from "react";
import { PagePath, Tab, S } from "./SharedUI";

interface Props {
  activeTab: Tab; // どのタブを開いているかを受け取る
  activePage: PagePath;
  liveData: Record<string, string>;
  title: string;
  imageUrl: string;
  summary: string;
}

// 改行を正しく <br /> に変換するヘルパー関数
const renderText = (text: string) => {
  if (!text) return null;
  // エンターキーの改行(\n) と、文字としての "\n" の両方に対応
  return text.split(/(?:\r\n|\r|\n|\\n)/).map((line, i) => (
    <span key={i}>{line}<br /></span>
  ));
};

export function PreviewPanel({ activeTab, activePage, liveData, title, imageUrl, summary }: Props) {
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
          
          {/* ▼ 文言編集タブを開いている時 ▼ */}
          {activeTab === "content" && (
            <>
              <p style={{ fontSize: "0.55rem", fontWeight: 900, color: "var(--accent)", marginBottom: "10px", letterSpacing: "0.2em" }}>NEXUS / {activePage.toUpperCase()}</p>
              <h3 style={{ fontSize: "1.6rem", fontWeight: 900, lineHeight: 1.25, marginBottom: "20px", letterSpacing: "-0.01em" }}>
                {renderText(liveData.hero_title || liveData.about_title || "Previewing...")}
              </h3>
              <div style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.85 }}>
                {renderText(liveData.hero_copy || liveData.about_body_1 || liveData.intro_text || "サイト上での見え方がここに表示されます。")}
              </div>
              {liveData.about_body_2 && (
                <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px dashed #eee", fontSize: "0.85rem", color: "#777", lineHeight: 1.8 }}>
                  {renderText(liveData.about_body_2)}
                </div>
              )}
            </>
          )}

          {/* ▼ 活動記録タブを開いている時 ▼ */}
          {activeTab === "activity" && (
            <div style={{ marginTop: "10px" }}>
              {imageUrl ? (
                <img src={imageUrl} alt="preview" style={{ width: "100%", borderRadius: "8px", marginBottom: "16px", objectFit: "cover", aspectRatio: "16/9" }} />
              ) : (
                <div style={{ width: "100%", aspectRatio: "16/9", background: "#eee", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: "0.8rem" }}>
                  No Image
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

          {/* ▼ その他のタブを開いている時 ▼ */}
          {activeTab !== "content" && activeTab !== "activity" && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#ccc", fontSize: "0.85rem" }}>
              このタブのプレビューは現在ありません
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
