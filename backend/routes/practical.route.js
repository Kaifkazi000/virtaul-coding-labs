import { Router } from "express";
import {
  addPractical,
  getTeacherPracticalsBySubject,
  getStudentPracticalsBySubjectInstance,
  getPracticalDetail,
  togglePracticalUnlock,
  checkSubmission,
  revertSubmission,
  getStudentNotifications,
} from "../controllers/practical.controller.js";

const router = Router();

// teacher
router.post("/", addPractical);
router.get("/teacher/:subjectInstanceId", getTeacherPracticalsBySubject);
router.patch("/:practicalId/unlock", togglePracticalUnlock);

// student
router.get("/student/notifications", getStudentNotifications);
router.get(
  "/student/:subjectInstanceId",
  getStudentPracticalsBySubjectInstance
);
router.get("/:practicalId", getPracticalDetail);
router.patch("/submission/:submissionId/check", checkSubmission);
router.patch("/submission/:submissionId/revert", revertSubmission);

export default router;
