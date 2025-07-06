const path = require("path");

const config = require("./config");
const { readJsonFile, writeJsonFile } = require("./fileHandlers");
const { runPythonScript } = require("./pythonRunner");
const { getResults } = require("./resultProcessor");

const RUN_CONFIG_PATH = path.join(config.MAIN_DIR, "run_config.json");

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
    const initialConfig = readJsonFile(RUN_CONFIG_PATH);

    const L_values = parseRangeOrSingle(initialConfig.L_type, initialConfig.L);
    const S_values = parseRangeOrSingle(initialConfig.S_type, initialConfig.S);

    console.log("L values to iterate:", L_values);
    console.log("S values to iterate:", S_values);

    const allExperimentResults = [];

    for (const l of L_values) {
        for (const s of S_values) {
            console.log(`\n--- Running experiment for L=${l}, S=${s} ---`);

            // Update run_config.json with current L and S values
            const currentConfig = { ...initialConfig, L: l, S: s };
            try {
                writeJsonFile(RUN_CONFIG_PATH, currentConfig);
                console.log(currentConfig);
            } catch (writeError) {
                console.error("Error updating run_config.json:", writeError.message);
                continue; // Skip this iteration if config cannot be written
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

    console.log("\n--- All experiments finished --- ");
    console.log("Collected results:", JSON.stringify(allExperimentResults, null, 2));

    // Save allExperimentResults to a file
    writeJsonFile(path.join(config.MAIN_DIR, "all_experiment_results.json"), allExperimentResults);
    console.log("All experiment results saved to all_experiment_results.json");
}

runExperiments();