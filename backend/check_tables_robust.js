import { supabaseAdmin } from "./config/supabase.js";

async function checkTables() {
               const tables = ['students', 'studentss', 'master_subjects', 'subjects', 'master_practicals', 'practicals', 'subject_allotments', 'allotments'];

               for (const t of tables) {
                              try {
                                             const { error } = await supabaseAdmin.from(t).select('*').limit(1);
                                             if (error) {
                                                            console.log(`${t}: FAILED (${error.message})`);
                                             } else {
                                                            console.log(`${t}: EXISTS`);
                                             }
                              } catch (e) {
                                             console.log(`${t}: THREW (${e.message})`);
                              }
               }
}

checkTables();
