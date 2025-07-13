import React, { useEffect, useState } from "react";
import { getConfigs, runExperiments } from "../api"; // adjust path if needed

const RunPage = () => {
  const [params, setParams] = useState("Loading...");
  const [output, setOutput] = useState("Ready.");
  const [loading, setLoading] = useState(false);

  // Fetch configs on page load
//   useEffect(() => {
//     const loadConfigs = async () => {
//       try {
//         setParams("Loading configs...");
//         const data = await getConfigs();
//         // Optional: mutate or format data if needed
//         setParams(JSON.stringify(data, null, 2));
//       } catch (err) {
//         setParams(`❌ Error loading configs: ${err.message}`);
//         console.error(err);
//       }
//     };

//     loadConfigs();
//   }, []);

  // Handle running experiments
  const handleRunClick = async () => {
    setLoading(true);
    setOutput("Running experiments...");
    try {
      const result = await runExperiments();
      setOutput("✅ Experiments completed successfully!");
      console.log("Experiment results:", result);
    } catch (err) {
      setOutput(`❌ Error running experiments: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Run Page</h1>

      <div className="mb-6">
        <h3 className="font-semibold">Parameters:</h3>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">{params}</pre>
      </div>

      <button
        onClick={handleRunClick}
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {loading ? "Running..." : "Run Python Script"}
      </button>

      <div className="mt-6">
        <h3 className="font-semibold">Output:</h3>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">{output}</pre>
      </div>

      <button
        className="mt-4 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        onClick={() => alert("Show results logic here")}
      >
        Show Results
      </button>
    </div>
  );
};

export default RunPage;
