import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set<string>([
  "https://satvplus.com.ar",
  "https://www.satvplus.com.ar",
  "http://localhost:5173",
  "http://localhost:5500",
]);

function corsHeaders(origin: string | null) {
  const o = origin ?? "";
  const allowOrigin = ALLOWED_ORIGINS.has(o) ? o : "https://satvplus.com.ar";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  // ✅ Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  const headers = { "Content-Type": "application/json", ...cors };
  const ok = new Response(JSON.stringify({ ok: true }), { status: 200, headers });

  try {
    if (req.method !== "POST") return ok;

    const body = await req.json().catch(() => null);
    if (!body) return ok;

    const { username, password, new_email, origin: bodyOrigin } = body;
    if (!username || !password || !new_email || !bodyOrigin) return ok;

    const SB_URL = Deno.env.get("SB_URL");
    const SB_SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY");
    const SB_ANON_KEY = Deno.env.get("SB_ANON_KEY");
    if (!SB_URL || !SB_SERVICE_ROLE_KEY || !SB_ANON_KEY) return ok;

    const safeOrigin = ALLOWED_ORIGINS.has(String(bodyOrigin))
      ? String(bodyOrigin)
      : "https://satvplus.com.ar";

    const admin = createClient(SB_URL, SB_SERVICE_ROLE_KEY);

    const uname = String(username).toLowerCase().trim();
    const newEmail = String(new_email).toLowerCase().trim();
    const pw = String(password);

    // 1) Resolver email actual por username (profiles)
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("username", uname)
      .maybeSingle();

    if (!profile?.id) return ok;

    const { data: userRes } = await admin.auth.admin.getUserById(String(profile.id));
    const currentEmail = userRes?.user?.email;
    if (!currentEmail) return ok;

    // 2) Login con password (esto NO manda magic link)
    const client = createClient(SB_URL, SB_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
      email: String(currentEmail).toLowerCase(),
      password: pw,
    });

    // neutro: si falla, no revelamos nada
    if (signInErr || !signInData?.session) return ok;

    // 3) Disparar el mail "Change email address"
    await client.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: `${safeOrigin}/login.html` }
    );

    return ok;
  } catch {
    return ok;
  }
});