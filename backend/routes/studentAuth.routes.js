import express from "express";
import { getCurrentStudent } from "../controllers/studentAuth.controller.js";
import {
  studentSignup,
  studentLogin,
} from "../controllers/studentAuth.controller.js";

const router = express.Router();

router.post("/signup", studentSignup);
router.post("/login", studentLogin);
router.get("/me", getCurrentStudent);

export default router;
