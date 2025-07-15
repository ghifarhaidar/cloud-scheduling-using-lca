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
import { getGroupedResults } from "../utils/resultPreproccessing";

ChartJS.register(BarElement, Title, Tooltip, Legend, CategoryScale, LinearScale);

export default function ResultsPage() {
    const [groupedData, setGroupedData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loaded = useRef(false);

    useEffect(() => {
        const fetchResultsData = async () => {
            try {
                const data = await getGroupedResults();
                console.log("Grouped results data:", data);
                setGroupedData(data);
                setLoading(false);
            } catch (err) {
                console.error("Error loading results data:", err);
                setError("Failed to load results data. Please make sure experiments have been run.");
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
            legend: {
                position: "top",
                labels: {
                    font: { size: 14, weight: "500" },
                    color: "#374151",
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`,
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
            <div className="app-container">
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
            <div className="app-container">
                <h1>Results Analysis</h1>
                <div className="card">
                    <div className="error-message">
                        <h3>⚠️ {error}</h3>
                        <p>Please run experiments first using the "Run Experiments" page.</p>
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
                        <p>These charts compare algorithm performance across different configurations.</p>
                    </div>
                </div>

                {/* Group Cards */}
                {groupedData.map((group, groupIdx) => {
                    // Prepare chart data for this group
                    const labels = [];
                    const totalCostData = [];
                    const makespanData = [];
                    const runTimeData = [];
                    const algorithmColors = {
                        'MO_LCA': '#1e3a8a',
                        'cost_LCA': '#059669',
                        'makespan_LCA': '#d97706'
                    };

                    group.runs.forEach((run, runIdx) => {
                        const label = `Run ${runIdx + 1} (L:${run.L}, S:${run.S})`;
                        labels.push(label);

                        const totalCostEntry = {};
                        const makespanEntry = {};
                        const runTimeEntry = {};

                        run.algorithms.forEach(algorithm => {
                            totalCostEntry[algorithm.name] = algorithm.totalCost;
                            makespanEntry[algorithm.name] = algorithm.makespan;
                            runTimeEntry[algorithm.name] = algorithm.run_time;
                        });

                        totalCostData.push(totalCostEntry);
                        makespanData.push(makespanEntry);
                        runTimeData.push(runTimeEntry);
                    });

                    const createDatasets = (metricData) => {
                        return ['MO_LCA', 'cost_LCA', 'makespan_LCA'].map((algoName) => ({
                            label: algoName,
                            data: metricData.map((d) => d[algoName] ?? 0),
                            backgroundColor: algorithmColors[algoName] + "cc",
                            borderColor: algorithmColors[algoName],
                            borderWidth: 1,
                        }));
                    };

                    const groupChartData = {
                        labels,
                        totalCost: createDatasets(totalCostData),
                        makespan: createDatasets(makespanData),
                        runTime: createDatasets(runTimeData),
                    };

                    return (
                        <div key={groupIdx} className="group-card mb-xl">
                            <div className="card-header">
                                <h2 className="card-title">
                                    Group {groupIdx + 1}: L={group.groupConfig.L_type === 'range' ?
                                        `${group.groupConfig.from}-${group.groupConfig.to}` :
                                        group.groupConfig.L},
                                    S={group.groupConfig.S},
                                    p_c={group.groupConfig.p_c}
                                </h2>
                            </div>

                            <div className="result-cards-container">
                                {/* Total Cost Card */}
                                <div className="result-card">
                                    <div className="card-header">
                                        <h3>Total Cost Comparison</h3>
                                    </div>
                                    <div className="chart-container">
                                        <Bar
                                            data={{
                                                labels: groupChartData.labels,
                                                datasets: groupChartData.totalCost,
                                            }}
                                            options={chartOptions}
                                        />
                                    </div>
                                    <div className="card-footer">
                                        <small>Lower values indicate better cost efficiency</small>
                                    </div>
                                </div>

                                {/* Makespan Card */}
                                <div className="result-card">
                                    <div className="card-header">
                                        <h3>Makespan Comparison</h3>
                                    </div>
                                    <div className="chart-container">
                                        <Bar
                                            data={{
                                                labels: groupChartData.labels,
                                                datasets: groupChartData.makespan,
                                            }}
                                            options={chartOptions}
                                        />
                                    </div>
                                    <div className="card-footer">
                                        <small>Lower values indicate faster completion</small>
                                    </div>
                                </div>

                                {/* Run Time Card */}
                                <div className="result-card">
                                    <div className="card-header">
                                        <h3>Run Time Comparison</h3>
                                    </div>
                                    <div className="chart-container">
                                        <Bar
                                            data={{
                                                labels: groupChartData.labels,
                                                datasets: groupChartData.runTime,
                                            }}
                                            options={chartOptions}
                                        />
                                    </div>
                                    <div className="card-footer">
                                        <small>Lower values indicate faster algorithms</small>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Runs */}
                            <div className="runs-details">
                                <h3>Detailed Results</h3>
                                <div className="runs-grid">
                                    {group.runs.map((run, runIdx) => (
                                        <div key={runIdx} className="run-card">
                                            <h4>Run {runIdx + 1}</h4>
                                            <p>L: {run.L}, S: {run.S}, Type: {run.config_type}</p>
                                            <div className="algorithm-results">
                                                {run.algorithms.map((algo, algoIdx) => (
                                                    <div key={algoIdx} className="algorithm-result">
                                                        <h5>{algo.name}</h5>
                                                        <p>Cost: {algo.totalCost.toFixed(2)}</p>
                                                        <p>Makespan: {algo.makespan.toFixed(2)}</p>
                                                        <p>Runtime: {algo.run_time.toFixed(4)}s</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </main>
        </div>
    );
}