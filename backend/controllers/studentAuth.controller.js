import { supabase, supabaseAdmin } from "../config/supabase.js";

// ================= STUDENT SIGNUP (DISABLED - HOD MANUAL ONLY) =================
export const studentSignup = async (req, res) => {
  return res.status(403).json({
    message: "Public signup is disabled. Please contact your HOD for registration.",
  });
};

// ================= STUDENT LOGIN =================
export const studentLogin = async (req, res) => {
  try {
    const { email, identifier, password } = req.body;
    const loginIdentifier = identifier || email;

    console.log(`[Auth] Login Attempt for identifier: ${loginIdentifier}`);

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        message: "Email/PRN and password are required",
      });
    }

    let targetEmail = loginIdentifier;

    // If identifier is a PRN (doesn't contain @), resolve it to an email
    if (!loginIdentifier.includes("@")) {
      console.log(`[Auth] Resolving PRN: ${loginIdentifier}`);
      const { data: student, error: studentError } = await supabaseAdmin
        .from("students")
        .select("email")
        .eq("prn", String(loginIdentifier)) // Ensure string
        .single();

      if (studentError || !student) {
        console.error(`[Auth] PRN Lookup Failed for ${loginIdentifier}:`, studentError?.message);
        return res.status(401).json({
          message: "Student with this PRN not found in registry",
        });
      }
      targetEmail = student.email;
      console.log(`[Auth] PRN ${loginIdentifier} resolved to ${targetEmail}`);
    }

    console.log(`[Auth] Final Auth Email: ${targetEmail}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password,
    });

    if (error) {
      console.error(`[Auth] Supabase Auth Error for ${targetEmail}:`, error.message);
      return res.status(401).json({
        message: error.message,
      });
    }

    console.log(`[Auth] Success for ${targetEmail}`);
    return res.status(200).json({
      message: "Login successful",
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error("[Auth] Login Crash:", err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getCurrentStudent = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const { data, error } = await supabaseAdmin
      .from("students")
      .select("full_name, email, prn, department, semester")
      .eq("auth_user_id", userData.user.id)
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

