import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_JP, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display"
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body"
});

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-jp"
});

export const metadata: Metadata = {
  title: "Nexus - 共に学んで、もっと先へ。",
  description:
    "意欲あるすべての学生へ。専門性を掛け合わせる「共創の場」であり、進む道を探すための「観察の場」。Nexusは、意欲ある学生が交わるオンラインコミュニティです。",
  metadataBase: new URL("https://nexus-connect.jp"),
  openGraph: {
    title: "Nexus - 共に学んで、もっと先へ。",
    description:
      "やりたいことを極める人と、探す人が交わるコミュニティ。完全無料・日本全国から参加可能。",
    url: "https://nexus-connect.jp",
    siteName: "Nexus",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/ogp.png",
        width: 1200,
        height: 630,
        alt: "Nexus - 共に学んで、もっと先へ。",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${cormorant.variable} ${outfit.variable} ${notoSansJp.variable}`}
      >
        {children}
      </body>
      <GoogleAnalytics gaId="G-E20DPF436Y" />
    </html>
  );
}
