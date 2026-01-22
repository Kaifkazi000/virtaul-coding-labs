import { supabase, supabaseAdmin } from "../config/supabase.js";

/**
 * TEACHER: Get submitted and not-submitted students for a practical
 * GET /api/teacher-dashboard/practical/:practicalId/students
 */
export const getPracticalStudents = async (req, res) => {
  try {
    const { practicalId } = req.params;

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

    // Verify teacher owns the practical's subject instance
    const { data: practical, error: practicalError } = await supabaseAdmin
      .from("practicals")
      .select(
        `
        id,
        pr_no,
        title,
        subject_instance_id,
        subject_instances!inner (
          id,
          teacher_id,
          subject_name,
          semester
        )
      `
      )
      .eq("id", practicalId)
      .single();

    if (practicalError || !practical) {
      return res.status(404).json({ error: "Practical not found" });
    }

    if (practical.subject_instances.teacher_id !== teacherId) {
      return res.status(403).json({
        error: "You don't have access to this practical",
      });
    }

    // Get all students enrolled in this subject instance (by semester)
    const rawSemester = practical.subject_instances?.semester ?? practical.subject_instances?.[0]?.semester;
    const semester = Math.abs(rawSemester || 1);

    console.log(`[DEBUG] Practical: ${practical.title}, Raw Semester: ${rawSemester}, Final Semester: ${semester}`);

    // 🚀 FIXED: use supabaseAdmin for the student query to bypass user session limits
    const { data: allStudents, error: studentsError } = await supabaseAdmin
      .from("studentss")
      .select("id, name, prn, roll, email")
      .eq("semester", semester);

    if (studentsError) {
      return res.status(400).json({ error: studentsError.message });
    }

    // Get all submissions for this practical
    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from("submissions")
      .select(
        `
        id,
        student_id,
        code,
        execution_status,
        execution_output,
        execution_error,
        execution_time_ms,
        submitted_at,
        studentss!inner (
          id,
          name,
          prn,
          roll,
          email
        )
      `
      )
      .eq("practical_id", practicalId);

    if (submissionsError) {
      return res.status(400).json({ error: submissionsError.message });
    }

    // Create a map of student_id -> submission
    const submissionMap = new Map();
    submissions.forEach((sub) => {
      submissionMap.set(sub.student_id, sub);
    });

    // Separate into submitted and not-submitted
    const submitted = [];
    const not_submitted = [];

    allStudents.forEach((student) => {
      const submission = submissionMap.get(student.id);
      if (submission) {
        submitted.push({
          student_id: student.id,
          name: student.name,
          prn: student.prn,
          roll: student.roll,
          email: student.email,
          execution_status: submission.execution_status,
          execution_time_ms: submission.execution_time_ms,
          submitted_at: submission.submitted_at,
          submission_id: submission.id,
        });
      } else {
        not_submitted.push({
          student_id: student.id,
          name: student.name,
          prn: student.prn,
          roll: student.roll,
          email: student.email,
        });
      }
    });

    const responseData = {
      practical: {
        id: practical.id,
        pr_no: practical.pr_no,
        title: practical.title,
        subject_name: (practical.subject_instances?.subject_name) || (practical.subject_instances?.[0]?.subject_name),
        semester: semester,
      },
      submitted: submitted.sort((a, b) => a.name.localeCompare(b.name)),
      not_submitted: not_submitted.sort((a, b) => a.name.localeCompare(b.name)),
      stats: {
        total_students: allStudents.length,
        submitted_count: submitted.length,
        not_submitted_count: not_submitted.length,
        submission_rate: allStudents.length > 0
          ? ((submitted.length / allStudents.length) * 100).toFixed(2)
          : 0,
      },
    };

    console.log(`[DEBUG] getPracticalStudents success for PR-${practical.pr_no}. Total Students: ${allStudents.length}`);

    // Prevent caching
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.json(responseData);
  } catch (err) {
    console.error("Error fetching practical students:", err);
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

    // Get submission with all related data using ADMIN client
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from("submissions")
      .select(
        `
        *,
        studentss!inner (
          id,
          name,
          prn,
          roll,
          email,
          semester
        ),
        practicals!inner (
          id,
          pr_no,
          title,
          language,
          subject_instance_id,
          subject_instances!inner (
            id,
            teacher_id
          )
        )
      `
      )
      .eq("id", submissionId)
      .single();

    if (submissionError || !submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Verify teacher owns this submission's subject instance
    if (submission.practicals.subject_instances.teacher_id !== teacherId) {
      return res.status(403).json({
        error: "You don't have access to this submission",
      });
    }

    res.json({
      submission: {
        id: submission.id,
        code: submission.code,
        language: submission.language,
        execution_status: submission.execution_status,
        execution_output: submission.execution_output,
        execution_error: submission.execution_error,
        execution_time_ms: submission.execution_time_ms,
        memory_used_kb: submission.memory_used_kb,
        submitted_at: submission.submitted_at,
        updated_at: submission.updated_at,
      },
      student: {
        id: submission.studentss.id,
        name: submission.studentss.name,
        prn: submission.studentss.prn,
        roll: submission.studentss.roll,
        email: submission.studentss.email,
        semester: submission.studentss.semester,
      },
      practical: {
        id: submission.practicals.id,
        pr_no: submission.practicals.pr_no,
        title: submission.practicals.title,
        language: submission.practicals.language,
      },
    });
  } catch (err) {
    console.error("Error fetching submission detail:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * TEACHER: Get all practicals with submission stats for a subject instance
 * GET /api/teacher-dashboard/subject-instance/:subjectInstanceId/practicals
 */
export const getSubjectInstancePracticals = async (req, res) => {
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
    const { data: subjectInstance, error: instanceError } = await supabaseAdmin
      .from("subject_instances")
      .select("id, subject_name, semester, teacher_id")
      .eq("id", subjectInstanceId)
      .single();

    if (instanceError || !subjectInstance) {
      return res.status(404).json({ error: "Subject instance not found" });
    }

    if (subjectInstance.teacher_id !== teacherId) {
      return res.status(403).json({
        error: "You don't have access to this subject instance",
      });
    }

    // Get all practicals
    const { data: practicals, error: practicalsError } = await supabaseAdmin
      .from("practicals")
      .select("id, pr_no, title, is_enabled")
      .eq("subject_instance_id", subjectInstanceId)
      .order("pr_no");

    if (practicalsError) {
      return res.status(400).json({ error: practicalsError.message });
    }

    // Get total students in this semester
    const semesterForStats = Math.abs(subjectInstance.semester || 1);
    const { count: totalStudents } = await supabaseAdmin
      .from("studentss")
      .select("*", { count: "exact", head: true })
      .eq("semester", semesterForStats);

    console.log(`[DEBUG] getSubjectInstancePracticals success for instance ${subjectInstanceId}. Semester: ${semesterForStats}, Total Students: ${totalStudents}`);

    // Get submission counts for each practical
    const practicalsWithStats = await Promise.all(
      practicals.map(async (practical) => {
        const { count: submittedCount } = await supabaseAdmin
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("practical_id", practical.id)
          .eq("execution_status", "success");

        return {
          ...practical,
          total_students: totalStudents || 0,
          submitted_count: submittedCount || 0,
          not_submitted_count: (totalStudents || 0) - (submittedCount || 0),
          submission_rate:
            totalStudents > 0
              ? ((submittedCount / totalStudents) * 100).toFixed(2)
              : "0.00",
        };
      })
    );

    res.json({
      subject_instance: {
        id: subjectInstance.id,
        subject_name: subjectInstance.subject_name,
        semester: subjectInstance.semester,
      },
      practicals: practicalsWithStats,
    });
  } catch (err) {
    console.error("Error fetching practicals with stats:", err);
    res.status(500).json({ error: "Server error" });
  }
};
