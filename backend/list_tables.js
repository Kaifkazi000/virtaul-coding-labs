import { supabaseAdmin } from "./config/supabase.js";

async function listTables() {
               try {
                              const { data, error } = await supabaseAdmin.rpc('get_tables');
                              if (error) {
                                             // If RPC doesn't exist, try raw query if possible or just check specific likely names
                                             console.log("RPC get_tables failed, checking likely names...");
                                             const tables = ['students', 'studentss', 'teachers', 'subjects', 'hods', 'master_subjects', 'master_practicals'];
                                             for (const t of tables) {
                                                            const { error: err } = await supabaseAdmin.from(t).select("*").limit(0);
                                                            console.log(`Table '${t}' exists: ${!err}`);
                                             }
                              } else {
                                             console.log("Tables:", data);
                              }
               } catch (err) {
                              console.error("Failed to list tables:", err);
               }
}

listTables();
