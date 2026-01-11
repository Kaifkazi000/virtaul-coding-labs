import { supabase } from "../config/supabase.js";

/**
 * MOCK CODE EXECUTION
 * For now, we'll do basic validation
 * Later can integrate with actual code execution APIs (Judge0, Piston, etc.)
 */
const executeCode = async (code, language) => {
  // Mock execution - basic validation
  // In production, use Judge0, Piston API, or similar
  
  if (!code || code.trim().length === 0) {
    return {
      success: false,
      output: "Error: Empty code",
      error: "Code cannot be empty",
    };
  }

  // Basic syntax checks (mock)
  if (language === "Python") {
    // Check for basic Python syntax
    if (code.includes("print(") || code.includes("def ") || code.includes("import ")) {
      return {
        success: true,
        output: "Code executed successfully (mock)",
        error: null,
      };
    }
  } else if (language === "Java") {
    // Check for basic Java structure
    if (code.includes("public class") || code.includes("System.out.println")) {
      return {
        success: true,
        output: "Code executed successfully (mock)",
        error: null,
      };
    }
  } else if (language === "SQL") {
    // Check for SQL keywords
    if (code.toUpperCase().includes("SELECT") || code.toUpperCase().includes("INSERT")) {
      return {
        success: true,
        output: "Query executed successfully (mock)",
        error: null,
      };
    }
  }

  // Default: assume valid if code exists
  return {
    success: true,
    output: "Code executed successfully (mock)",
    error: null,
  };
};

/**
 * STUDENT: Execute code (before submission)
 * POST /api/submissions/execute
 */
export const executeCodeForPractical = async (req, res) => {
  try {
    const { code, language, practical_id } = req.body;

    if (!code || !language || !practical_id) {
      return res.status(400).json({
        error: "code, language, and practical_id are required",
      });
    }

    // Verify student is authenticated
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !userData.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const studentAuthId = userData.user.id;

    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from("studentss")
      .select("id")
      .eq("auth_user_id", studentAuthId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Verify practical exists and get subject_instance_id
    const { data: practical, error: practicalError } = await supabase
      .from("practicals")
      .select("id, subject_instance_id, language")
      .eq("id", practical_id)
      .single();

    if (practicalError || !practical) {
      return res.status(404).json({ error: "Practical not found" });
    }

    // Execute code
    const executionResult = await executeCode(code, language);

    res.json({
      execution_status: executionResult.success ? "success" : "failed",
      output: executionResult.output,
      error: executionResult.error,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * STUDENT: Submit code (after successful execution)
 * POST /api/submissions
 */
export const submitCode = async (req, res) => {
  try {
    const { code, language, practical_id, execution_status, output } = req.body;

    if (!code || !language || !practical_id || !execution_status) {
      return res.status(400).json({
        error: "code, language, practical_id, and execution_status are required",
      });
    }

    // Only allow submission if execution was successful
    if (execution_status !== "success") {
      return res.status(400).json({
        error: "Code must execute successfully before submission",
      });
    }

    // Verify student is authenticated
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !userData.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const studentAuthId = userData.user.id;

    // Get student record
    const { data: student, error: studentError } = await supabase
      .from("studentss")
      .select("id")
      .eq("auth_user_id", studentAuthId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Get practical details
    const { data: practical, error: practicalError } = await supabase
      .from("practicals")
      .select("id, subject_instance_id, pr_no")
      .eq("id", practical_id)
      .single();

    if (practicalError || !practical) {
      return res.status(404).json({ error: "Practical not found" });
    }

    // Check if submission already exists
    const { data: existingSubmission } = await supabase
      .from("submissions")
      .select("id")
      .eq("student_id", student.id)
      .eq("practical_id", practical_id)
      .single();

    let submissionData;

    if (existingSubmission) {
      // Update existing submission
      const { data, error: updateError } = await supabase
        .from("submissions")
        .update({
          code,
          language,
          execution_status,
          output: output || null,
          submission_status: "pending", // Reset to pending on resubmission
          submitted_at: new Date().toISOString(),
        })
        .eq("id", existingSubmission.id)
        .select()
        .single();

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      submissionData = data;
    } else {
      // Create new submission
      const { data, error: insertError } = await supabase
        .from("submissions")
        .insert([
          {
            student_id: student.id,
            subject_instance_id: practical.subject_instance_id,
            practical_id: practical_id,
            pr_no: practical.pr_no,
            code,
            language,
            execution_status,
            output: output || null,
            submission_status: "pending",
          },
        ])
        .select()
        .single();

      if (insertError) {
        return res.status(400).json({ error: insertError.message });
      }

      submissionData = data;
    }

    res.status(201).json({
      message: "Submission created successfully",
      submission: submissionData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * STUDENT: Get own submissions for a practical
 * GET /api/submissions/student/:practicalId
 */
export const getStudentSubmission = async (req, res) => {
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

    const studentAuthId = userData.user.id;

    // Get student record
    const { data: student, error: studentError } = await supabase
      .from("studentss")
      .select("id")
      .eq("auth_user_id", studentAuthId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Get submission
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("*")
      .eq("student_id", student.id)
      .eq("practical_id", practicalId)
      .single();

    if (submissionError) {
      // No submission found is okay
      return res.json({ submission: null });
    }

    res.json({ submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * TEACHER: Get all submissions for a subject instance
 * GET /api/submissions/teacher/:subjectInstanceId
 */
export const getTeacherSubmissions = async (req, res) => {
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
    const { data: subjectInstance, error: instanceError } = await supabase
      .from("subject_instances")
      .select("id")
      .eq("id", subjectInstanceId)
      .eq("teacher_id", teacherId)
      .single();

    if (instanceError || !subjectInstance) {
      return res.status(403).json({
        error: "You don't have access to this subject instance",
      });
    }

    // Get all submissions for this subject instance
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("*")
      .eq("subject_instance_id", subjectInstanceId)
      .order("submitted_at", { ascending: false });

    if (submissionsError) {
      return res.status(400).json({ error: submissionsError.message });
    }

    // Enrich submissions with student and practical data
    const enrichedSubmissions = await Promise.all(
      submissions.map(async (submission) => {
        const [studentResult, practicalResult] = await Promise.all([
          supabase
            .from("studentss")
            .select("id, name, prn, roll")
            .eq("id", submission.student_id)
            .single(),
          supabase
            .from("practicals")
            .select("id, pr_no, title")
            .eq("id", submission.practical_id)
            .single(),
        ]);

        return {
          ...submission,
          student: studentResult.data || null,
          practical: practicalResult.data || null,
        };
      })
    );

    res.json({ submissions: enrichedSubmissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * TEACHER: Approve or reject a submission
 * PATCH /api/submissions/:submissionId/review
 */
export const reviewSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { action, feedback } = req.body; // action: "approve" or "reject"

    if (!action || !["approve", "reject"].includes(action)) {
      return res.status(400).json({
        error: "action must be 'approve' or 'reject'",
      });
    }

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

    // Get submission
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (submissionError || !submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Verify teacher owns the subject instance
    const { data: subjectInstance, error: instanceError } = await supabase
      .from("subject_instances")
      .select("id, teacher_id")
      .eq("id", submission.subject_instance_id)
      .single();

    if (instanceError || !subjectInstance) {
      return res.status(404).json({ error: "Subject instance not found" });
    }

    if (subjectInstance.teacher_id !== teacherId) {
      return res.status(403).json({
        error: "You don't have permission to review this submission",
      });
    }

    // Update submission status
    const newStatus = action === "approve" ? "approved" : "rejected";
    const { data: updatedSubmission, error: updateError } = await supabase
      .from("submissions")
      .update({
        submission_status: newStatus,
        teacher_feedback: feedback || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: teacherId,
      })
      .eq("id", submissionId)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // If approved, unlock next practical for the student
    if (action === "approve") {
      // Get next practical number
      const nextPrNo = submission.pr_no + 1;

      // Check if next practical exists
      const { data: nextPractical } = await supabase
        .from("practicals")
        .select("id")
        .eq("subject_instance_id", submission.subject_instance_id)
        .eq("pr_no", nextPrNo)
        .single();

      // Note: We don't need to explicitly "unlock" - students can see all practicals
      // But we can track progress in a separate table if needed
      // For now, approval just marks the submission as approved
    }

    res.json({
      message: `Submission ${action}d successfully`,
      submission: updatedSubmission,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * STUDENT: Get progress for a subject instance
 * GET /api/submissions/student/progress/:subjectInstanceId
 */
export const getStudentProgress = async (req, res) => {
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

    const studentAuthId = userData.user.id;

    // Get student record
    const { data: student, error: studentError } = await supabase
      .from("studentss")
      .select("id")
      .eq("auth_user_id", studentAuthId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Get all submissions for this student in this subject instance
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("pr_no, submission_status, submitted_at")
      .eq("student_id", student.id)
      .eq("subject_instance_id", subjectInstanceId)
      .order("pr_no");

    if (submissionsError) {
      return res.status(400).json({ error: submissionsError.message });
    }

    // Calculate progress
    const approvedCount = submissions.filter(
      (s) => s.submission_status === "approved"
    ).length;
    const pendingCount = submissions.filter(
      (s) => s.submission_status === "pending"
    ).length;
    const rejectedCount = submissions.filter(
      (s) => s.submission_status === "rejected"
    ).length;

    res.json({
      total_submissions: submissions.length,
      approved: approvedCount,
      pending: pendingCount,
      rejected: rejectedCount,
      submissions: submissions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

