const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const { getConfigs, getRunConfigs, saveConfig, getAllResults } = require('../utils/fileHandlers');
const { runPythonScript } = require('../utils/pythonRunner');
const { getResults } = require('../utils/resultProcessor');
const { runExperiments } = require('../utils/runExperiments');
const asyncHandler = require('../middleware/asyncHandler');
const { log } = require('console');
// const { validate, schemas } = require('../middleware/validation');



// Get configurations
router.get('/configs', asyncHandler(async (req, res) => {
    const configs = getConfigs();
    res.json({
        success: true,
        data: configs
    });
}));

// Get configurations
router.get('/run-configs', asyncHandler(async (req, res) => {
    const configs = getRunConfigs();
    res.json({
        success: true,
        data: configs
    });
}));

// Save configuration
router.post('/config', asyncHandler(async (req, res) => {
    const result = saveConfig(req.body);
    res.json({
        success: true,
        data: result
    });
}));

// Run Python script
router.post('/run-python', asyncHandler(async (req, res) => {
    const result = await runPythonScript(req.body);
    res.json({
        success: true,
        data: result
    });
}));

// Get results
router.get('/results', asyncHandler(async (req, res) => {
    const results = getResults();
    res.json({
        success: true,
        data: results
    });
}));

// Get all results
router.get('/all-results', asyncHandler(async (req, res) => {
    const results = getAllResults();
    res.json({
        success: true,
        data: results
    });
}));

// Run experiments
router.post('/experiments', asyncHandler(async (req, res) => {
    await runExperiments();
    res.json({
        success: true,
        message: "Experiments completed"
    });
}));

// Get fitness data for all algorithms from txt files in lca or algorithms folders
router.get('/fitness/all', asyncHandler(async (req, res) => {
    const folders = ['lca', 'algorithms'];
    const data = {};

    for (const folder of folders) {
        const folderPath = path.join(process.env.MAIN_DIR, folder);

        // Check if folder exists
        if (!fs.existsSync(folderPath)) {
            continue;
        }

        // Get all txt files in the folder
        const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.txt'));

        for (const file of files) {
            const algoName = path.basename(file, '.txt');
            const filePath = path.join(folderPath, file);

            try {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                data[algoName] = fileContent.trim().split('\n').map(line => {
                    const match = line.match(/t\s*=(\d+),\s*f_best=(\d+\.?\d*)/);
                    if (match) {
                        const [, t, f] = match;
                        return { t: Number(t), fitness: Number(f) };
                    }
                    return null;
                }).filter(Boolean);
            } catch (error) {
                console.error(`Error reading file ${filePath}:`, error);
                data[algoName] = [];
            }
        }
    }

    res.json({
        data
    });
}));

module.exports = router;

