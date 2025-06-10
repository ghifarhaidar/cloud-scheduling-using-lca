package MOLCA;
/**
 * Interface for a solution/individual in the genetic algorithm
 */
public interface Solution extends Comparable<Solution> {
    void evaluate();
    double[] getObjectives();  // For multi-objective optimization
    double getFitness();       // For single-objective (can return first objective)
    Solution copy();

    // Default implementation for single-objective comparison
    @Override
    default int compareTo(Solution other) {
        return Double.compare(this.getFitness(), other.getFitness());
    }
}
