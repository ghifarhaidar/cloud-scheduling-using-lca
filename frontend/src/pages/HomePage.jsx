import React, { useState, useEffect } from 'react';
import AlgorithmCard from '../components/AlgorithmCard';
import '../styles/cards.css';
import { getAllAlgorithms } from "../utils/api";
export default function HomePage() {

    const [algorithms, setAlgorithms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadAlgorithms = async () => {
            try {
                setLoading(true);
                const response = await getAllAlgorithms();
                setAlgorithms(response.data.allAlgorithms.algorithms);
            } catch (err) {
                setError(err.message);
                console.error("Failed to load algorithms:", err);
            } finally {
                setLoading(false);
            }
        };
        loadAlgorithms();
    }, []);


    return (
        <div>
            <h1>Cloud Scheduling using League Championship Algorithm</h1>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Welcome to the LCA Research Platform</h2>
                </div>
                <p>
                    This platform provides a comprehensive environment for testing and analyzing
                    the League Championship Algorithm (LCA) for cloud scheduling optimization.
                    The system implements multiple variants of the LCA algorithm to solve
                    multi-objective optimization problems in cloud computing environments.
                </p>
                
                <h3 className="mt-lg">Available Algorithms</h3>
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        Loading algorithms...
                    </div>
                ) : error ? (
                    <div className="error-message">
                        ❌ Error loading algorithms: {error}
                    </div>
                ) : (
                    <div className="algorithm-grid">
                        {algorithms.map(algorithm => (
                            <AlgorithmCard
                                key={algorithm.name}
                                algorithm={algorithm}
                            />
                        ))}
                    </div>
                )}

                <h3>Getting Started</h3>
                <ol style={{ paddingLeft: 'var(--spacing-lg)', color: 'var(--secondary-gray)' }}>
                    <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <strong>Set Configuration:</strong> Define algorithm parameters and simulation settings
                    </li>
                    <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <strong>Run Experiments:</strong> Execute the algorithms with your configured parameters
                    </li>
                    <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <strong>Analyze Results:</strong> View fitness evolution and performance metrics
                    </li>
                </ol>

                <div style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-lg)', backgroundColor: 'var(--light-blue)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ color: 'var(--primary-blue)', marginBottom: 'var(--spacing-sm)' }}>Research Context</h4>
                    <p className="mb-0" style={{ fontSize: '0.9rem' }}>
                        This implementation is part of ongoing research in cloud computing optimization,
                        specifically focusing on the application of bio-inspired algorithms for
                        resource scheduling in distributed computing environments.
                    </p>
                </div>
            </div>
        </div>
    );
}
