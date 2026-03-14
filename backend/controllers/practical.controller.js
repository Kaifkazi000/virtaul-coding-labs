import { supabase, supabaseAdmin } from "../config/supabase.js";

export const addPractical = async (req, res) => {
               try {
                               // 🚫 Master Practicals are managed by HOD. Standalone creation removed.
                               return res.status(403).json({ error: "Practicals must be added to the Master Repository by HOD." });
               } catch (err) {
                               console.error(err);
                               res.status(500).json({ error: "Server error" });
               }
};

/**
 * TEACHER: Get own practicals for an allotment (Batch)
 */
export const getTeacherPracticalsBySubject = async (req, res) => {
               try {
                              const { subjectInstanceId } = req.params; // This is the allotmentId

                              const authHeader = req.headers.authorization;
                              if (!authHeader) {
                                             return res.status(401).json({ error: "Authorization token missing" });
                              }

                              const token = authHeader.replace("Bearer ", "");
                              const { data: userData, error: authError } = await supabase.auth.getUser(token);

                              if (authError || !userData.user) {
                                             return res.status(401).json({ error: "Invalid token" });
                              }

                              const teacherId = userData.user.id;

                              // 1. Verify allotment ownership
                              const { data: allotment, error: allotError } = await supabaseAdmin
                                             .from("allotments")
                                             .select("id, teacher_id, subject_id")
                                             .eq("id", subjectInstanceId)
                                             .single();

                              if (allotError || !allotment) {
                                             return res.status(404).json({ error: "Allotment not found" });
                              }

                              if (allotment.teacher_id !== teacherId) {
                                             return res.status(403).json({ error: "Unauthorized access" });
                              }

                              // 2. Get master practicals
                              const { data: masterPracticals, error: prError } = await supabaseAdmin
                                             .from("master_practicals")
                                             .select("*")
                                             .eq("master_subject_id", allotment.subject_id)
                                             .order("pr_no");

                              if (prError) throw prError;

                              // 3. Get unlock status for this allotment
                              const { data: statuses, error: statusError } = await supabaseAdmin
                                             .from("allotment_practical_status")
                                             .select("*")
                                             .eq("allotment_id", subjectInstanceId);

                              if (statusError) throw statusError;

                              const statusMap = new Map();
                              statuses?.forEach(s => statusMap.set(s.master_practical_id, s.is_unlocked));

                              // 4. Merge
                              const mergedData = (masterPracticals || []).map(mp => ({
                                             ...mp,
                                             is_unlocked: statusMap.get(mp.id) || false
                              }));

                              res.json(mergedData);
               } catch (err) {
                              console.error("Fetch Practicals Error:", err);
                              res.status(500).json({ error: err.message });
               }
};

/**
 * TEACHER: Unlock practical for all students
 * PATCH /api/practicals/:practicalId/unlock
 */
export const togglePracticalUnlock = async (req, res) => {
               try {
                              const { practicalId } = req.params;
                              const { unlocked, allotmentId } = req.body; // true or false

                              const authHeader = req.headers.authorization;
                              if (!authHeader) {
                                             return res.status(401).json({ error: "Authorization token missing" });
                              }

                              const token = authHeader.replace("Bearer ", "");
                              const { data: userData, error: authError } = await supabase.auth.getUser(token);

                              if (authError || !userData.user) {
                                             return res.status(401).json({ error: "Invalid token" });
                              }

                              // Upsert into allotment_practical_status
                              const { error: upsertError } = await supabaseAdmin
                                             .from("allotment_practical_status")
                                             .upsert({
                                                            allotment_id: allotmentId,
                                                            master_practical_id: practicalId,
                                                            is_unlocked: unlocked === true,
                                                            updated_at: new Date().toISOString()
                                             }, {
                                                            onConflict: "allotment_id, master_practical_id"
                                             });

                              if (upsertError) {
                                             return res.status(400).json({ error: upsertError.message });
                              }

                              res.json({
                                             message: `Practical ${unlocked ? "unlocked" : "locked"} successfully`,
                                             is_unlocked: unlocked
                              });
               } catch (err) {
                              console.error(err);
                              res.status(500).json({ error: "Server error" });
               }
};

export const getStudentPracticalsBySubjectInstance = async (req, res) => {
               try {
                              const { subjectInstanceId } = req.params; // Allotment ID

                              const authHeader = req.headers.authorization;
                              if (!authHeader) return res.status(401).json({ error: "Authorization token missing" });

                              const token = authHeader.replace("Bearer ", "");
                              const { data: userData, error: authError } = await supabase.auth.getUser(token);
                              if (authError || !userData.user) return res.status(401).json({ error: "Invalid token" });

                              const studentIdStr = userData.user.id; // auth_user_id

                              const { data: student } = await supabaseAdmin.from("students").select("id, semester, batch_name").eq("auth_user_id", studentIdStr).single();
                              if (!student) return res.status(404).json({ error: "Student not found" });

                              const { data: allotment } = await supabaseAdmin
                                             .from("allotments")
                                             .select(`
                                                            *,
                                                            subjects:master_subjects(*)
                                             `)
                                             .eq("id", subjectInstanceId)
                                             .single();

                              if (!allotment) return res.status(404).json({ error: "No matching enrollment found" });

                              const { data: masterPracticals } = await supabaseAdmin.from("master_practicals").select("*").eq("master_subject_id", allotment.subject_id).order("pr_no");

                              const [unlockStatuses, submissions] = await Promise.all([
                                             supabaseAdmin.from("allotment_practical_status").select("*").eq("allotment_id", allotment.id),
                                             supabaseAdmin.from("submissions").select("*").eq("student_id", student.id)
                              ]);

                              const unlockMap = new Map();
                              unlockStatuses.data?.forEach(s => unlockMap.set(s.master_practical_id, s.is_unlocked));

                              const submissionMap = new Map();
                              submissions.data?.forEach(s => submissionMap.set(s.practical_id, s));

                              const merged = (masterPracticals || []).map(mp => ({
                                             ...mp,
                                             is_unlocked: unlockMap.get(mp.id) || false,
                                             submission: submissionMap.get(mp.id) || null
                                             // Note: master_practicals should have description, task, theory etc.
                              }));

                              res.json(merged);
               } catch (err) {
                              console.error("Student Fetch Error:", err);
                              res.status(500).json({ error: err.message });
               }
};

/**
 * STUDENT: Get single practical detail
 */
export const getPracticalDetail = async (req, res) => {
               try {
                              const { practicalId } = req.params;

                              const { data, error } = await supabaseAdmin
                                             .from("master_practicals")
                                             .select("*")
                                             .eq("id", practicalId)
                                             .single();

                              if (error) {
                                             return res.status(404).json({ error: "Practical not found" });
                              }

                              res.json(data);
               } catch (err) {
                              console.error(err);
                              res.status(500).json({ error: "Server error" });
               }
};

/**
 * TEACHER: Mark submission as checked
 */
export const checkSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    const { data: submission, error: subError } = await supabaseAdmin
      .from("submissions")
      .update({
        status: "checked",
        score: score || 10,
        teacher_feedback: feedback || "Checked",
        checked_at: new Date().toISOString()
      })
      .eq("id", submissionId)
      .select()
      .single();

    if (subError) throw subError;
    res.json({ message: "Submission marked as checked", submission });
  } catch (err) {
    console.error("[CheckSubmission] Error:", err);
    res.status(500).json({ error: "Server error marking submission checked" });
  }
};

/**
 * STUDENT: Get notifications for checked practicals
 */
export const getStudentNotifications = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Authorization token missing" });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) return res.status(401).json({ error: "Invalid token" });
    const { data: student } = await supabaseAdmin.from("students").select("id").eq("auth_user_id", userData.user.id).single();
    if (!student) return res.status(404).json({ error: "Student profile not found" });

    const { data: submissions, error: subError } = await supabaseAdmin.from("submissions")
      .select("id, checked_at, practical_id")
      .eq("student_id", student.id)
      .eq("status", "checked")
      .order("checked_at", { ascending: false })
      .limit(10);

    if (subError) throw subError;
    if (!submissions || submissions.length === 0) return res.json([]);

    const prIds = [...new Set(submissions.map(s => s.practical_id))];
    const { data: practicals, error: prError } = await supabaseAdmin.from("master_practicals").select("id, title").in("id", prIds);
    if (prError) throw prError;

    const prMap = new Map();
    practicals?.forEach(p => prMap.set(p.id, p));

    const merged = submissions.map(s => ({
      ...s,
      master_practicals: prMap.get(s.practical_id) || { title: "Practical" }
    }));
    res.json(merged);
  } catch (err) {
    console.error("[Notifications] Merge Error:", err);
    res.status(500).json({ error: "Server error fetching notifications" });
  }
};