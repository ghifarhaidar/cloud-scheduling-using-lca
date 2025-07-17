export default function LoadingError({ error }) {
    return (<div className="card">
        <div className="error-message">
            <h3>⚠️ {error}</h3>
            <p>Please run experiments first using the "Run Experiments" page.</p>
            <button
                className="btn btn-primary mt-lg"
                onClick={() => (window.location.href = "/run")}
            >
                🚀 Go to Experiments
            </button>
        </div>
    </div>);
}