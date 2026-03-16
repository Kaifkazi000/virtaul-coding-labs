import { supabase, supabaseAdmin } from "../config/supabase.js";

export const verifyHOD = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];

    // 1. Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("[Auth] Token verification failed:", authError?.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // 2. Check if user is HOD in the database
    const { data: hod, error: hodError } = await supabaseAdmin
      .from("hods")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (hodError || !hod) {
      console.error("[Auth] HOD profile check failed:", hodError?.message);
      return res.status(403).json({ message: "Access denied: HOD profile not found" });
    }

    // Attach HOD info to request
    req.user = {
      ...user,
      hod_id: hod.id,
      department: hod.department,
      role: 'hod'
    };

    next();
  } catch (err) {
    console.error("[Auth] Middleware Crash:", err.message);
    return res.status(500).json({ message: "Internal server error during authentication" });
  }
};
