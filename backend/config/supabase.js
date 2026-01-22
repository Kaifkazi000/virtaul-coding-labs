import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

/* =====================================================
   FORCE .env LOAD (NO MORE RANDOM FAILURES)
===================================================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 IMPORTANT: always load backend/.env explicitly
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

/* =====================================================
   ENV VALIDATION (FAIL FAST)
===================================================== */
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("🔑 SUPABASE_URL:", supabaseUrl ? "LOADED" : "MISSING");
console.log(
  "🔑 SERVICE_ROLE_KEY:",
  serviceRoleKey?.startsWith("ey") ? "JWT PRESENT" : "INVALID"
);

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("❌ Supabase env variables are missing (.env not loaded)");
}

/* =====================================================
   SAFETY CHECK: ENSURE service_role KEY
===================================================== */
function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

const payload = decodeJwtPayload(serviceRoleKey);

if (payload?.role !== "service_role") {
  throw new Error(
    `❌ INVALID SUPABASE_SERVICE_ROLE_KEY.
Expected role: service_role
Got: ${payload?.role || "unknown"}

Fix: Supabase Dashboard → Settings → API → service_role key
DO NOT use anon key.`
  );
}

/* =====================================================
   1️⃣ GLOBAL SUPABASE CLIENT (SERVICE ROLE)
   (UNCHANGED LOGIC)
===================================================== */
export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/* =====================================================
   2️⃣ REQUEST-SCOPED CLIENT (OPTIONAL, SAFE)
===================================================== */
export const createUserSupabase = (userToken) => {
  if (!userToken) {
    throw new Error("User token is required");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
  });
};
