import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    // 🔑 実行時にのみ環境変数を取得し、存在チェックを行います
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "サーバーに RESEND_API_KEY が設定されていません。" },
        { status: 500 }
      );
    }

    // 📬 必要な時にだけ Resend を初期化します（ビルドエラーを回避）
    const resend = new Resend(apiKey);

    const { to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "必須項目（to, subject, body）が不足しています" },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: "Nexus <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      text: body,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Resend API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

