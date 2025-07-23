const { exec } = require("child_process");
const path = require("path");
const { MAIN_DIR } = require("../config/config");
const { appLogger } = require("../middleware/logging");

const runPythonScript = (args = {}) => {
    return new Promise((resolve, reject) => {
        // 🛠️ Build CLI args string
        const cliArgs = Object.entries(args)
            .filter(([_, value]) => value !== undefined && value !== null) // skip empty values
            .map(([key, value]) => `--${key} ${value}`)
            .join(" ");

        // 🐍 Full command
        const command = `python3 ${path.join(MAIN_DIR, "run.py")} ${cliArgs}`;

        appLogger.info(`Running: ${command}`); // Debugging

        exec(
            command,
            { cwd: MAIN_DIR },
            (error, stdout, stderr) => {
                if (stdout) {
                    appLogger.info(`Python stdout: ${stdout.trim()}`);
                }
                if (stderr) {
                    appLogger.warn(`Python stderr: ${stderr.trim()}`);
                }
                if (error) {
                    appLogger.error(`Python error: ${error.message}`);
                    return reject(new Error(`Error: ${stderr || error.message}`));
                }
                resolve({ output: stdout });
            }
        );
    });
};

module.exports = {
    runPythonScript,
};