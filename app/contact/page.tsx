"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

const joinUrl = "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("inquiries")
        .insert([formData]);

      if (error) throw error;
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
      <nav className="site-nav" aria-label="メインナビゲーション">
        <Link className="nav-logo" href="/" aria-label="Nexus ホーム">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={34} height={34} priority />
          Nexus
        </Link>
        <div className="nav-links">
          <Link href="/">トップへ戻る</Link>
          <a className="nav-cta" href={joinUrl} target="_blank" rel="noreferrer">参加する</a>
        </div>
      </nav>

      <header className="concept-header">
        <div className="animate-slide-up">
          <p className="eyebrow" style={{ justifyContent: "center" }}>CONTACT</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center" }}>
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
            <h2 style={{ fontSize: "1.8rem", marginBottom: "16px" }}>送信が完了しました</h2>
            <p style={{ color: "var(--ink-soft)", marginBottom: "32px" }}>
              お問い合わせありがとうございます。通常2〜3営業日以内にご返信いたします。
            </p>
            <Link href="/" className="button button-dark">トップページに戻る</Link>
          </div>
        ) : (
          <form className="contact-form animate-slide-up" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">お名前 / 組織名</label>
              <input
                type="text"
                id="name"
                className="form-input"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例：山田 太郎"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
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
            <div className="form-group">
              <label htmlFor="content">お問い合わせ内容</label>
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

      <footer>
        <p>意欲あるすべての学生へ</p>
        <nav className="footer-links" aria-label="フッターナビゲーション">
          <Link href="/">トップ</Link>
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/guidelines">ガイドライン</Link>
          <Link href="/activity-log">活動記録</Link>
          <Link href="/contact">お問い合わせ</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
        </nav>
      </footer>
    </main>
  );
}
