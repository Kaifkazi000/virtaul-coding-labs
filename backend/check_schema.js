
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log("Checking allotments table schema...");
  
  // Querying pg_attribute and pg_attrdef for defaults
  const { data, error } = await supabaseAdmin.rpc('get_table_schema', { table_name: 'allotments' });
  
  if (error) {
    // Fallback: try to insert a record without is_active and see what happens (not recommended if it's production)
    // Better: Query information_schema if RPC is not available
    const { data: cols, error: colError } = await supabaseAdmin.from('allotments').select('*').limit(1);
    if (colError) {
       console.error("Error querying allotments:", colError);
       return;
    }
    console.log("Columns found in allotments:", Object.keys(cols[0] || {}));
    console.log("To see defaults, I'll try to fetch one record and see if is_active exists.");
    console.log("Record sample:", cols[0]);
  } else {
    console.log("Schema data:", data);
  }
}

checkSchema();
