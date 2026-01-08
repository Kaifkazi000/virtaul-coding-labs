import { supabase } from "../config/supabase.js";

export const teacherLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 1️⃣ Authenticate teacher
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    // 2️⃣ Check teacher exists in teachers table
    const { data: teacher, error: teacherError } = await supabase
      .from("teachers")
      .select("name, email, department, role")
      .eq("auth_user_id", data.user.id)
      .single();

    if (teacherError || !teacher) {
      return res.status(403).json({
        message: "Access denied: Not a teacher",
      });
    }

    res.json({
      message: "Teacher login successful",
      teacher,
      session: data.session,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
