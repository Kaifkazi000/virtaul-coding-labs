import express from "express"
import studentRoutes from "../routes/student.route.js"

const app = express()

app.use(express.json())

app.get("/", (req, res) => {
  res.send("Backend running & Supabase ready ✅")
})

app.use("/", studentRoutes)

export default app
