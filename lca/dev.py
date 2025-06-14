import numpy as np
import random
import math

L = 50
L_half = L // 2
S = 10
n = 10
p_c = 0.3
PSI1 = 0.2
PSI2 = 1.0
genericSchedule = list()
schedule = list()


class LeagueChampionshipAlgorithm(object):
    def __init__(self, L=L, S=S, n=n, p_c=p_c, PSI1=PSI1, PSI2=PSI2,min_xi=0,max_xi=0,path_w="lca/LCA.txt"):
        self.L = L
        self.L_half = L // 2
        self.S = S
        self.n = n
        self.p_c = p_c
        self.PSI1 = PSI1
        self.PSI2 = PSI2
        self.min_xi = min_xi
        self.max_xi = max_xi
        self.path_w = path_w
        return

    def league(self):
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

        global schedule, genericSchedule
        genericSchedule = self.generateRoundRobinSchedule()
        schedule = self.leagueSchedule(t)
        wfile.write("t =%d, f_best=%f\n" % (t, f_best))
        while t < self.S * (self.L - 1):
            print(t)
            if t % 10 == 0:
                wfile.write("t =%d, f_best=%f\n" % (t, f_best))

            Y = self.get_Y()

            # for _ , i in enumerate(schedule):
            # print("team ",_ ,": " , i)

            for l in range(self.L):
                teamA, teamB, teamC, teamD = self.teamClassification(t, l)
                # print (teamA, teamB, teamC, teamD)
                winner1 = self.winORlose(teamA, teamB, fX, f_best)
                winner2 = self.winORlose(teamC, teamD, fX, f_best)
                nextX[teamA] = self.setTeamFormation(
                    X, B, Y, teamA, teamB, teamC, teamD, winner1, winner2)

            X = nextX.copy()

            fX = self.fitness(X)

            for l in range(self.L):
                if fX[l] < fB[l]:
                    B[l] = X[l]
                    fB[l] = fX[l]
            f_best = min(fB)
            f_bList.append(f_best)

            if t % (self.L - 1) == 0:
                # self.addOnModule() #add-onを追加できる
                schedule = self.leagueSchedule(t)
            t += 1

        return f_bList

    def getRandomTeam(self, min, max):
        if min > max:
            min, max = max, min  # Swap if reversed

        team = [random.randint(min, max) for _ in range(self.n)]
        return team

    def getRandomTeams(self, min, max):
        X = [self.getRandomTeam(min, max) for _ in range(self.L)]
        return X

    def leagueSchedule(self, t):
        global schedule, genericSchedule
        if t == 1:
            schedule = genericSchedule.copy()

        else:
            teams = list(range(self.L))
            shuffledTeams = teams.copy()
            random.shuffle(shuffledTeams)
            reversedShuffledTeams = list(range(self.L))
            for i in range(self.L):
                reversedShuffledTeams[shuffledTeams[i]] = i

            for i in range(self.L):
                schedule[i] = genericSchedule[reversedShuffledTeams[i]]
                schedule[i] = list(
                    map(lambda x: shuffledTeams[x], schedule[i]))
        return schedule

    def generateRoundRobinSchedule(self):
        """
        Generates a round-robin schedule using circular rotation method.

        Args:
            num_teams: Integer number of teams

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
        tmp_t = t % (self.L - 1)
        teamA = l
        teamB = schedule[l][tmp_t-2]
        teamC = schedule[l][tmp_t-1]
        teamD = schedule[teamC][tmp_t-2]

        return teamA, teamB, teamC, teamD

    def winORlose(self, team1, team2, fX, f_best):
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
        random_list = random.sample(range(1, 1000 + 1), len(X))
        return random_list

    def get_Y(self):
        q0 = 1
        Y = list()
        y_sample = [i for i in range(self.n)]
        for i in range(self.L):
            y = [0] * self.n
            a = random.uniform(0.0, 1.0)
            flagNum = (math.log(1 - (1 - (1 - p_c)**(self.n - q0 + 1)) * a) //
                       math.log(1 - p_c)) + q0 - 1
            q = int(flagNum)
            poInt = list(random.sample(range(self.n), q))
            poInt.sort()
            for pos in poInt:
                y[pos] = 1
            Y.append(y)
        return Y

    def getRandom_rid(self):
        r1_id = [random.uniform(0.0, 1.0) for _ in range(n)]
        r2_id = [random.uniform(0.0, 1.0) for _ in range(n)]
        return r1_id, r2_id

    def setTeamFormation(self, X, B, Y, teamA, teamB, teamC, teamD, winner1, winner2):
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
