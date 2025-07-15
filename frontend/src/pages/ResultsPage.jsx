import React, { useEffect, useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
} from "chart.js";
import { getAllResults } from "../api"; // 👈 your API helper

ChartJS.register(BarElement, Title, Tooltip, Legend, CategoryScale, LinearScale);

export default function ResultsPage() {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loaded = useRef(false);

    useEffect(() => {
        const fetchResultsData = async () => {
            try {
                const { data } = await getAllResults();
                console.log("Results data:", data);

                const algorithmColors = [
                    "#1e3a8a", // Primary blue
                    "#059669", // Success green
                    "#d97706", // Warning orange
                    "#dc2626", // Red
                    "#9333ea", // Purple
                    "#3b82f6", // Sky blue
                ];

                const labels = [];
                const algorithmsSet = new Set();
                const totalCostData = [];
                const makespanData = [];
                const runTimeData = [];

                // Process API response
                data.results.forEach((resultSet, idx) => {
                    const config = resultSet.config;
                    const configLabel = `L:${config.L} S:${config.S} (${config.vm_scheduling_mode})`;
                    labels.push(configLabel);

                    const resultsObj = resultSet.results[0].results;

                    const totalCostEntry = {};
                    const makespanEntry = {};
                    const runTimeEntry = {};

                    Object.keys(resultsObj.result).forEach((algoKey) => {
                        const algoName = resultsObj.result[algoKey].name;
                        algorithmsSet.add(algoName); // Collect all unique algorithm names

                        // Simulation results
                        const simResultsKey = `${algoName}_sim_results`;
                        const simResult = resultsObj.simResult[simResultsKey];

                        totalCostEntry[algoName] = simResult.totalCost;
                        makespanEntry[algoName] = simResult.makespan;

                        // Run time from result
                        runTimeEntry[algoName] = resultsObj.result[algoKey].run_time;
                    });

                    totalCostData.push(totalCostEntry);
                    makespanData.push(makespanEntry);
                    runTimeData.push(runTimeEntry);
                });

                // Create datasets dynamically for each algorithm
                const algorithms = Array.from(algorithmsSet);
                const colorMap = algorithms.reduce((acc, algo, idx) => {
                    acc[algo] = algorithmColors[idx % algorithmColors.length];
                    return acc;
                }, {});

                const createDatasets = (metricData, metricName) => {
                    return algorithms.map((algoName) => ({
                        label: algoName,
                        data: metricData.map((d) => d[algoName] ?? 0), // fallback to 0 if missing
                        backgroundColor: colorMap[algoName] + "cc", // semi-transparent
                        borderColor: colorMap[algoName],
                        borderWidth: 1,
                    }));
                };

                setChartData({
                    labels,
                    totalCost: createDatasets(totalCostData, "Total Cost"),
                    makespan: createDatasets(makespanData, "Makespan"),
                    runTime: createDatasets(runTimeData, "Run Time"),
                });

                setLoading(false);
            } catch (err) {
                console.error("Error loading results data:", err);
                setError(
                    "Failed to load results data. Please make sure experiments have been run."
                );
                setLoading(false);
            }
        };

        if (!loaded.current) {
            loaded.current = true;
            fetchResultsData();
        }
    }, []);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                font: { size: 18, weight: "bold" },
                color: "#1e3a8a",
            },
            legend: {
                position: "top",
                labels: {
                    font: { size: 14, weight: "500" },
                    color: "#374151",
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) =>
                        `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`,
                },
            },
        },
        scales: {
            x: {
                grid: { color: "#f3f4f6" },
                ticks: { color: "#6b7280", font: { size: 12 } },
            },
            y: {
                beginAtZero: true,
                grid: { color: "#f3f4f6" },
                ticks: { color: "#6b7280", font: { size: 12 } },
            },
        },
    };

    if (loading) {
        return (
            <div>
                <h1>Results Analysis</h1>
                <div className="card">
                    <div className="loading">
                        <div className="spinner"></div>
                        Loading results data...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1>Results Analysis</h1>
                <div className="card">
                    <div
                        style={{
                            padding: "var(--spacing-xl)",
                            textAlign: "center",
                            color: "var(--error-red)",
                        }}
                    >
                        <h3>⚠️ {error}</h3>
                        <p
                            style={{
                                color: "var(--secondary-gray)",
                                marginTop: "var(--spacing-md)",
                            }}
                        >
                            Please run experiments first using the "Run Experiments" page.
                        </p>
                        <button
                            className="btn btn-primary mt-lg"
                            onClick={() => (window.location.href = "/run")}
                        >
                            🚀 Go to Experiments
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <main className="main-content">
                <h1>Results Analysis</h1>

                {/* Overview Card */}
                <div className="card mb-lg">
                    <div className="card-header">
                        <h2 className="card-title">📊 Algorithm Performance Comparison</h2>
                    </div>
                    <div className="card-body">
                        <p>
                            These charts compare Total Cost, Makespan, and Run Time for all
                            algorithms across configurations.
                        </p>
                    </div>
                </div>

                {/* Total Cost Card */}
                <div className="card mb-lg">
                    <div className="card-header">
                        <h3 className="card-title">Total Cost Comparison</h3>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <div style={{ height: "400px", padding: "var(--spacing-lg)" }}>
                            <Bar
                                data={{
                                    labels: chartData.labels,
                                    datasets: chartData.totalCost,
                                }}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: { display: false },
                                    },
                                }}
                            />
                        </div>
                    </div>
                    <div className="card-footer">
                        <small>Lower values indicate better cost efficiency</small>
                    </div>
                </div>

                {/* Makespan Card */}
                <div className="card mb-lg">
                    <div className="card-header">
                        <h3 className="card-title">Makespan Comparison</h3>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <div style={{ height: "400px", padding: "var(--spacing-lg)" }}>
                            <Bar
                                data={{
                                    labels: chartData.labels,
                                    datasets: chartData.makespan,
                                }}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: { display: false },
                                    },
                                }}
                            />
                        </div>
                    </div>
                    <div className="card-footer">
                        <small>Lower values indicate faster completion</small>
                    </div>
                </div>

                {/* Run Time Card */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Run Time Comparison</h3>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <div style={{ height: "400px", padding: "var(--spacing-lg)" }}>
                            <Bar
                                data={{
                                    labels: chartData.labels,
                                    datasets: chartData.runTime,
                                }}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: { display: false },
                                    },
                                }}
                            />
                        </div>
                    </div>
                    <div className="card-footer">
                        <small>Lower values indicate faster algorithms</small>
                    </div>
                </div>
            </main>
        </div>
    );
}
