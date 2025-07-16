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
import { getAllFitness } from "../api"; // 👈 import your API helper

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

        const datasets = Object.entries(data).map(([algo, points]) => {
          const baseColor = getAlgorithmColor(algo);

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Algorithm Fitness Evolution Over Time",
        font: {
          size: 18,
          weight: 'bold'
        },
        color: '#1e3a8a'
      },
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            weight: '500'
          },
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'line'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e3a8a',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function (context) {
            return `Time: ${context[0].parsed.x}`;
          },
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(4)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: "Time (t)",
          font: {
            size: 14,
            weight: '600'
          },
          color: '#374151'
        },
        grid: {
          color: '#f3f4f6',
          lineWidth: 1
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      },
      y: {
        title: {
          display: true,
          text: "Fitness Value (f_best)",
          font: {
            size: 14,
            weight: '600'
          },
          color: '#374151'
        },
        grid: {
          color: '#f3f4f6',
          lineWidth: 1
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  if (loading) {
    return (
      <div>
        <h1>Fitness Analysis</h1>
        <div className="card">
          <div className="loading">
            <div className="spinner"></div>
            Loading fitness data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Fitness Analysis</h1>
        <div className="card">
          <div style={{
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            color: 'var(--error-red)'
          }}>
            <h3>⚠️ {error}</h3>
            <p style={{ color: 'var(--secondary-gray)', marginTop: 'var(--spacing-md)' }}>
              Please run experiments first using the "Run Experiments" page.
            </p>
            <button
              className="btn btn-primary mt-lg"
              onClick={() => window.location.href = '/run'}
            >
              🚀 Go to Experiments
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
    return (
      <div>
        <h1>Fitness Analysis</h1>
        <div className="card">
          <div style={{
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            color: 'var(--secondary-gray)'
          }}>
            <h3>📊 No Data Available</h3>
            <p>No fitness data found. Please run experiments to generate data.</p>
          </div>
        </div>
      </div>
    );
  }

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
      </div>
    </div>
  );
}


const algorithmColorCache = {};

const getAlgorithmColor = (algoName) => {
  // Simple color palette (expand as needed)
  const colorPalette = [
    '#1e3a8a', '#059669', '#d97706',  // Your original colors
    '#7c3aed', '#dc2626', '#0891b2',  // Additional colors
    '#9d174d', '#4d7c0f', '#b45309'   // More fallback colors
  ];

  // Generate consistent color for each algorithm
  if (!algorithmColorCache[algoName]) {
    // Simple hash calculation for consistent color mapping
    let hash = 0;
    for (let i = 0; i < algoName.length; i++) {
      hash = algoName.charCodeAt(i) + ((hash << 5) - hash);
    }
    algorithmColorCache[algoName] = colorPalette[Math.abs(hash) % colorPalette.length];
  }

  return algorithmColorCache[algoName];
};