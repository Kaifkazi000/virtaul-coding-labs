import { supabase, supabaseAdmin } from "../config/supabase.js";

/**
 * TEACHER: Get submitted and not-submitted students for a practical
 * GET /api/teacher-dashboard/practical/:practicalId/students
 */
export const getPracticalStudents = async (req, res) => {
  try {
    const { practicalId } = req.params; // Master Practical ID
    const { allotmentId } = req.query;  // Allotment ID (passed from teacher frontend)

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

    // 1. Get allotment and master practical to verify ownership
    const { data: allotment, error: allotError } = await supabaseAdmin
      .from("allotments")
      .select("*, subjects:master_subjects(*)")
      .eq("id", allotmentId)
      .single();

    if (allotError || !allotment) {
      return res.status(404).json({ error: "Allotment not found" });
    }

    if (allotment.teacher_id !== teacherId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { data: practical, error: prError } = await supabaseAdmin
      .from("master_practicals")
      .select("*")
      .eq("id", practicalId)
      .single();

    if (prError || !practical) {
      return res.status(404).json({ error: "Master Practical not found" });
    }

    // 2. Get all students in this specific batch and semester
    const { data: allStudents, error: studentsError } = await supabaseAdmin
      .from("students")
      .select("id, full_name, prn, roll_no, email")
      .eq("semester", allotment.semester)
      .eq("batch_name", allotment.batch_name);

    if (studentsError) throw studentsError;

    // 3. Get all submissions for this practical FROM THIS BATCH
    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from("submissions")
      .select(`
        id,
        student_id,
        code,
        execution_status,
        submitted_at,
        similarity_score,
        flagged
      `)
      .eq("practical_id", practicalId)
      // Joined check for batch/sem of student
      .in("student_id", (allStudents || []).map(s => s.id));

    if (submissionsError) throw submissionsError;

    const submissionMap = new Map();
    submissions.forEach((sub) => {
      submissionMap.set(sub.student_id, sub);
    });

    const submitted = [];
    const not_submitted = [];

    allStudents.forEach((student) => {
      const submission = submissionMap.get(student.id);
      if (submission) {
        submitted.push({
          ...student,
          ...submission,
          submission_id: submission.id
        });
      } else {
        not_submitted.push(student);
      }
    });

    res.json({
      practical,
      allotment,
      submitted: submitted.sort((a, b) => (a.roll_no || 0) - (b.roll_no || 0)),
      not_submitted: not_submitted.sort((a, b) => (a.roll_no || 0) - (b.roll_no || 0)),
      stats: {
        total: allStudents.length,
        submitted: submitted.length,
        not_submitted: not_submitted.length
      }
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * TEACHER: Get student submission details
 * GET /api/teacher-dashboard/submission/:submissionId
 */
export const getStudentSubmissionDetail = async (req, res) => {
  try {
    const { submissionId } = req.params;

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

    // 1. Get submission with student and practical context
    const { data: submission, error: subError } = await supabaseAdmin
      .from("submissions")
      .select(`
        *,
        students:student_id (*),
        practicals:practical_id!master_practicals (*)
      `)
      .eq("id", submissionId)
      .single();

    if (subError || !submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // 2. Verify teacher owns an allotment for this subject and the student's batch
    const { data: allotment, error: allotError } = await supabaseAdmin
      .from("allotments")
      .select("*")
      .eq("teacher_id", teacherId)
      .eq("subject_id", submission.practicals.subject_id)
      .eq("batch_name", submission.students.batch_name)
      .eq("semester", submission.students.semester)
      .single();

    if (allotError || !allotment) {
      return res.status(403).json({ error: "You don't have access to this student's submission" });
    }

    res.json({
      submission,
      student: submission.students,
      practical: submission.practicals,
      allotment
    });
  } catch (err) {
    console.error("Submission Detail Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * TEACHER: Get all practicals with submission stats for a subject instance
 * GET /api/teacher-dashboard/subject-instance/:subjectInstanceId/practicals
 */
export const getSubjectInstancePracticals = async (req, res) => {
  try {
    const { subjectInstanceId } = req.params; // This is now the allotmentId from subject_allotments

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
      .select(`
        id,
        semester,
        batch_name,
        teacher_id,
        subject_id,
        subjects:master_subjects (
          id,
          name,
          course_code
        )
      `)
      .eq("id", subjectInstanceId)
      .single();

    if (allotError || !allotment) {
      return res.status(404).json({ error: "Subject allotment not found" });
    }

    if (allotment.teacher_id !== teacherId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    // 2. Get master practicals for this subject
    const { data: masterPracticals, error: prError } = await supabaseAdmin
      .from("master_practicals")
      .select("*")
      .eq("master_subject_id", allotment.subject_id)
      .order("pr_no");

    if (prError) throw prError;

    // 3. Get total students in this batch + semester
    const { count: totalStudents } = await supabaseAdmin
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("semester", allotment.semester)
      .eq("batch_name", allotment.batch_name);

    // 4. Get submission stats for these practicals in this batch
    // We join submissions with students to filter by batch
    const practicalsWithStats = await Promise.all(
      (masterPracticals || []).map(async (mp) => {
        const { count: submittedCount } = await supabaseAdmin
          .from("submissions")
          .select("id, student_id, students!inner(*)", { count: "exact", head: true })
          .eq("practical_id", mp.id)
          .eq("students.semester", allotment.semester)
          .eq("students.batch_name", allotment.batch_name);

        const { count: flaggedCount } = await supabaseAdmin
          .from("submissions")
          .select("id, student_id, students!inner(*)", { count: "exact", head: true })
          .eq("practical_id", mp.id)
          .eq("flagged", true)
          .eq("students.semester", allotment.semester)
          .eq("students.batch_name", allotment.batch_name);

        return {
          id: mp.id,
          pr_no: mp.pr_no,
          title: mp.title,
          is_unlocked: true, // For now, handle unlocking separately if needed
          total_students: totalStudents || 0,
          submitted_count: submittedCount || 0,
          not_submitted_count: (totalStudents || 0) - (submittedCount || 0),
          flagged_count: flaggedCount || 0,
          submission_rate: totalStudents > 0
            ? ((submittedCount / totalStudents) * 100).toFixed(2)
            : "0.00"
        };
      })
    );

    res.json({
      subject_instance: {
        id: allotment.id,
        subject_name: allotment.subjects.name,
        semester: allotment.semester,
        batch_name: allotment.batch_name
      },
      practicals: practicalsWithStats
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * TEACHER: Get progress of all students in a batch for all practicals
 * GET /api/teacher-dashboard/allotment/:allotmentId/batch-progress
 */
export const getBatchProgress = async (req, res) => {
  try {
    const { allotmentId } = req.params;

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

    // 1. Verify allotment
    const { data: allotment, error: allotError } = await supabaseAdmin
      .from("allotments")
      .select("*, subjects:master_subjects(*)")
      .eq("id", allotmentId)
      .single();

    if (allotError || !allotment) {
      return res.status(404).json({ error: "Allotment not found" });
    }

    if (allotment.teacher_id !== teacherId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // 2. Get all students in this batch
    const { data: students, error: studentsError } = await supabaseAdmin
      .from("students")
      .select("id, full_name, prn, roll_no")
      .eq("semester", allotment.semester)
      .eq("batch_name", allotment.batch_name)
      .order("roll_no");

    if (studentsError) throw studentsError;

    // 3. Get all practicals for this subject
    const { data: practicals, error: prError } = await supabaseAdmin
      .from("master_practicals")
      .select("id, pr_no, title")
      .eq("master_subject_id", allotment.subject_id)
      .order("pr_no");

    if (prError) throw prError;

    // 4. Get all submissions for these students and these practicals
    const studentIds = (students || []).map(s => s.id);
    const practicalIds = (practicals || []).map(p => p.id);

    const { data: submissions, error: subError } = await supabaseAdmin
      .from("submissions")
      .select("student_id, practical_id, execution_status")
      .in("student_id", studentIds)
      .in("practical_id", practicalIds);

    if (subError) throw subError;

    // 5. Format data
    const progress = (students || []).map(student => {
      const studentSubmissions = (submissions || []).filter(s => s.student_id === student.id);
      return {
        id: student.id,
        name: student.full_name,
        prn: student.prn,
        roll: student.roll_no,
        submitted_count: studentSubmissions.length,
        total_practicals: practicals.length,
        submissions: (practicals || []).map(p => {
          const sub = studentSubmissions.find(s => s.practical_id === p.id);
          return {
            practical_id: p.id,
            pr_no: p.pr_no,
            status: sub ? (sub.execution_status || "submitted") : "pending"
          };
        })
      };
    });

    res.json({
      allotment,
      practicals,
      students: progress
    });
  } catch (err) {
    console.error("Batch Progress Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
