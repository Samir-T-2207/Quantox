// Importiere Express
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware für JSON-Parsing, falls du JSON-Daten empfängst
app.use(express.json());

// Eine einfache Route für die Basis-URL
app.get('/', (req, res) => {
  res.send('Hello, Messenger is running!');
});

// Beispiel-API-Route (kann später mit echter Logik erweitert werden)
app.get('/api/messages', (req, res) => {
  res.json({ message: 'This is a sample message!' });
});

// Health Check-Route für Render oder Monitoring-Tools
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Starte den Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

