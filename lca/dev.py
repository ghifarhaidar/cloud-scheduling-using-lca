import os
import numpy as np
import random
import math
from util import read_lca_parameters
params = read_lca_parameters()

L = params['L']
L_half = L // 2
S = params['S']
n = 0
p_c = params['p_c']
PSI1 = params['PSI1']
PSI2 = params['PSI2']
q0 = params['q0']

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))


class LeagueChampionshipAlgorithm(object):
    def __init__(self, L=L, S=S, n=n, p_c=p_c, PSI1=PSI1, PSI2=PSI2, min_xi=0, max_xi=0,q0=q0, path_w="LCA.txt", mode="time"):
        self.L = L
        self.L_half = L // 2
        self.S = S
        self.n = n
        self.p_c = p_c
        self.PSI1 = PSI1
        self.PSI2 = PSI2
        self.min_xi = min_xi
        self.max_xi = max_xi
        self.q0 = q0
        self.path_w = os.path.join(BASE_DIR, f"lca/{path_w}")
        self.mode = mode
        self.configure()
        self.fitness_scale = 1
        self.fitness_scale = self.calc_fitness(self.round_robin())
        return

    def configure(self):
        """Override in subclass."""
        pass

    def round_robin(self):
        """Returns a round robin team"""
        return [i % (self.max_xi+1) for i in range(self.n)]

    def league(self):
        """
        Executes the main League Championship Algorithm optimization process.

        Returns:
            list: The best found solutions (teams) after all seasons
        """
        wfile = open(self.path_w, mode='w')

        X = self.getRandomTeams(self.min_xi, self.max_xi)

        DUMMY_TEAM = self.getRandomTeam(self.min_xi, self.max_xi)

        if self.L % 2 == 1:
            X.append(DUMMY_TEAM)
            self.L += 1
            self.L_half += 1

        fX = list(0 for _ in range(self.L))
        fX = self.fitness(X)
        nextX = list(X)

        B = list(X)
        fB = list(fX)

        f_best = min(fB)
        f_bList = list()
        f_bList.append(f_best)

        t = 1

        self.genericSchedule = self.generateRoundRobinSchedule()
        self.schedule = self.leagueSchedule(t)
        wfile.write("t =%d, f_best=%f\n" % (t, f_best))
        while t < self.S * (self.L - 1):
            if t % 10 == 0:
                wfile.write("t =%d, f_best=%f\n" % (t, f_best))

            Y = self.get_Y()

            nextX = self.calc_nextX(t, fX, f_best, X, B, Y, nextX)

            X = nextX.copy()

            fX = self.fitness(X)

            for l in range(self.L):
                if fX[l] < fB[l]:
                    B[l] = X[l]
                    fB[l] = fX[l]
            f_best = min(fB)
            f_bList.append(f_best)

            if t % (self.L - 1) == 0:
                self.schedule = self.leagueSchedule(t)
            t += 1

        return B

    def calc_nextX(self, t, fX, f_best, X, B, Y, nextX):
        """
        Updates all teams based on current matches and results.

        Args:
            t (int): Current iteration
            L (int): Number of teams
            fX (list): Current fitness values
            f_best (float): Best fitness value
            X (list): Current population
            B (list): Best teams
            Y (list): Binary modification vectors
            nextX (list): Next generation population

        Returns:
            nextX (list): Next population
        """
        for l in range(self.L):
            teamA, teamB, teamC, teamD = self.teamClassification(t, l)
            winner1 = self.winORlose(teamA, teamB, fX, f_best)
            winner2 = self.winORlose(teamC, teamD, fX, f_best)
            nextX[teamA] = self.setTeamFormation(
                X, B, Y, teamA, teamB, teamC, teamD, winner1, winner2)
        return nextX

    def getRandomTeam(self, min, max):
        """
        Generates a single random team within specified bounds.

        Args:
            min (int): Minimum possible value for team parameters
            max (int): Maximum possible value for team parameters

        Returns:
            list: A team represented as a list of n random integers in [min, max]
        """
        if min > max:
            min, max = max, min  # Swap if reversed

        team = [random.randint(min, max) for _ in range(self.n)]
        return team

    def getRandomTeams(self, min, max):
        """
        Initializes the entire league with random teams.

        Args:
            min (int): Minimum bound for team values
            max (int): Maximum bound for team values

        Returns:
            list: List of L teams, each being a list of n random values
        """
        X = [self.getRandomTeam(min, max) for _ in range(self.L)]
        return X

    def leagueSchedule(self, t):
        """
        Generates or updates the league schedule based on current round.

        Args:
            t (int): Current iteration

        Returns:
            list: schedule where each element is a team's ordered list of opponents
        """
        if t == 1:
            self.schedule = self.genericSchedule.copy()

        else:
            teams = list(range(self.L))
            shuffledTeams = teams.copy()
            random.shuffle(shuffledTeams)
            reversedShuffledTeams = list(range(self.L))
            for i in range(self.L):
                reversedShuffledTeams[shuffledTeams[i]] = i

            for i in range(self.L):
                self.schedule[i] = self.genericSchedule[reversedShuffledTeams[i]]
                self.schedule[i] = list(
                    map(lambda x: shuffledTeams[x], self.schedule[i]))
        return self.schedule

    def generateRoundRobinSchedule(self):
        """
        Generates a round-robin schedule using circular rotation method.

        Returns:
            A list where each element is a team's schedule (list of opponent indices in order)
        """
        teams = list(range(self.L))

        schedule = [[] for _ in range(self.L)]  # Initialize empty schedules

        for _ in range(self.L - 1):
            # Pair up teams for this round
            for i in range(self.L_half):
                home = teams[i]
                away = teams[self.L - 1 - i]

                schedule[home].append(away)
                schedule[away].append(home)

            # Rotate all teams except the first one
            teams.insert(1, teams.pop())

        return schedule

    def teamClassification(self, t, l):
        """
        Identifies the four interacting teams for a given match.

        Args:
            t (int): Current iteration
            l (int): Current team index

        Returns:
            tuple: (teamA, teamB, teamC, teamD) indices for current interaction
        """
        tmp_t = t % (self.L - 1)
        teamA = l
        teamB = self.schedule[l][tmp_t-2]
        teamC = self.schedule[l][tmp_t-1]
        teamD = self.schedule[teamC][tmp_t-2]

        return teamA, teamB, teamC, teamD

    def winORlose(self, team1, team2, fX, f_best):
        """
        Probabilistically determines the winner between two teams.

        Args:
            team1 (int): Index of first team
            team2 (int): Index of second team
            fX (list): Current fitness values for all teams
            f_best (float): Best fitness value found so far

        Returns:
            int: Index of winning team
        """
        if fX[team2] + fX[team1] == 2.0 * f_best:
            winPoint = 0.5
        else:
            winPoint = (fX[team2] - f_best) / \
                (fX[team2] + fX[team1] - 2.0 * f_best)

        random_point = random.uniform(0.0, 1.0)
        if winPoint == 0.0:
            winner = team2
        elif winPoint == 1.0:
            winner = team1
        else:
            if random_point <= winPoint:
                winner = team1
            else:
                winner = team2
        return winner

    def fitness(self, X):
        """
        Evaluates team performance (CURRENTLY RETURNS RANDOM VALUES - IMPLEMENT PROBLEM-SPECIFIC LOGIC).

        Args:
            X (list): List of teams to evaluate

        Returns:
            list: Fitness values for each team (lower is better)
        """

        fitness = list()
        for x in X:
            f = 100 * self.calc_fitness(x) / self.fitness_scale
            fitness.append(f)

        return fitness

    def get_Y(self):
        """
        Generates binary modification vectors for team updates.

        Returns:
            list: List of binary vectors (1=update parameter, 0=keep current)
        """
        self.q0 = 1
        Y = list()
        y_sample = [i for i in range(self.n)]
        for i in range(self.L):
            y = [0] * self.n
            a = random.uniform(0.0, 1.0)
            flagNum = (math.log(1 - (1 - (1 - p_c)**(self.n - self.q0 + 1)) * a) //
                       math.log(1 - p_c)) + self.q0 - 1
            q = int(flagNum)
            poInt = list(random.sample(range(self.n), q))
            poInt.sort()
            for pos in poInt:
                y[pos] = 1
            Y.append(y)
        return Y

    def getRandom_rid(self):
        """
        Generates random influence factors for team updates.

        Returns:
            tuple: (r1_id, r2_id) where each is a list of n random floats in [0,1]
        """
        r1_id = [random.uniform(0.0, 1.0) for _ in range(self.n)]
        r2_id = [random.uniform(0.0, 1.0) for _ in range(self.n)]
        return r1_id, r2_id

    def setTeamFormation(self, X, B, Y, teamA, teamB, teamC, teamD, winner1, winner2):
        """
        Updates a team's strategy based on match outcomes.

        Args:
            X (list): Current population of teams
            B (list): Best teams formation 
            Y (list): Binary modification vectors
            teamA (int): Current team index to update
            teamB (int): teamA opponent index in previous iteration 
            teamC (int): teamA opponent opponent index in current iteration
            teamD (int): teamC opponent index in previous iteration
            winner1 (int): Winner of teamA vs teamB
            winner2 (int): Winner of teamC vs teamD

        Returns:
            list: Updated teamA strategy
        """
        nextA = B[teamA].copy()
        r1_id, r2_id = self.getRandom_rid()

        if winner1 == teamA and winner2 == teamC:  # S/T
            for i in range(self.n):
                nextA[i] = B[teamA][i] + Y[teamA][i] * (
                    PSI1 * r1_id[i] * (X[teamA][i] - X[teamD][i]) +
                    PSI1 * r2_id[i] * (X[teamA][i] - X[teamB][i]))
        elif winner1 == teamA and winner2 == teamD:  # S/O
            for i in range(self.n):
                nextA[i] = B[teamA][i] + Y[teamA][i] * (
                    PSI2 * r1_id[i] * (X[teamD][i]-X[teamA][i]) +
                    PSI1 * r2_id[i] * (X[teamA][i] - X[teamB][i]))
        elif winner1 == teamB and winner2 == teamC:  # W/T
            for i in range(self.n):
                nextA[i] = B[teamA][i] + Y[teamA][i] * (
                    PSI1 * r1_id[i] * (X[teamA][i] - X[teamD][i]) +
                    PSI2 * r2_id[i] * (X[teamB][i] - X[teamA][i]))
        elif winner1 == teamB and winner2 == teamD:  # W/O
            for i in range(self.n):
                nextA[i] = B[teamA][i] + Y[teamA][i] * (
                    PSI2 * r1_id[i] * (X[teamD][i] - X[teamA][i]) +
                    PSI2 * r2_id[i] * (X[teamB][i] - X[teamA][i]))

        for i in range(self.n):
            if nextA[i] > self.max_xi:
                nextA[i] = self.max_xi
            elif nextA[i] < self.min_xi:
                nextA[i] = self.min_xi

        return nextA
