const { exec } = require("child_process");
const path = require("path");
const { MAIN_DIR } = require("./config");

const runPythonScript = (args = {}) => {
    return new Promise((resolve, reject) => {
        // 🛠️ Build CLI args string
        const cliArgs = Object.entries(args)
            .filter(([_, value]) => value !== undefined && value !== null) // skip empty values
            .map(([key, value]) => `--${key} ${value}`)
            .join(" ");

        // 🐍 Full command
        const command = `python3 ${path.join(MAIN_DIR, "run.py")} ${cliArgs}`;

        console.log("Running:", command); // Debugging

        exec(
            command,
            { cwd: MAIN_DIR },
            (error, stdout, stderr) => {
                if (error) {
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