import numpy as np
import random


L = 100  
L_half = L / 2  
S = 100 
n = 10 
p_c = 0.3
PSI1 = 0.2
PSI2 = 1.0

class LeagueChampionshipAlgorithm(object):
    def __init__(self, L, S, n, p_c, PSI1, PSI2):
        self.L = L  
        self.L_half = L / 2  
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

        schedule = self.leagueSchedule()
        while t < self.S * (self.L - 1):
            if self.L % 2 == 1:
                X.append(DUMMY_TEAM.copy())
            
            if t % (self.L - 1) == 0:
                #self.addOnModule() #add-onを追加できる
                schedule = self.leagueSchedule()
            t += 1
            
        return f_bList

    def getRandomTeam(self):
        team = [round(random.uniform(0, 10.0), 6) for i in range(n)]
        return team
    
    def getRandomTeams(self, L):
        X = [self.getRandomTeam() for i in range(L)]
        return X
    
    def leagueSchedule(self):
        pass

    def fitness(self):
        pass
    
    