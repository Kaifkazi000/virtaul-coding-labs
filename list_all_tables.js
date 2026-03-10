import { supabaseAdmin } from "./backend/config/supabase.js";
import fs from "fs";

async function listAllTablesReal() {
               // Best way to list tables without knowing them
               const { data: tables, error } = await supabaseAdmin.rpc('get_tables_v2');
               // If rpc fails, we can use a trick with a known system table if we have permissions
               // But since we are service_role, we can try this:
               const { data, error: e } = await supabaseAdmin.from('pg_catalog.pg_tables').select('tablename').eq('schemaname', 'public');

               let output = "";
               if (e) {
                              output += `Error listing tables: ${e.message}\n`;
                              // Fallback: try common names
                              output += "Attempting fallback table discovery...\n";
               } else {
                              output += "Tables in public schema:\n";
                              data.forEach(t => output += `- ${t.tablename}\n`);
               }

               fs.writeFileSync("all_tables.txt", output);
}

listAllTablesReal();
