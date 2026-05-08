# Nexus

**専門を学ぶ、すべての学生へ。**

領域を越えようとする高校生・専門学生・大学生・大学院生が専門を持ち寄り、その接続を日常にできる場を目指すコミュニティ、Nexus の公式サイトです。

🔗 [nexus-connect.jp](https://nexus-connect.jp)

---

## 概要

Nexus は、異なる専門を持つ学生が対話することで、一人では辿り着けない視点を生み出すことを目的としたオンラインコミュニティです。

- 参加費用：無料
- 対象：学生（高校生・専門学生・大学生・大学院生）
- 参加形式：オンライン
- 活動内容：関心のあるテーマや問いの共有、学びの記録、専門分野を紹介する企画など

---

## 活動内容

Nexus では、専門分野や関心の異なる学生同士が、日常的に問いや学びを共有しながら対話を深めていきます。

主な活動は以下の通りです。

- 最近気になっているテーマや問いの共有
- 読んだ本、記事、論文、観た動画などのインプット共有
- メンバーの専門分野や関心領域を紹介する企画
- 異なる分野の視点を持ち寄るオンライン上での対話

---

## 使用技術

- Next.js
- React
- TypeScript
- CSS
- GitHub Pages

---

## ディレクトリ構成

```text
/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   ├── CNAME
│   └── nexus-mark.svg
├── next.config.ts
├── package.json
└── README.md
```

---

## ローカルでの確認方法

```bash
git clone https://github.com/Kojki/nexus_website.git
cd nexus_website
npm install
npm run dev
```

ブラウザで以下を開きます。

```text
http://localhost:3000
```

---

## 本番用ビルド

```bash
npm run build
```

GitHub Pages 用に静的ファイルとして出力されます。

---

## デプロイ

本サイトは GitHub Pages で公開します。

独自ドメインは以下を使用します。

```text
nexus-connect.jp
```

ドメイン設定用の `CNAME` は `public/CNAME` に配置しています。

---

## コントリビューション

本リポジトリは外部からの Pull Request およびコントリビューションを受け付けていません。

---

## ライセンス

© 2026 Kojki. All Rights Reserved.

本リポジトリのコード・デザイン・テキストコンテンツの無断転載・複製・改変・再配布を禁じます。
