import { supabaseAdmin } from "../config/supabase.js";

/**
 * Fetch a student's complete academic history
 * GET /api/history/student/:prn
 */
export const getStudentHistory = async (req, res) => {
  try {
    const { prn } = req.params;

    // 1. Get Student Profile
    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("prn", prn)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // 2. Fetch all submissions for this student, including practicals, subjects, and the specific allotment (for semester)
    const { data: submissions, error: subError } = await supabaseAdmin
      .from("submissions")
      .select(`
        *,
        allotment:allotments (
          id,
          semester,
          academic_year
        ),
        practicals:master_practicals (
          id,
          pr_no,
          title,
          master_subject_id,
          master_subjects:master_subjects (
            id,
            name,
            course_code
          )
        )
      `)
      .eq("student_id", student.id)
      .order("submitted_at", { ascending: true });

    if (subError) {
      console.error("[History] Error fetching submissions:", subError);
      throw subError;
    }

    // 3. Group the data: Semester -> Subject -> Practicals
    const transcript = {};

    for (const sub of (submissions || [])) {
      const prac = sub.practicals;
      if (!prac || !prac.master_subjects || !sub.allotment) continue;

      const subject = prac.master_subjects;
      const sem = sub.allotment.semester;

      if (!transcript[sem]) {
        transcript[sem] = {}; // Map of subject_id -> subject object
      }

      if (!transcript[sem][subject.id]) {
        transcript[sem][subject.id] = {
          subject_id: subject.id,
          subject_name: subject.name,
          course_code: subject.course_code,
          practicals: []
        };
      }

      transcript[sem][subject.id].practicals.push({
        submission_id: sub.id,
        pr_no: prac.pr_no,
        title: prac.title,
        status: sub.status,
        score: sub.score,
        feedback: sub.teacher_feedback,
        submitted_at: sub.submitted_at,
        checked_at: sub.checked_at
      });
    }

    // Sort practicals within each subject by pr_no
    for (const sem in transcript) {
      for (const subjId in transcript[sem]) {
        transcript[sem][subjId].practicals.sort((a, b) => a.pr_no - b.pr_no);
      }
    }

    // Convert the subject maps to arrays for easier frontend mapping
    const structuredTranscript = {};
    for (const sem in transcript) {
      structuredTranscript[sem] = Object.values(transcript[sem]);
    }

    res.json({
      student: {
        id: student.id,
        prn: student.prn,
        full_name: student.full_name,
        department: student.department,
        current_semester: student.semester,
        batch: student.batch_name
      },
      transcript: structuredTranscript
    });

  } catch (err) {
    console.error("[History] Controller Error:", err);
    res.status(500).json({ error: "Failed to load student history" });
  }
};
