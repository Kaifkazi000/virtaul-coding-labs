import { supabase, supabaseAdmin } from "../config/supabase.js";

console.log("🔥 LOADED subject.controller.js 🔥");

/**
 * ================================
 * TEACHER: ADD SUBJECT
 * ================================
 */
export const addSubject = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        message: "Name and code are required",
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const teacherId = userData.user.id;

    const { data, error } = await supabaseAdmin
      .from("subjects")
      .insert({
        name,
        code,
        description,
        is_active: true,
        created_by: teacherId,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(201).json({
      subject: data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * ================================
 * TEACHER: GET OWN SUBJECTS
 * ================================
 */
export const getTeacherSubjects = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const teacherId = userData.user.id;

    const { data, error } = await supabaseAdmin
      .from("subjects")
      .select("*")
      .eq("created_by", teacherId);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * ================================
 * STUDENT: GET ALL ACTIVE SUBJECTS
 * ================================
 */
export const getStudentSubjects = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("subjects")
      .select("id, name, code, description")
      .eq("is_active", true);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * ================================
 * TEACHER: GET SUBJECT BY ID
 * ================================
 */
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const teacherId = userData.user.id;

    const { data, error } = await supabaseAdmin
      .from("subjects")
      .select("*")
      .eq("id", id)
      .eq("created_by", teacherId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
