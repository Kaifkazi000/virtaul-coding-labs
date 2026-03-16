import { Router } from "express";
import { getStudentHistory } from "../controllers/history.controller.js";
import { verifyHOD } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyHOD);
router.get("/student/:prn", getStudentHistory);

export default router;
