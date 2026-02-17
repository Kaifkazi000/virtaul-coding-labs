import { supabaseAdmin } from "./config/supabase.js";

async function checkSchema() {
               try {
                              console.log("--- SCHEMA CHECK ---");
                              const { data: sData } = await supabaseAdmin.from("students").select("*").limit(1);
                              console.log("COLUMNS_STUDENTS:" + Object.keys(sData[0] || {}).join(", "));

                              const { data: ssData } = await supabaseAdmin.from("studentss").select("*").limit(1);
                              // Since studentss is empty, we might not get keys from select.
                              // Let's try to insert a dummy and rollback or just check if we can get info another way.
                              console.log("COLUMNS_STUDENTSS (if any):" + Object.keys(ssData[0] || {}).join(", "));
                              console.log("--- END SCHEMA ---");

               } catch (err) {
                              console.error("Check failed:", err);
               }
}

checkSchema();
