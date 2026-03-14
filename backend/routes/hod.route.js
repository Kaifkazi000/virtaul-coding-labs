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
    promoteDepartment,
    createMasterPractical,
    getMasterPracticals,
    deleteMasterSubject,
    deleteStudent,
    deleteMasterPractical,
    getSubjectAllotments,
    getStats,
    registerTeacher,
    deleteTeacher,
    deleteAllotment,
    searchAlumni,
    getStudentHistory,
    getAvailableBatches,
    rebalanceCohortBatches
} from "../controllers/hod.controller.js";
import {
    login
} from "../controllers/hodAuth.controller.js";

const router = Router();

// HOD Auth routes
router.post("/auth/login", login);

// HOD Dashboard stats
router.get("/stats", getStats);

// HOD core routes
router.get("/teachers", getAllTeachers);
router.get("/students", getStudents);
router.get("/master-subjects", getMasterSubjects);
router.post("/master-subjects", createMasterSubject);
router.post("/allot-subject", allotSubject);
router.get("/master-subjects/:subjectId/practicals", getMasterPracticals);
router.post("/master-practicals", createMasterPractical);
router.post("/register-student", manualRegisterStudent);
router.post("/bulk-register-students", bulkRegisterStudents);
router.post("/promote-batch", promoteBatch);
router.post("/promote-department", promoteDepartment);
router.post("/register-teacher", registerTeacher);

// Delete routes
router.delete("/master-subjects/:id", deleteMasterSubject);
router.delete("/students/:id", deleteStudent);
router.delete("/teachers/:id", deleteTeacher);
router.delete("/master-practicals/:id", deleteMasterPractical);
router.delete("/allotments/:id", deleteAllotment);

// Allotments
router.get("/allotments", getSubjectAllotments);

router.get("/student-history/:prn", getStudentHistory);
router.get("/alumni", searchAlumni);
router.get("/available-batches", getAvailableBatches);

export default router;
