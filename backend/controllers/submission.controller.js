import { supabase, supabaseAdmin } from "../config/supabase.js";
import { checkIntegrity, analyzeLogic } from "../services/logicEngine/index.js";

/**
 * MOCK CODE EXECUTION
 */
const executeCode = async (code, language) => {
  if (!code || code.trim().length === 0) {
    return {
      success: false,
      output: null,
      error: "Code cannot be empty",
    };
  }

  if (language === "Python") {
    if (code.includes("print(") || code.includes("def ")) {
      return { success: true, output: "Code executed successfully (mock)", error: null };
    }
  }

  if (language === "Java") {
    if (code.includes("public class") || code.includes("System.out.println")) {
      return { success: true, output: "Code executed successfully (mock)", error: null };
    }
  }

  if (language === "SQL") {
    if (code.toUpperCase().includes("SELECT") || code.toUpperCase().includes("INSERT")) {
      return { success: true, output: "Query executed successfully (mock)", error: null };
    }
  }

  return { success: true, output: "Code executed successfully (mock)", error: null };
};

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
      execution_status: result.success ? "success" : "failed",
      output: result.output,
      error: result.error,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * SUBMIT CODE
 */
export const submitCode = async (req, res) => {
  try {
    const { code, language, practical_id, execution_status, output } = req.body;

    if (execution_status !== "success") {
      return res.status(400).json({ error: "Execute code successfully first" });
    }

    const token = req.headers.authorization?.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const studentAuthId = userData.user.id;

    // 1. Get Student and Practical/Subject details
    const { data: student } = await supabaseAdmin
      .from("students")
      .select("id, semester")
      .eq("auth_user_id", studentAuthId)
      .single();

    const { data: practical } = await supabaseAdmin
      .from("practicals")
      .select("id, subject_instance_id, pr_no, sample_code")
      .eq("id", practical_id)
      .single();

    // 2. Fetch existing submissions for comparison (same scope)
    const { data: existingSubmissions } = await supabaseAdmin
      .from("submissions")
      .select("id, code, language")
      .eq("subject_instance_id", practical.subject_instance_id)
      .eq("pr_no", practical.pr_no)
      .neq("student_id", student.id); // Exclude current student

    console.log(`[AI Logic] Found ${existingSubmissions?.length || 0} other submissions to compare against for PR-${practical.pr_no}`);

    // 3. Run AI Logic Integrity Check
    const integrityResult = checkIntegrity(
      code,
      language,
      existingSubmissions || [],
      practical.sample_code
    );

    console.log(`[AI Logic] Result for PR-${practical.pr_no}:`, {
      score: integrityResult.similarityScore,
      flagged: integrityResult.flagged,
      tokens: integrityResult.logicHash?.length || 0
    });

    // 4. Save or Update Submission
    const { data: existing } = await supabaseAdmin
      .from("submissions")
      .select("id")
      .eq("student_id", student.id)
      .eq("practical_id", practical_id)
      .maybeSingle();

    const submissionData = {
      student_id: student.id,
      subject_instance_id: practical.subject_instance_id,
      practical_id,
      pr_no: practical.pr_no,
      semester: student.semester,
      code,
      language,
      execution_status,
      execution_output: output,
      logic_hash: integrityResult.logicHash,
      similarity_score: integrityResult.similarityScore,
      flagged: integrityResult.flagged,
      matching_submission_id: integrityResult.matchingSubmissionId,
      updated_at: new Date().toISOString(),
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
        .insert({
          ...submissionData,
          created_at: new Date().toISOString(),
        })
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
    console.error("Submission error:", err);
    res.status(500).json({ error: "Server error" });
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
