import { supabase, supabaseAdmin } from "../config/supabase.js";
import { checkIntegrity, analyzeLogic } from "../services/logicEngine/index.js";
import { executeCode } from "../services/codeExecutor.service.js";

/**
 * EXECUTE CODE
 */
export const executeCodeForPractical = async (req, res) => {
  try {
    const { code, language, practical_id } = req.body;

    if (!code || !language || !practical_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const token = req.headers.authorization?.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);

    if (!userData?.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const result = await executeCode(code, language);

    res.json({
      execution_status: result.execution_status,
      output: result.output,
      error: result.error,
    });
  } catch (err) {
    console.error("[SubmissionController] Execute Error:", err);
    res.status(500).json({ error: "Server error during code execution" });
  }
};

/**
 * SUBMIT CODE
 */
export const submitCode = async (req, res) => {
  try {
    const { code, language, practical_id, execution_status, output } = req.body;
    console.log(`[Submission] Incoming request for practical: ${practical_id}, language: ${language}`);

    if (execution_status !== "success") {
      return res.status(400).json({ error: "Execute code successfully first" });
    }

    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Missing authorization token" });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    const studentAuthId = userData.user.id;

    // 1. Get Student details
    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .select("id, semester, batch_name")
      .eq("auth_user_id", studentAuthId)
      .single();

    if (studentError || !student) {
      console.error("[Submission] Student profile not found for auth_id:", studentAuthId);
      return res.status(404).json({ error: "Student profile not found. Please contact HOD." });
    }

    // 2. Get Practical details - Using ID directly
    console.log(`[Submission] Fetching practical data for ID: ${practical_id}`);
    const { data: practical, error: practicalError } = await supabaseAdmin
      .from("master_practicals")
      .select("id, master_subject_id, pr_no, sample_code, language")
      .eq("id", practical_id)
      .single();

    if (practicalError || !practical) {
      console.error("[Submission] Practical NOT found in DB. ID:", practical_id, "Error:", practicalError);
      return res.status(404).json({ error: "Practical not found in system." });
    }

    // 3. Strict Backend Validation: Language and Success status
    const reqLang = String(language || "").trim().toLowerCase();
    const targetLang = String(practical.language || "").trim().toLowerCase();
    
    // 3. Find target Subject Instance / Allotment ID
    console.log(`[Submission] Resolving Subject Instance (Allotment) for batch ${student.batch_name}, subject ${practical.master_subject_id}`);
    const { data: allotment, error: allotError } = await supabaseAdmin
      .from("allotments")
      .select("id")
      .eq("subject_id", practical.master_subject_id)
      .eq("semester", student.semester)
      .eq("batch_name", student.batch_name)
      .single();

    if (allotError || !allotment) {
      console.warn(`[Submission] No configured subject instance for student ${studentAuthId}`);
      return res.status(403).json({ error: "No subject allotment found for your batch." });
    }

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
      console.warn(`[Submission] Language mismatch: Got ${normalizedReq}, Expected ${normalizedTarget}`);
      return res.status(400).json({ 
        error: `Submission blocked: Language mismatch. Expected ${practical.language}, but got ${language}.` 
      });
    }

    // 4. Fetch existing submissions for comparison (same scope)
    const { data: existingSubmissions } = await supabaseAdmin
      .from("submissions")
      .select("id, code, language")
      .eq("practical_id", practical_id)
      .neq("student_id", student.id); // Exclude current student

    // 5. Run AI Logic Integrity Check
    const integrityResult = checkIntegrity(
      code,
      language,
      existingSubmissions || [],
      practical.sample_code
    );

    console.log(`[AI Logic] PR-${practical.pr_no} Result:`, {
      score: integrityResult.similarityScore,
      flagged: integrityResult.flagged
    });

    // 6. Save or Update Submission
    const { data: existing } = await supabaseAdmin
      .from("submissions")
      .select("id")
      .eq("student_id", student.id)
      .eq("practical_id", practical_id)
      .maybeSingle();

    const submissionData = {
      student_id: student.id,
      subject_instance_id: allotment.id,
      practical_id,
      pr_no: practical.pr_no,
      code,
      language,
      execution_status,
      execution_output: output,
      logic_hash: integrityResult.logicHash,
      similarity_score: integrityResult.similarityScore,
      flagged: integrityResult.flagged,
      matching_submission_id: integrityResult.matchingSubmissionId,
      submitted_at: new Date().toISOString(),
    };

    let resultSubmission;
    if (existing) {
      const { data } = await supabaseAdmin
        .from("submissions")
        .update(submissionData)
        .eq("id", existing.id)
        .select()
        .single();
      resultSubmission = data;
    } else {
      const { data } = await supabaseAdmin
        .from("submissions")
        .insert({ ...submissionData, submitted_at: new Date().toISOString() })
        .select()
        .single();
      resultSubmission = data;
    }

    res.status(201).json({
      message: "Submission saved successfully",
      submission: resultSubmission,
      integrity: integrityResult,
    });
  } catch (err) {
    console.error("[Submission] Fatal Error:", err);
    res.status(500).json({ error: "Internal server error during submission" });
  }
};


/**
 * GET STUDENT SUBMISSION
 */
export const getStudentSubmission = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);

    const studentAuthId = userData.user.id;

    const { data: student } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("auth_user_id", studentAuthId)
      .single();

    const { data } = await supabaseAdmin
      .from("submissions")
      .select("*")
      .eq("student_id", student.id)
      .eq("practical_id", req.params.practicalId)
      .maybeSingle();

    res.json({ submission: data || null });
  } catch {
    res.json({ submission: null });
  }
};
