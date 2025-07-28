"""
this is a vectorized version of dev.py,
check dev.py for code documentation.

it uses numpy for its calculations.
"""
import os
import numpy as np
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


class LeagueChampionshipAlgorithm:
    def __init__(self, L=L, S=S, n=n, p_c=p_c, PSI1=PSI1, PSI2=PSI2, min_xi=0, max_xi=0,q0=q0 ,path_w="LCA.txt", mode="time"):
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
        pass

    def round_robin(self):
        return np.arange(self.n) % (self.max_xi + 1)

    def league(self):
        wfile = open(self.path_w, mode='w')

        X = self.getRandomTeams(self.min_xi, self.max_xi)

        DUMMY_TEAM = self.getRandomTeam(self.min_xi, self.max_xi)

        if self.L % 2 == 1:
            X = np.vstack([X, DUMMY_TEAM])
            self.L += 1
            self.L_half += 1

        fX = self.fitness(X)
        nextX = np.copy(X)
        B = np.copy(X)
        fB = np.copy(fX)

        f_best = np.min(fB)
        f_bList = [f_best]

        t = 1
        self.genericSchedule = self.generateRoundRobinSchedule()
        self.schedule = self.leagueSchedule(t)

        wfile.write(f"t={t}, f_best={f_best}\n")

        while t < self.S * (self.L - 1):
            if t % 10 == 0:
                wfile.write(f"t={t}, f_best={f_best}\n")

            Y = self.get_Y()
            nextX = self.calc_nextX(t, fX, f_best, X, B, Y, nextX)

            X = np.copy(nextX)
            fX = self.fitness(X)

            improvement_mask = fX < fB
            B[improvement_mask] = X[improvement_mask]
            fB[improvement_mask] = fX[improvement_mask]

            f_best = np.min(fB)
            f_bList.append(f_best)

            if t % (self.L - 1) == 0:
                self.schedule = self.leagueSchedule(t)
            t += 1

        return B

    def calc_nextX(self, t, fX, f_best, X, B, Y, nextX):
        teamA = np.arange(self.L)
        tmp_t = t % (self.L - 1)
        teamB = np.array([self.schedule[l][tmp_t - 2] for l in teamA])
        teamC = np.array([self.schedule[l][tmp_t - 1] for l in teamA])
        teamD = np.array([self.schedule[teamC[l]][tmp_t - 2] for l in teamA])

        winner1 = self.winORlose(teamA, teamB, fX, f_best)
        winner2 = self.winORlose(teamC, teamD, fX, f_best)

        nextX = self.setTeamFormation(
            X, B, Y, teamA, teamB, teamC, teamD, winner1, winner2)
        return nextX

    def getRandomTeam(self, min_val, max_val):
        return np.random.randint(min_val, max_val + 1, size=(self.n,))

    def getRandomTeams(self, min_val, max_val):
        return np.random.randint(min_val, max_val + 1, size=(self.L, self.n))

    def leagueSchedule(self, t):
        if t == 1:
            return np.copy(self.genericSchedule)
        else:
            shuffled = np.random.permutation(self.L)
            reversed_shuffled = np.argsort(shuffled)
            return np.array([
                shuffled[self.genericSchedule[reversed_shuffled[i]]]
                for i in range(self.L)
            ])

    def generateRoundRobinSchedule(self):
        teams = np.arange(self.L)
        schedule = [[] for _ in range(self.L)]

        for _ in range(self.L - 1):
            for i in range(self.L_half):
                home = teams[i]
                away = teams[self.L - 1 - i]
                schedule[home].append(away)
                schedule[away].append(home)
            teams[1:] = np.roll(teams[1:], shift=1)
        return np.array(schedule)

    def winORlose(self, team1, team2, fX, f_best):
        denom = (fX[team2] + fX[team1] - 2.0 * f_best)
        winPoint = np.where(
            denom == 0,
            0.5,
            (fX[team2] - f_best) / denom
        )
        rand_vals = np.random.uniform(0.0, 1.0, size=team1.shape)
        winner = np.where(rand_vals <= winPoint, team1, team2)
        return winner

    def fitness(self, X):
        return 100 * np.array([self.calc_fitness(x) for x in X]) / self.fitness_scale

    def get_Y(self):
        self.q0 = 1
        a = np.random.uniform(0.0, 1.0, size=(self.L,))
        flagNum = (
            np.log(1 - (1 - (1 - self.p_c) ** (self.n - self.q0 + 1)) * a)
            // np.log(1 - self.p_c)
            + self.q0 - 1
        ).astype(int)

        Y = np.zeros((self.L, self.n), dtype=int)
        for i, q in enumerate(flagNum):
            positions = np.random.choice(self.n, size=q, replace=False)
            Y[i, positions] = 1
        return Y

    def getRandom_rid(self):
        r1 = np.random.uniform(0.0, 1.0, size=(self.L, self.n))
        r2 = np.random.uniform(0.0, 1.0, size=(self.L, self.n))
        return r1, r2

    def setTeamFormation(self, X, B, Y, teamA, teamB, teamC, teamD, winner1, winner2):
        r1, r2 = self.getRandom_rid()
        nextA = np.copy(B).astype(float)

        mask_S_T = (winner1 == teamA) & (winner2 == teamC)
        mask_S_O = (winner1 == teamA) & (winner2 == teamD)
        mask_W_T = (winner1 != teamA) & (winner2 == teamC)
        mask_W_O = (winner1 != teamA) & (winner2 == teamD)

        delta = np.zeros_like(nextA, dtype=float)

        delta[mask_S_T] = (
            self.PSI1 * r1[mask_S_T] * (X[teamA[mask_S_T]] - X[teamD[mask_S_T]]) +
            self.PSI1 * r2[mask_S_T] *
            (X[teamA[mask_S_T]] - X[teamB[mask_S_T]])
        )

        delta[mask_S_O] = (
            self.PSI2 * r1[mask_S_O] * (X[teamD[mask_S_O]] - X[teamA[mask_S_O]]) +
            self.PSI1 * r2[mask_S_O] *
            (X[teamA[mask_S_O]] - X[teamB[mask_S_O]])
        )

        delta[mask_W_T] = (
            self.PSI1 * r1[mask_W_T] * (X[teamA[mask_W_T]] - X[teamD[mask_W_T]]) +
            self.PSI2 * r2[mask_W_T] *
            (X[teamB[mask_W_T]] - X[teamA[mask_W_T]])
        )

        delta[mask_W_O] = (
            self.PSI2 * r1[mask_W_O] * (X[teamD[mask_W_O]] - X[teamA[mask_W_O]]) +
            self.PSI2 * r2[mask_W_O] *
            (X[teamB[mask_W_O]] - X[teamA[mask_W_O]])
        )

        nextA += Y * delta
        nextA = np.clip(nextA, self.min_xi, self.max_xi)
        return nextA
