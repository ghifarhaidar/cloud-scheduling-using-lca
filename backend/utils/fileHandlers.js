const fs = require("fs");
const path = require("path");

const { MAIN_DIR, RESULTS_DIR } = require("./config");

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
    const simConfigPath = path.join(MAIN_DIR, "sim_config.json");
    const simCostConfigPath = path.join(MAIN_DIR, "sim_cost_config.json");

    const simConfig = readJsonFile(simConfigPath);
    const simCostConfig = readJsonFile(simCostConfigPath);

    return {
        simConfig,
        simCostConfig,
    };
};

const saveConfig = (configData) => {
    const filePath = path.join(MAIN_DIR, "run_config.json");
    return writeJsonFile(filePath, configData);
};

module.exports = {
    getConfigs,
    saveConfig,
    readJsonFile,
    writeJsonFile,
};