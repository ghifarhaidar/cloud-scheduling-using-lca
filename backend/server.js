const express = require("express");
const fs = require('fs');
const path = require("path");




const config = require("./utils/config");
const { getConfigs, saveConfig } = require("./utils/fileHandlers");
const { runPythonScript } = require("./utils/pythonRunner");
const { getResults } = require("./utils/resultProcessor");
const { runExperiments } = require('./utils/runExperiments');



const app = express();
const PORT = config.PORT;
app.use(express.json());

const cors = require('cors');
app.use(cors());


app.get("/get-configs", (req, res) => {
	try {
		const configs = getConfigs();
		res.json(configs);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/run-python", async (req, res) => {
	try {
		const args = req.body; // 📝 Read JSON body
		const result = await runPythonScript(args);
		res.json(result);
	} catch (err) {
		res.status(500).json({ output: err.message });
	}
});

app.get("/get-results", (req, res) => {
	try {
		const results = getResults();
		res.json(results);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/save-config", (req, res) => {
	const configData = req.body;
	try {
		const result = saveConfig(configData);
		res.json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post('/run-experiments', async (req, res) => {
	try {
		await runExperiments(); // Call your experiments function
		res.json({ message: "Experiments completed" });
	} catch (err) {
		console.error("❌ Error during experiments:", err.message);
		res.status(500).json({ error: err.message });
	}
});

app.get('/fitness/all', (req, res) => {
	const algos = ['Cost_LCA', 'Makespan_LCA', 'MO_LCA'];
	const data = {};

	try {
		for (const algo of algos) {
			const filePath = path.join(config.MAIN_DIR, 'lca', `${algo}.txt`);
			const fileContent = fs.readFileSync(filePath, 'utf8');

			data[algo] = fileContent.trim().split('\n').map(line => {
				const [, t, f] = line.match(/t\s*=(\d+),\s*f_best=(\d+\.?\d*)/);
				return { t: Number(t), fitness: Number(f) };
			});
		}

		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Error loading fitness data' });
	}
});


// Start server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});