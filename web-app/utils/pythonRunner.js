const { exec } = require("child_process");
const path = require("path");
const { MAIN_DIR } = require("./config");

const runPythonScript = () => {
    return new Promise((resolve, reject) => {
        exec(
            `python3 ${path.join(MAIN_DIR, "run.py")}`,
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