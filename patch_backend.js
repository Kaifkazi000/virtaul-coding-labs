const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend/controllers/hod.controller.js');
let content = fs.readFileSync(filePath, 'utf8');

const newManualReg = `export const manualRegisterStudent = async (req, res) => {
               try {
                               const { name, email, prn, roll, semester, batch_name, academic_year } = req.body;

                               // 1. Create or Find Auth User
                               let targetUserId = null;
                               const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                                              email,
                                              password: prn, // Default password is PRN
                                              email_confirm: true,
                                              user_metadata: { role: 'student' }
                               });

                               if (authError) {
                                              if (authError.message.includes("already registered") || authError.status === 422 || authError.status === 400) {
                                                             const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
                                                             const existingUser = listData?.users?.find(u => u.email?.toLowerCase() === email?.toLowerCase());
                                                             if (existingUser) {
                                                                            targetUserId = existingUser.id;
                                                             } else {
                                                                            throw new Error(\`Profile sync failed: \${authError.message}\`);
                                                             }
                                              } else {
                                                             throw authError;
                                              }
                               } else {
                                              targetUserId = authUser.user.id;
                               }

                               // 2. Upsert Student Profile
                               const { data: newStudent, error: profileError } = await supabaseAdmin
                                              .from("students")
                                              .upsert([{
                                                             auth_user_id: targetUserId,
                                                             full_name: name,
                                                             email,
                                                             prn,
                                                             roll_no: roll || null,
                                                             semester: semester,
                                                             batch_name: batch_name,
                                                             admission_year: academic_year,
                                                             department: 'CSE',
                                                             status: 'active'
                                              }], { onConflict: 'prn' })
                                              .select()
                                              .single();

                               if (profileError) throw profileError;

                               res.status(201).json({ 
                                              message: "Student registered successfully", 
                                              student: newStudent 
                               });
               } catch (err) {
                               console.error("[ManualReg] Error:", err.message);
                               res.status(500).json({ error: err.message });
               }
};`;

// Use a regex that matches the old function signature and body
content = content.replace(
               /export const manualRegisterStudent = async \(req, res\) => \{[\s\S]*?\n\};/,
               newManualReg
);

fs.writeFileSync(filePath, content);
console.log('Backend Patched successfully');
