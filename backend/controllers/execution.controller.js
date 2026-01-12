import { supabase } from "../config/supabase.js";
import { executeCode } from "../services/codeExecutor.service.js";

/**
 * STUDENT: Execute code and auto-submit if successful
 * POST /api/execution/execute
 */
export const executeAndSubmit = async (req, res) => {
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
      .select("id, subject_instance_id, pr_no, language")
      .eq("id", practical_id)
      .single();

    if (practicalError || !practical) {
      return res.status(404).json({ error: "Practical not found" });
    }

    // Verify language matches
    if (practical.language !== language) {
      return res.status(400).json({
        error: `Language mismatch. This practical requires ${practical.language}`,
      });
    }

    // Execute code
    const executionResult = await executeCode(code, language);

    // Auto-submit if execution successful
    let submission = null;
    if (executionResult.execution_status === "success") {
      // Check if submission already exists
      const { data: existingSubmission } = await supabase
        .from("submissions")
        .select("id")
        .eq("student_id", student.id)
        .eq("practical_id", practical_id)
        .single();

      if (existingSubmission) {
        // Update existing submission
        const { data: updatedSubmission, error: updateError } = await supabase
          .from("submissions")
          .update({
            code,
            language,
            execution_status: executionResult.execution_status,
            execution_output: executionResult.output,
            execution_error: executionResult.error || null,
            execution_time_ms: executionResult.execution_time_ms,
            memory_used_kb: executionResult.memory_used_kb,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSubmission.id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating submission:", updateError);
        } else {
          submission = updatedSubmission;
        }
      } else {
        // Create new submission
        const { data: newSubmission, error: insertError } = await supabase
          .from("submissions")
          .insert([
            {
              student_id: student.id,
              subject_instance_id: practical.subject_instance_id,
              practical_id: practical_id,
              pr_no: practical.pr_no,
              code,
              language,
              execution_status: executionResult.execution_status,
              execution_output: executionResult.output,
              execution_error: executionResult.error || null,
              execution_time_ms: executionResult.execution_time_ms,
              memory_used_kb: executionResult.memory_used_kb,
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error("Error creating submission:", insertError);
        } else {
          submission = newSubmission;
        }
      }
    }

    // Return execution result with submission info
    res.json({
      execution_status: executionResult.execution_status,
      output: executionResult.output,
      error: executionResult.error,
      execution_time_ms: executionResult.execution_time_ms,
      memory_used_kb: executionResult.memory_used_kb,
      submitted: submission !== null,
      submission_id: submission?.id || null,
    });
  } catch (err) {
    console.error("Execution error:", err);
    res.status(500).json({ error: "Server error during execution" });
  }
};

/**
 * STUDENT: Check if practical is unlocked
 * GET /api/execution/unlock-status/:practicalId
 */
export const checkUnlockStatus = async (req, res) => {
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

    // Get practical
    const { data: practical, error: practicalError } = await supabase
      .from("practicals")
      .select("id, pr_no, is_enabled, subject_instance_id")
      .eq("id", practicalId)
      .single();

    if (practicalError || !practical) {
      return res.status(404).json({ error: "Practical not found" });
    }

    // Check unlock status
    let isUnlocked = false;
    let unlockReason = "";

    // PR-1 is always unlocked
    if (practical.pr_no === 1) {
      isUnlocked = true;
      unlockReason = "First practical";
    }
    // If teacher enabled it, always unlocked
    else if (practical.is_enabled) {
      isUnlocked = true;
      unlockReason = "Teacher enabled";
    }
    // Check if previous practical has successful submission
    else {
      const previousPrNo = practical.pr_no - 1;
      
      // Get previous practical
      const { data: previousPractical } = await supabase
        .from("practicals")
        .select("id")
        .eq("subject_instance_id", practical.subject_instance_id)
        .eq("pr_no", previousPrNo)
        .single();

      if (previousPractical) {
        // Check if student has successful submission for previous practical
        const { data: previousSubmission } = await supabase
          .from("submissions")
          .select("execution_status")
          .eq("student_id", student.id)
          .eq("practical_id", previousPractical.id)
          .single();

        if (previousSubmission?.execution_status === "success") {
          isUnlocked = true;
          unlockReason = "Previous practical completed";
        } else {
          unlockReason = "Complete previous practical first";
        }
      } else {
        unlockReason = "Previous practical not found";
      }
    }

    res.json({
      is_unlocked: isUnlocked,
      reason: unlockReason,
      pr_no: practical.pr_no,
      is_enabled: practical.is_enabled,
    });
  } catch (err) {
    console.error("Unlock check error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
