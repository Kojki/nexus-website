import React, { CSSProperties } from "react";

export type Tab = "activity" | "content" | "members" | "faq" | "inquiries";
export type PagePath = "home" | "about" | "en" | "guidelines" | "privacy";

// --- 共通コンポーネント ---
export function NavBtn({ label, children, active, onClick, icon }: any) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 18px", borderRadius: "12px", border: "none", cursor: "pointer",
      background: active ? "#111" : "transparent", color: active ? "white" : "#666",
      fontWeight: active ? 800 : 500, display: "flex", alignItems: "center", gap: "8px", transition: "0.2s"
    }}>
      <span style={{ fontSize: "1rem" }}>{icon}</span>{label || children}
    </button>
  );
}

export function PageTabBtn({ children, active, onClick }: any) {
  return <button onClick={onClick} style={{ padding: "6px 12px", borderRadius: "8px", border: "none", cursor: "pointer", background: active ? "white" : "transparent", color: active ? "black" : "#888", fontSize: "0.7rem", fontWeight: active ? 800 : 500, boxShadow: active ? "0 2px 8px rgba(0,0,0,0.05)" : "none" }}>{children}</button>;
}

export function InputField({ label, value, onChange, textarea, large, placeholder, disabled }: any) {
  return (
    <div style={S.group}>
      <label style={S.fieldLabel}>{label}</label>
      {textarea ? (
        <textarea
          style={{ ...S.input, minHeight: large ? "250px" : "100px", opacity: disabled ? 0.6 : 1 }}
          value={value}
          onChange={e => !disabled && onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      ) : (
        <input
          style={{ ...S.input, opacity: disabled ? 0.6 : 1 }}
          value={value}
          onChange={e => !disabled && onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
  );
}

// --- スタイル定義 (TypeScriptエラー回避のため CSSProperties を使用) ---
export const S: Record<string, CSSProperties> = {
  header: { background: "white", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e0d8", position: "sticky", top: 0, zIndex: 100 },
  tabNav: { display: "flex", gap: "4px", background: "#f0efeb", padding: "4px", borderRadius: "16px" },
  logoutBtn: { fontSize: "0.65rem", fontWeight: 900, color: "#888", border: "1px solid #ddd", background: "white", padding: "6px 12px", borderRadius: "8px", cursor: "pointer" },
  sectionTitle: { fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.03em" },
  pageToggle: { display: "flex", gap: "4px", background: "#f0efeb", padding: "4px", borderRadius: "10px" },
  formStack: { display: "flex", flexDirection: "column", gap: "24px" },
  group: { display: "flex", flexDirection: "column", gap: "10px" },
  fieldLabel: { fontWeight: 900, fontSize: "0.65rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em" },
  input: { width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #dcd7cc", background: "white", fontSize: "0.95rem", boxSizing: "border-box", outline: "none", fontFamily: "inherit" },
  textArea: { width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #dcd7cc", background: "white", fontSize: "0.95rem", boxSizing: "border-box", outline: "none", fontFamily: "inherit", minHeight: "100px", lineHeight: 1.6 },
  select: { width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #dcd7cc", background: "white", fontSize: "0.95rem", boxSizing: "border-box", outline: "none", cursor: "pointer" },
  editorCard: { background: "white", padding: "30px", borderRadius: "20px", border: "1px solid #e5e0d8" },
  primaryBtn: { background: "#111", color: "white", border: "none", borderRadius: "12px", padding: "18px", fontSize: "1rem", fontWeight: 800, cursor: "pointer", width: "100%", transition: "0.2s" },
  listContainer: { display: "flex", flexDirection: "column", gap: "12px" },
  listItem: { display: "flex", alignItems: "center", gap: "16px", background: "white", padding: "16px", borderRadius: "14px", border: "1px solid #e5e0d8" },
  dangerBtn: { color: "#ff4d4d", fontSize: "0.75rem", fontWeight: 800, border: "none", background: "none", cursor: "pointer" },
  previewWindow: { background: "white", padding: "40px", borderRadius: "28px", height: "calc(100% - 40px)", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.06)" },
  emptyState: { textAlign: "center", padding: "60px", color: "#aaa", border: "2px dashed #eee", borderRadius: "20px" },
  loading: { padding: "100px", textAlign: "center", fontSize: "0.7rem", fontWeight: 900, color: "#aaa", letterSpacing: "0.2em" }
};
