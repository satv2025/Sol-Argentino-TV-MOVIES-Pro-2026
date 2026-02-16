import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set<string>([
  "https://satvplus.com.ar",
  "http://localhost:5173",
  "http://localhost:5500",
]);

function corsHeaders(origin: string | null) {
  const o = origin ?? "";
  const allowOrigin = ALLOWED_ORIGINS.has(o) ? o : "https://satvplus.com.ar"; // fallback seguro
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = {
    "Content-Type": "application/json",
    ...corsHeaders(origin),
  };

  // ✅ Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers, status: 204 });
  }

  // Respuesta neutra siempre (anti-enumeración)
  const ok = new Response(JSON.stringify({ ok: true }), { headers, status: 200 });

  try {
    if (req.method !== "POST") return ok;

    const { username, new_email, origin: bodyOrigin } = await req.json();
    if (!username || !new_email || !bodyOrigin) return ok;

    const SB_URL = Deno.env.get("SB_URL");
    const SB_SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY");
    if (!SB_URL || !SB_SERVICE_ROLE_KEY) return ok;

    const admin = createClient(SB_URL, SB_SERVICE_ROLE_KEY);

    const uname = String(username).toLowerCase().trim();
    const newEmail = String(new_email).toLowerCase().trim();

    // 1) Buscar UUID por username
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("username", uname)
      .maybeSingle();

    if (!profile?.id) return ok;
    const uid = String(profile.id);

    // 2) Email real desde auth.users
    const { data: userRes } = await admin.auth.admin.getUserById(uid);
    const currentEmail = userRes?.user?.email;
    if (!currentEmail) return ok;

    // 3) Redirect a tu front (usa el origin del body)
    // Importante: validamos origin contra allowlist para evitar open redirect
    const safeOrigin = ALLOWED_ORIGINS.has(String(bodyOrigin)) ? String(bodyOrigin) : "https://satvplus.com.ar";

    const redirectTo =
      `${safeOrigin}/emailchange-approve.html?uid=${encodeURIComponent(uid)}&new=${encodeURIComponent(newEmail)}`;

    await admin.auth.admin.generateLink({
      type: "magiclink",
      email: currentEmail,
      options: { redirectTo },
    });

    return ok;
  } catch (_e) {
    return ok;
  }
});