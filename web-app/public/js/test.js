document.addEventListener('DOMContentLoaded', () => {
    console.log("run.js loaded");

    const runBtn = document.getElementById('runBtn');
    const paramsEl = document.getElementById('params');
    const outputEl = document.getElementById('output');
    const resultsBtn = document.getElementById('resultsBtn');

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

        // 📝 Define the args you want to send
        const args = {
            job: 0, // default job
            'config-type': 1, // or dynamically get from user input
            'cost-config-type': 1,
            'vm-scheduling-mode': "space"
        };

        try {
            const res = await fetch('/run-python', {
                method: 'POST', // POST because we're sending data
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(args)
            });
            const data = await res.json();

            outputEl.textContent = data.output || "✅ Python script ran successfully";
        } catch (err) {
            outputEl.textContent = `❌ Error: ${err.message}`;
        }
    });

    loadConfigs();

});