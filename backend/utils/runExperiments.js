const path = require("path");

const config = require("../config/config");
const { readJsonFile, writeJsonFile } = require("./fileHandlers");
const { runPythonScript } = require("./pythonRunner");
const { getResults } = require("./resultProcessor");

const RUN_CONFIG_PATH = path.join(config.MAIN_DIR, "run_config.json");
const LCA_PARAMS_PATH = path.join(config.MAIN_DIR, "LCA_parameters.json");

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
    const timeStart = performance.now();
    const initialConfig = readJsonFile(RUN_CONFIG_PATH);

    const L_values = parseRangeOrSingle(initialConfig.L_type, initialConfig.L);
    const S_values = parseRangeOrSingle(initialConfig.S_type, initialConfig.S);

    console.log("L values to iterate:", L_values);
    console.log("S values to iterate:", S_values);

    const allExperimentResults = [];

    // Handle config_type = -1 (loop from 1 to 9)
    const configTypes = (initialConfig.config_type === -1)
        ? Array.from({ length: 9 }, (_, i) => i + 1)
        : [initialConfig.config_type];

    console.log("config type values", configTypes);
    for (const configType of configTypes) {
        console.log(`\n🔁 Using config_type = ${configType}`);

        // 1️⃣ Pre-run: Create configuration by calling Python script
        console.log("📄 Preparing configuration...");
        try {
            await runPythonScript({
                job: 1, // job 1 = generate config
                'config-type': initialConfig.config_type,
                'cost-config-type': initialConfig.cost_config_type,
                'vm-scheduling-mode': initialConfig.vm_scheduling_mode
            });
            console.log("✅ Initial configuration generated.");
        } catch (error) {
            console.error("❌ Failed to generate initial configuration:", error.message);
            return;
        }

        for (const l of L_values) {
            for (const s of S_values) {
                console.log(`\n--- Running experiment for L=${l}, S=${s}, config_type=${configType} ---`);

                // Update run_config.json with current L and S values
                const currentConfig = { ...initialConfig, L: l, S: s };
                try {

                    // Write LCA_parameter.json with only required fields
                    const lcaParameters = {
                        L: l,
                        S: s,
                        p_c: initialConfig.p_c,
                        PSI1: initialConfig.PSI1,
                        PSI2: initialConfig.PSI2
                    };

                    writeJsonFile(LCA_PARAMS_PATH, lcaParameters);
                    console.log("📄 Created LCA_parameter.json:", lcaParameters);

                } catch (writeError) {
                    console.error("❌ Error writing configuration files:", writeError.message);
                    continue; // Skip this iteration if write fails
                }

                try {
                    await runPythonScript(); // Execute the Python script
                    const results = getResults(); // Get results after Python script runs
                    allExperimentResults.push({ L: l, S: s, results });
                } catch (runError) {
                    console.error(`Experiment failed for L=${l}, S=${s}: ${runError.message}`);
                }
            }
        }
    }
    console.log("\n--- All experiments finished --- ");
    console.log("Collected results:", JSON.stringify(allExperimentResults, null, 2));

    // Save allExperimentResults to a file
    writeJsonFile(path.join(config.MAIN_DIR, "all_experiment_results.json"), allExperimentResults);
    console.log("All experiment results saved to all_experiment_results.json");
    const timeEnd = performance.now();
    console.log(`⏱️ Time taken to run all experiments: ${(timeEnd - timeStart).toFixed(2)} ms`);
}

module.exports = {
    runExperiments,
};