import { supabaseAdmin } from "./config/supabase.js";

async function checkStudents() {
               try {
                              console.log("--- START CHECK ---");
                              const { count: sCount } = await supabaseAdmin.from("students").select("*", { count: 'exact', head: true });
                              console.log("COUNT_STUDENTS:" + sCount);

                              const { count: ssCount } = await supabaseAdmin.from("studentss").select("*", { count: 'exact', head: true });
                              console.log("COUNT_STUDENTSS:" + ssCount);

                              const { data: sData } = await supabaseAdmin.from("students").select("name, email").limit(2);
                              console.log("SAMPLE_STUDENTS:" + JSON.stringify(sData));

                              const { data: ssData } = await supabaseAdmin.from("studentss").select("name, email").limit(2);
                              console.log("SAMPLE_STUDENTSS:" + JSON.stringify(ssData));
                              console.log("--- END CHECK ---");

               } catch (err) {
                              console.error("Check failed:", err);
               }
}

checkStudents();
