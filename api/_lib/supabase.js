const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('Supabase env vars not set');
}

const supabaseOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
};

const supabase = createClient(supabaseUrl, supabasePublishableKey, supabaseOptions);

function createUserClient(accessToken) {
  return createClient(supabaseUrl, supabasePublishableKey, {
    ...supabaseOptions,
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
}

module.exports = { supabase, createUserClient };
