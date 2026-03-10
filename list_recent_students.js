import { supabaseAdmin } from "./backend/config/supabase.js";

async function listStudents() {
               const { data, error } = await supabaseAdmin.from('students').select('full_name, email, prn').order('created_at', { ascending: false }).limit(5);
               if (error) {
                              console.error(error);
                              return;
               }
               console.log(JSON.stringify(data, null, 2));
}

listStudents();
