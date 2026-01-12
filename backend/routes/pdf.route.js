import { Router } from "express";
import {
  downloadPracticalPDF,
  downloadSubjectInstancePDF,
} from "../controllers/pdf.controller.js";

const router = Router();

router.get("/practical/:practicalId", downloadPracticalPDF);
router.get("/subject-instance/:subjectInstanceId", downloadSubjectInstancePDF);

export default router;
