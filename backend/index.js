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
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all origins in production (or restrict as needed)
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

// old subjects (can be removed later)
app.use("/api/subjects", subjectRoutes);

// new instance-based system
app.use("/api/subject-instances", subjectInstanceRoutes);
app.use("/api/practicals", practicalRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/execution", executionRoutes);
app.use("/api/teacher-dashboard", teacherDashboardRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api", testRoutes);

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
