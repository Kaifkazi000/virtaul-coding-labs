import { Router } from "express";
import {
  executeCodeOnly,
  checkUnlockStatus,
} from "../controllers/execution.controller.js";

const router = Router();

// Student routes
router.post("/execute", executeCodeOnly);
router.get("/unlock-status/:practicalId", checkUnlockStatus);

export default router;
