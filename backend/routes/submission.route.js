import { Router } from "express";
import {
  getStudentSubmission,
} from "../controllers/submission.controller.js";

const router = Router();

// Student routes (execution + auto-submit moved to /api/execution/*)
router.get("/student/:practicalId", getStudentSubmission);

export default router;

