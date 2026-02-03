import { supabase, supabaseAdmin } from "../config/supabase.js";

export const  = async (req, res) => {
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
 * TEACHER: Get own practicals for a subject instance
 */
export const getTeacherPracticalsBySubject = async (req, res) => {
               try {
                              const { subjectInstanceId } = req.params;

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

                              // Verify teacher owns this subject instance
                              const { data: subjectInstance, error: subjectError } = await supabaseAdmin
                                             .from("subject_instances")
                                             .select("id, teacher_id")
                                             .eq("id", subjectInstanceId)
                                             .single();

                              if (subjectError || !subjectInstance) {
                                             return res.status(404).json({ error: "Subject instance not found" });
                              }

                              if (subjectInstance.teacher_id !== teacherId) {
                                             return res.status(403).json({ error: "Unauthorized: Not your subject instance" });
                              }

                              const { data, error } = await supabaseAdmin
                                             .from("practicals")
                                             .select("*")
                                             .eq("subject_instance_id", subjectInstanceId)
                                             .order("pr_no");

                              if (error) {
                                             console.error(`❌ Failed to fetch practicals for subject ${subjectInstanceId}:`, error);
                                             return res.status(400).json({ error: error.message });
                              }

                              console.log(`✅ Fetched ${data?.length || 0} practicals for subject_instance ${subjectInstanceId}`);

                              // Prevent caching
                              res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
                              res.setHeader("Pragma", "no-cache");
                              res.setHeader("Expires", "0");

                              res.json(data || []);
               } catch (err) {
                              console.error(err);
                              res.status(500).json({ error: "Server error" });
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
                              const { subjectInstanceId } = req.params;

                              const { data, error } = await supabaseAdmin
                                             .from("practicals")
                                             .select("id, pr_no, title, is_unlocked")
                                             .eq("subject_instance_id", subjectInstanceId)
                                             .order("pr_no");

                              if (error) return res.status(400).json({ error: error.message });

                              res.json(data);
               } catch (err) {
                              console.error(err);
                              res.status(500).json({ error: "Server error" });
               }
};

/**
 * STUDENT: Get single practical detail
 */
export const getPracticalDetail = async (req, res) => {
               try {
                              const { practicalId } = req.params;

                              const { data, error } = await supabaseAdmin
                                             .from("practicals")
                                             .select(
                                                            "id, pr_no, title, description, task, sample_code, theory, language, is_unlocked"
                                             )
                                             .eq("id", practicalId)
                                             .eq("is_unlocked", true)
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