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
    getStats,
    registerTeacher,
    deleteTeacher,
    deleteAllotment,
    searchAlumni
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
router.post("/register-teacher", registerTeacher);

// Delete routes
router.delete("/master-subjects/:id", deleteMasterSubject);
router.delete("/students/:id", deleteStudent);
router.delete("/teachers/:id", deleteTeacher);
router.delete("/master-practicals/:id", deleteMasterPractical);
router.delete("/allotments/:id", deleteAllotment);

// Allotments
router.get("/allotments", getSubjectAllotments);

// Alumni
router.get("/alumni", searchAlumni);

export default router;
