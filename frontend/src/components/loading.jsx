export default function Loading({ content }) {
    return (
        <div className="card">
            <div className="loading">
                <div className="spinner"></div>
                Loading {content} data...
            </div>
        </div>
    );
}