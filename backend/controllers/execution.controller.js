import { supabase, supabaseAdmin } from "../config/supabase.js";
import { executeCode } from "../services/codeExecutor.service.js";

/**
 * STUDENT: Execute code only
 * POST /api/execution/execute
 */
export const executeCodeOnly = async (req, res) => {
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

    // Get student record using ADMIN client
    const { data: student, error: studentError } = await supabaseAdmin
      .from("studentss")
      .select("id")
      .eq("auth_user_id", studentAuthId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Get practical details (for language verification)
    const { data: practical, error: practicalError } = await supabaseAdmin
      .from("practicals")
      .select("id, language")
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

    // Return ONLY execution result
    res.json({
      execution_status: executionResult.execution_status,
      output: executionResult.output,
      error: executionResult.error,
      execution_time_ms: executionResult.execution_time_ms,
      memory_used_kb: executionResult.memory_used_kb,
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

    // Get student record using ADMIN client
    const { data: student, error: studentError } = await supabaseAdmin
      .from("studentss")
      .select("id")
      .eq("auth_user_id", studentAuthId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Get practical using ADMIN client
    const { data: practical, error: practicalError } = await supabaseAdmin
      .from("practicals")
      .select("id, pr_no, is_unlocked")
      .eq("id", practicalId)
      .single();

    if (practicalError || !practical) {
      return res.status(404).json({ error: "Practical not found" });
    }

    res.json({
      is_unlocked: !!practical.is_unlocked,
      reason: practical.is_unlocked ? "Unlocked by teacher" : "Locked by teacher",
      pr_no: practical.pr_no,
    });
  } catch (err) {
    console.error("Unlock check error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
