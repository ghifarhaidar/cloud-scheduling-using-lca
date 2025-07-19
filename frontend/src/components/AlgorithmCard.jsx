import '../styles/cards.css';

export default function AlgorithmCard({ algorithm }) {
  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title">{algorithm.name.replaceAll("_", " ")}</h4>
        <p className="card-text mb-0">{algorithm.description}</p>
      </div>
    </div>
  );
}