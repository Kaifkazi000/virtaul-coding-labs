import PDFDocument from "pdfkit";
import { supabase } from "../config/supabase.js";

/**
 * Generate PDF report for practical submissions
 */
export const generatePracticalReport = async (
  practicalId,
  subjectInstanceId,
  teacherId
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get practical details
      const { data: practical, error: practicalError } = await supabase
        .from("practicals")
        .select(
          `
          *,
          subject_instances!inner (
            id,
            subject_name,
            subject_code,
            semester,
            teacher_id
          )
        `
        )
        .eq("id", practicalId)
        .single();

      if (practicalError || !practical) {
        reject(new Error("Practical not found"));
        return;
      }

      if (practical.subject_instances.teacher_id !== teacherId) {
        reject(new Error("Unauthorized"));
        return;
      }

      // Get teacher details
      const { data: teacherData } = await supabase.auth.admin.getUserById(
        teacherId
      );
      const teacherName = teacherData?.user?.email || "Teacher";

      // Get all students and submissions
      const semester = practical.subject_instances.semester;
      const { data: allStudents } = await supabase
        .from("studentss")
        .select("id, name, prn, roll, email")
        .eq("semester", semester)
        .order("name");

      const { data: submissions } = await supabase
        .from("submissions")
        .select("*")
        .eq("practical_id", practicalId);

      const submissionMap = new Map();
      submissions?.forEach((sub) => {
        submissionMap.set(sub.student_id, sub);
      });

      // Create PDF
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc.fontSize(20).text("Virtual Coding Lab - Submission Report", {
        align: "center",
      });
      doc.moveDown();

      // College Info
      doc.fontSize(12).text("Government College of Engineering, Chandrapur", {
        align: "center",
      });
      doc.moveDown(2);

      // Subject Info
      doc.fontSize(14).text("Subject Information", { underline: true });
      doc.fontSize(11);
      doc.text(`Subject: ${practical.subject_instances.subject_name}`);
      doc.text(`Code: ${practical.subject_instances.subject_code}`);
      doc.text(`Semester: ${practical.subject_instances.semester}`);
      doc.text(`Teacher: ${teacherName}`);
      doc.moveDown();

      // Practical Info
      doc.fontSize(14).text("Practical Information", { underline: true });
      doc.fontSize(11);
      doc.text(`PR-${practical.pr_no}: ${practical.title}`);
      doc.text(`Language: ${practical.language}`);
      doc.moveDown(2);

      // Statistics
      const submittedCount = submissions?.length || 0;
      const totalStudents = allStudents?.length || 0;
      const notSubmittedCount = totalStudents - submittedCount;

      doc.fontSize(14).text("Statistics", { underline: true });
      doc.fontSize(11);
      doc.text(`Total Students: ${totalStudents}`);
      doc.text(`Submitted: ${submittedCount}`);
      doc.text(`Not Submitted: ${notSubmittedCount}`);
      doc.text(
        `Submission Rate: ${totalStudents > 0 ? ((submittedCount / totalStudents) * 100).toFixed(2) : 0}%`
      );
      doc.moveDown(2);

      // Submitted Students
      doc.fontSize(14).text("Submitted Students", { underline: true });
      doc.moveDown(0.5);

      const submitted = [];
      allStudents?.forEach((student) => {
        const submission = submissionMap.get(student.id);
        if (submission) {
          submitted.push({
            ...student,
            submission,
          });
        }
      });

      if (submitted.length > 0) {
        doc.fontSize(10);
        submitted.forEach((item, index) => {
          doc.text(
            `${index + 1}. ${item.name} (PRN: ${item.prn}, Roll: ${item.roll})`,
            { indent: 20 }
          );
          doc.text(
            `   Status: ${item.submission.execution_status} | Submitted: ${new Date(item.submission.submitted_at).toLocaleString()}`,
            { indent: 20 }
          );
          doc.moveDown(0.3);
        });
      } else {
        doc.text("No submissions yet.", { indent: 20 });
      }

      doc.moveDown();

      // Not Submitted Students
      doc.fontSize(14).text("Not Submitted Students", { underline: true });
      doc.moveDown(0.5);

      const notSubmitted = allStudents?.filter(
        (student) => !submissionMap.has(student.id)
      );

      if (notSubmitted && notSubmitted.length > 0) {
        doc.fontSize(10);
        notSubmitted.forEach((student, index) => {
          doc.text(
            `${index + 1}. ${student.name} (PRN: ${student.prn}, Roll: ${student.roll})`,
            { indent: 20 }
          );
          doc.moveDown(0.3);
        });
      } else {
        doc.text("All students have submitted.", { indent: 20 });
      }

      // Footer
      doc.fontSize(8).text(
        `Generated on: ${new Date().toLocaleString()}`,
        50,
        doc.page.height - 50,
        { align: "center" }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generate PDF report for entire subject instance
 */
export const generateSubjectInstanceReport = async (
  subjectInstanceId,
  teacherId
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get subject instance details
      const { data: subjectInstance, error: instanceError } = await supabase
        .from("subject_instances")
        .select("*")
        .eq("id", subjectInstanceId)
        .single();

      if (instanceError || !subjectInstance) {
        reject(new Error("Subject instance not found"));
        return;
      }

      if (subjectInstance.teacher_id !== teacherId) {
        reject(new Error("Unauthorized"));
        return;
      }

      // Get teacher details
      const { data: teacherData } = await supabase.auth.admin.getUserById(
        teacherId
      );
      const teacherName = teacherData?.user?.email || "Teacher";

      // Get all practicals
      const { data: practicals } = await supabase
        .from("practicals")
        .select("id, pr_no, title")
        .eq("subject_instance_id", subjectInstanceId)
        .order("pr_no");

      // Get all students
      const { data: allStudents } = await supabase
        .from("studentss")
        .select("id, name, prn, roll")
        .eq("semester", subjectInstance.semester)
        .order("name");

      // Get all submissions
      const { data: allSubmissions } = await supabase
        .from("submissions")
        .select("*")
        .eq("subject_instance_id", subjectInstanceId);

      // Create PDF
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc.fontSize(20).text("Virtual Coding Lab - Subject Report", {
        align: "center",
      });
      doc.moveDown();

      doc.fontSize(12).text("Government College of Engineering, Chandrapur", {
        align: "center",
      });
      doc.moveDown(2);

      // Subject Info
      doc.fontSize(14).text("Subject Information", { underline: true });
      doc.fontSize(11);
      doc.text(`Subject: ${subjectInstance.subject_name}`);
      doc.text(`Code: ${subjectInstance.subject_code}`);
      doc.text(`Semester: ${subjectInstance.semester}`);
      doc.text(`Teacher: ${teacherName}`);
      doc.moveDown(2);

      // Practical-wise summary
      doc.fontSize(14).text("Practical Summary", { underline: true });
      doc.moveDown(0.5);

      practicals?.forEach((practical) => {
        const practicalSubmissions = allSubmissions?.filter(
          (sub) => sub.practical_id === practical.id
        );
        const submittedCount = practicalSubmissions?.length || 0;
        const submissionRate =
          allStudents?.length > 0
            ? ((submittedCount / allStudents.length) * 100).toFixed(2)
            : "0.00";

        doc.fontSize(11).text(`PR-${practical.pr_no}: ${practical.title}`, {
          indent: 20,
        });
        doc.fontSize(10);
        doc.text(
          `Submitted: ${submittedCount}/${allStudents?.length || 0} (${submissionRate}%)`,
          { indent: 40 }
        );
        doc.moveDown(0.5);
      });

      // Footer
      doc.fontSize(8).text(
        `Generated on: ${new Date().toLocaleString()}`,
        50,
        doc.page.height - 50,
        { align: "center" }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
