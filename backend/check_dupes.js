
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDuplicates() {
  console.log("Checking for duplicate active allotments...");
  
  const { data, error } = await supabaseAdmin
    .from('allotments')
    .select('subject_id, semester, batch_name, id, is_active')
    .eq('is_active', true);

  if (error) {
    console.error("Error fetching allotments:", error);
    return;
  }

  const map = new Map();
  const duplicates = [];

  data.forEach(allot => {
    const key = `${allot.subject_id}_${allot.semester}_${allot.batch_name}`;
    if (map.has(key)) {
      duplicates.push({ key, ids: [map.get(key).id, allot.id] });
    } else {
      map.set(key, allot);
    }
  });

  if (duplicates.length > 0) {
    console.log("Found duplicate active allotments:");
    console.log(JSON.stringify(duplicates, null, 2));
  } else {
    console.log("No duplicate active allotments found.");
  }
}

checkDuplicates();
