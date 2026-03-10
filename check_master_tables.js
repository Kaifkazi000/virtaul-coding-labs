import { supabaseAdmin } from "./backend/config/supabase.js";

async function checkMasterTables() {
    console.log("Checking for master_subjects...");
    const { data: subjects, error: subjectError } = await supabaseAdmin.from('master_subjects').select('*').limit(1);
    
    if (subjectError) {
        console.log("❌ master_subjects table issue:", subjectError.message);
    } else {
        console.log("✅ master_subjects table exists.");
    }

    console.log("Checking for master_practicals...");
    const { data: practicals, error: practicalError } = await supabaseAdmin.from('master_practicals').select('*').limit(1);
    
    if (practicalError) {
        console.log("❌ master_practicals table issue:", practicalError.message);
    } else {
        console.log("✅ master_practicals table exists.");
    }
}

checkMasterTables();
