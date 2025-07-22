import React, { useEffect, useState } from "react";
import { getRunConfigs, runExperiments, getAllAlgorithms, saveAlgorithms } from "../utils/api"; // adjust path if needed
import SelectableAlgorithmCard from "../components/SelectableAlgorithmCard"

const RunPage = () => {
  const [params, setParams] = useState("Loading...");
  const [output, setOutput] = useState("Ready to run experiments.");
  const [loading, setLoading] = useState(false);

  const [algorithms, setAlgorithms] = useState([]);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState([]);

  // Fetch configs and algorithms on page load
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        setParams("Loading configurations...");
        const data = await getRunConfigs();
        console.log("configurations loaded: ", data);
        setParams(JSON.stringify(data.data, null, 2));
      } catch (err) {
        setParams(`❌ Error loading configs: ${err.message}`);
        console.error(err);
      }
    };
    const loadAlgorithms = async () => {
      try {
        setParams("Loading algorithms...");
        const algorithmsResponse = await getAllAlgorithms();
        console.log("algorithms loaded: ", algorithmsResponse);
        setAlgorithms(algorithmsResponse.data.allAlgorithms.algorithms);
      } catch (err) {
        setParams(`❌ Error loading algorithms: ${err.message}`);
        console.error(err);
      }
    };
    loadConfigs();
    loadAlgorithms();
  }, []);

  // Toggle algorithm selection
  const toggleAlgorithm = (algorithmName) => {
    setSelectedAlgorithms(prev => {
      if (prev.includes(algorithmName)) {
        return prev.filter(name => name !== algorithmName);
      } else {
        return [...prev, algorithmName];
      }
    });
  };

  // Handle running experiments
  const handleRunClick = async () => {
    if (selectedAlgorithms.length === 0) {
      setOutput("❌ Please select at least one algorithm to run");
      return;
    }
    setLoading(true);

    setOutput("🚀 Initializing experiments...");
    try {
      const algorithmsData = selectedAlgorithms.map(algorithmName => {
        const algorithm = algorithms.find(alg => alg.name === algorithmName);
        return {
          name: algorithm.name,
          directory: algorithm.directory
        };
      });
      await saveAlgorithms({
        algorithms: algorithmsData
      });
      const result = await runExperiments();
      setOutput("✅ Experiments completed successfully! Check the Fitness Analysis page for results.");
      console.log("Experiment results:", result);
    } catch (err) {
      setOutput(`❌ Error running experiments: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Experiment Execution</h1>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🔬 Run LCA Experiments</h2>
        </div>
        <p>
          Select which algorithms to execute from the available options below.
          The system will run the selected algorithms and generate fitness evolution data for analysis.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 Available Algorithms</h3>
        </div>
        <div className="algorithm-grid">
          {algorithms.length > 0 ? (
            algorithms.map(algorithm => (
              <SelectableAlgorithmCard
                key={algorithm.name}
                algorithm={algorithm}
                isSelected={selectedAlgorithms.includes(algorithm.name)}
                onToggle={toggleAlgorithm}
              />
            ))
          ) : (
            <p>Loading algorithms...</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 Current Configuration</h3>
        </div>
        <div className="code-block">{params}</div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🎯 Experiment Controls</h3>
        </div>

        <div className="flex gap-md mb-lg">
          <button
            onClick={handleRunClick}
            disabled={loading || selectedAlgorithms.length === 0}
            className={`btn ${loading ? 'btn-primary' : 'btn-primary'}`}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Running Experiments...
              </>
            ) : (
              <>
                🚀 Start Experiments ({selectedAlgorithms.length} selected)
              </>
            )}
          </button>

          <button
            className="btn btn-success"
            onClick={() => window.location.href = '/results'}
            disabled={loading}
          >
            📊 View Results
          </button>
        </div>

        <div style={{
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--light-blue)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-gray)'
        }}>
          <h4 style={{ color: 'var(--primary-blue)', marginBottom: 'var(--spacing-sm)' }}>
            ℹ️ Experiment Information
          </h4>
          <ul style={{ paddingLeft: 'var(--spacing-lg)', color: 'var(--secondary-gray)', margin: 0 }}>
            <li>Selected algorithms: {selectedAlgorithms.length > 0 ? selectedAlgorithms.join(", ") : "None"}</li>
            <li>Results are automatically saved for analysis</li>
            <li>Execution time depends on your parameter settings</li>
            <li>Monitor progress in the output section below</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📤 Execution Output</h3>
        </div>
        <div className="code-block" style={{
          minHeight: '120px',
          color: output.includes('✅') ? 'var(--success-green)' :
            output.includes('❌') ? 'var(--error-red)' :
              'var(--light-gray)'
        }}>
          {output}
        </div>
      </div>
    </div>
  );
};

export default RunPage;
