import { Router } from "express";
import {
  addPractical,
  getTeacherPracticalsBySubject,
  getStudentPracticalsBySubjectInstance,
  getPracticalDetail,
  enablePractical,
} from "../controllers/practical.controller.js";

const router = Router();

// teacher
router.post("/", addPractical);
router.get("/teacher/:subjectInstanceId", getTeacherPracticalsBySubject);
router.patch("/:practicalId/enable", enablePractical);

// student
router.get(
  "/student/:subjectInstanceId",
  getStudentPracticalsBySubjectInstance
);
router.get("/:practicalId", getPracticalDetail);

export default router;
