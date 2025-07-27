import React, { useEffect, useState, useRef } from "react";
import { Bar, Scatter } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
} from "chart.js";
import ResultsSection from "../components/ResultsSection"
import Loading from "../components/loading"
import LoadingError from "../components/loadingError"

import { getGroupedResults, getAlgorithmColor, getAllAlgorithmNames, getSomeParetoSols, getLCAConfigKey, createDatasets } from "../utils/resultPreprocessing";
import "../styles/resultsPage.css"

ChartJS.register(BarElement, Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement);



export default function ResultsPage() {
    const [groupedData, setGroupedData] = useState([]);
    const [algorithmColors, setAlgorithmColors] = useState({});
    const [allAlgorithms, setAllAlgorithms] = useState([]);
    const [configTypeFilters, setConfigTypeFilters] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loaded = useRef(false);

    const handleConfigTypeChange = (groupIdx, value) => {
        setConfigTypeFilters(prev => ({ ...prev, [groupIdx]: value }));
    };

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
    useEffect(() => {
        if (!loaded.current) {
            loaded.current = true;
            fetchResultsData();
        }
    }, []);
    console.log("groupedData", groupedData)
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
                            // Get unique config types in this group
                            const typesSet = new Set(group.runs.map(run => run.config_type));
                            const configTypes = Array.from(typesSet);

                            // Determine selected filter for this group
                            const selectedType = configTypeFilters[groupIdx] ?? "all";

                            // Filter runs in this group
                            const filteredRuns = group.runs.filter(
                                run => selectedType === "all" || run.config_type === selectedType
                            );


                            const lcaRuns = filteredRuns.filter(run =>
                                run.algorithms.some(algo => algo.name.toLowerCase().includes("mo_lca"))
                            );

                            const nonLCARuns = filteredRuns.filter(run =>
                                run.algorithms.every(algo => !algo.name.toLowerCase().includes("mo_lca"))
                            );
                            const lcaConfigsMap = {};
                            lcaRuns.forEach(run => {
                                const key = getLCAConfigKey(run);
                                if (!lcaConfigsMap[key]) {
                                    lcaConfigsMap[key] = [];
                                }
                                lcaConfigsMap[key].push(run);
                            });
                            console.log("lcaRuns:", lcaRuns);
                            const singleLCAConfigs = Object.values(lcaConfigsMap).filter(cfgRuns => cfgRuns.length === 1).flat();
                            const multiLCAConfigs = Object.entries(lcaConfigsMap).filter(([_, cfgRuns]) => cfgRuns.length > 1);

                            console.log("multiLCAConfigs:", multiLCAConfigs);
                            console.log("singleLCAConfigs:", singleLCAConfigs);

                            if (multiLCAConfigs.length > 0) {
                                // Flatten all LCA runs
                                const allLcaRuns = multiLCAConfigs.flatMap(([_, runs]) => runs);
                                var paretoData = allLcaRuns.map((run, idx) => {
                                    const algo = run.algorithms.find(a => a.name.toLowerCase().includes("mo_lca")) ?? {};

                                    return {
                                        id: `Run ${idx + 1}`,
                                        cost: algo.totalCost,
                                        makespan: algo.makespan,
                                        fitness: algo.fitness,
                                        algorithms: run.algorithms,
                                        PSI1: run.PSI1,
                                        PSI2: run.PSI2,
                                        q0: run.q0,
                                        p_c: run.p_c,
                                        L: run.L,
                                        S: run.S,

                                    };
                                });


                                // Find Pareto front
                                const isDominated = (a, b) =>
                                    (b.cost <= a.cost && b.makespan <= a.makespan) &&
                                    (b.cost < a.cost || b.makespan < a.makespan);

                                var paretoFront = paretoData.filter(a =>
                                    !paretoData.some(b => b !== a && isDominated(a, b))
                                );
                                // setParetoFrontData(paretoFront)
                                console.log("allLcaRuns:", allLcaRuns);
                                console.log("paretoFront:", paretoFront);
                                var someParetoSols = getSomeParetoSols(paretoFront)
                            }


                            const labels = [];
                            const totalCostData = [];
                            const makespanData = [];
                            const runTimeData = [];
                            [...nonLCARuns, ...singleLCAConfigs, ...someParetoSols].forEach((run, runIdx) => {
                                const label = run.id ? `${run.id}` : `Run ${runIdx + 1}`;
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

                            console.log("totalCostData", totalCostData);
                            const groupChartData = {
                                labels,
                                totalCost: createDatasets(totalCostData, allAlgorithms, algorithmColors),
                                makespan: createDatasets(makespanData, allAlgorithms, algorithmColors),
                                runTime: createDatasets(runTimeData, allAlgorithms, algorithmColors),
                            };
                            console.log("groupChartData", groupChartData)
                            return (
                                <div key={groupIdx} className="group-card mb-xl">
                                    <div className="card-header">
                                        <h2 className="card-title">
                                            Group {groupIdx + 1}:
                                        </h2>
                                    </div>
                                    {/* Filter UI for this group */}
                                    {configTypes.length > 1 && (
                                        <div className="filter-container">
                                            <label className="filter-label">Filter by Config Type:</label>
                                            <div className="radio-group">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name={`configType-${groupIdx}`}
                                                        value="all"
                                                        checked={selectedType === "all"}
                                                        onChange={() => handleConfigTypeChange(groupIdx, "all")}
                                                    />
                                                    All
                                                </label>
                                                {configTypes.map((type) => (
                                                    <label key={type}>
                                                        <input
                                                            type="radio"
                                                            name={`configType-${groupIdx}`}
                                                            value={type}
                                                            checked={selectedType === type}
                                                            onChange={() => handleConfigTypeChange(groupIdx, type)}
                                                        />
                                                        {type}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

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

                                    {multiLCAConfigs.length > 0 && (() => {


                                        return (
                                            <div className="gridsearch-results">
                                                <h3>Grid Search Results (LCA)</h3>

                                                {/* Pareto Scatter Plot */}
                                                <div style={{ height: 400, marginBottom: "2rem" }}>
                                                    <h4>Pareto Front: Makespan vs Total Cost</h4>
                                                    <Scatter
                                                        data={{
                                                            datasets: [
                                                                {
                                                                    label: "All Runs",
                                                                    data: paretoData.map(p => ({ x: p.makespan, y: p.cost })),
                                                                    backgroundColor: "#93c5fd",
                                                                    pointRadius: 4,
                                                                },
                                                                {
                                                                    label: "Pareto Front",
                                                                    data: paretoFront.map(p => ({ x: p.makespan, y: p.cost })),
                                                                    backgroundColor: "#ef4444",
                                                                    pointRadius: 6,
                                                                },
                                                            ],
                                                        }}
                                                        options={{
                                                            responsive: true,
                                                            plugins: {
                                                                tooltip: {
                                                                    callbacks: {
                                                                        label: (ctx) => {
                                                                            const point = paretoData.find(p =>
                                                                                p.makespan === ctx.parsed.x && p.cost === ctx.parsed.y
                                                                            );
                                                                            return [
                                                                                `Run: ${point?.id ?? "?"}`,
                                                                                `Makespan: ${ctx.parsed.x.toFixed(2)}`,
                                                                                `Cost: ${ctx.parsed.y.toFixed(2)}`,
                                                                                ...(point?.fitness !== undefined ? [`Fitness: ${point.fitness.toFixed(4)}`] : []),
                                                                            ];
                                                                        }
                                                                    }
                                                                },
                                                                legend: { position: "top" },
                                                                title: {
                                                                    display: true,
                                                                    text: "Pareto Front: Makespan vs Total Cost",
                                                                }
                                                            },
                                                            scales: {
                                                                x: {
                                                                    title: { display: true, text: "Makespan" },
                                                                },
                                                                y: {
                                                                    title: { display: true, text: "Total Cost" },
                                                                }
                                                            }
                                                        }}
                                                    />

                                                </div>


                                            </div>
                                        );
                                    })()}

                                    {/* Detailed Runs */}
                                    <ResultsSection
                                        nonLCARuns={nonLCARuns}
                                        singleLCAConfigs={singleLCAConfigs}
                                        paretoFront={paretoFront}
                                        algorithmColors={algorithmColors}
                                    />
                                </div>
                            );
                        })}</>
            }</div>
    );
}