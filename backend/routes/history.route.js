import { Router } from "express";
import { getStudentHistory } from "../controllers/history.controller.js";

const router = Router();

router.get("/student/:prn", getStudentHistory);

export default router;
