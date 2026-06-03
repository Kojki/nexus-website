import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://nexus-connect.jp",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORSプリフライトリクエストに対応
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    // パブリックなRLSをバイパスし、安全に集計と登録を行うためにサービスロールキーを使用します
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const turnstileSecretKey = Deno.env.get("TURNSTILE_SECRET_KEY") ?? "";

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { name, organization, email, category, content, turnstileToken } = await req.json();

    // 1. Cloudflare Turnstileトークンの認証チェック
    if (turnstileSecretKey) {
      const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(turnstileSecretKey)}&response=${encodeURIComponent(turnstileToken ?? "")}`,
      });
      const turnstileData = await turnstileRes.json();
      if (!turnstileData.success) {
        return new Response(JSON.stringify({ error: "ボットの可能性があるため、送信がブロックされました。" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // 2. クライアントIPアドレスの取得
    const clientIp = req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || "unknown-ip";

    // 3. 送信制限チェック：過去24時間以内に同じIPから3回以上送信されている場合はブロック
    if (clientIp !== "unknown-ip") {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count, error: countError } = await supabaseAdmin
        .from("inquiries")
        .select("*", { count: "exact", head: true })
        .eq("ip_address", clientIp)
        .gte("created_at", twentyFourHoursAgo);

      if (countError) throw countError;

      if (count !== null && count >= 3) {
        return new Response(JSON.stringify({ error: "本日はこれ以上申請できません。明日再度お試しください。" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 429,
        });
      }
    }

    // 4. データベースへの安全な書き込み (IPアドレス付き)
    const dbPayload = {
      name,
      organization,
      email,
      category,
      content,
      ip_address: clientIp,
    };

    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from("inquiries")
      .insert([dbPayload])
      .select()
      .single();

    if (insertError) throw insertError;

    // 5. 運営のSlackへのリアルタイム通知のトリガー
    try {
      await supabaseAdmin.functions.invoke("contact-slack", {
        body: dbPayload,
      });
    } catch (slackError) {
      console.error("Slack通知の送信に失敗しました:", slackError);
    }

    return new Response(JSON.stringify({ success: true, data: insertedData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
