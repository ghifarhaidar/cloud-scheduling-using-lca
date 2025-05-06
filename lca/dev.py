from abc import ABC, abstractmethod
import random

class EvolutionaryAlgorithm(ABC):
    def __init__(self, population_size, num_generations, crossover_rate, mutation_rate):
        self.population_size = population_size
        self.num_generations = num_generations
        self.crossover_rate = crossover_rate
        self.mutation_rate = mutation_rate
        self.population = []
        self.fitness_scores = []

    @abstractmethod
    def initialize_population(self):
        """Initialize the population with random individuals."""
        pass

    @abstractmethod
    def evaluate_fitness(self, individual):
        """Evaluate the fitness of an individual."""
        pass

    @abstractmethod
    def selection(self):
        """Select parents for crossover based on fitness."""
        pass

    @abstractmethod
    def crossover(self, parent1, parent2):
        """Perform crossover between two parents to produce offspring."""
        pass

    @abstractmethod
    def mutate(self, individual):
        """Apply mutation to an individual."""
        pass

    def evolve(self):
        """Main loop of the evolutionary algorithm."""
        self.initialize_population()
        for generation in range(self.num_generations):
            new_population = []
            self.fitness_scores = [self.evaluate_fitness(ind) for ind in self.population]
            while len(new_population) < self.population_size:
                parent1, parent2 = self.selection()
                if random.random() < self.crossover_rate:
                    child1, child2 = self.crossover(parent1, parent2)
                else:
                    child1, child2 = parent1.copy(), parent2.copy()
                if random.random() < self.mutation_rate:
                    self.mutate(child1)
                if random.random() < self.mutation_rate:
                    self.mutate(child2)
                new_population.extend([child1, child2])
            self.population = new_population[:self.population_size]






class LeagueChampionshipAlgorithm(EvolutionaryAlgorithm):
    def __init__(self, population_size, num_generations, crossover_rate, mutation_rate):
        super().__init__(population_size, num_generations, crossover_rate, mutation_rate)

    def initialize_population(self):
        """Initialize the population with random individuals (schedules)."""
        self.population = [self.random_individual() for _ in range(self.population_size)]

    def random_individual(self):
        """Create a random individual (schedule). Override this in a subclass with real encoding."""
        # Placeholder: individual is a list of 10 random integers (e.g., task assignments)
        return [random.randint(0, 9) for _ in range(10)]

    def evaluate_fitness(self, individual):
        """Evaluate fitness of an individual. Override with a domain-specific function."""
        # Placeholder: negative sum (we are minimizing)
        return -sum(individual)

    def selection(self):
        """Select two individuals using tournament selection."""
        contenders = random.sample(self.population, 4)
        contenders.sort(key=self.evaluate_fitness, reverse=True)  # assuming maximization
        return contenders[0], contenders[1]

    def crossover(self, parent1, parent2):
        """One-point crossover."""
        point = random.randint(1, len(parent1) - 1)
        child1 = parent1[:point] + parent2[point:]
        child2 = parent2[:point] + parent1[point:]
        return child1, child2

    def mutate(self, individual):
        """Mutate an individual by randomly changing one gene."""
        index = random.randint(0, len(individual) - 1)
        individual[index] = random.randint(0, 9)

    def compete_and_rank(self):
        """League-style competition among individuals to assign scores."""
        scores = [0] * self.population_size
        for i in range(self.population_size):
            for j in range(i + 1, self.population_size):
                fitness_i = self.evaluate_fitness(self.population[i])
                fitness_j = self.evaluate_fitness(self.population[j])
                if fitness_i > fitness_j:
                    scores[i] += 3  # win
                elif fitness_i < fitness_j:
                    scores[j] += 3  # win
                else:
                    scores[i] += 1  # draw
                    scores[j] += 1
        return scores

    def evolve(self):
        """Main loop using LCA-style competition to guide selection."""
        self.initialize_population()
        for generation in range(self.num_generations):
            scores = self.compete_and_rank()
            sorted_population = [ind for _, ind in sorted(zip(scores, self.population), reverse=True)]
            self.population = sorted_population[:self.population_size // 2]

            # Refill population via crossover and mutation
            while len(self.population) < self.population_size:
                parent1, parent2 = self.selection()
                child1, child2 = self.crossover(parent1, parent2)
                if random.random() < self.mutation_rate:
                    self.mutate(child1)
                if random.random() < self.mutation_rate:
                    self.mutate(child2)
                self.population.extend([child1, child2])

            self.population = self.population[:self.population_size]  # ensure size

