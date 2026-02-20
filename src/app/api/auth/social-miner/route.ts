import { createClient } from '@supabase/supabase-js';

// Helper to get admin client safely during build
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export async function POST(req: Request) {
  try {
    const { session } = await req.json();
    const providerToken = session?.provider_token;
    const userId = session?.user?.id;

    if (!providerToken || !userId) {
      return new Response(JSON.stringify({ error: 'Missing token or user ID' }), { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return new Response(JSON.stringify({ error: 'Supabase not configured' }), { status: 500 });
    }

    // Process in background
    processContacts(supabaseAdmin, userId, providerToken).catch(err => console.error('Social Miner Background Error:', err));

    return new Response(JSON.stringify({ success: true, message: 'Sync started in background' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

async function processContacts(supabaseAdmin: any, userId: string, token: string) {
  try {
    // ... logic remains the same but uses passed supabaseAdmin ...
    const response = await fetch(
      'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers',
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!response.ok) throw new Error(`Google API Error: ${response.statusText}`);

    const data = await response.json();
    const connections = data.connections || [];

    const contactsToInsert = [];
    let hasProKeywords = false;
    const proKeywords = ['mecanic', 'samsar', 'agence', 'immobilier', 'garage', 'vendeur'];

    for (const person of connections) {
      const name = person.names?.[0]?.displayName || '';
      const email = person.emailAddresses?.[0]?.value;
      const phone = person.phoneNumbers?.[0]?.value;

      if (email || phone) {
        contactsToInsert.push({
          user_id: userId,
          contact_name: name,
          contact_email: email,
          contact_phone: phone,
          source: 'google_contacts'
        });

        // Smart Profiling Check
        if (!hasProKeywords) {
          const lowerName = name.toLowerCase();
          if (proKeywords.some(kw => lowerName.includes(lowerName))) {
            hasProKeywords = true;
          }
        }
      }
    }

    // 2. Insert into user_networks
    if (contactsToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('user_networks')
        .upsert(contactsToInsert, { onConflict: 'user_id, contact_email' });
      
      if (insertError) console.error('Supabase Insert Error:', insertError);
    }

    // 3. Update User Profile Tags
    const tags = [];
    if (hasProKeywords) tags.push('Professional Networker');
    if (contactsToInsert.length > 50) tags.push('High Connection');

    await supabaseAdmin
      .from('profiles')
      .update({ 
        profiling_tags: tags,
        last_sync_contacts: new Date().toISOString()
      })
      .eq('id', userId);

  } catch (err) {
    console.error('Process Contacts Failure:', err);
  }
}
