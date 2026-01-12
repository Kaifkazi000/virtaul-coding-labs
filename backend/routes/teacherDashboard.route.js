import { Router } from "express";
import {
  getPracticalStudents,
  getStudentSubmissionDetail,
  getSubjectInstancePracticals,
} from "../controllers/teacherDashboard.controller.js";

const router = Router();

router.get("/practical/:practicalId/students", getPracticalStudents);
router.get("/submission/:submissionId", getStudentSubmissionDetail);
router.get("/subject-instance/:subjectInstanceId/practicals", getSubjectInstancePracticals);

export default router;
