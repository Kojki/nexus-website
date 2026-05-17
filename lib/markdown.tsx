import React from "react";

export function renderMarkdown(text: string) {
  if (!text) return null;

  return text.split(/(?:\r\n|\r|\n)/).map((line, i) => {
    // 1. 大見出し (## Title)
    if (line.startsWith("## ")) {
      return (
        <h2 
          key={i} 
          style={{ 
            fontSize: "clamp(1.4rem, 3vw, 1.8rem)", 
            fontWeight: 800, 
            marginTop: "36px", 
            marginBottom: "16px", 
            color: "var(--accent)",
            borderBottom: "1px solid #eaeaea",
            paddingBottom: "8px"
          }}
        >
          {line.replace("## ", "")}
        </h2>
      );
    }

    // 2. 中見出し (### Title)
    if (line.startsWith("### ")) {
      return (
        <h3 
          key={i} 
          style={{ 
            fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)", 
            fontWeight: 800, 
            marginTop: "28px", 
            marginBottom: "12px", 
            color: "#111" 
          }}
        >
          {line.replace("### ", "")}
        </h3>
      );
    }

    // 3. 箇条書きリスト (- item)
    if (line.startsWith("- ")) {
      return (
        <li 
          key={i} 
          style={{ 
            marginLeft: "24px", 
            marginBottom: "8px", 
            listStyleType: "disc",
            lineHeight: 1.8,
            color: "var(--ink-soft)"
          }}
        >
          {parseInlineMarkdown(line.replace("- ", ""))}
        </li>
      );
    }

    // 4. 空行の調整
    if (line.trim() === "") {
      return <div key={i} style={{ height: "12px" }} />;
    }

    // 5. 一般段落
    return (
      <p 
        key={i} 
        style={{ 
          marginBottom: "16px", 
          lineHeight: 1.8,
          color: "var(--ink-soft)"
        }}
      >
        {parseInlineMarkdown(line)}
      </p>
    );
  });
}


function parseInlineMarkdown(text: string): React.ReactNode[] {
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // 太字処理
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} style={{ fontWeight: 800, color: "#111" }}>{part.slice(2, -2)}</strong>;
    }
    // リンク処理
    if (part.startsWith("[") && part.includes("](")) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        const [, linkText, url] = match;
        return (
          <a 
            key={index} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              color: "var(--accent)", 
              textDecoration: "underline", 
              fontWeight: 600 
            }}
          >
            {linkText}
          </a>
        );
      }
    }
    return part;
  });
}
