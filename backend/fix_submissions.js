import { supabaseAdmin } from './config/supabase.js';

async function fix() {
  console.log('Fetching students mapping...');
  const { data: students, error } = await supabaseAdmin.from('students').select('id, auth_user_id');
  if (error || !students) return console.error('No students found or error:', error);
  
  let updated = 0;
  for (const st of students) {
    // Attempt to update any submissions that mistakenly saved the auth_user_id
    const { data: updatedRows, error: updateError } = await supabaseAdmin
      .from('submissions')
      .update({ student_id: st.id })
      .eq('student_id', st.auth_user_id)
      .select('id');
      
    if (updateError) {
       console.error(`Error updating for ${st.id}:`, updateError);
    } else if (updatedRows && updatedRows.length > 0) {
       console.log(`Updated ${updatedRows.length} rows for student ${st.id}`);
       updated += updatedRows.length;
    }
  }
  
  console.log(`\nSuccessfully fixed ${updated} orphaned submissions.`);
  process.exit(0);
}

fix();
