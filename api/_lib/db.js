const { supabase } = require('./supabase');

const clean = (value) => String(value || '').trim();

async function createBusiness(data, userId, client = supabase) {
  const payload = {
    user_id: userId,
    name: clean(data.name),
    category: clean(data.category),
    city: clean(data.city),
    service_area: clean(data.service_area),
    website: clean(data.website),
    target_audience: clean(data.target_audience),
    priority_services: clean(data.priority_services),
    notes: clean(data.notes),
  };

  const { data: business, error } = await client
    .from('businesses')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return business;
}

async function getBusiness(id, userId, client = supabase) {
  let query = client.from('businesses').select('*').eq('id', id);
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}

async function listBusinesses(userId, client = supabase) {
  let query = client.from('businesses').select('*').order('created_at', { ascending: false });
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function createSuggestion(
  { business_id, user_id, type, title, content, rationale },
  client = supabase
) {
  const { data, error } = await client
    .from('suggestions')
    .insert({ business_id, user_id, type, title, content, rationale })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function listSuggestions(businessId, userId, client = supabase) {
  const business = await getBusiness(businessId, userId, client);
  if (!business) return null;
  const { data, error } = await client
    .from('suggestions')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function updateSuggestionStatus(id, status, userId, client = supabase) {
  const { data: suggestion, error } = await client
    .from('suggestions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!suggestion) return null;

  const business = await getBusiness(suggestion.business_id, userId, client);
  if (!business) return null;

  const { data, error: updateError } = await client
    .from('suggestions')
    .update({ status })
    .eq('id', id)
    .eq('business_id', business.id)
    .select()
    .single();
  if (updateError) throw updateError;
  return data;
}

module.exports = {
  createBusiness,
  getBusiness,
  listBusinesses,
  createSuggestion,
  listSuggestions,
  updateSuggestionStatus
};
