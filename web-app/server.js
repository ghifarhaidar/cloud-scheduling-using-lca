const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

// Define paths
const WEB_DIR = __dirname;  // Current web app directory
const MAIN_DIR = path.resolve(__dirname, '..');  // Parent directory (where configs/run.py live)

// Serve static files (CSS, JS) from /public
app.use(express.static(path.join(WEB_DIR, 'public')));

// Routes for HTML pages
app.get('/', (req, res) => {
	res.sendFile(path.join(WEB_DIR, 'views', 'home.html'));
});

app.get('/set-config', (req, res) => {
	res.sendFile(path.join(WEB_DIR, 'views', 'set-config.html'));
});

app.get('/edit-config', (req, res) => {
	res.sendFile(path.join(WEB_DIR, 'views', 'edit-config.html'));
});

app.get('/run', (req, res) => {
	res.sendFile(path.join(WEB_DIR, 'views', 'run.html'));
});


app.get('/get-configs', (req, res) => {
	try {
		const configs = {
			simConfig: JSON.parse(fs.readFileSync(path.join(MAIN_DIR, 'sim_config.json'))),
			simCostConfig: JSON.parse(fs.readFileSync(path.join(MAIN_DIR, 'sim_cost_config.json'))),
		};
		res.json(configs);
	} catch (err) {
		res.status(500).json({ error: `Failed to read configs: ${err.message}` });
	}
});

app.get('/run-python', (req, res) => {
	exec(
		`python3 ${path.join(MAIN_DIR, 'run.py')}`,
		{ cwd: MAIN_DIR },
		(error, stdout, stderr) => {
			if (error) {
				return res.status(500).json({ output: `Error: ${stderr || error.message}` });
			}
			res.json({ output: stdout });
		});
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});