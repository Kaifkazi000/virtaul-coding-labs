import { supabase, supabaseAdmin } from "../config/supabase.js";

/**
 * HOD: Get students for promotion/management
 */
export const getStudents = async (req, res) => {
               try {
                              const { semester, batch } = req.query;
                              let query = supabaseAdmin
                                             .from("students")
                                             .select("*")
                                             .order("roll", { ascending: true });

                              if (semester) query = query.eq("semester", Number(semester));
                              if (batch) query = query.eq("batch_name", batch);

                              const { data, error } = await query;
                              if (error) throw error;
                              res.json(data);
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Get all master subjects
 */
export const getMasterSubjects = async (req, res) => {
               try {
                              const { data, error } = await supabaseAdmin
                                             .from("master_subjects")
                                             .select("*")
                                             .order("created_at", { ascending: false });

                              if (error) throw error;
                              res.json(data);
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Get all teachers for allotment dropdown
 */
export const getAllTeachers = async (req, res) => {
               try {
                              const { data: teachers, error } = await supabaseAdmin
                                             .from("teachers")
                                             .select("auth_user_id, name, email, department")
                                             .eq("role", "Faculty");

                              if (error) throw error;
                              res.json(teachers);
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Create a Master Subject
 */
export const createMasterSubject = async (req, res) => {
               try {
                              const { name, course_code, department } = req.body;
                              const { data, error } = await supabaseAdmin
                                             .from("master_subjects")
                                             .insert([{ name, course_code, department }])
                                             .select()
                                             .single();

                              if (error) throw error;
                              res.status(201).json(data);
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Allot Subject to Teacher
 */
export const allotSubject = async (req, res) => {
               try {
                              const { master_subject_id, teacher_id, semester, batch_name, academic_year } = req.body;

                              const { data, error } = await supabaseAdmin
                                             .from("subject_allotments")
                                             .insert([{
                                                            master_subject_id,
                                                            teacher_id,
                                                            semester,
                                                            batch_name,
                                                            academic_year
                                             }])
                                             .select()
                                             .single();

                              if (error) throw error;
                              res.status(201).json(data);
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Manual Student Registration
 */
export const manualRegisterStudent = async (req, res) => {
               try {
                              const { name, email, prn, roll, semester, batch_name, academic_year } = req.body;

                              // 1. Create Auth User
                              const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                                             email,
                                             password: prn, // Default password is PRN
                                             email_confirm: true
                              });

                              if (authError) throw authError;

                              // 2. Create Student Profile
                              const { error: profileError } = await supabaseAdmin
                                             .from("students")
                                             .insert([{
                                                            auth_user_id: authUser.user.id,
                                                            name,
                                                            email,
                                                            prn,
                                                            roll,
                                                            semester,
                                                            batch_name,
                                                            academic_year,
                                                            department: 'CSE'
                                             }]);

                              if (profileError) throw profileError;

                              res.status(201).json({ message: "Student registered successfully", studentId: authUser.user.id });
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Bulk Student Registration
 */
export const bulkRegisterStudents = async (req, res) => {
               try {
                              const { students } = req.body; // Array of student objects

                              const results = [];
                              for (const student of students) {
                                             try {
                                                            const { name, email, prn, roll, semester, batch_name, academic_year } = student;

                                                            // 1. Create Auth User
                                                            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                                                                           email,
                                                                           password: prn,
                                                                           email_confirm: true
                                                            });

                                                            if (authError) throw authError;

                                                            // 2. Create Student Profile
                                                            const { error: profileError } = await supabaseAdmin
                                                                           .from("students")
                                                                           .insert([{
                                                                                          auth_user_id: authUser.user.id,
                                                                                          name,
                                                                                          email,
                                                                                          prn,
                                                                                          roll,
                                                                                          semester: Number(semester),
                                                                                          batch_name,
                                                                                          academic_year: Number(academic_year),
                                                                                          department: 'CSE'
                                                                           }]);

                                                            if (profileError) throw profileError;
                                                            results.push({ email, status: "success" });
                                             } catch (err) {
                                                            results.push({ email: student.email, status: "error", message: err.message });
                                             }
                              }

                              res.json({ message: "Bulk registration complete", results });
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Promote Batch
 */
export const promoteBatch = async (req, res) => {
               try {
                              const { current_semester, batch_name, exclude_student_ids = [] } = req.body;

                              // Update students who are NOT in the exclude list
                              const { data, error } = await supabaseAdmin
                                             .from("students")
                                             .update({ semester: current_semester + 1 })
                                             .eq("semester", current_semester)
                                             .eq("batch_name", batch_name)
                                             .not("id", "in", `(${exclude_student_ids.join(",")})`);

                              if (error) throw error;
                              res.json({ message: `Batch ${batch_name} promoted to Semester ${current_semester + 1}` });
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};
/**
 * HOD: Create Master Practical Template
 */
export const createMasterPractical = async (req, res) => {
               try {
                              const { master_subject_id, pr_no, title, description, task, theory, sample_code, language } = req.body;

                              const { data, error } = await supabaseAdmin
                                             .from("master_practicals")
                                             .insert([{
                                                            master_subject_id,
                                                            pr_no: Number(pr_no),
                                                            title,
                                                            description,
                                                            task,
                                                            theory,
                                                            sample_code,
                                                            language
                                             }])
                                             .select()
                                             .single();

                              if (error) throw error;
                              res.status(201).json(data);
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Get Master Practicals for a subject
 */
export const getMasterPracticals = async (req, res) => {
               try {
                              const { subjectId } = req.params;
                              const { data, error } = await supabaseAdmin
                                             .from("master_practicals")
                                             .select("*")
                                             .eq("master_subject_id", subjectId)
                                             .order("pr_no", { ascending: true });

                              if (error) throw error;
                              res.json(data);
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Get Dashboard Stats
 */
export const getStats = async (req, res) => {
               try {
                              const { count: studentCount } = await supabaseAdmin
                                             .from("students")
                                             .select("*", { count: "exact", head: true });

                              const { count: teacherCount } = await supabaseAdmin
                                             .from("teachers")
                                             .select("*", { count: "exact", head: true })
                                             .eq("role", "Faculty");

                              const { count: subjectCount } = await supabaseAdmin
                                             .from("master_subjects")
                                             .select("*", { count: "exact", head: true });

                              const { count: allotmentCount } = await supabaseAdmin
                                             .from("subject_allotments")
                                             .select("*", { count: "exact", head: true });

                              res.json({
                                             totalStudents: studentCount || 0,
                                             totalTeachers: teacherCount || 0,
                                             totalSubjects: subjectCount || 0,
                                             totalAllotments: allotmentCount || 0
                              });
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Delete Master Subject
 */
export const deleteMasterSubject = async (req, res) => {
               try {
                              const { id } = req.params;
                              const { error } = await supabaseAdmin
                                             .from("master_subjects")
                                             .delete()
                                             .eq("id", id);

                              if (error) throw error;
                              res.json({ message: "Master subject deleted successfully" });
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Delete Student
 */
export const deleteStudent = async (req, res) => {
               try {
                              const { id } = req.params;
                              // 1. Get auth_user_id first to delete from Supabase Auth
                              const { data: student, error: fetchError } = await supabaseAdmin
                                             .from("students")
                                             .select("auth_user_id")
                                             .eq("id", id)
                                             .single();

                              if (fetchError) throw fetchError;

                              // 2. Delete Profile
                              const { error: profileError } = await supabaseAdmin
                                             .from("students")
                                             .delete()
                                             .eq("id", id);
                              if (profileError) throw profileError;

                              // 3. Delete Auth User
                              const { error: authError } = await supabase.auth.admin.deleteUser(student.auth_user_id);
                              if (authError) console.error("Auth Delete Warning:", authError.message);

                              res.json({ message: "Student deleted successfully" });
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Delete Master Practical
 */
export const deleteMasterPractical = async (req, res) => {
               try {
                              const { id } = req.params;
                              const { error } = await supabaseAdmin
                                             .from("master_practicals")
                                             .delete()
                                             .eq("id", id);

                              if (error) throw error;
                              res.json({ message: "Practical template deleted successfully" });
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Get All Subject Allotments
 */
export const getSubjectAllotments = async (req, res) => {
               try {
                              const { data, error } = await supabaseAdmin
                                             .from("subject_allotments")
                                             .select(`
                                                            *,
                                                            master_subjects (name, course_code),
                                                            teachers (name, email)
                                             `)
                                             .order("created_at", { ascending: false });

                              if (error) throw error;
                              res.json(data);
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};
