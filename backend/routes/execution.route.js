import { Router } from "express";
import {
  executeAndSubmit,
  checkUnlockStatus,
} from "../controllers/execution.controller.js";

const router = Router();

// Student routes
router.post("/execute", executeAndSubmit);
router.get("/unlock-status/:practicalId", checkUnlockStatus);

export default router;
