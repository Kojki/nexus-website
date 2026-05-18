// Setup type definitions for Deno
import "@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, organization, email, category, content } = await req.json();
    const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");

    if (!slackWebhookUrl) {
      throw new Error("Slack Webhook URL is not configured.");
    }

    const payload = {
      text: `📩 *【新規お問い合わせ】* \n----------------------------------------\n*カテゴリ:* ${category}\n*お名前:* ${name}\n*所属/組織:* ${organization || "未入力"}\n*返信用アドレス:* ${email}\n*本文:*\n${content}\n----------------------------------------\n⚡️ _Nexus Connect Edge Function_`
    };

    await fetch(slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
