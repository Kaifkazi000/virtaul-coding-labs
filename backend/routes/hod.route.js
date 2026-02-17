import { Router } from "express";
import {
               getStudents,
               getMasterSubjects,
               getAllTeachers,
               createMasterSubject,
               allotSubject,
               manualRegisterStudent,
               bulkRegisterStudents,
               promoteBatch,
               createMasterPractical,
               getMasterPracticals,
               deleteMasterSubject,
               deleteStudent,
               deleteMasterPractical,
               getSubjectAllotments,
               getStats
} from "../controllers/hod.controller.js";
import {
               login,
               getDashboardStats
} from "../controllers/hodAuth.controller.js";

const router = Router();

// HOD Auth routes
router.post("/auth/login", login);

// HOD Dashboard stats
router.get("/stats", getDashboardStats);

// HOD core routes
router.get("/teachers", getAllTeachers);
router.get("/students", getStudents);
router.get("/master-subjects", getMasterSubjects);
router.post("/master-subject", createMasterSubject);
router.post("/allot-subject", allotSubject);
router.get("/master-subjects/:subjectId/practicals", getMasterPracticals);
router.post("/master-practical", createMasterPractical);
router.post("/register-student", manualRegisterStudent);
router.post("/bulk-register-students", bulkRegisterStudents);
router.post("/promote-batch", promoteBatch);

// Delete routes
router.delete("/master-subjects/:id", deleteMasterSubject);
router.delete("/students/:id", deleteStudent);
router.delete("/master-practicals/:id", deleteMasterPractical);

// Allotments
router.get("/allotments", getSubjectAllotments);

// Stats
router.get("/stats", getStats);

export default router;
