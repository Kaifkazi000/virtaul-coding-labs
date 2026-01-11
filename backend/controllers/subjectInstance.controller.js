import { supabase } from "../config/supabase.js";

/**
 * TEACHER: Create subject instance
 */
export const createSubjectInstance = async (req, res) => {
  try {
    const { subject_name, subject_code, semester } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Authorization token missing" });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error } = await supabase.auth.getUser(token);

    if (error || !userData.user)
      return res.status(401).json({ error: "Invalid token" });

    const teacherId = userData.user.id;

    const { data, insertError } = await supabase
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

    const { data, fetchError } = await supabase
      .from("subject_instances")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    if (fetchError)
      return res.status(400).json({ error: fetchError.message });

    res.json(data);
  } catch {
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

    // get student semester
    const { data: student, error: studentError } = await supabase
      .from("studentss")
      .select("semester")
      .eq("auth_user_id", studentAuthId)
      .single();

    if (studentError)
      return res.status(400).json({ error: "Student profile not found" });

    // Fetch subject instances matching student's semester
    // Note: If is_active is NULL, we treat it as active (backward compatibility)
    const { data, fetchError } = await supabase
      .from("subject_instances")
      .select("*")
      .eq("semester", student.semester)
      .or(`is_active.eq.true,is_active.is.null`);

    if (fetchError) {
      console.error("Error fetching subject instances:", fetchError);
      return res.status(400).json({ error: fetchError.message });
    }

    console.log(`Found ${data?.length || 0} subject instances for semester ${student.semester}`);
    
    res.json(data || []);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};
