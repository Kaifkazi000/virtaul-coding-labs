import { supabase, supabaseAdmin } from "../config/supabase.js";
import { executeCode } from "../services/codeExecutor.service.js";

/**
 * STUDENT: Execute code only
 * POST /api/execution/execute
 */
export const executeCodeOnly = async (req, res) => {
  try {
    const { code, language, practical_id } = req.body;
    if (!code || !language || !practical_id) return res.status(400).json({ error: "code, language, and practical_id are required" });

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Authorization token missing" });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) return res.status(401).json({ error: "Invalid token" });

    const studentAuthId = userData.user.id;
    const { data: student, error: studentError } = await supabaseAdmin.from("students").select("id, admission_year, semester, batch_name").eq("auth_user_id", studentAuthId).single();
    if (studentError || !student) return res.status(404).json({ error: "Student profile not found" });

    const { data: practical, error: practicalError } = await supabaseAdmin.from("master_practicals").select("id, language, master_subject_id").eq("id", practical_id).single();
    if (practicalError || !practical) {
      console.error("[Execution] Practical not found:", practical_id);
      return res.status(404).json({ error: "Practical not found" });
    }

    // 1. Strict Language Check
    const reqLang = String(language || "").trim().toLowerCase();
    const targetLang = String(practical.language || "").trim().toLowerCase();

    // Mapping for common aliases
    const aliases = {
      js: "javascript",
      javascript: "javascript",
      py: "python",
      python: "python",
      cpp: "c++",
      "c++": "c++"
    };

    const normalizedReq = aliases[reqLang] || reqLang;
    const normalizedTarget = aliases[targetLang] || targetLang;

    if (normalizedReq !== normalizedTarget) {
      return res.status(400).json({
        error: `Language mismatch! This practical only allows ${practical.language}. You tried to run ${language}.`
      });
    }

    // 2. Resilient Allotment Check
    const stdSem = String(student.semester).trim();
    const stdBatch = String(student.batch_name || "").trim().toUpperCase();

    const { data: allotments } = await supabaseAdmin.from("allotments")
      .select("id, semester, batch_name")
      .eq("subject_id", practical.master_subject_id)
      .eq("is_active", true);

    const activeAllotment = allotments?.find(a => {
      const aSem = String(a.semester).trim();
      const aBatch = String(a.batch_name || "").trim().toUpperCase();
      return aSem === stdSem && aBatch === stdBatch;
    });
    
    if (activeAllotment) {
      const { data: status } = await supabaseAdmin.from("allotment_practical_status")
        .select("is_unlocked")
        .match({ allotment_id: activeAllotment.id, master_practical_id: practical_id })
        .maybeSingle();
      
      if (!status?.is_unlocked) {
        return res.status(403).json({ error: "This practical is locked by your teacher." });
      }
    } else {
       console.warn(`[Execution] No active allotment found for student ${student.id} | Sem: ${stdSem} | Batch: ${stdBatch} | Subject: ${practical.master_subject_id}`);
       return res.status(403).json({ error: "No allotment found for your batch. Contact your teacher." });
    }

    const executionResult = await executeCode(code, language);
    res.json({
      execution_status: executionResult.execution_status,
      output: executionResult.output,
      error: executionResult.error,
      execution_time_ms: executionResult.execution_time_ms,
      memory_used_kb: executionResult.memory_used_kb,
    });
  } catch (err) { 
    console.error("[Execution] System Error:", err);
    res.status(500).json({ error: "Server error during execution" }); 
  }
};

export const checkUnlockStatus = async (req, res) => {
  try {
    const { practicalId } = req.params;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Authorization token missing" });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData?.user) return res.status(401).json({ error: "Invalid token" });

    const { data: student } = await supabaseAdmin.from("students").select("id, admission_year, semester, batch_name").eq("auth_user_id", userData.user.id).single();
    if (!student) return res.status(404).json({ error: "Student profile not found" });

    const { data: practical } = await supabaseAdmin.from("master_practicals").select("id, pr_no, master_subject_id").eq("id", practicalId).single();
    if (!practical) return res.status(404).json({ error: "Practical not found" });

    // Manual filtering for type safety and resilience
    const stdSem = String(student.semester).trim();
    const stdBatch = String(student.batch_name || "").trim().toUpperCase();

    // 1. Find the correct allotment for this student/subject
    const { data: allotments } = await supabaseAdmin.from("allotments")
      .select("id, semester, batch_name")
      .eq("subject_id", practical.master_subject_id)
      .eq("is_active", true);

    const activeAllotment = allotments?.find(a => {
      const aSem = String(a.semester).trim();
      const aBatch = String(a.batch_name || "").trim().toUpperCase();
      return aSem === stdSem && aBatch === stdBatch;
    });
    
    let is_unlocked = false;
    let allotment_found = !!activeAllotment;
    
    if (activeAllotment) {
      const { data: status } = await supabaseAdmin.from("allotment_practical_status")
        .select("is_unlocked")
        .match({ allotment_id: activeAllotment.id, master_practical_id: practicalId })
        .maybeSingle();
      is_unlocked = !!status?.is_unlocked;
    }

    console.log(`[Unlock Check] Student ${student.id} | Sem: ${stdSem} | Batch: ${stdBatch} | Practical: ${practical.pr_no} | Found: ${allotment_found} | Unlocked: ${is_unlocked}`);

    res.json({
      is_unlocked,
      reason: is_unlocked ? "Unlocked by teacher" : "Locked for your batch",
      pr_no: practical.pr_no,
      allotment_found,
      debug: {
        student: { sem: stdSem, batch: stdBatch },
        allotments_scanned: allotments?.length || 0,
        matched_allotment_id: activeAllotment?.id || null
      }
    });
  } catch (err) { 
    console.error("[Unlock Status Error]:", err);
    res.status(500).json({ error: "Internal server error" }); 
  }
};