package MOLCA;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

public abstract class BaseGeneticAlgorithm<T extends Solution> implements GeneticAlgorithm<T> {

    protected List<T> population;
    protected Random random = new Random();
    protected int elitismCount = 1; // Number of best solutions to preserve

    // Configuration with default values
    protected int populationSize = 100;
    protected double crossoverRate = 0.85;
    protected double mutationRate = 0.15;

    @Override
    public void initialize() {
        population = new ArrayList<>(populationSize);
        for (int i = 0; i < populationSize; i++) {
            T solution = createRandomSolution();
            solution.evaluate();
            population.add(solution);
        }
        sortPopulation();
    }

    protected abstract T createRandomSolution();

    @Override
    public void runEvolution(int generations) {
        initialize();

        for (int gen = 0; gen < generations; gen++) {
            List<T> parents = selection();
            List<T> offspring = crossover(parents);
            offspring = mutation(offspring);
            evaluatePopulation(offspring);
            replacePopulation(offspring);

            // Optional progress tracking
            if (gen % 10 == 0) {
                System.out.printf("Generation %d: Best fitness = %.4f%n",
                        gen, getBestSolutions().get(0).getFitness());
            }
        }
    }

    @Override
    public List<T> crossover(List<T> parents) {
        List<T> offspring = new ArrayList<>();

        for (int i = 0; i < parents.size(); i += 2) {
            if (i + 1 >= parents.size()) break; // Skip if odd number

            T parent1 = parents.get(i);
            T parent2 = parents.get(i + 1);

            if (random.nextDouble() < crossoverRate) {
                offspring.addAll(performCrossover(parent1, parent2));
            } else {
                // No crossover, just copy parents
                offspring.add((T) parent1.copy());
                offspring.add((T) parent2.copy());
            }
        }

        return offspring;
    }

    /**
     * Performs problem-specific crossover between two parents
     * Should return typically 2 children (but can be more for some algorithms)
     */
    protected abstract List<T> performCrossover(T parent1, T parent2);

    @Override
    public List<T> mutation(List<T> offspring) {
        return offspring.stream()
                .map(child -> {
                    if (random.nextDouble() < mutationRate) {
                        return performMutation(child);
                    }
                    return child;
                })
                .collect(Collectors.toList());
    }

    /**
     * Performs problem-specific mutation
     */
    protected abstract T performMutation(T child);

    @Override
    public void evaluatePopulation(List<T> population) {
        population.forEach(Solution::evaluate);
    }

    @Override
    public void replacePopulation(List<T> newGeneration) {
        // Sort both populations by fitness
        sortPopulation();
        newGeneration.sort(Comparator.reverseOrder());

        List<T> nextPopulation = new ArrayList<>();

        // Elitism from current population
        int eliteFromCurrent = Math.min(elitismCount, population.size());
        nextPopulation.addAll(population.subList(0, eliteFromCurrent));

        // Elitism from new generation
        int eliteFromNew = Math.min(elitismCount, newGeneration.size());
        nextPopulation.addAll(newGeneration.subList(0, eliteFromNew));

        // Fill remaining spots with best from combined populations
        List<T> combined = new ArrayList<>();
        combined.addAll(population);
        combined.addAll(newGeneration);
        combined.sort(Comparator.reverseOrder());

        int remaining = populationSize - nextPopulation.size();
        for (int i = 0; i < remaining && i < combined.size(); i++) {
            if (!nextPopulation.contains(combined.get(i))) {
                nextPopulation.add(combined.get(i));
            }
        }

        // If we still need more (due to duplicates), add random solutions
        while (nextPopulation.size() < populationSize) {
            T randomSolution = createRandomSolution();
            randomSolution.evaluate();
            nextPopulation.add(randomSolution);
        }

        population = nextPopulation;
        sortPopulation();
    }

    protected void sortPopulation() {
        population.sort(Comparator.reverseOrder());
    }

    @Override
    public List<T> getBestSolutions() {
        if (population == null || population.isEmpty()) {
            return new ArrayList<>();
        }
        sortPopulation();
        return List.of(population.get(0));
    }

    @Override
    public List<T> getCurrentPopulation() {
        return new ArrayList<>(population);
    }

    // Configuration setters
    @Override
    public void setPopulationSize(int size) {
        this.populationSize = size;
    }

    @Override
    public void setCrossoverRate(double rate) {
        this.crossoverRate = rate;
    }

    @Override
    public void setMutationRate(double rate) {
        this.mutationRate = rate;
    }

}