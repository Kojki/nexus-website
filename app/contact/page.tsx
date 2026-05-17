"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const joinUrl = "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    email: "",
    category: "ご質問",
    content: "",
  });

  // 🤖 ボット検知用の見えないハニーポットフィールド
  const [honeypot, setHoneypot] = useState("");

  const categories = ["ご質問", "ご意見・ご感想", "取材のご依頼", "企業・大学関係者の方", "その他"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 🤖 もしハニーポットに何かが入力されていたら、スパムボットと判定して送信処理をスキップ
    if (honeypot !== "") {
      console.log("Bot spam inquiry blocked successfully.");
      // ボット側には「成功した」と思い込ませるために、成功画面だけを見せます
      setTimeout(() => {
        setIsSubmitted(true);
        setIsSubmitting(false);
      }, 800);
      return;
    }

    try {
      // 1. Supabaseへ書き込み
      const { error } = await supabase.from("inquiries").insert([formData]);
      if (error) throw error;

      // 2. 運営Slackへの即時リアルタイム通知 (環境変数から安全に取得)
      try {
        const slackWebhookUrl = process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL || "";
        
        if (slackWebhookUrl) {
          const messageText = `📩 *【新規お問い合わせ】* \n----------------------------------------\n*カテゴリ:* ${formData.category}\n*お名前:* ${formData.name}\n*所属/組織:* ${formData.organization || "未入力"}\n*返信用アドレス:* ${formData.email}\n*本文:*\n${formData.content}\n----------------------------------------\n⚡️ _Nexus Connect Studio システム即時通知_`;
          
          await fetch(slackWebhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: messageText })
          });
        }
      } catch (slackErr) {
        console.error("Slack通知に失敗しました:", slackErr);
      }

      setIsSubmitted(true);
    } catch (error) {
      alert("送信に失敗しました。時間をおいて再度お試しください。");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <Navbar />
      <header className="concept-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="eyebrow">CONTACT</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto" }}>
            お問い合わせ
          </h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>
            ご質問・ご意見・取材のご依頼など、お気軽にどうぞ。
          </p>
        </div>
      </header>

      <section className="concept-container">
        {isSubmitted ? (
          <div className="success-state">
            <div className="success-icon">✓</div>
            <h2>送信が完了しました</h2>
            <p style={{ color: "var(--muted)", marginBottom: "30px", fontSize: "0.95rem" }}>お問い合わせいただきありがとうございます。内容を確認の上、担当者より返信いたします。</p>
            <Link href="/" className="button button-dark">トップページに戻る</Link>
          </div>
        ) : (
          <form className="contact-form animate-slide-up" onSubmit={handleSubmit}>
            
            {/* 🤖 スパムトラップ（人間には表示されない、ボットだけが入力する罠） */}
            <div style={{ display: "none" }} aria-hidden="true">
              <input 
                type="text" 
                name="website_hidden_trap_field" 
                value={honeypot} 
                onChange={(e) => setHoneypot(e.target.value)} 
                tabIndex={-1} 
                placeholder="Do not fill this field if you are a human" 
              />
            </div>

            {/* カテゴリ選択 */}
            <div className="form-group">
              <label htmlFor="category">お問い合わせカテゴリ</label>
              <select
                id="category"
                className="form-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>

            {/* 名前 */}
            <div className="form-group">
              <label htmlFor="name">お名前 <span className="required-badge">必須</span></label>
              <input
                type="text"
                id="name"
                className="form-input"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="山田 太郎"
              />
            </div>

            {/* 所属（任意） */}
            <div className="form-group">
              <label htmlFor="organization" style={{ display: 'flex', justifyContent: 'space-between' }}>
                所属・組織名 
                <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '0.8rem' }}>任意（入力なしでも構いません）</span>
              </label>
              <input
                type="text"
                id="organization"
                className="form-input"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="例：〇〇大学 〇〇学部"
              />
            </div>

            {/* メールアドレス */}
            <div className="form-group">
              <label htmlFor="email">メールアドレス <span className="required-badge">必須</span></label>
              <input
                type="email"
                id="email"
                className="form-input"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@nexus-connect.jp"
              />
            </div>

            {/* 内容 */}
            <div className="form-group">
              <label htmlFor="content">メッセージ <span className="required-badge">必須</span></label>
              <textarea
                id="content"
                className="form-textarea"
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="ご質問やメッセージをご記入ください"
              ></textarea>
            </div>

            <button type="submit" className="button button-dark" style={{ width: "100%" }} disabled={isSubmitting}>
              {isSubmitting ? "送信中..." : "この内容で送信する"}
            </button>
          </form>
        )}
      </section>
      <Footer />
    </main>
  );
}

