import { supabase } from "../config/supabase.js";

// TEACHER: Add practical
export const addPractical = async (req, res) => {
  try {
    const {
      subject_instance_id,
      pr_no,
      title,
      description,
      task,
      sample_code,
      theory,
      language,
    } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Authorization token missing" });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error } = await supabase.auth.getUser(token);

    if (error || !userData.user)
      return res.status(401).json({ error: "Invalid token" });

    const teacherId = userData.user.id;

    const { error: insertError } = await supabase.from("practicals").insert([
      {
        subject_instance_id,
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

    if (insertError)
      return res.status(400).json({ error: insertError.message });

    res.status(201).json({ message: "Practical added successfully" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};
/**
 * TEACHER: Get own practicals for a subject instance
 */
export const getTeacherPracticalsBySubject = async (req, res) => {
  try {
    const { subjectInstanceId } = req.params;

    const { data, error } = await supabase
      .from("practicals")
      .select("*")
      .eq("subject_instance_id", subjectInstanceId)
      .order("pr_no");

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};


export const getStudentPracticalsBySubjectInstance = async (req, res) => {
  try {
    const { subjectInstanceId } = req.params;

    const { data, error } = await supabase
      .from("practicals")
      .select("id, pr_no, title")
      .eq("subject_instance_id", subjectInstanceId)
      .order("pr_no");

    if (error) return res.status(400).json({ error: error.message });

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
