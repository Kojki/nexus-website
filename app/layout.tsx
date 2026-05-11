import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata } from "next";
import { DM_Serif_Display, Noto_Serif_JP, Outfit } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display"
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body"
});

const notoSerifJp = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
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
    type: "website"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${dmSerif.variable} ${outfit.variable} ${notoSerifJp.variable}`}
      >
        {children}
      </body>
      <GoogleAnalytics gaId="G-E20DPF436Y" />
    </html>
  );
}
