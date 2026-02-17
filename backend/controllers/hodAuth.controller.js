import { supabase, supabaseAdmin } from "../config/supabase.js";
import jwt from "jsonwebtoken";

/**
 * HOD: Login
 */
export const login = async (req, res) => {
               try {
                              const { email, password } = req.body;

                              // 1. Authenticate with Supabase Auth
                              const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                                             email,
                                             password,
                              });

                              if (authError) {
                                             return res.status(401).json({ error: "Invalid credentials" });
                              }

                              // 2. Verify user exists in 'hods' table
                              const { data: hod, error: hodError } = await supabaseAdmin
                                             .from("hods")
                                             .select("*")
                                             .eq("auth_user_id", authData.user.id)
                                             .single();

                              if (hodError || !hod) {
                                             return res.status(403).json({ error: "Unauthorized. HOD profile not found." });
                              }

                              // 3. Generate a custom JWT if needed (Supabase token is usually enough, but we might want role in payload)
                              const token = authData.session.access_token;

                              res.json({
                                             message: "Login successful",
                                             token,
                                             user: {
                                                            id: hod.id,
                                                            name: hod.name,
                                                            email: hod.email,
                                                            role: "hod",
                                             },
                              });
               } catch (err) {
                              console.error("HOD Login Error:", err);
                              res.status(500).json({ error: "Server error during login" });
               }
};

/**
 * HOD: Get Dashboard Stats
 */
export const getDashboardStats = async (req, res) => {
               try {
                              const [studentsCount, subjectsCount, teachersCount] = await Promise.all([
                                             supabaseAdmin.from("students").select("*", { count: "exact", head: true }),
                                             supabaseAdmin.from("master_subjects").select("*", { count: "exact", head: true }),
                                             supabaseAdmin.from("teachers").select("*", { count: "exact", head: true }),
                              ]);

                              res.json({
                                             totalStudents: studentsCount.count || 0,
                                             totalSubjects: subjectsCount.count || 0,
                                             totalTeachers: teachersCount.count || 0,
                              });
               } catch (err) {
                              console.error("Stats Error:", err);
                              res.status(500).json({ error: "Failed to fetch dashboard statistics" });
               }
};
