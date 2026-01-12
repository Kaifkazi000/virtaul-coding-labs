import {
  generatePracticalReport,
  generateSubjectInstanceReport,
} from "../services/pdfGenerator.service.js";
import { supabase } from "../config/supabase.js";

/**
 * TEACHER: Download PDF report for a practical
 * GET /api/pdf/practical/:practicalId
 */
export const downloadPracticalPDF = async (req, res) => {
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

    // Generate PDF
    const pdfBuffer = await generatePracticalReport(
      practicalId,
      null,
      teacherId
    );

    // Get practical details for filename
    const { data: practical } = await supabase
      .from("practicals")
      .select("pr_no, title, subject_instances!inner(subject_name)")
      .eq("id", practicalId)
      .single();

    const filename = `PR-${practical?.pr_no || "unknown"}_${practical?.subject_instances?.subject_name || "report"}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: err.message || "Failed to generate PDF" });
  }
};

/**
 * TEACHER: Download PDF report for entire subject instance
 * GET /api/pdf/subject-instance/:subjectInstanceId
 */
export const downloadSubjectInstancePDF = async (req, res) => {
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

    // Generate PDF
    const pdfBuffer = await generateSubjectInstanceReport(
      subjectInstanceId,
      teacherId
    );

    // Get subject instance details for filename
    const { data: subjectInstance } = await supabase
      .from("subject_instances")
      .select("subject_name, semester")
      .eq("id", subjectInstanceId)
      .single();

    const filename = `${subjectInstance?.subject_name || "subject"}_Sem${subjectInstance?.semester || ""}_Report.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: err.message || "Failed to generate PDF" });
  }
};
