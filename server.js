const express = require('express');
const path = require('path');
const app = require('./api/index');

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota não encontrada' });
  }
  return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`Respostas Google em http://localhost:${port}`);
  });
}

module.exports = app;
