const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const { getConfigs, getRunConfigs, saveConfig, getAllResults, resetRunConfigs, saveAlgorithms, getAllAlgorithms, getFitnessData } = require('../utils/fileHandlers');
const { getResults } = require('../utils/resultProcessor');
const { runExperiments } = require('../utils/runExperiments');
const asyncHandler = require('../middleware/asyncHandler');


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


// Reset configurations
router.post('/run-configs/reset', asyncHandler(async (req, res) => {
    const configs = resetRunConfigs();
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

// Get all algorithms 
router.get('/all-algorithms', asyncHandler(async (req, res) => {
    const results = getAllAlgorithms();
    res.json({
        success: true,
        data: results
    });
}));

// save run algorithms
router.post('/run-algorithms', asyncHandler(async (req, res) => {
    await saveAlgorithms(req.body);
    res.json({
        success: true,
        message: "Run algorithms saved"
    });
}));

// Get fitness data for all algorithms from txt files in lca or algorithms folders
router.get('/fitness/all', asyncHandler(async (req, res) => {
    data = getFitnessData();

    res.json({
        data
    });
}));

module.exports = router;

