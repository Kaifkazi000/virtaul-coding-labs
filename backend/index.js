import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import studentAuthRoutes from "./routes/studentAuth.routes.js";
import teacherAuthRoutes from "./routes/teacherAuth.routes.js";
import subjectRoutes from "./routes/subject.route.js";
import subjectInstanceRoutes from "./routes/subjectInstance.route.js";
import practicalRoutes from "./routes/practical.route.js";
import submissionRoutes from "./routes/submission.route.js";
import executionRoutes from "./routes/execution.route.js";
import teacherDashboardRoutes from "./routes/teacherDashboard.route.js";
import hodRoutes from "./routes/hod.route.js";
import authRoutes from "./routes/auth.route.js";
import pdfRoutes from "./routes/pdf.route.js";
import testRoutes from "./routes/test.routes.js";

dotenv.config();

const app = express();

// CORS configuration - supports both localhost and production
const allowedOrigins = [
  "http://localhost:3000",
  "https://virtaul-coding-labs.vercel.app",
  "https://virtaul-coding-labs-j8o4.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); 
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: ["Authorization"],
  })
);

app.use(express.json());

// auth
app.use("/api/auth/student", studentAuthRoutes);
app.use("/api/auth/teacher", teacherAuthRoutes);

// core modules
app.use("/api/subjects", subjectRoutes);
app.use("/api/subject-instances", subjectInstanceRoutes);
app.use("/api/practicals", practicalRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/execution", executionRoutes);
app.use("/api/teacher-dashboard", teacherDashboardRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api", testRoutes);

app.get("/api/debug-env", (req, res) => {
  res.json({ 
    supabaseUrl: process.env.SUPABASE_URL,
    serviceRoleSet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    cwd: process.cwd()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SERVER START TIMESTAMP: ${new Date().toISOString()}`);
  console.log(`Backend running on port ${PORT}`);
});

// Global Error Handlers
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ UNHANDLED REJECTION at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION:", err);
});
