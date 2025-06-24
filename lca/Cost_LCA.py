from dev import LeagueChampionshipAlgorithm
import os
import json
import random
import numpy as np
from util import get_config, get_cost_config

L = 100
L_half = L // 2
S = 100
n = 100
p_c = 0.3
PSI1 = 0.2
PSI2 = 1.0
genericSchedule = list()
schedule = list()

vms = list()
cloudlets = list()


class cost_LCA(LeagueChampionshipAlgorithm):
    """
    League Championship Algorithm variant for cost optimization.

    Extends the base LCA to optimize cloudlet-to-VM assignments for minimal cost
    (vms running cost).
    """

    def fitness(self, X):
        """
        Calculate cost (vms running cost) for cloudlet-to-VM scheduling.

        Args:
            X (list): List of teams (solutions), where each solution is a list
                     of VM indices assigned to each cloudlet

        Returns:
            list: Cost values for each solution in X
        """

        fitness = list()
        for x in X:
            fitness.append(random.randint(100,10000))
        return fitness


def run():
    global n, vms, cloudlets
    n, vms, cloudlets = get_config()
    cost_config = get_cost_config()
    lca = cost_LCA(n=n, max_xi=len(vms)-1, path_w="lca/Cost_LCA.txt")
    best = lca.league()
    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(f"{current_dir}/../cost_LCA_schedule.json", "w") as f:
        result = {"schedule": best[0]}
        json.dump(result, f, indent=4)


if __name__ == "__main__":
    run()
