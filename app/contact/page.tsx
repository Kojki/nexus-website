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
    organization: "",
    email: "",
    category: "ご質問",
    content: "",
  });

  const categories = ["ご質問", "ご意見・ご感想", "取材のご依頼", "企業・大学関係者の方", "その他"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("inquiries").insert([formData]);
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
      {/* ナビゲーションとヘッダーは既存のものを維持 */}
      <nav className="site-nav">
        <Link className="nav-logo" href="/"><Image src="/nexus-icon.png" alt="Logo" width={34} height={34} /> Nexus</Link>
        <div className="nav-links"><Link href="/">トップへ戻る</Link></div>
      </nav>

      <header className="concept-header">
        <div className="animate-slide-up">
          <p className="eyebrow" style={{ justifyContent: "center" }}>CONTACT</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", textAlign: "center" }}>お問い合わせ</h1>
        </div>
      </header>

      <section className="concept-container">
        {isSubmitted ? (
          <div className="success-state">
            <div className="success-icon">✓</div>
            <h2>送信が完了しました</h2>
            <Link href="/" className="button button-dark">トップページに戻る</Link>
          </div>
        ) : (
          <form className="contact-form animate-slide-up" onSubmit={handleSubmit}>
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
    </main>
  );
}
