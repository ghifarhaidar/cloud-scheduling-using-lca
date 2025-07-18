const fs = require("fs");
const path = require("path");

const { MAIN_DIR, RESULTS_DIR, CONFIGS_DIR } = require("../config/config");

const readJsonFile = (filePath) => {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        throw new Error(`Failed to read ${path.basename(filePath)}: ${error.message}`);
    }
};

const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return { message: "Config saved successfully" };
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        throw new Error(`Failed to write ${path.basename(filePath)}: ${error.message}`);
    }
};

const getConfigs = () => {
    const simConfigPath = path.join(CONFIGS_DIR, "sim_config.json");
    const simCostConfigPath = path.join(CONFIGS_DIR, "sim_cost_config.json");

    const simConfig = readJsonFile(simConfigPath);
    const simCostConfig = readJsonFile(simCostConfigPath);

    return {
        simConfig,
        simCostConfig,
    };
};

const getRunConfigs = () => {
    const runConfigsPath = path.join(CONFIGS_DIR, "run_configs.json");
    const runConfigs = readJsonFile(runConfigsPath);

    return {
        runConfigs
    };
};

const resetRunConfigs = () => {
    const runConfigsPath = path.join(CONFIGS_DIR, "run_configs.json");
    const runConfigs = [];
    return writeJsonFile(runConfigsPath, runConfigs);
}

const saveConfig = (configData) => {
    const filePath = path.join(CONFIGS_DIR, "run_configs.json");
    let configs = [];

    // Try reading existing configs
    try {
        configs = readJsonFile(filePath);
        if (!Array.isArray(configs)) {
            // If the existing data isn't an array, wrap it
            configs = [configs];
        }
    } catch (error) {
        // If file doesn't exist or is invalid, start fresh
        configs = [];
    }

    // Add the new config
    configs.push(configData);

    // Write back the updated list
    return writeJsonFile(filePath, configs);
};

function deleteFilesInDir(dir, extension) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith(extension)) {
            const filePath = path.join(dir, file);
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted: ${filePath}`);
        }
    }
}
const getAllResults = () => {
    const resultsPath = path.join(RESULTS_DIR, "results.json");
    const results = readJsonFile(resultsPath);

    return {
        results
    };
}

const getAllAlgorithms = () => {
    const allAlgorithmsPath = path.join(CONFIGS_DIR, "all_algorithms.json");
    const allAlgorithms = readJsonFile(allAlgorithmsPath);

    return {
        allAlgorithms
    };
}

const saveAlgorithms = (algorithmsData) => {
    const AlgorithmsPath = path.join(CONFIGS_DIR, "algorithms.json");
    return writeJsonFile(AlgorithmsPath, algorithmsData);

}

module.exports = {
    getConfigs,
    getRunConfigs,
    saveConfig,
    readJsonFile,
    writeJsonFile,
    deleteFilesInDir,
    getAllResults,
    resetRunConfigs,
    saveAlgorithms,
    getAllAlgorithms,
};