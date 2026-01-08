import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./config/supabase.js";
import studentAuthRoutes from "./routes/studentAuth.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth/student", studentAuthRoutes);

app.post("/api/student", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  const { data, error } = await supabase
    .from("students")
    .insert([{ name }]);

  if (error) {
    console.error(error);
    return res.status(500).json({ message: "Supabase error" });
  }

  res.json({
    message: "Student saved in Supabase",
    data,
  });
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
