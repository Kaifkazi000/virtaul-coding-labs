import { Router } from "express";
import {
  addSubject,
  getTeacherSubjects,
  getStudentSubjects,
  getSubjectById,
} from "../controllers/subject.controller.js";

const router = Router();

// STATIC ROUTES FIRST
router.post("/", addSubject);
router.get("/teacher", getTeacherSubjects);
router.get("/student", getStudentSubjects);

// DYNAMIC ROUTE LAST
router.get("/:id", getSubjectById);

export default router;
