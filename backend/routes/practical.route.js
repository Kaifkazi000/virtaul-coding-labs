import { Router } from "express";
import {
  addPractical,
  getTeacherPracticalsBySubject,
  getStudentPracticalsBySubjectInstance,
  getPracticalDetail,
} from "../controllers/practical.controller.js";

const router = Router();

// teacher
router.post("/", addPractical);
router.get("/teacher/:subjectInstanceId", getTeacherPracticalsBySubject);

// student
router.get(
  "/student/:subjectInstanceId",
  getStudentPracticalsBySubjectInstance
);
router.get("/:practicalId", getPracticalDetail);

export default router;
