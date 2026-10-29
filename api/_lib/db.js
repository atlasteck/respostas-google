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

async function getBusiness(id) {
  const { data, error } = await supabase.from('businesses').select('*').eq('id', id).single();
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

async function listSuggestions(businessId) {
  const { data, error } = await supabase.from('suggestions').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function updateSuggestionStatus(id, status) {
  const { data, error } = await supabase.from('suggestions').update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

module.exports = { createBusiness, getBusiness, listBusinesses, createSuggestion, listSuggestions, updateSuggestionStatus };
