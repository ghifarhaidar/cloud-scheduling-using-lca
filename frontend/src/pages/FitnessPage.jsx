import React, { useEffect, useState , useRef} from "react";
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
  const loaded = useRef(false);


  useEffect(() => {
    const fetchFitnessData = async () => {
      try {
        const {data} = await getAllFitness(); // 👈 call API helper
        console.log("data loaded: ", data);
        const colors = ["red", "green", "blue", "orange", "purple"];
        const datasets = Object.entries(data).map(([algo, points], index) => ({
          label: algo,
          data: points.map((p) => ({ x: p.t, y: p.fitness })),
          borderColor: colors[index % colors.length],
          fill: false,
          tension: 0.2,
        }));

        setChartData({ datasets });
        setLoading(false);
      } catch (error) {
        console.error("Error loading fitness data:", error);
        alert("Failed to load fitness data");
        setLoading(false);
      }
    };
    if (!loaded.current){
      loaded.current = true;
      fetchFitnessData();
    }
  }, []);

  if (loading) {
    return <div className="main"><h2>Loading fitness data...</h2></div>;
  }

  if (!chartData) {
    return <div className="main"><h2>No data available</h2></div>;
  }

  return (
    <div className="main">
      <h1>Fitness Over Time for All Algorithms</h1>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Fitness Over Time",
            },
            legend: {
              position: "top",
            },
          },
          scales: {
            x: {
              type: "linear",
              title: {
                display: true,
                text: "Time (t)",
              },
            },
            y: {
              title: {
                display: true,
                text: "Fitness (f_best)",
              },
            },
          },
        }}
      />
    </div>
  );
}
