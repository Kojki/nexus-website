import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="footer-brand">
        <Image src="/nexus-icon.png" alt="Nexus Logo" width={30} height={30} />
        Nexus
      </div>
      <p>意欲あるすべての学生へ</p>
            <nav className="footer-links" aria-label="フッターナビゲーション">
        <Link href="/">トップ</Link>
        <Link href="/about">About</Link>
        <Link href="/activity-log">活動記録</Link>
        <Link href="/projects">プロジェクト一覧</Link>
        <Link href="/members">メンバー紹介</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/contact">お問い合わせ</Link>
        <Link href="/guidelines">ガイドライン</Link>
        <Link href="/privacy">プライバシーポリシー</Link>
        <a href="https://www.instagram.com/nex.us_2026/" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          📸 Instagram
        </a>
        <Link href="/login" style={{ opacity: 0.3, fontSize: '0.7rem', marginLeft: '10px' }}>Admin</Link>
        <Link href="/login" style={{ opacity: 0.3, fontSize: '0.7rem', marginLeft: '10px' }}>Admin</Link>
      </nav>
    </footer>
  );
}
