const express = require("express");
const path = require("path");

const config = require("./utils/config");
const { getConfigs, saveConfig } = require("./utils/fileHandlers");
const { runPythonScript } = require("./utils/pythonRunner");
const { getResults } = require("./utils/resultProcessor");

const app = express();
const PORT = config.PORT;
app.use(express.json());

// Serve static files (CSS, JS) from /public
app.use(express.static(path.join(config.WEB_DIR, "public")));

// Routes for HTML pages
app.get("/", (req, res) => {
	res.sendFile(path.join(config.WEB_DIR, "views", "home.html"));
});

app.get("/set-config", (req, res) => {
	res.sendFile(path.join(config.WEB_DIR, "views", "set-config.html"));
});

app.get("/edit-config", (req, res) => {
	res.sendFile(path.join(config.WEB_DIR, "views", "edit-config.html"));
});

app.get("/test", (req, res) => {
	res.sendFile(path.join(config.WEB_DIR, "views", "test.html"));
});

app.get("/run", (req, res) => {
	res.sendFile(path.join(config.WEB_DIR, "views", "run.html"));
});

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

// Start server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});