import { supabase } from "../config/supabase.js";

export const updatePassword = async (req, res) => {
               try {
                              const { newPassword } = req.body;
                              const authHeader = req.headers.authorization;

                              if (!authHeader) {
                                             return res.status(401).json({ message: "No token provided" });
                              }

                              const token = authHeader.split(" ")[1];

                              // Supabase update user with the token
                              const { data: { user }, error } = await supabase.auth.updateUser({
                                             password: newPassword
                              });

                              if (error) {
                                             // Note: Supabase might require the user to be logged in with the token
                                             // we might need to set the session or use the client with the token
                                             return res.status(400).json({ message: error.message });
                              }

                              return res.status(200).json({
                                             message: "Password updated successfully",
                                             user: user
                              });
               } catch (err) {
                              console.error("Update Password Error:", err);
                              return res.status(500).json({ message: "Internal server error" });
               }
};
