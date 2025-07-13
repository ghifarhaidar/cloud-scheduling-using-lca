const fs = require("fs");
const path = require("path");
const { RESULTS_DIR } = require("./config");
const { readJsonFile } = require("./fileHandlers");

const getResults = () => {
    try {
        const fileTypes = ["result", "sim_results"];
        const results = {};

        // Auto-discover algorithms
        const files = fs.readdirSync(RESULTS_DIR);
        const algorithms = new Set();

        files.forEach((file) => {
            const match = file.match(/^(.*?)_(result|sim_results)\.json$/);
            if (match) {
                algorithms.add(match[1]);
            }
        });

        // Build results object
        fileTypes.forEach((type) => {
            results[type === "result" ? "result" : "simResult"] = {};
            algorithms.forEach((algo) => {
                const fileName = `${algo}_${type}.json`;
                results[type === "result" ? "result" : "simResult"][`${algo}_${type}`] = readJsonFile(
                    path.join(RESULTS_DIR, fileName)
                );
            });
        });

        console.log(`✅ Loaded results for: ${[...algorithms].join(", ")}`);
        return results;
    } catch (err) {
        throw new Error(`Failed to read results: ${err.message}`);
    }
};

module.exports = {
    getResults,
};