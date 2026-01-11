import { Router } from "express";
import {
  executeCodeForPractical,
  submitCode,
  getStudentSubmission,
  getTeacherSubmissions,
  reviewSubmission,
  getStudentProgress,
} from "../controllers/submission.controller.js";

const router = Router();

// Student routes
router.post("/execute", executeCodeForPractical);
router.post("/", submitCode);
router.get("/student/:practicalId", getStudentSubmission);
router.get("/student/progress/:subjectInstanceId", getStudentProgress);

// Teacher routes
router.get("/teacher/:subjectInstanceId", getTeacherSubmissions);
router.patch("/:submissionId/review", reviewSubmission);

export default router;

