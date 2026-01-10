import { Router } from "express";
import {
  addPractical,
  getTeacherPracticalsBySubject,
  getStudentPracticalsBySubject,
  getPracticalDetail,
} from "../controllers/practical.controller.js";

const router = Router();

// teacher
router.post("/", addPractical);
router.get("/teacher/:subjectId", getTeacherPracticalsBySubject);

// student
router.get("/student/:subjectId", getStudentPracticalsBySubject);
router.get("/:practicalId", getPracticalDetail);

export default router;
