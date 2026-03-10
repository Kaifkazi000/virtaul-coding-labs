import { supabaseAdmin } from "./backend/config/supabase.js";

async function listAllTables() {
               const tables = ['students', 'studentss', 'teachers', 'subjects', 'allotments', 'practicals', 'master_practicals'];
               console.log("--- TABLE SCAN START ---");
               for (const t of tables) {
                              const { error } = await supabaseAdmin.from(t).select('*').limit(1);
                              if (error) {
                                             console.log(`[ABSENT]  ${t.padEnd(15)} : ${error.message}`);
                              } else {
                                             console.log(`[PRESENT] ${t.padEnd(15)} : OK`);
                              }
               }
               console.log("--- TABLE SCAN END ---");
}

listAllTables();
