import { Router } from "express";
import {
  createSubjectInstance,
  getTeacherSubjectInstances,
  getStudentSubjectInstances,
} from "../controllers/subjectInstance.controller.js";

const router = Router();

// teacher
router.post("/", createSubjectInstance);
router.get("/teacher", getTeacherSubjectInstances);

// student (auto-enroll)
router.get("/student", getStudentSubjectInstances);

export default router;
