import { supabase, supabaseAdmin } from "../config/supabase.js";

/**
 * HOD: Manual Teacher Registration
 */
export const registerTeacher = async (req, res) => {
               try {
                              const { name, email, department, password } = req.body;

                              // 1. Create Auth User
                              const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                                             email,
                                             password: password || "Faculty@123", // Default password
                                             email_confirm: true
                              });

                              if (authError) throw authError;

                              // 2. Create Teacher Profile
                              const { error: profileError } = await supabaseAdmin
                                             .from("teachers")
                                             .insert([{
                                                            auth_user_id: authUser.user.id,
                                                            name,
                                                            email,
                                                            department,
                                                            role: "Faculty"
                                             }]);

                              if (profileError) throw profileError;

                              res.status(201).json({ message: "Teacher registered successfully", teacherId: authUser.user.id });
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Delete Teacher
 */
export const deleteTeacher = async (req, res) => {
               try {
                              const { id } = req.params; // teacher.id (from the table)

                              // 1. Get auth_user_id
                              const { data: teacher, error: fetchError } = await supabaseAdmin
                                             .from("teachers")
                                             .select("auth_user_id")
                                             .eq("id", id)
                                             .single();

                              if (fetchError) throw fetchError;

                              // 2. Delete Profile
                              const { error: profileError } = await supabaseAdmin
                                             .from("teachers")
                                             .delete()
                                             .eq("id", id);
                              if (profileError) throw profileError;

                              // 3. Delete Auth User
                              const { error: authError } = await supabase.auth.admin.deleteUser(teacher.auth_user_id);
                              if (authError) console.error("Auth Delete Warning:", authError.message);

                              res.json({ message: "Teacher deleted successfully" });
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Get students for promotion/management
 */


/**
 * HOD: Delete Allotment
 */
export const deleteAllotment = async (req, res) => {
	try {
		const { id } = req.params;
		const { error } = await supabaseAdmin
			.from("allotments")
			.delete()
			.eq("id", id);

		if (error) throw error;
		res.json({ message: "Allotment removed successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const getStudents = async (req, res) => {
	try {
		console.log("[DEBUG] getStudents called. Query params:", req.query);
		const { semester, batch } = req.query;
		let query = supabaseAdmin
			.from("students")
			.select("*")
			.order("roll_no", { ascending: true }); // Fixed roll -> roll_no

		if (semester) {
			console.log("[DEBUG] Filtering by semester:", semester);
			query = query.eq("semester", String(semester));
		}
		if (batch) query = query.eq("batch_name", batch);

		const { data, error } = await query;
		if (error) {
			console.error("[DEBUG] Students Fetch Error:", error.message);
			throw error;
		}
		console.log(`[DEBUG] Found ${data?.length || 0} students`);
		res.json(data);
	} catch (err) {
		console.error("[DEBUG] CRITICAL Error in getStudents:", err.message);
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
                              
                              // 1. Create Subject
                              const { data: subject, error: subjectError } = await supabaseAdmin
                                             .from("master_subjects")
                                             .insert([{ name, course_code, department: department || 'CSE' }])
                                             .select()
                                             .single();

                              if (subjectError) throw subjectError;

                              // 2. Initialize 10 Practicals
                              const practicalTemplates = Array.from({ length: 10 }, (_, i) => ({
                                             master_subject_id: subject.id,
                                             pr_no: i + 1,
                                             title: `Practical ${i + 1}`,
                                             description: "",
                                             task: "",
                                             theory: "",
                                             sample_code: "",
                                             language: "javascript"
                              }));

                              const { error: practicalError } = await supabaseAdmin
                                             .from("master_practicals")
                                             .insert(practicalTemplates);

                              if (practicalError) {
                                             console.error("Practical Initialization Error:", practicalError.message);
                              }

                              res.status(201).json(subject);
               } catch (err) {
                              console.error("Create Master Subject Error:", err.message);
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
                                             .from("allotments")
                                             .insert([{
                                                            subject_id: master_subject_id,
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

                               // 1. Create or Find Auth User
                               let targetUserId = null;
                               const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                                              email,
                                              password: prn, // Default password is PRN
                                              email_confirm: true,
                                              user_metadata: { role: 'student' }
                               });

                               if (authError) {
                                              if (authError.message.includes("already registered") || authError.status === 422 || authError.status === 400) {
                                                             const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
                                                             const existingUser = listData?.users?.find(u => u.email?.toLowerCase() === email?.toLowerCase());
                                                             if (existingUser) {
                                                                            targetUserId = existingUser.id;
                                                             } else {
                                                                            throw new Error(`Profile sync failed: ${authError.message}`);
                                                             }
                                              } else {
                                                             throw authError;
                                              }
                               } else {
                                              targetUserId = authUser.user.id;
                               }

                               // 2. Upsert Student Profile
                               const { data: newStudent, error: profileError } = await supabaseAdmin
                                              .from("students")
                                              .upsert([{
                                                             auth_user_id: targetUserId,
                                                             full_name: name,
                                                             email,
                                                             prn,
                                                             roll_no: roll || null,
                                                             semester: semester,
                                                             batch_name: batch_name,
                                                             admission_year: academic_year,
                                                             department: 'CSE',
                                                             status: 'active'
                                              }], { onConflict: 'prn' })
                                              .select()
                                              .single();

                               if (profileError) throw profileError;

                               res.status(201).json({ 
                                              message: "Student registered successfully", 
                                              student: newStudent 
                               });
               } catch (err) {
                               console.error("[ManualReg] Error:", err.message);
                               res.status(500).json({ error: err.message });
               }
};

/**
 * HOD: Bulk Student Registration with Dynamic Batching
 */
export const bulkRegisterStudents = async (req, res) => {
               try {
                              const { students } = req.body; // Array of student objects
                              if (!students || students.length === 0) {
                                             return res.status(400).json({ error: "No students provided" });
                              }

                              // Group students by admission_year and semester for batching
                              const groups = {};
                              students.forEach(s => {
                                             const year = s.admission_year || s.academic_year;
                                             const sem = s.semester;
                                             const key = `${year}_${sem}`;
                                             if (!groups[key]) groups[key] = [];
                                             groups[key].push(s);
                              });

                              const results = [];

                              // Process each group
                              for (const key in groups) {
                                             const groupStudents = groups[key];
                                             // Sort by name for deterministic batching
                                             groupStudents.sort((a, b) => (a.name || a.full_name || "").localeCompare(b.name || b.full_name || ""));

                                             const BATCH_SIZE = 30; // Standard batch size

                                             for (let i = 0; i < groupStudents.length; i++) {
                                                            const student = groupStudents[i];
                                                            const batchIndex = Math.floor(i / BATCH_SIZE);
                                                            const batchLetter = String.fromCharCode(65 + batchIndex); // A, B, C...

                                                            try {
                                                                           const { name, full_name, email, prn, roll, roll_no, semester, academic_year, admission_year } = student;
                                                                           const finalName = name || full_name;
                                                                           const finalEmail = email;
                                                                           const finalPRN = prn;
                                                                           const finalRoll = roll || roll_no;
                                                                           const finalSem = semester;
                                                                           const finalYear = Number(admission_year || academic_year);

                                                                           let targetUserId = null;
                                                                           console.log(`[BulkImport] Processing: ${finalEmail} (PRN: ${finalPRN})`);

                                                                           // 1. Create Auth User or fetch existing
                                                                           const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                                                                                          email: finalEmail,
                                                                                          password: finalPRN, // Default password is PRN
                                                                                          email_confirm: true,
                                                                                          user_metadata: { role: 'student' }
                                                                           });

                                                                           if (authError) {
                                                                                          if (authError.message.includes("already registered") || authError.status === 422 || authError.status === 400) {
                                                                                                         console.log(`[BulkImport] User ${finalEmail} exists in Auth. Fetching ID...`);
                                                                                                         const { data: userData, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
                                                                                                         // listUsers is sometimes more reliable than getUserByEmail in some Supabase versions
                                                                                                         const existingUser = userData?.users?.find(u => u.email?.toLowerCase() === finalEmail?.toLowerCase());

                                                                                                         if (existingUser) {
                                                                                                                        targetUserId = existingUser.id;
                                                                                                                        console.log(`[BulkImport] Linked to existing ID: ${targetUserId}`);
                                                                                                         } else {
                                                                                                                        console.error(`[BulkImport] User found in error but not in list for ${finalEmail}`);
                                                                                                                        throw new Error(`Profile sync failed for existing user: ${authError.message}`);
                                                                                                         }
                                                                                          } else {
                                                                                                         console.error(`[BulkImport] Auth Error for ${finalEmail}:`, authError.message);
                                                                                                         throw authError;
                                                                                          }
                                                                           } else {
                                                                                          targetUserId = authUser.user.id;
                                                                                          console.log(`[BulkImport] Created new user: ${targetUserId}`);
                                                                           }



                                                                           console.log(`[BulkImport] Upserting profile for ${finalEmail}...`);
                                                                           const { error: profileError } = await supabaseAdmin
                                                                                          .from("students")
                                                                                          .upsert([{
                                                                                                         auth_user_id: targetUserId,
                                                                                                         full_name: finalName,
                                                                                                         email: finalEmail,
                                                                                                         prn: finalPRN,
                                                                                                         roll_no: finalRoll,
                                                                                                         semester: finalSem,
                                                                                                         batch_name: batchLetter, // Assigned Batch
                                                                                                         admission_year: finalYear,
                                                                                                         department: 'CSE',
                                                                                                         status: 'active'
                                                                                          }], { onConflict: 'prn' });


                                                                           if (profileError) {
                                                                                          console.error(`[BulkImport] Database Error for ${finalEmail}:`, profileError.message);
                                                                                          throw profileError;
                                                                           }

                                                                           console.log(`[BulkImport] Successfully registered: ${finalEmail}`);
                                                                           results.push({ email: finalEmail, status: "success", batch: batchLetter });
                                                            } catch (err) {
                                                                           console.error(`[BulkImport] CRITICAL FAIL for ${student.email || 'unknown'}:`, err.message);
                                                                           results.push({ email: student.email, status: "error", message: err.message });
                                                            }
                                             }
                              }

                              const successCount = results.filter(r => r.status === "success").length;
                              const failedCount = results.filter(r => r.status === "error").length;
                              console.log(`[BulkImport] FINISHED: ${successCount} success, ${failedCount} fail.`);
                              res.json({ message: `Import finished: ${successCount} successful, ${failedCount} failed.`, results });

               } catch (err) {
                              console.error(`[BulkImport] Fatal Controller Error:`, err.message);
                              res.status(500).json({ error: err.message });
               }
};


/**
 * HOD: Promote Batch
 */
export const promoteBatch = async (req, res) => {
               try {
                              const { current_semester, batch_name, exclude_student_ids = [] } = req.body;

                              // 1. Identify graduates (Semester 8 students)
                              if (current_semester === 8) {
                                             const { data: graduates } = await supabaseAdmin
                                                            .from("students")
                                                            .select("*")
                                                            .eq("semester", 8)
                                                            .eq("batch_name", batch_name)
                                                            .not("id", "in", `(${exclude_student_ids.join(",")})`);

                                             if (graduates && graduates.length > 0) {
                                                            const alumniData = graduates.map(g => ({
                                                                           prn: g.prn,
                                                                           full_name: g.full_name,
                                                                           email: g.email,
                                                                           admission_year: g.admission_year,
                                                                           passout_year: new Date().getFullYear(),
                                                                           final_batch: g.batch_name,
                                                                           academic_history: { final_semester: 8 }
                                                            }));

                                                            const { error: alumniError } = await supabaseAdmin
                                                                           .from("alumni")
                                                                           .insert(alumniData);

                                                            if (alumniError) throw alumniError;

                                                            // Delete from active students
                                                            await supabaseAdmin
                                                                           .from("students")
                                                                           .delete()
                                                                           .in("id", graduates.map(g => g.id));
                                             }
                                             return res.json({ message: `Batch ${batch_name} graduated and moved to Alumni` });
                              }

                              // 2. Regular Promotion
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
                                             .update({
                                                            title,
                                                            description,
                                                            task,
                                                            theory,
                                                            sample_code,
                                                            language
                                             })
                                             .eq("master_subject_id", master_subject_id)
                                             .eq("pr_no", Number(pr_no))
                                             .select()
                                             .single();

                              if (error) throw error;
                              res.json(data);
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
                                             .from("allotments")
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
                                             .from("allotments")
                                             .select(`
                                                            *,
                                                            subjects:subject_id!master_subjects(name, course_code),
                                                            teachers (name, email)
                                             `)
                                             .order("created_at", { ascending: false });

                              if (error) throw error;
                              res.json(data);
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};
/**
 * HOD: Search Alumni by PRN
 */
export const searchAlumni = async (req, res) => {
               try {
                              const { prn } = req.query;
                              const { data, error } = await supabaseAdmin
                                             .from("alumni")
                                             .select("*")
                                             .eq("prn", prn)
                                             .maybeSingle();

                              if (error) throw error;
                              res.json(data);
               } catch (err) {
                              res.status(500).json({ error: err.message });
               }
};
