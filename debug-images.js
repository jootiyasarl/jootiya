const fs = require('fs');
const text = fs.readFileSync('.env.local', 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of text.split(/\r?\n/)) {
  if (!line || line.trim().startsWith('#')) continue;
  const i = line.indexOf('=');
  if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}

const { createClient } = require('@supabase/supabase-js');
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  const { data, error } = await s
    .from('ads')
    .select('id,title,image_urls,status,created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(15);

  if (error) {
    console.error(error);
    process.exit(1);
  }

  for (const ad of data) {
    const hasImages = Array.isArray(ad.image_urls) && ad.image_urls.length > 0;
    const firstUrl = hasImages ? ad.image_urls[0] : 'NONE';
    console.log(`${ad.title} | images: ${hasImages ? 'YES' : 'NO'} | ${firstUrl.substring(0, 80)}...`);
  }

  process.exit(0);
})();
