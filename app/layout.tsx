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
  title: "Nexus - 文系理系が専門について話し合う場所",
  description:
    "Nexus は、異なる専門を持つ学生が本気で話し合うオンラインコミュニティです。",
  metadataBase: new URL("https://nexus-connect.jp"),
  openGraph: {
    title: "Nexus - 専門の壁を、対話で越える。",
    description:
      "専門が違うから、対話に意味がある。学生のための越境コミュニティ。",
    url: "https://nexus-connect.jp",
    siteName: "Nexus",
    locale: "ja_JP",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${dmSerif.variable} ${outfit.variable} ${notoSerifJp.variable}`}>
        {children}
      </body>
    </html>
  );
}
