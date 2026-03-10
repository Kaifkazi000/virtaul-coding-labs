import { supabaseAdmin } from "./backend/config/supabase.js";

async function checkDb() {
    console.log("Checking master_subjects table...");
    const { data, error, count } = await supabaseAdmin
        .from("master_subjects")
        .select("*", { count: 'exact' });

    if (error) {
        console.error("DB Error:", error.message);
    } else {
        console.log("Count:", count);
        console.log("Data:", JSON.stringify(data, null, 2));
    }

    console.log("Checking master_practicals table...");
    const { count: prCount } = await supabaseAdmin
        .from("master_practicals")
        .select("*", { count: 'exact', head: true });
    
    console.log("Practicals Count:", prCount);
}

checkDb();
