import { Router } from "express";
import {
  addSubject,
  getTeacherSubjects,
  getStudentSubjects,
} from "../controllers/subject.controller.js";

const router = Router();

router.post("/", addSubject);            // teacher
router.get("/teacher", getTeacherSubjects);
router.get("/student", getStudentSubjects);

export default router;
