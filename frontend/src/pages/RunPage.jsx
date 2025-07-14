import React, { useEffect, useState } from "react";
import { getRunConfigs, runExperiments } from "../api"; // adjust path if needed

const RunPage = () => {
  const [params, setParams] = useState("Loading...");
  const [output, setOutput] = useState("Ready to run experiments.");
  const [loading, setLoading] = useState(false);

  // Fetch configs on page load
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        setParams("Loading configurations...");
        const data = await getRunConfigs();
        // Optional: mutate or format data if needed
        setParams(JSON.stringify(data, null, 2));
      } catch (err) {
        setParams(`❌ Error loading configs: ${err.message}`);
        console.error(err);
      }
    };

    loadConfigs();
  }, []);

  // Handle running experiments
  const handleRunClick = async () => {
    setLoading(true);
    setOutput("🚀 Initializing experiments...");
    try {
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
          Execute the League Championship Algorithm experiments with your configured parameters. 
          The system will run all three algorithm variants (Cost_LCA, Makespan_LCA, MO_LCA) 
          and generate fitness evolution data for analysis.
        </p>
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
            disabled={loading}
            className={`btn ${loading ? 'btn-primary' : 'btn-primary'}`}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Running Experiments...
              </>
            ) : (
              <>
                🚀 Start Experiments
              </>
            )}
          </button>

          <button
            className="btn btn-success"
            onClick={() => window.location.href = '/fitness'}
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
          <h4 style={{color: 'var(--primary-blue)', marginBottom: 'var(--spacing-sm)'}}>
            ℹ️ Experiment Information
          </h4>
          <ul style={{paddingLeft: 'var(--spacing-lg)', color: 'var(--secondary-gray)', margin: 0}}>
            <li>Experiments will run all configured algorithm variants</li>
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
