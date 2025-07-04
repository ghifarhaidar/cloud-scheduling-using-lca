document.addEventListener('DOMContentLoaded', () => {
    console.log("run.js loaded");

    const runBtn = document.getElementById('runBtn');
    const paramsEl = document.getElementById('params');
    const outputEl = document.getElementById('output');

    if (!paramsEl || !outputEl || !runBtn) {
        console.error("Error: Missing HTML elements. Check IDs in run.html");
        return;
    }

    // Load configs on page load
    const loadConfigs = async () => {
        try {
            paramsEl.textContent = "Loading configs...";
            const res = await fetch('/get-configs');
            res.simConfig.vms = res.simConfig.vms.length()
            const data = await res.json();
            paramsEl.textContent = JSON.stringify(data, null, 2);
        } catch (err) {
            paramsEl.textContent = `Error loading configs: ${err.message}`;
        }
    };

    runBtn.addEventListener('click', async () => {
        outputEl.textContent = "Running...";
        try {
            const res = await fetch('/run-python');
            const data = await res.json();
            outputEl.textContent = data.output || "No output";
        } catch (err) {
            outputEl.textContent = `Error: ${err.message}`;
        }
    });
    loadConfigs();
});