const { supabase, createUserClient } = require('./supabase');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  supabase.auth.getUser(token).then(({ data, error }) => {
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = data.user;
    req.supabase = createUserClient(token);
    next();
  }).catch(() => res.status(401).json({ error: 'Unauthorized' }));
}

module.exports = { requireAuth };
