import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://nexus-connect.jp",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORSのプリフライトリクエストに対応
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("Supabase側に RESEND_API_KEY が設定されていません。");
    }

    const { to, subject, body } = await req.json();

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Nexus <info@nexus-connect.jp>",
        to: [to],
        subject: subject,
        text: body,
      }),
    });

    const resData = await response.json();

    // 🔴 修正ポイント: 送信が成功している場合(200や201など)は、強制的に「200」を返してSupabaseのエラー判定を回避します！
    if (response.ok) {
      return new Response(JSON.stringify(resData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // 👈 ここを 200 に固定
      });
    }

    // 失敗した場合はそのままのエラーコードを返します
    return new Response(JSON.stringify(resData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: response.status,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

