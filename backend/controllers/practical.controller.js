import { supabase } from "../config/supabase.js";

/**
 * TEACHER: Add practical
 */
export const addPractical = async (req, res) => {
  try {
    const {
      subject_id,
      pr_no,
      title,
      description,
      task,
      sample_code,
      theory,
      language,
    } = req.body;

    // get teacher from token
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

    const { error } = await supabase.from("practicals").insert([
      {
        subject_id,
        pr_no,
        title,
        description,
        task,
        sample_code,
        theory,
        language,
        created_by: teacherId,
      },
    ]);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: "Practical added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * TEACHER: Get own practicals for a subject
 */
export const getTeacherPracticalsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const { data, error } = await supabase
      .from("practicals")
      .select("*")
      .eq("subject_id", subjectId)
      .order("pr_no");

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * STUDENT: Get practical list for a subject
 */
export const getStudentPracticalsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const { data, error } = await supabase
      .from("practicals")
      .select("id, pr_no, title")
      .eq("subject_id", subjectId)
      .eq("is_active", true)
      .order("pr_no");

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * STUDENT: Get single practical detail
 */
export const getPracticalDetail = async (req, res) => {
  try {
    const { practicalId } = req.params;

    const { data, error } = await supabase
      .from("practicals")
      .select(
        "id, pr_no, title, description, task, sample_code, theory, language"
      )
      .eq("id", practicalId)
      .single();

    if (error) {
      return res.status(404).json({ error: "Practical not found" });
    }

    res.json(data);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};
