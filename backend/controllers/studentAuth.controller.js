import { supabase, supabaseAdmin } from "../config/supabase.js";

// ================= STUDENT SIGNUP =================
export const studentSignup = async (req, res) => {
  try {
    const { name, email, password, prn, roll, semester } = req.body;

    if (!name || !email || !password || !prn || !roll || !semester) {
      return res.status(400).json({
        message: "All fields are required (including semester)",
      });
    }

    const sem = Number(semester);
    if (isNaN(sem) || sem < 1 || sem > 12) {
      return res.status(400).json({
        message: "Semester must be a number between 1 and 12",
      });
    }

    // 1️⃣ Create user using ADMIN API (important)
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return res.status(400).json({
        message: authError.message,
      });
    }

    // 2️⃣ Insert student profile into studentss table using ADMIN client
    const { error: dbError } = await supabaseAdmin
      .from("studentss")
      .insert([
        {
          auth_user_id: authData.user.id,
          name: name,
          email: email,
          prn: prn,
          roll: roll,
          semester: Number(semester),
          department: "CSE",
          college_name: "Government College of Engineering, Chandrapur",
        },
      ]);

    if (dbError) {
      return res.status(500).json({
        message: dbError.message,
      });
    }

    return res.status(201).json({
      message: "Student signup successful",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
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
      .from("studentss")
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

