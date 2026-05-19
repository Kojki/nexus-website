"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

  const [honeypot, setHoneypot] = useState("");

  const categories = ["ご質問", "ご意見・ご感想", "取材のご依頼", "企業・大学関係者の方", "その他"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (honeypot !== "") {
      console.log("Bot spam inquiry blocked successfully.");
      setTimeout(() => {
        setIsSubmitted(true);
        setIsSubmitting(false);
      }, 800);
      return;
    }

    try {
      const { error } = await supabase.from("inquiries").insert([formData]);
      if (error) throw error;

      try {
        const { data, error: notifyError } = await supabase.functions.invoke("contact-slack", {
          body: formData,
        });

        if (notifyError) {
          console.error("通知送信に失敗しました:", notifyError);
        } else if (data?.deliveries) {
          console.info("通知送信結果:", data.deliveries);
        }
      } catch (notifyErr) {
        console.error("通知送信に失敗しました:", notifyErr);
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

            <div className="form-group">
              <label htmlFor="organization" style={{ display: 'flex', justifyContent: 'space-between' }}>
                所属・組織名
                <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '0.8rem' }}>任意</span>
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

