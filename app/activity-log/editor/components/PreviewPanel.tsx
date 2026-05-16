import { PagePath, S } from "./SharedUI";

interface Props {
  activePage: PagePath;
  liveData: Record<string, string>;
  title: string;
  imageUrl: string;
}

export function PreviewPanel({ activePage, liveData, title, imageUrl }: Props) {
  return (
    <div style={{ background: "#f0efeb", padding: "24px", position: "sticky", top: "70px", height: "calc(100vh - 70px)", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <span style={{ fontSize: "0.65rem", fontWeight: 900, color: "#999", letterSpacing: "0.15em" }}>LIVE PREVIEW</span>
        <span style={{ background: "#111", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "0.6rem", fontWeight: 800 }}>{activePage.toUpperCase()}</span>
      </div>
      <div style={S.previewWindow}>
        <div style={{ animation: "fadeIn 0.4s" }}>
          <p style={{ fontSize: "0.55rem", fontWeight: 900, color: "var(--accent)", marginBottom: "10px", letterSpacing: "0.2em" }}>NEXUS / CONCEPT</p>
          <h3 style={{ fontSize: "1.6rem", fontWeight: 900, lineHeight: 1.25, marginBottom: "20px", letterSpacing: "-0.01em" }}>
            {(liveData.hero_title || liveData.about_title || "Previewing...").split('\\n').map((line: string, i: number) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h3>
          <div style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
            {liveData.hero_copy || liveData.about_body_1 || liveData.intro_text || "サイト上での見え方がここに表示されます。"}
          </div>
          {liveData.about_body_2 && (
            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px dashed #eee", fontSize: "0.85rem", color: "#777", lineHeight: 1.8 }}>
              {liveData.about_body_2}
            </div>
          )}
          
          <div style={{ marginTop: "32px", padding: "20px", background: "#fcfbf9", borderRadius: "16px", border: "1px solid #eee", fontSize: "0.8rem" }}>
            {imageUrl && <img src={imageUrl} alt="preview" style={{ width: "100%", borderRadius: "8px", marginBottom: "12px", objectFit: "cover" }} />}
            <div style={{ fontWeight: 800 }}>{title || "Activity Title"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
