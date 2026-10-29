const express = require('express');
const { createBusiness, getBusiness, listBusinesses, createSuggestion, listSuggestions, updateSuggestionStatus } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');
const { analyzeBusiness } = require('../agent');

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'google-profile-agent' }));

app.get('/api/empresas', requireAuth, async (req, res) => {
  try {
    const businesses = await listBusinesses(req.user.id);
    res.json(businesses);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/empresas', requireAuth, async (req, res) => {
  try {
    const business = await createBusiness(req.body || {}, req.user.id);
    const analysis = analyzeBusiness(business);
    await createSuggestion({
      business_id: business.id,
      type: 'description',
      title: 'Descrição sugerida',
      content: analysis.description,
      rationale: 'Gerada com os dados informados.'
    });
    await createSuggestion({
      business_id: business.id,
      type: 'keywords',
      title: 'Palavras-chave sugeridas',
      content: analysis.keywords.join(', '),
      rationale: 'Derivadas dos serviços, categoria e região.'
    });
    for (const x of analysis.recommendations) {
      await createSuggestion({
        business_id: business.id,
        type: 'recommendation',
        title: x.item,
        content: x.action,
        rationale: 'Prioridade: ' + x.priority
      });
    }
    const suggestions = await listSuggestions(business.id);
    res.status(201).json({ business, analysis, suggestions });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/empresas/:id/analise', requireAuth, async (req, res) => {
  try {
    const b = await getBusiness(req.params.id);
    if (!b) return res.status(404).json({ error: 'Empresa não encontrada' });
    const analysis = analyzeBusiness(b);
    const suggestions = await listSuggestions(b.id);
    res.json({ business: b, analysis, suggestions });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

app.get('/api/empresas/:id/sugestoes', requireAuth, async (req, res) => {
  try {
    const suggestions = await listSuggestions(req.params.id);
    res.json(suggestions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/sugestoes/:id', requireAuth, async (req, res) => {
  try {
    const status = req.body?.status;
    if (!['pending','approved','rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    const suggestion = await updateSuggestionStatus(req.params.id, status);
    res.json(suggestion);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = app;
