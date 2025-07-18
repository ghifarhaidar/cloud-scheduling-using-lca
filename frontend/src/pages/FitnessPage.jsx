import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";
import { getAllFitness } from "../utils/api"; // 👈 import your API helper
import Loading from "../components/loading"
import LoadingError from "../components/loadingError"
import { chartOptions, getAlgorithmColor } from "../utils/fitnessPageUtil";

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

export default function FitnessPage() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loaded = useRef(false);

  useEffect(() => {
    const fetchFitnessData = async () => {
      try {
        const { data } = await getAllFitness(); // 👈 call API helper
        console.log("data loaded: ", data);
        const colors = {};
        Object.keys(data).forEach((algo, index) => {
          colors[algo] = getAlgorithmColor(algo, index);
        });
        const datasets = Object.entries(data).map(([algo, points]) => {
          const baseColor = colors[algo];

          return {
            label: algo.replace('_', ' '),
            data: points.map((p) => ({ x: p.t, y: p.fitness })),
            borderColor: baseColor,
            backgroundColor: `${baseColor}20`,
            fill: false,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 6,
            borderWidth: 3,
          };
        });

        setChartData({ datasets });
        setLoading(false);
      } catch (error) {
        console.error("Error loading fitness data:", error);
        setError("Failed to load fitness data. Please ensure experiments have been run.");
        setLoading(false);
      }
    };

    if (!loaded.current) {
      loaded.current = true;
      fetchFitnessData();
    }
  }, []);

  return (
    <div>
      <h1>Fitness Analysis</h1>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📈 Algorithm Performance Comparison</h2>
        </div>
        <p>
          This chart shows the fitness evolution over time for all League Championship Algorithm variants.
          Lower fitness values generally indicate better performance for optimization problems.
        </p>
      </div>
      {loading ? <Loading content="fitness" /> : error ? <LoadingError error={error} /> :
        !chartData || !chartData.datasets || chartData.datasets.length === 0 ? <div className="card">
          <div style={{
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            color: 'var(--secondary-gray)'
          }}>
            <h3>📊 No Data Available</h3>
            <p>No fitness data found. Please run experiments to generate data.</p>
          </div>
        </div> : <>
          <div className="chart-container">
            <div style={{ height: '500px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🔍 Analysis Insights</h3>
            </div>
            <div className="flex flex-col gap-md">
              <div style={{
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--light-blue)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-gray)'
              }}>
                <h4 style={{ color: 'var(--primary-blue)', marginBottom: 'var(--spacing-sm)' }}>
                  💰 Cost LCA
                </h4>
                <p className="mb-0" style={{ fontSize: '0.9rem', color: 'var(--secondary-gray)' }}>
                  Focuses on minimizing resource costs in cloud scheduling.
                  Ideal for budget-constrained environments.
                </p>
              </div>

              <div style={{
                padding: 'var(--spacing-md)',
                backgroundColor: '#f0fdf4',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #bbf7d0'
              }}>
                <h4 style={{ color: 'var(--success-green)', marginBottom: 'var(--spacing-sm)' }}>
                  ⏱️ Makespan LCA
                </h4>
                <p className="mb-0" style={{ fontSize: '0.9rem', color: 'var(--secondary-gray)' }}>
                  Optimizes for minimum execution time (makespan).
                  Best for time-critical applications.
                </p>
              </div>

              <div style={{
                padding: 'var(--spacing-md)',
                backgroundColor: '#fffbeb',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #fed7aa'
              }}>
                <h4 style={{ color: 'var(--warning-orange)', marginBottom: 'var(--spacing-sm)' }}>
                  🎯 Multi-Objective LCA
                </h4>
                <p className="mb-0" style={{ fontSize: '0.9rem', color: 'var(--secondary-gray)' }}>
                  Balances both cost and makespan objectives.
                  Provides trade-off solutions for complex scenarios.
                </p>
              </div>
            </div>
          </div></>}
    </div>
  );
}


