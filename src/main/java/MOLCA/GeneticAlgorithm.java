package MOLCA;

import java.util.List;

/**
 * Interface defining the core operations of a genetic algorithm
 *
 * @param <T> The type of individual/solution in the population
 */
public interface GeneticAlgorithm<T extends Solution> {

    /**
     * Initializes
     */
    void initialize();

    /**
     * Runs the genetic algorithm for the specified number of generations
     * @param maxGenerations Maximum number of generations to run
     */
    void runEvolution(int maxGenerations);

    /**
     * Performs selection operation
     * @return Selected individuals
     */
    List<T> selection();

    /**
     * Performs crossover operation
     * @param parents List of parent individuals
     * @return List of offspring individuals
     */
    List<T> crossover(List<T> parents);

    /**
     * Performs mutation operation
     * @param offspring Individuals to mutate
     * @return Mutated individuals
     */
    List<T> mutation(List<T> offspring);

    /**
     * Evaluates the fitness of the population
     * @param newPopulation New population
     */
    void evaluatePopulation(List<T> offspring);
    /**
     * Replaces the current population with a new one
     */
    void replacePopulation(List<T> newPopulation);

    /**
     * Gets the current best solution(s)
     * @return List of best solutions
     */
    List<T> getBestSolutions();

    /**
     * Gets the current population
     * @return List of solutions
     */
    List<T> getCurrentPopulation();


    void setPopulationSize(int size);

    void setCrossoverRate(double rate);

    void setMutationRate(double rate);
}