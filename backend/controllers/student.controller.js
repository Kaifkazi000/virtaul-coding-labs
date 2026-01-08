import { supabase } from "../config/supabase.js";

export const addStudent = async (req, res) => {
  const { name } = req.body

  if (!name) {
    return res.status(400).json({ error: "Name is required" })
  }

  const { data, error } = await supabase
    .from("students")
    .insert([{ name }])
    .select()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json({
    message: "Student added successfully",
    data
  })
}
