import { supabase } from "../config/supabase.js";

/**
 * TEACHER: ADD SUBJECT
 */
export const addSubject = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    // get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const token = authHeader.replace("Bearer ", "");

    // get logged-in teacher
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const teacherId = userData.user.id;

    // insert subject
    const { error } = await supabase.from("subjects").insert([
      {
        name,
        code,
        description,
        created_by: teacherId,
      },
    ]);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: "Subject added successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * TEACHER: GET OWN SUBJECTS
 */
export const getTeacherSubjects = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const teacherId = userData.user.id;

    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("created_by", teacherId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * STUDENT: GET ALL ACTIVE SUBJECTS
 */
export const getStudentSubjects = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("subjects")
      .select("id, name, code, description")
      .eq("is_active", true);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
