import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { session } = await req.json();
    const providerToken = session?.provider_token;
    const userId = session?.user?.id;

    if (!providerToken || !userId) {
      return new Response(JSON.stringify({ error: 'Missing token or user ID' }), { status: 400 });
    }

    // Process in background using a separate promise (don't await fully before responding)
    processContacts(userId, providerToken).catch(err => console.error('Social Miner Background Error:', err));

    return new Response(JSON.stringify({ success: true, message: 'Sync started in background' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

async function processContacts(userId: string, token: string) {
  try {
    // 1. Fetch contacts from Google People API
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
