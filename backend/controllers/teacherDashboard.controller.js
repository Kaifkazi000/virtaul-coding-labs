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
      .from("subject_allotments")
      .select("*, master_subjects(*)")
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
      .from("studentss")
      .select("id, name, prn, roll, email")
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
      submitted: submitted.sort((a, b) => a.roll?.localeCompare(b.roll)),
      not_submitted: not_submitted.sort((a, b) => a.roll?.localeCompare(b.roll)),
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
        studentss:student_id (*),
        master_practicals:practical_id (*)
      `)
      .eq("id", submissionId)
      .single();

    if (subError || !submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // 2. Verify teacher owns an allotment for this subject and the student's batch
    const { data: allotment, error: allotError } = await supabaseAdmin
      .from("subject_allotments")
      .select("*")
      .eq("teacher_id", teacherId)
      .eq("master_subject_id", submission.master_practicals.master_subject_id)
      .eq("batch_name", submission.studentss.batch_name)
      .eq("semester", submission.studentss.semester)
      .single();

    if (allotError || !allotment) {
      return res.status(403).json({ error: "You don't have access to this student's submission" });
    }

    res.json({
      submission,
      student: submission.studentss,
      practical: submission.master_practicals,
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
      .from("subject_allotments")
      .select(`
        id,
        semester,
        batch_name,
        teacher_id,
        master_subject_id,
        master_subjects (
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
      .eq("master_subject_id", allotment.master_subject_id)
      .order("pr_no");

    if (prError) throw prError;

    // 3. Get total students in this batch + semester
    const { count: totalStudents } = await supabaseAdmin
      .from("studentss")
      .select("*", { count: "exact", head: true })
      .eq("semester", allotment.semester)
      .eq("batch_name", allotment.batch_name);

    // 4. Get submission stats for these practicals in this batch
    // We join submissions with students to filter by batch
    const practicalsWithStats = await Promise.all(
      (masterPracticals || []).map(async (mp) => {
        const { count: submittedCount } = await supabaseAdmin
          .from("submissions")
          .select("id, student_id, studentss!inner(*)", { count: "exact", head: true })
          .eq("practical_id", mp.id)
          .eq("studentss.semester", allotment.semester)
          .eq("studentss.batch_name", allotment.batch_name);

        const { count: flaggedCount } = await supabaseAdmin
          .from("submissions")
          .select("id, student_id, studentss!inner(*)", { count: "exact", head: true })
          .eq("practical_id", mp.id)
          .eq("flagged", true)
          .eq("studentss.semester", allotment.semester)
          .eq("studentss.batch_name", allotment.batch_name);

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
        subject_name: allotment.master_subjects.name,
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
