const { supabase, supabaseAdmin } = require('./supabase');

const clean = (v) => String(v || '').trim();

async function createBusiness(data, userId) {
  const payload = {
    user_id: userId || null,
    name: clean(data.name),
    category: clean(data.category),
    city: clean(data.city),
    service_area: clean(data.service_area),
    website: clean(data.website),
    target_audience: clean(data.target_audience),
    priority_services: clean(data.priority_services),
    notes: clean(data.notes),
  };
  const { data: business, error } = await supabase
    .from('businesses')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return business;
}

async function getBusiness(id, userId) {
  let query = supabase.from('businesses').select('*').eq('id', id);
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}

async function listBusinesses(userId) {
  let query = supabase.from('businesses').select('*').order('created_at', { ascending: false });
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function createSuggestion({ business_id, type, title, content, rationale }) {
  const { data, error } = await supabase
    .from('suggestions')
    .insert({ business_id, type, title, content, rationale })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function listSuggestions(businessId, userId) {
  const business = await getBusiness(businessId, userId);
  if (!business) return null;
  const { data, error } = await supabase.from('suggestions').select('*').eq('business_id', business.id).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function updateSuggestionStatus(id, status, userId) {
  const { data: suggestion, error } = await supabase.from('suggestions').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!suggestion) return null;
  const business = await getBusiness(suggestion.business_id, userId);
  if (!business) return null;
  const { data, error: updateError } = await supabase.from('suggestions').update({ status }).eq('id', id).eq('business_id', business.id).select().single();
  if (updateError) throw updateError;
  return data;
}

module.exports = { createBusiness, getBusiness, listBusinesses, createSuggestion, listSuggestions, updateSuggestionStatus };
