import numpy as np
import random


L = 6  
L_half = L // 2  
S = 100 
n = 10 
p_c = 0.3
PSI1 = 0.2
PSI2 = 1.0
genericSchedule = list()
schedule = list()

class LeagueChampionshipAlgorithm(object):
    def __init__(self, L=L, S=S, n=n, p_c=p_c, PSI1=PSI1, PSI2=PSI2):
        self.L = L  
        self.L_half = L // 2  
        self.S = S 
        self.n = n 
        self.p_c = p_c
        self.PSI1 = PSI1
        self.PSI2 = PSI2
        return
    
    def league(self):
        path_w = "LCA.txt"
        wfile = open(path_w, mode='w')

        X = self.getRandomTeams(self.L)
        
        DUMMY_TEAM = self.getRandomTeam()
        
        if self.L % 2 == 1:
            X.append(DUMMY_TEAM)
            self.L += 1
            self.L_half += 1    

        fX = list(0 for _ in range(L))
        fX = self.fitness(X)
        nextX = list(X)

        B = list(X)
        fB = list(fX)

        fbest = min(fB) 
        f_bList = list()
        f_bList.append(fbest)

        t = 1

        global schedule,genericSchedule
        genericSchedule = self.generateRoundRobinSchedule()
        schedule = self.leagueSchedule(t)
        while t < self.S * (self.L - 1):
            if self.L % 2 == 1:
                X.append(DUMMY_TEAM.copy())
            
            if t % (self.L - 1) == 0:
                #self.addOnModule() #add-onを追加できる
                schedule = self.leagueSchedule(t)
            t += 1
            
        return f_bList

    def getRandomTeam(self):
        team = [round(random.uniform(0, 10.0), 6) for i in range(n)]
        return team
    
    def getRandomTeams(self, L):
        X = [self.getRandomTeam() for i in range(L)]
        return X
    
    def leagueSchedule(self, t):
        global schedule,genericSchedule
        if t==1:
            schedule = genericSchedule.copy()
        
        else:
            teams = list(range(L))
            shuffledTeams = teams.copy()
            random.shuffle(shuffledTeams)
            reversedShuffledTeams = list(range(L))
            for i in range(self.L):
                reversedShuffledTeams[shuffledTeams[i]] = i

            for i in range(self.L):
                schedule[i] = genericSchedule[reversedShuffledTeams[i]]
                schedule[i]  = list(map(lambda x: shuffledTeams[x], schedule[i])) 
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

    def fitness(self):
        pass

    