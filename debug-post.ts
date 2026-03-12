
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugPost() {
  console.log("Searching for post related to 'afribaba'...");
  
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, slug, title, status')
    .or('slug.ilike.%afribaba%,title.ilike.%afribaba%');

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Found posts:", JSON.stringify(posts, null, 2));
}

debugPost();
