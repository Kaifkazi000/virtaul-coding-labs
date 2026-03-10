import { supabaseAdmin } from "./backend/config/supabase.js";
import fs from "fs";

async function listAllTables() {
               const tables = ['students', 'studentss', 'teachers', 'subjects', 'allotments', 'practicals', 'master_practicals'];
               let output = "--- TABLE SCAN START ---\n";
               for (const t of tables) {
                              const { error } = await supabaseAdmin.from(t).select('*').limit(1);
                              if (error) {
                                             output += `[ABSENT]  ${t.padEnd(15)} : ${error.message}\n`;
                              } else {
                                             output += `[PRESENT] ${t.padEnd(15)} : OK\n`;
                              }
               }
               output += "--- TABLE SCAN END ---\n";
               fs.writeFileSync("scan_results.txt", output);
               console.log("Scan written to scan_results.txt");
}

listAllTables();
