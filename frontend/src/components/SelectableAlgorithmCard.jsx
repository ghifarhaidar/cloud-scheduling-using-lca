import AlgorithmCard from './AlgorithmCard';
import '../styles/cards.css';

export default function SelectableAlgorithmCard({ algorithm, isSelected, onToggle }) {
    return (
        <div
            className={`selectable-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onToggle(algorithm.name)}
        >
            <AlgorithmCard algorithm={algorithm} />
            <div className="card-checkbox">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(algorithm.name)}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
}