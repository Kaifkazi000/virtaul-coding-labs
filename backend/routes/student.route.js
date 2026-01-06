import { Router } from "express"
import { addStudent } from "../controllers/student.controller.js"

const router = Router()

router.post("/add-student", addStudent)

export default router
