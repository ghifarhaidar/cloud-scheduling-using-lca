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
import Loading from "../components/loading"
import LoadingError from "../components/loadingError"

import { getGroupedResults, getAlgorithmColor, getAllAlgorithmNames } from "../utils/resultPreprocessing";
import "../styles/resultsPage.css"

ChartJS.register(BarElement, Title, Tooltip, Legend, CategoryScale, LinearScale);

export default function ResultsPage() {
    const [groupedData, setGroupedData] = useState([]);
    const [algorithmColors, setAlgorithmColors] = useState({});
    const [allAlgorithms, setAllAlgorithms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loaded = useRef(false);

    
    useEffect(() => {
        const fetchResultsData = async () => {
            try {
                const data = await getGroupedResults();
                const algorithms = getAllAlgorithmNames(data);
                const colors = {};

                algorithms.forEach((algo, index) => {
                    colors[algo] = getAlgorithmColor(algo, index)
                });

                setGroupedData(data);
                setAlgorithmColors(colors);
                setAllAlgorithms(algorithms);
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
            console.log(groupedData)
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

    const createDatasets = (metricData) => {
        return allAlgorithms.map((algoName) => ({
            label: algoName.replace('_', ' '),
            data: metricData.map((d) => d[algoName] ?? 0),
            backgroundColor: algorithmColors[algoName] + "cc",
            borderColor: algorithmColors[algoName],
            borderWidth: 1,
        }));
    };

    return (
        <div>
            <h1>Results Analysis</h1>
            {
                loading ? <Loading content="results" /> : error ? <LoadingError error={error} /> :
                    <>
                        {/* Overview Card */}
                        <div className="card mb-lg">
                            <div className="card-header">
                                <h2 className="card-title">📊 Algorithm Performance Comparison</h2>
                                <div className="algorithm-legend">
                                    {allAlgorithms.map((algo, idx) => (
                                        <span key={idx} className="legend-item">
                                            <span
                                                className="legend-color"
                                                style={{ backgroundColor: algorithmColors[algo] }}
                                            ></span>
                                            {algo.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="card-body">
                                <p>These charts compare algorithm performance across different configurations.</p>
                            </div>
                        </div>

                        {/* Group Cards */}
                        {groupedData.map((group, groupIdx) => {
                            const labels = [];
                            const totalCostData = [];
                            const makespanData = [];
                            const runTimeData = [];

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
                                            <div className="bar-chart-container">
                                                <Bar
                                                    data={{
                                                        labels: groupChartData.labels,
                                                        datasets: groupChartData.totalCost,
                                                    }}
                                                    options={chartOptions}
                                                />
                                            </div>
                                        </div>

                                        {/* Makespan Card */}
                                        <div className="result-card">
                                            <div className="card-header">
                                                <h3>Makespan Comparison</h3>
                                            </div>
                                            <div className="bar-chart-container">
                                                <Bar
                                                    data={{
                                                        labels: groupChartData.labels,
                                                        datasets: groupChartData.makespan,
                                                    }}
                                                    options={chartOptions}
                                                />
                                            </div>
                                        </div>

                                        {/* Run Time Card */}
                                        <div className="result-card">
                                            <div className="card-header">
                                                <h3>Run Time Comparison</h3>
                                            </div>
                                            <div className="bar-chart-container">
                                                <Bar
                                                    data={{
                                                        labels: groupChartData.labels,
                                                        datasets: groupChartData.runTime,
                                                    }}
                                                    options={chartOptions}
                                                />
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
                                                            <div
                                                                key={algoIdx}
                                                                className="algorithm-result"
                                                                style={{ borderLeft: `4px solid ${algorithmColors[algo.name]}` }}
                                                            >
                                                                <h5>{algo.name.replace('_', ' ')}</h5>
                                                                <p>Cost: {algo.totalCost?.toFixed(2) ?? 'N/A'}</p>
                                                                <p>Makespan: {algo.makespan?.toFixed(2) ?? 'N/A'}</p>
                                                                <p>Runtime: {algo.run_time?.toFixed(4) ?? 'N/A'}s</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}</>
            }</div>
    );
}