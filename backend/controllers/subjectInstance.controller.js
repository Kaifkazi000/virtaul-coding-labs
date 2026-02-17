import { supabase, supabaseAdmin } from "../config/supabase.js";

/**
 * TEACHER: Create subject instance
 */
export const createSubjectInstance = async (req, res) => {
  try {
    const { subject_name, subject_code, semester } = req.body;

    const sem = Number(semester);
    if (isNaN(sem) || sem < 1 || sem > 12) {
      return res.status(400).json({ error: "Semester must be a number between 1 and 12" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Authorization token missing" });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error } = await supabase.auth.getUser(token);

    if (error || !userData.user)
      return res.status(401).json({ error: "Invalid token" });

    const teacherId = userData.user.id;

    const { data, insertError } = await supabaseAdmin
      .from("subject_instances")
      .insert([
        {
          subject_name,
          subject_code,
          semester,
          teacher_id: teacherId,
        },
      ])
      .select()
      .single();

    if (insertError)
      return res.status(400).json({ error: insertError.message });

    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * TEACHER: Get own subject instances
 */
export const getTeacherSubjectInstances = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Authorization token missing" });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error } = await supabase.auth.getUser(token);

    if (error || !userData.user)
      return res.status(401).json({ error: "Invalid token" });

    const teacherId = userData.user.id;

    const { data, fetchError } = await supabaseAdmin
      .from("subject_allotments")
      .select(`
        id,
        semester,
        batch_name,
        academic_year,
        master_subjects (
          id,
          name,
          course_code
        )
      `)
      .eq("teacher_id", teacherId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (fetchError)
      return res.status(400).json({ error: fetchError.message });

    // Map to a format compatible with existing frontend
    const formattedData = (data || []).map(allot => ({
      id: allot.id,
      subject_name: allot.master_subjects.name,
      subject_code: allot.master_subjects.course_code,
      semester: allot.semester,
      batch_name: allot.batch_name,
      academic_year: allot.academic_year
    }));

    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * STUDENT: Auto-enrolled subject instances (by semester)
 */
export const getStudentSubjectInstances = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Authorization token missing" });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error } = await supabase.auth.getUser(token);

    if (error || !userData.user)
      return res.status(401).json({ error: "Invalid token" });

    const studentAuthId = userData.user.id;

    // 1. Get student profile with batch and semester
    const { data: student, error: studentError } = await supabaseAdmin
      .from("studentss")
      .select("semester, batch_name")
      .eq("auth_user_id", studentAuthId)
      .single();

    if (studentError || !student)
      return res.status(404).json({ error: "Student profile not found" });

    // 2. Fetch allotted subjects matching student's batch and semester
    const { data: allotments, error: fetchError } = await supabaseAdmin
      .from("subject_allotments")
      .select(`
        id,
        master_subject_id,
        batch_name,
        semester,
        academic_year,
        master_subjects (
          id,
          name,
          course_code
        )
      `)
      .eq("semester", student.semester)
      .eq("batch_name", student.batch_name)
      .eq("is_active", true);

    if (fetchError) {
      console.error("Error fetching subject allotments:", fetchError);
      return res.status(400).json({ error: fetchError.message });
    }

    // Map to a format compatible with existing frontend (using subject_instance style)
    const formattedData = (allotments || []).map(allot => ({
      id: allot.id, // Using allotment ID as instance ID
      subject_name: allot.master_subjects.name,
      subject_code: allot.master_subjects.course_code,
      semester: allot.semester,
      master_subject_id: allot.master_subject_id,
      batch_name: allot.batch_name
    }));

    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
