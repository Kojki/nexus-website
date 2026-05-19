
  if (!apiKey || !from) {
    return {
      ok: false,
      skipped: true,
      error: "RESEND_API_KEY or RESEND_FROM_EMAIL is not configured.",
    };
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
      reply_to: params.replyTo,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { ok: false, error: errorText };
  }

  return { ok: true };
}

async function notifySlack(payload: InquiryPayload): Promise<DeliveryResult> {
  const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");

  if (!slackWebhookUrl) {
    return { ok: false, skipped: true, error: "SLACK_WEBHOOK_URL is not configured." };
  }

  const response = await fetch(slackWebhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `📩 *【新規お問い合わせ】* \n----------------------------------------\n*カテゴリ:* ${payload.category}\n*お名前:* ${payload.name}\n*所属/組織:* ${payload.organization || "未入力"}\n*返信用アドレス:* ${payload.email}\n*本文:*\n${payload.content}\n----------------------------------------\n⚡️ _Nexus Connect Edge Function_`,
    }),
  });

  if (!response.ok) {
    return { ok: false, error: await response.text() };
  }

  return { ok: true };
}

async function sendApplicantEmail(payload: InquiryPayload): Promise<DeliveryResult> {
  const projectTitle = getProjectTitle(payload.content);
  const subject = isProjectApplication(payload)
    ? `【Nexus】${projectTitle} への参加申請を受け付けました`
    : "【Nexus】お問い合わせを受け付けました";
  const intro = isProjectApplication(payload)
    ? `プロジェクト「${projectTitle}」への参加申請を受け付けました。`
    : "お問い合わせを受け付けました。";
  const text = `${payload.name} 様

${intro}
運営メンバーが内容を確認し、追ってご連絡いたします。

---
お名前: ${payload.name}
所属・組織: ${payload.organization || "未入力"}
メールアドレス: ${payload.email}
カテゴリ: ${payload.category}

${payload.content}

Nexus Connect`;

  return sendResendEmail({
    to: payload.email,
    subject,
    text,
    html: `
      <p>${escapeHtml(payload.name)} 様</p>
      <p>${escapeHtml(intro)}<br />運営メンバーが内容を確認し、追ってご連絡いたします。</p>
      <hr />
      <p><strong>お名前:</strong> ${escapeHtml(payload.name)}<br />
      <strong>所属・組織:</strong> ${escapeHtml(payload.organization || "未入力")}<br />
      <strong>メールアドレス:</strong> ${escapeHtml(payload.email)}<br />
      <strong>カテゴリ:</strong> ${escapeHtml(payload.category)}</p>
      <pre style="white-space: pre-wrap; font-family: sans-serif;">${escapeHtml(payload.content)}</pre>
      <p>Nexus Connect</p>
    `,
  });
}

async function sendAdminEmail(payload: InquiryPayload): Promise<DeliveryResult> {
  const notificationEmail = Deno.env.get("APPLICATION_NOTIFY_EMAIL") || Deno.env.get("CONTACT_NOTIFY_EMAIL");

  if (!notificationEmail) {
    return { ok: false, skipped: true, error: "APPLICATION_NOTIFY_EMAIL or CONTACT_NOTIFY_EMAIL is not configured." };
  }

  const projectTitle = getProjectTitle(payload.content);
  const subject = isProjectApplication(payload)
    ? `【Nexus】新規プロジェクト参加申請: ${projectTitle}`
    : `【Nexus】新規お問い合わせ: ${payload.category}`;
  const text = `新しい送信がありました。

カテゴリ: ${payload.category}
お名前: ${payload.name}
所属・組織: ${payload.organization || "未入力"}
返信用アドレス: ${payload.email}

本文:
${payload.content}`;

  return sendResendEmail({
    to: notificationEmail.split(",").map((email) => email.trim()).filter(Boolean),
    subject,
    text,
    replyTo: payload.email,
    html: `
      <p>新しい送信がありました。</p>
      <p><strong>カテゴリ:</strong> ${escapeHtml(payload.category)}<br />
      <strong>お名前:</strong> ${escapeHtml(payload.name)}<br />
      <strong>所属・組織:</strong> ${escapeHtml(payload.organization || "未入力")}<br />
      <strong>返信用アドレス:</strong> ${escapeHtml(payload.email)}</p>
      <pre style="white-space: pre-wrap; font-family: sans-serif;">${escapeHtml(payload.content)}</pre>
    `,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json() as InquiryPayload;

    if (!payload.name || !payload.email || !payload.category || !payload.content) {
      return new Response(JSON.stringify({ error: "Missing required fields." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const [slack, applicantEmail, adminEmail] = await Promise.all([
      notifySlack(payload),
      sendApplicantEmail(payload),
      sendAdminEmail(payload),
    ]);

    return new Response(JSON.stringify({
      success: true,
      deliveries: {
        slack,
        applicantEmail,
        adminEmail,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});