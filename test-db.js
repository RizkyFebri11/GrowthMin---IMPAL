import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xgrieapkwrawwqnvalhr.supabase.co',
  'sb_publishable_Fhb6pWO7EFocuHKCESA8Jg_6jRth87D'
);

async function test() {
  const { data, error } = await supabase.from('users').select('*');
  console.log("DATA:", data);
  console.log("ERROR:", error);
}
test();
