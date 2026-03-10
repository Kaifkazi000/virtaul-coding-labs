import { supabaseAdmin } from "./backend/config/supabase.js";

async function inspectColumns() {
    console.log("--- master_subjects ---");
    const { data: col1, error: err1 } = await supabaseAdmin.from('master_subjects').select('*').limit(1);
    if (!err1 && col1.length > 0) {
        console.log("Columns:", Object.keys(col1[0]).join(', '));
    } else {
        console.log("Empty or Error:", err1?.message);
    }

    console.log("\n--- master_practicals ---");
    const { data: col2, error: err2 } = await supabaseAdmin.from('master_practicals').select('*').limit(1);
    if (!err2 && col2.length > 0) {
        console.log("Columns:", Object.keys(col2[0]).join(', '));
    } else {
        console.log("Empty or Error:", err2?.message);
    }
}

inspectColumns();
