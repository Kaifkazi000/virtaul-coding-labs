import { supabaseAdmin } from "./config/supabase.js";

async function dumpSchema() {
               const tables = ['students', 'studentss', 'teachers', 'master_subjects', 'subject_allotments'];

               for (const table of tables) {
                              console.log(`--- Schema for ${table} ---`);
                              const { data, error } = await supabaseAdmin
                                             .from(table)
                                             .select('*')
                                             .limit(1);

                              if (error) {
                                             console.error(`Error fetching ${table}:`, error.message);
                              } else if (data && data.length > 0) {
                                             console.log(Object.keys(data[0]));
                              } else {
                                             console.log("No data found to infer columns.");
                              }
               }
}

dumpSchema();
