import { supabaseAdmin } from "../config/supabase.js";

/**
 * CLI Script to create the initial HOD
 * Usage: node scripts/create_hod.js <email> <password> <name>
 */

const args = process.argv.slice(2);
if (args.length < 3) {
               console.log("Usage: node scripts/create_hod.js <email> <password> <name>");
               process.exit(1);
}

const [email, password, name] = args;

async function createHOD() {
               console.log(`🚀 Creating HOD: ${name} (${email})...`);

               try {
                              // 1. Create Auth User
                              const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                                             email,
                                             password,
                                             email_confirm: true,
                                             user_metadata: { role: 'hod' }
                              });

                              if (authError) throw authError;

                              const authUserId = authUser.user.id;
                              console.log(`✅ Auth user created: ${authUserId}`);

                              // 2. Create HOD Profile
                              const { error: profileError } = await supabaseAdmin
                                             .from("hods")
                                             .insert([
                                                            {
                                                                           auth_user_id: authUserId,
                                                                           name,
                                                                           email,
                                                                           department: "Computer Science", // Default
                                                                           role: "hod"
                                                            }
                                             ]);

                              if (profileError) throw profileError;

                              console.log("🎉 HOD successfully registered in database!");
                              console.log("You can now log in at /HOD using these credentials.");

               } catch (err) {
                              console.error("❌ Error creating HOD:", err.message);
               }
}

createHOD();
