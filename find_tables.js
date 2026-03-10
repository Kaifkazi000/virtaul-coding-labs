import { supabaseAdmin } from "./backend/config/supabase.js";

async function listAllTables() {
               // This is a common way to list tables in Postgres via Supabase
               const { data, error } = await supabaseAdmin.from('pg_tables').select('tablename').eq('schemaname', 'public');
               if (error) {
                              // If pg_tables is not accessible directly, try another way
                              console.log("pg_tables access failed, trying another way...");
                              const { data: d2, error: e2 } = await supabaseAdmin.rpc('get_tables');
                              if (e2) {
                                             console.log("RPC get_tables failed. Trying direct select on common names...");
                                             const tables = ['students', 'studentss', 'teachers', 'subjects', 'allotments', 'practicals', 'master_practicals'];
                                             for (const t of tables) {
                                                            const { error: e } = await supabaseAdmin.from(t).select('*').limit(1);
                                                            console.log(`Table '${t}':`, e ? `MISSING (${e.message})` : "EXISTS");
                                             }
                              } else {
                                             console.log("Tables from RPC:", d2);
                              }
               } else {
                              console.log("Tables in public schema:", data.map(t => t.tablename));
               }
}

listAllTables();
