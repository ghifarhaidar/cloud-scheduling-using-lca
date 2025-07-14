
export default function EditConfigPage() {
    return (
        <div>
            <h1>Edit Configuration</h1>
            
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">🚧 Under Development</h2>
                </div>
                <p>
                    This page is currently under development. The configuration editing functionality 
                    will allow you to modify existing algorithm parameters and simulation settings.
                </p>
                
                <div style={{
                    padding: 'var(--spacing-lg)',
                    backgroundColor: 'var(--light-blue)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-gray)',
                    marginTop: 'var(--spacing-lg)'
                }}>
                    <h3 style={{color: 'var(--primary-blue)', marginBottom: 'var(--spacing-md)'}}>
                        🔄 Alternative Options
                    </h3>
                    <p style={{marginBottom: 'var(--spacing-md)', color: 'var(--secondary-gray)'}}>
                        While this feature is being developed, you can:
                    </p>
                    <ul style={{paddingLeft: 'var(--spacing-lg)', color: 'var(--secondary-gray)'}}>
                        <li style={{marginBottom: 'var(--spacing-sm)'}}>
                            Use the <strong>Set Configuration</strong> page to create new configurations
                        </li>
                        <li style={{marginBottom: 'var(--spacing-sm)'}}>
                            View current configurations in the <strong>Run Experiments</strong> page
                        </li>
                        <li>
                            Analyze results in the <strong>Fitness Analysis</strong> page
                        </li>
                    </ul>
                </div>
                
                <div className="flex gap-md mt-lg">
                    <button 
                        className="btn btn-primary"
                        onClick={() => window.location.href = '/set-config'}
                    >
                        📝 Set New Configuration
                    </button>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => window.location.href = '/run'}
                    >
                        🔬 View Current Config
                    </button>
                </div>
            </div>
        </div>
    );
}
