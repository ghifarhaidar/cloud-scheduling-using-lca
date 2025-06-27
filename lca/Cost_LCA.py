from dev import LeagueChampionshipAlgorithm
import os
import json
import random
import numpy as np
from util import get_config, get_cost_config, sort_vms

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
cost_config = {}


class cost_LCA(LeagueChampionshipAlgorithm):
    """
    League Championship Algorithm variant for cost optimization.

    Extends the base LCA to optimize cloudlet-to-VM assignments for minimal cost
    (vms running cost).
    """

    def cost(self, x):
        """
        Calculate cost (vms running cost) for cloudlet-to-VM scheduling.

        Args:
            x : one team (solution), where it is a list
                     of VM indices assigned to each cloudlet

        Returns:
            int : Cost value for the solution x
        """

        vm_workload = [np.zeros(vms[int(vm_idx)]['vm_pes'], np.uint64)
                       for vm_idx in range(len(vms))]

        for cloudlet_idx, vm_idx in enumerate(x):
            min_index = np.argmin(vm_workload[int(vm_idx)])

            vm_workload[int(
                vm_idx)][min_index] += cloudlets[cloudlet_idx]['length']

        vm_time = [np.zeros(vms[int(vm_idx)]['vm_pes'])
                   for vm_idx in range(len(vms))]

        for vm_idx in range(len(vms)):
            vm_time[vm_idx] = vm_workload[vm_idx] / vms[vm_idx]['vm_mips']

        max_values = [np.max(arr) for arr in vm_time]

        cost = 0
        for vm_idx in range(len(vms)):
            cost += max_values[vm_idx] * vms[vm_idx]['vm_mips'] * \
                vms[vm_idx]['vm_pes'] * \
                cost_config["CostPerSecond"] / 1000000
        return cost

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
            cost = self.cost(x)
            fitness.append(cost)

        return fitness


def run():
    global n, vms, cloudlets, cost_config
    n, vms, cloudlets = get_config()
    cost_config = get_cost_config()
    vms, original_indices = sort_vms(vms)
    lca = cost_LCA(n=n, max_xi=len(vms)-1, path_w="lca/Cost_LCA.txt")
    best = lca.league()
    best = min(best, key=lca.cost)
    best = np.floor(best).astype(int)
    selected_vms = [original_indices[i] for i in best]
    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(f"{current_dir}/../cost_LCA_schedule.json", "w") as f:
        result = {"schedule": selected_vms}
        json.dump(result, f, indent=4)

if __name__ == "__main__":
    run()
