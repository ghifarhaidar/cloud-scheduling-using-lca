const path = require("path");
const fs = require("fs");

const config = require("../config/config");
const { readJsonFile, writeJsonFile, deleteFilesInDir } = require("./fileHandlers");
const { runPythonScript } = require("./pythonRunner");
const { getResults } = require("./resultProcessor");
const { log } = require("console");

const LCA_PARAMS_PATH = path.join(config.CONFIGS_DIR, "LCA_parameters.json");
const lcaDir = path.join(config.MAIN_DIR, "lca");
const algorithmsDir = path.join(config.MAIN_DIR, "algorithms");
const resultsDir = path.join(config.MAIN_DIR, "results");

function parseRangeOrSingle(type, value) {
    if (type === "range") {
        const { from, to, step } = value;
        const result = [];
        for (let i = from; i <= to; i += step) {
            result.push(i);
        }
        return result;
    } else if (type === "single") {
        return [value];
    } else {
        console.error("Invalid type for L or S. Must be 'range' or 'single'.");
        process.exit(1);
    }
}

async function runExperiments() {
    console.log(`\n--- Deleting old results files ---`);
    // Delete .txt files in lca
    deleteFilesInDir(lcaDir, ".txt");

    // Delete .txt files in algorithms (if added later)
    deleteFilesInDir(algorithmsDir, ".txt");

    // Delete .json files in results
    deleteFilesInDir(resultsDir, ".json");

    const RUN_CONFIGS_PATH = path.join(config.CONFIGS_DIR, "run_configs.json");
    const RESULTS_DIR = path.join(config.MAIN_DIR, "results");
    const RESULTS_FILE = path.join(RESULTS_DIR, "results.json");

    // Make sure the results folder exists
    if (!fs.existsSync(RESULTS_DIR)) {
        fs.mkdirSync(RESULTS_DIR, { recursive: true });
    }

    let allConfigs;
    try {
        allConfigs = readJsonFile(RUN_CONFIGS_PATH);
        if (!Array.isArray(allConfigs)) {
            throw new Error("run_configs.json must contain an array of configs.");
        }
    } catch (error) {
        console.error(`❌ Failed to read run_configs.json: ${error.message}`);
        throw new Error(`Failed to read run_configs.json: ${error.message}`);
    }

    console.log(`📂 Found ${allConfigs.length} configs in run_configs.json`);

    // 📦 Collect results for ALL configs
    const allConfigsResults = [];

    for (const [index, cfg] of allConfigs.entries()) {
        console.log(`\n============================`);
        console.log(`🚀 Running config #${index + 1}/${allConfigs.length}`);
        console.log(`============================\n`);
        try {
            const resultsWithConfig = await runExperimentsForConfig(cfg);
            allConfigsResults.push(resultsWithConfig);
        } catch (err) {
            console.error(`❌ Error running experiments for config #${index + 1}: ${err.message}`);
            throw new Error(`Error running experiments for config #${index + 1}: ${err.message}`);
        }
    }

    // ✍️ Save all results to a single file
    try {
        writeJsonFile(RESULTS_FILE, allConfigsResults);
        console.log(`\n✅ All results saved to ${RESULTS_FILE}`);
    } catch (writeError) {
        console.error(`❌ Failed to write combined results: ${writeError.message}`);
        throw new Error(`Failed to write combined results: ${writeError.message}`);
    }

    console.log("\n✅ Finished running all configs.");
}

async function runExperimentsForConfig(currentConfig) {
    if (Array.isArray(currentConfig.LCA_configs)) {
        return await runExperimentsForGroupedConfig(currentConfig);
    } else {
        return await runExperimentsForSingleConfig(currentConfig);
    }
}

async function runExperimentsForGroupedConfig(currentConfig) {
    const timeStart = performance.now();
    const RUN_CONFIG_PATH = path.join(config.CONFIGS_DIR, "run_config.json");
    const allExperimentResults = [];

    const configTypes = (currentConfig.config_type === -1)
        ? Array.from({ length: 6 }, (_, i) => i + 1)
        : [currentConfig.config_type];

    for (const configType of configTypes) {
        console.log(`\n🔁 Using config_type = ${configType}`);

        try {
            await runPythonScript({
                job: 1,
                'config-type': configType,
                'cost-config-type': currentConfig.cost_config_type,
                'vm-scheduling-mode': currentConfig.vm_scheduling_mode
            });
            console.log("✅ Initial configuration generated.");
        } catch (error) {
            console.error("❌ Failed to generate initial configuration:", error.message);
            throw error;
        }

        for (const lcaConfig of currentConfig.LCA_configs) {
            const mergedConfig = {
                ...currentConfig,
                ...lcaConfig,
                config_type: configType
            };
            console.log(`\n💾lcaConfig:`, lcaConfig);

            writeJsonFile(RUN_CONFIG_PATH, mergedConfig);
            console.log(`\n💾 Saved current config to run_config.json:`, mergedConfig);

            const L_values = parseRangeOrSingle(lcaConfig.L_type, lcaConfig.L);
            const S_values = parseRangeOrSingle(lcaConfig.S_type, lcaConfig.S);

            for (const l of L_values) {
                for (const s of S_values) {
                    console.log(`\n--- Running experiment for L=${l}, S=${s}, config_type=${configType} ---`);
                    const lcaParameters = {
                        L: l,
                        S: s,
                        p_c: lcaConfig.p_c,
                        PSI1: lcaConfig.PSI1,
                        PSI2: lcaConfig.PSI2,
                        q0: lcaConfig.q0
                    };

                    try {
                        writeJsonFile(LCA_PARAMS_PATH, lcaParameters);
                        await runPythonScript();
                        const results = getResults();
                        allExperimentResults.push({ L: l, S: s, config_type: configType, results });
                    } catch (err) {
                        console.error(`Experiment failed for L=${l}, S=${s}: ${err.message}`);
                    }
                }
            }
        }
    }

    const timeEnd = performance.now();
    console.log("\n✅ Finished all grouped experiments.");
    console.log(`⏱️ Time: ${(timeEnd - timeStart).toFixed(2)} ms`);

    return {
        config: currentConfig,
        results: allExperimentResults
    };
}

// this is no more used nor maintained single config will be handled as a group of one, see runExperimentsForGroupedConfig
async function runExperimentsForSingleConfig(currentConfig) {
    const timeStart = performance.now();

    // Save the current config to run_config.json
    const RUN_CONFIG_PATH = path.join(config.CONFIGS_DIR, "run_config.json");
    writeJsonFile(RUN_CONFIG_PATH, currentConfig);
    console.log(`\n💾 Saved current config to run_config.json:`, currentConfig);

    const L_values = parseRangeOrSingle(currentConfig.L_type, currentConfig.L);
    const S_values = parseRangeOrSingle(currentConfig.S_type, currentConfig.S);

    console.log("L values to iterate:", L_values);
    console.log("S values to iterate:", S_values);

    const allExperimentResults = [];

    if (currentConfig.config_type === 0) {
        const CUSTOM_CONFIG_PATH = path.join(config.CONFIGS_DIR, "custom_config.json");
        writeJsonFile(CUSTOM_CONFIG_PATH, currentConfig.custom_config)
    }
    // Handle config_type = -1 (loop from 1 to 6)
    const configTypes = (currentConfig.config_type === -1)
        ? Array.from({ length: 6 }, (_, i) => i + 1)
        : [currentConfig.config_type];

    console.log("config type values", configTypes);
    for (const configType of configTypes) {
        console.log(`\n🔁 Using config_type = ${configType}`);

        // 1️⃣ Pre-run: Create configuration by calling Python script
        console.log("📄 Preparing configuration...");
        try {
            await runPythonScript({
                job: 1, // job 1 = generate config
                'config-type': configType,
                'cost-config-type': currentConfig.cost_config_type,
                'vm-scheduling-mode': currentConfig.vm_scheduling_mode
            });
            console.log("✅ Initial configuration generated.");
        } catch (error) {
            console.error("❌ Failed to generate initial configuration:", error.message);
            throw new Error(`Failed to generate initial configuration: ${error.message}`);
        }

        for (const l of L_values) {
            for (const s of S_values) {
                console.log(`\n--- Running experiment for L=${l}, S=${s}, config_type=${configType} ---`);

                // Update LCA_parameter.json with current L and S values
                const lcaParameters = {
                    L: l,
                    S: s,
                    p_c: currentConfig.p_c,
                    PSI1: currentConfig.PSI1,
                    PSI2: currentConfig.PSI2
                };

                try {
                    writeJsonFile(LCA_PARAMS_PATH, lcaParameters);
                    console.log("📄 Created LCA_parameter.json:", lcaParameters);
                } catch (writeError) {
                    console.error("❌ Error writing configuration files:", writeError.message);
                    continue; // Skip this iteration if write fails
                }

                try {
                    await runPythonScript(); // Execute the Python script
                    const results = getResults(); // Get results after Python script runs
                    allExperimentResults.push({ L: l, S: s, config_type: configType, results });
                } catch (runError) {
                    console.error(`Experiment failed for L=${l}, S=${s}, configType=${configType}: ${runError.message}`);
                }
            }
        }
    }

    console.log("\n--- All experiments finished for this config --- ");
    console.log("Collected results:", JSON.stringify(allExperimentResults, null, 2));

    const timeEnd = performance.now();
    console.log(`⏱️ Time taken to run all experiments: ${(timeEnd - timeStart).toFixed(2)} ms`);

    // Return the config + results to be saved in one big file
    return {
        config: currentConfig,
        results: allExperimentResults
    };
}

module.exports = {
    runExperiments,
};