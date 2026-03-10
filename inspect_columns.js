import { supabaseAdmin } from "./backend/config/supabase.js";

async function inspectColumns() {
    console.log("--- master_subjects ---");
    const { data: col1, error: err1 } = await supabaseAdmin.from('master_subjects').select('*').limit(1);
    if (!err1 && col1.length > 0) {
        console.log("Found record in master_subjects:", Object.keys(col1[0]));
    } else if (err1) {
        console.log("Error master_subjects:", err1.message);
    } else {
        console.log("master_subjects is empty, cannot easily inspect columns via select *");
    }

    console.log("\n--- master_practicals ---");
    const { data: col2, error: err2 } = await supabaseAdmin.from('master_practicals').select('*').limit(1);
    if (!err2 && col2.length > 0) {
        console.log("Found record in master_practicals:", Object.keys(col2[0]));
    } else if (err2) {
        console.log("Error master_practicals:", err2.message);
    } else {
        console.log("master_practicals is empty.");
    }
}

inspectColumns();
