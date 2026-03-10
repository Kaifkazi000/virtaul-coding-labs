import { supabase, supabaseAdmin } from "./backend/config/supabase.js";

async function debugPrnLogin() {
               const identifier = "202303365449"; // PRN for Soha de@gmail.com
               const password = identifier;

               console.log(`--- DEBUG PRN LOGIN ---`);
               console.log(`Identifier: ${identifier}`);

               try {
                              // 1. Resolve PRN to Email
                              const { data: student, error: studentError } = await supabaseAdmin
                                             .from("students")
                                             .select("email, full_name, auth_user_id")
                                             .eq("prn", identifier)
                                             .single();

                              if (studentError || !student) {
                                             console.error(`❌ PRN resolution failed:`, studentError?.message);
                                             return;
                              }

                              console.log(`✅ Resolved: ${student.full_name} (${student.email})`);
                              console.log(`ℹ️ Auth User ID in students table: ${student.auth_user_id}`);

                              // 2. Check Auth User Status
                              const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(student.auth_user_id);
                              if (userError) {
                                             console.error(`❌ User not found in Supabase Auth:`, userError.message);

                                             // Try searching by email
                                             const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
                                             const foundUser = listData.users.find(u => u.email === student.email);
                                             if (foundUser) {
                                                            console.log(`✅ Found user by email in Auth. Correct ID should be: ${foundUser.id}`);
                                                            if (foundUser.id !== student.auth_user_id) {
                                                                           console.log(`⚠️ ID MISMATCH detected! Updating students table...`);
                                                                           await supabaseAdmin.from('students').update({ auth_user_id: foundUser.id }).eq('id', student.id);
                                                            }
                                             }
                              } else {
                                             console.log(`✅ User exists in Supabase Auth.`);
                              }

                              // 3. Attempt Login
                              console.log(`--- ATTEMPTING LOGIN ---`);
                              const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                                             email: student.email,
                                             password: password
                              });

                              if (loginError) {
                                             console.error(`❌ Login failed:`, loginError.message);

                                             console.log(`--- ATTEMPTING PASSWORD RESET ---`);
                                             const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(student.auth_user_id, {
                                                            password: password
                                             });

                                             if (resetError) {
                                                            console.error(`❌ Reset failed:`, resetError.message);
                                             } else {
                                                            console.log(`✅ Password reset to ${password}. Trying login again...`);
                                                            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                                                                           email: student.email,
                                                                           password: password
                                                            });
                                                            if (retryError) {
                                                                           console.error(`❌ Still failed:`, retryError.message);
                                                            } else {
                                                                           console.log(`🎉 SUCCESS after reset!`);
                                                            }
                                             }
                              } else {
                                             console.log(`🎉 Login SUCCESS!`);
                              }

               } catch (err) {
                              console.error(`💥 Crash:`, err.message);
               }
}

debugPrnLogin();
