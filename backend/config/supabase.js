import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config(); // VERY IMPORTANT

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase env variables are missing");
}

// Fail fast if someone accidentally put the ANON key instead of SERVICE ROLE key.
// RLS errors like: "new row violates row-level security policy" almost always mean this.
function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const payload = decodeJwtPayload(serviceRoleKey);
if (!payload?.role || payload.role !== "service_role") {
  throw new Error(
    `Invalid SUPABASE_SERVICE_ROLE_KEY: expected JWT with role "service_role", got "${payload?.role || "unknown"}". ` +
      `Fix: Supabase Dashboard → Settings → API → service_role key (NOT anon key).`
  );
}

export const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
