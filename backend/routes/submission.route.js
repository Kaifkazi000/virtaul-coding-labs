import { Router } from "express";
import {
  getStudentSubmission,
  submitCode,
} from "../controllers/submission.controller.js";

const router = Router();

// Student routes
router.get("/student/:practicalId", getStudentSubmission);
router.post("/submit", submitCode);

export default router;

