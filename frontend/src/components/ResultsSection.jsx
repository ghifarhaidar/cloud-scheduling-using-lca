import { ChevronDown, ChevronRight } from "lucide-react"; // Optional icons
import React, { useState } from "react";

export default function ResultsSection({ nonLCARuns, singleLCAConfigs, paretoFront, algorithmColors }) {
    const [showDetails, setShowDetails] = useState(false);

    const toggleDetails = () => setShowDetails(prev => !prev);

    return (
        <div className="runs-details">
            <h3
                style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                onClick={toggleDetails}
            >
                {showDetails ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                <span style={{ marginLeft: "0.5rem" }}>Detailed Results</span>
            </h3>

            {showDetails && (
                <div className="runs-grid">
                    {[...nonLCARuns, ...singleLCAConfigs, ...paretoFront].map((run, runIdx) => (
                        <div key={runIdx} className="run-card">
                            <h4> {run.id ? run.id : "Run" + ` ${runIdx + 1}`}</h4>
                            <p>Type: {run.config_type}</p>
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
                                        {algo.name.toLowerCase().includes("mo_lca") ?
                                            <>  <p>L: {run.L}</p>
                                                <p>S: {run.S}</p>
                                                <p>PSI1: {run.PSI1}</p>
                                                <p>PSI2: {run.PSI2}</p>
                                                <p>p_c: {run.p_c}</p>
                                                <p>q0: {run.q0}</p>
                                            </> : <></>
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}