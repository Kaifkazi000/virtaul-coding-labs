import { supabase, supabaseAdmin } from "../config/supabase.js";

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

                              if (!subject_instance_id || !pr_no || !title || !language) {
                                             return res.status(400).json({ error: "Missing required fields" });
                              }

                              const authHeader = req.headers.authorization;
                              if (!authHeader) {
                                             return res.status(401).json({ error: "Authorization token missing" });
                              }

                              const token = authHeader.replace("Bearer ", "");

                              // 🔐 Validate teacher identity
                              const { data: userData, error } = await supabase.auth.getUser(token);
                              if (error || !userData?.user) {
                                             return res.status(401).json({ error: "Invalid token" });
                              }

                              const teacherId = userData.user.id;

                              // 🔎 Verify ownership using ADMIN client
                              const { data: subjectInstance } = await supabaseAdmin
                                             .from("subject_instances")
                                             .select("id, teacher_id")
                                             .eq("id", subject_instance_id)
                                             .single();

                              if (!subjectInstance) {
                                             return res.status(404).json({ error: "Subject instance not found" });
                              }

                              if (subjectInstance.teacher_id !== teacherId) {
                                             return res.status(403).json({ error: "Unauthorized" });
                              }

                              // 🚫 Prevent duplicate PR
                              const { data: existing } = await supabaseAdmin
                                             .from("practicals")
                                             .select("id")
                                             .eq("subject_instance_id", subject_instance_id)
                                             .eq("pr_no", pr_no)
                                             .maybeSingle();

                              if (existing) {
                                             return res.status(400).json({ error: `PR-${pr_no} already exists` });
                              }

                              // ✅ INSERT (SERVICE ROLE → NO RLS ISSUE)
                              const { data, error: insertError } = await supabaseAdmin
                                             .from("practicals")
                                             .insert([
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
                                                                           is_unlocked: false,
                                                                           is_enabled: pr_no === 1,
                                                                           enabled_at: pr_no === 1 ? new Date().toISOString() : null,
                                                                           enabled_by: pr_no === 1 ? teacherId : null,
                                                            },
                                             ])
                                             .select()
                                             .single();

                              if (insertError) {
                                             console.error("INSERT FAILED:", insertError);
                                             return res.status(400).json({ error: insertError.message });
                              }

                              res.status(201).json({
                                             message: "Practical added successfully",
                                             practical: data,
                              });
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
                                             .from("subject_allotments")
                                             .select("id, teacher_id, master_subject_id")
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
                                             .eq("master_subject_id", allotment.master_subject_id)
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
                              const { unlocked } = req.body; // true or false

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

                              // Get practical and verify teacher owns the subject instance
                              const { data: practical, error: practicalError } = await supabaseAdmin
                                             .from("practicals")
                                             .select("id, subject_instance_id")
                                             .eq("id", practicalId)
                                             .single();

                              if (practicalError || !practical) {
                                             return res.status(404).json({ error: "Practical not found" });
                              }

                              // Verify teacher owns the subject instance
                              const { data: subjectInstance, error: instanceError } = await supabaseAdmin
                                             .from("subject_instances")
                                             .select("id, teacher_id")
                                             .eq("id", practical.subject_instance_id)
                                             .single();

                              if (instanceError || !subjectInstance) {
                                             return res.status(404).json({ error: "Subject instance not found" });
                              }

                              if (subjectInstance.teacher_id !== teacherId) {
                                             return res.status(403).json({
                                                            error: "You don't have permission to modify this practical",
                                             });
                              }

                              // Update unlock status
                              const { data: updatedPractical, error: updateError } = await supabaseAdmin
                                             .from("practicals")
                                             .update({ is_unlocked: unlocked === true })
                                             .eq("id", practicalId)
                                             .select()
                                             .single();

                              if (updateError) {
                                             return res.status(400).json({ error: updateError.message });
                              }

                              res.json({
                                             message: `Practical ${unlocked ? "unlocked" : "locked"} successfully`,
                                             practical: updatedPractical,
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

                              const studentId = userData.user.id;

                              const { data: student } = await supabaseAdmin.from("studentss").select("id, semester, batch_name").eq("id", studentId).single();
                              if (!student) return res.status(404).json({ error: "Student not found" });

                              const { data: allotment } = await supabaseAdmin.from("subject_allotments").select("*, master_subjects(*)").eq("id", subjectInstanceId).single();
                              if (!allotment) return res.status(404).json({ error: "No matching enrollment found" });

                              const { data: masterPracticals } = await supabaseAdmin.from("master_practicals").select("*").eq("master_subject_id", allotment.master_subject_id).order("pr_no");

                              const [unlockStatuses, submissions] = await Promise.all([
                                             supabaseAdmin.from("allotment_practical_status").select("*").eq("allotment_id", allotment.id),
                                             supabaseAdmin.from("submissions").select("*").eq("student_id", studentId)
                              ]);

                              const unlockMap = new Map();
                              unlockStatuses.data?.forEach(s => unlockMap.set(s.master_practical_id, s.is_unlocked));

                              const submissionMap = new Map();
                              submissions.data?.forEach(s => submissionMap.set(s.practical_id, s));

                              const merged = (masterPracticals || []).map(mp => ({
                                             ...mp,
                                             is_unlocked: unlockMap.get(mp.id) || false,
                                             submission: submissionMap.get(mp.id) || null
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