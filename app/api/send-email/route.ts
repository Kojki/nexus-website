import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "必須項目（to, subject, body）が不足しています" },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      // ドメイン未認証時は以下のように onboarding@resend.dev を使用します
      // ドメイン認証後は "Nexus 運営チーム <info@yourdomain.com>" のように自由に変更可能です
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
