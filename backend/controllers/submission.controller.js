import { supabase, supabaseAdmin } from "../config/supabase.js";

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

    const { data: student } = await supabaseAdmin
      .from("studentss")
      .select("id")
      .eq("auth_user_id", studentAuthId)
      .single();

    const { data: practical } = await supabaseAdmin
      .from("practicals")
      .select("id, subject_instance_id, pr_no")
      .eq("id", practical_id)
      .single();

    const { data: existing } = await supabaseAdmin
      .from("submissions")
      .select("id")
      .eq("student_id", student.id)
      .eq("practical_id", practical_id)
      .maybeSingle();

    let submission;

    if (existing) {
      const { data } = await supabaseAdmin
        .from("submissions")
        .update({
          code,
          language,
          execution_status,
          execution_output: output,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      submission = data;
    } else {
      const { data } = await supabaseAdmin
        .from("submissions")
        .insert({
          student_id: student.id,
          subject_instance_id: practical.subject_instance_id,
          practical_id,
          pr_no: practical.pr_no,
          code,
          language,
          execution_status,
          execution_output: output,
        })
        .select()
        .single();

      submission = data;
    }

    res.status(201).json({
      message: "Submission saved successfully",
      submission,
    });
  } catch (err) {
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
      .from("studentss")
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
