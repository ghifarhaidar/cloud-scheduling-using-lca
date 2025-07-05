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
        try {
            const res = await fetch('/run-python');
            const data = await res.json();
            outputEl.textContent = data.output || "No output";
        } catch (err) {
            outputEl.textContent = `Error: ${err.message}`;
        }
    });
    loadConfigs();

    resultsBtn.addEventListener('click', async () => {
        try {
            // 1️⃣ Fetch the JSON data
            const response = await fetch('/get-results');
            if (!response.ok) throw new Error('Failed to load JSON');
            const data = await response.json();

            // 2️⃣ Select the `.main` container and clear it
            const main = document.querySelector('.main');
            main.innerHTML = ''; // Clear only the main content

            // 3️⃣ Create a container for results
            const container = document.createElement('div');

            // 4️⃣ Add canvases for charts
            container.innerHTML = `
            <h2>Fitness Comparison</h2>
            <canvas id="fitnessChart"></canvas>
            <h2>Makespan Comparison</h2>
            <canvas id="makespanChart"></canvas>
            <h2>Total Cost Comparison</h2>
            <canvas id="costChart"></canvas>
            `;
            document.body.appendChild(container);

            /// 5️⃣ Prepare data for charts
            const algorithms = Object.keys(data.result);
            const fitnessData = algorithms.map(algo => ({
                algorithm: data.result[algo].name,
                fitness: data.result[algo].fitness
            }));

            const makespanData = algorithms.map(algo => ({
                algorithm: data.result[algo].name,
                makespan: data.simResult[`${data.result[algo].name}_sim_results`].makespan
            }));

            const costData = algorithms.map(algo => ({
                algorithm: data.result[algo].name,
                totalCost: data.simResult[`${data.result[algo].name}_sim_results`].totalCost
            }));

            // 6️⃣ Function to render a chart
            const renderChart = (ctxId, label, dataKey, dataset, colors) => {
                const ctx = document.getElementById(ctxId).getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: dataset.map(d => d.algorithm),
                        datasets: [{
                            label: label,
                            data: dataset.map(d => d[dataKey]),
                            backgroundColor: colors,
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            };

            // 7️⃣ Render charts
            renderChart('fitnessChart', 'Fitness', 'fitness', fitnessData, ['#ff6384', '#36a2eb', '#cc65fe']);
            renderChart('makespanChart', 'Makespan', 'makespan', makespanData, ['#4bc0c0', '#ff9f40', '#9966ff']);
            renderChart('costChart', 'Total Cost', 'totalCost', costData, ['#ffcd56', '#ff6384', '#36a2eb']);

        } catch (error) {
            console.error('Error loading JSON:', error);
            alert('Failed to load results.');
        }
    });
});