import '../styles/cards.css';

export default function AlgorithmCard({ algorithm }) {
  return (
    <div className="algorithm-card mb-0 ">
      <div className="card-body mb-0">
        <h4 className="card-title mb-0">{algorithm.name.replaceAll("_", " ")}</h4>
        <p className="card-text mb-0">{algorithm.description}</p>
      </div>
    </div>
  );
}