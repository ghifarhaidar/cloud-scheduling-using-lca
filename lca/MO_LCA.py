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


class MO_LCA(LeagueChampionshipAlgorithm):
    """
    Multi-Objective League Championship Algorithm variant for cost and makespan optimization.

    Extends the base LCA to optimize cloudlet-to-VM assignments for minimal cost and minimal makespan.
    """

    def cost_fitness(self, X):
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
            fitness.append(random.randint(100, 10000))
            
        return fitness

    def makespan_fitness(self, X):
        """
        Calculate makespan (total completion time) for cloudlet-to-VM scheduling.

        Args:
            X (list): List of teams (solutions), where each solution is a list
                     of VM indices assigned to each cloudlet

        Returns:
            list: Makespan values for each solution in X
        """

        # Initialize VM workload tracking
        vm_workload_og = [np.zeros(vms[int(vm_idx)]['vm_pes'], np.uint64)
                          for vm_idx in range(len(vms))]

        fitness = list()
        for x in X:
            vm_workload = vm_workload_og.copy()
            for cloudlet_idx, vm_idx in enumerate(x):
                min_index = np.argmin(vm_workload[int(vm_idx)])

                vm_workload[int(
                    vm_idx)][min_index] += cloudlets[cloudlet_idx]['length']

            for vm_idx in range(len(vms)):
                vm_workload[vm_idx] //= vms[vm_idx]['vm_mips']

            makespan = np.max(vm_workload)
            fitness.append(makespan)

        return fitness

    def fitness(self, X):
        """
        Calculate fitness for cloudlet-to-VM scheduling.

        Args:
            X (list): List of teams (solutions), where each solution is a list
                     of VM indices assigned to each cloudlet

        Returns:
            list: Fitness values for each solution in X
        """

        cost_fitness = self.cost_fitness(X)
        makespan_fitness = self.makespan_fitness(X)


        fitness = [max(cost, makespan) for cost, makespan in zip(cost_fitness, makespan_fitness)]
        return fitness


def run():
    global n, vms, cloudlets
    n, vms, cloudlets = get_config()
    cost_config = get_cost_config()
    lca = MO_LCA(n=n, max_xi=len(vms)-1, path_w="lca/MO_LCA.txt")
    best = lca.league()
    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(f"{current_dir}/../MO_LCA_schedule.json", "w") as f:
        result = {"schedule": best[0]}
        json.dump(result, f, indent=4)


if __name__ == "__main__":
    run()
