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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      return res.status(401).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user: data.user,
      session: data.session,
    });
  } catch (err) {
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
      .select("name, email, prn, roll, department, semester")
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

