import '../styles/cards.css';

export default function AlgorithmCard({ algorithm }) {
  return (
    <div className="algorithm-card mb-0 ">
      <div className="algorithm-card-body  mb-0 full-grid">
        <h4 className="card-title mb-0 full-grid">{algorithm.name.replaceAll("_", " ")}</h4>
        <p className="card-text mb-0 full-grid">{algorithm.description}</p>
      </div>
    </div>
  );
}