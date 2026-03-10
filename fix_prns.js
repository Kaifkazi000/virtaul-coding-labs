import { supabaseAdmin } from "./backend/config/supabase.js";

async function fixPrns() {
               console.log("--- PRN FIX START ---");

               // 1. Fetch all students with scientific notation in PRN
               const { data: students, error } = await supabaseAdmin
                              .from('students')
                              .select('id, prn, full_name');

               if (error) {
                              console.error("Fetch Error:", error.message);
                              return;
               }

               const scientificStudents = students.filter(s => String(s.prn).includes('E+'));
               console.log(`Found ${scientificStudents.length} students with scientific notation PRNs.`);

               for (const student of scientificStudents) {
                              // Convert scientific notation string to number and then to back to plain string
                              // Note: This might lose precision if truncated, but for PRNs it usually works if they are < 16 digits
                              const numericPrn = Number(student.prn).toLocaleString('fullwide', { useGrouping: false });
                              console.log(`Fixing ${student.full_name}: ${student.prn} -> ${numericPrn}`);

                              const { error: updateError } = await supabaseAdmin
                                             .from('students')
                                             .update({ prn: numericPrn })
                                             .eq('id', student.id);

                              if (updateError) {
                                             console.error(`Failed to update ${student.full_name}:`, updateError.message);
                              }
               }

               console.log("--- PRN FIX END ---");
}

fixPrns();
