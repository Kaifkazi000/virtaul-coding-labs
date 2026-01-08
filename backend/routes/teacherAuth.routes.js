import express from "express";
import { teacherLogin } from "../controllers/teacherAuth.controller.js";

const router = express.Router();

router.post("/login", teacherLogin);

export default router;
