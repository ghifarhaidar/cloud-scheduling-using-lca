const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files (CSS)
app.use(express.static('public'));

// Routes for each page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/set-config', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'set-config.html'));
});

app.get('/edit-config', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'edit-config.html'));
});

app.get('/run', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'run.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});