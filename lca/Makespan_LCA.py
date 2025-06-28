import time
from dev import LeagueChampionshipAlgorithm
import os
import json
import random
import numpy as np
from util import get_config, get_cost_config, sort_vms

vms = list()
cloudlets = list()
cost_config = {}

class makespan_LCA(LeagueChampionshipAlgorithm):
    """
    League Championship Algorithm variant for makespan optimization.

    Extends the base LCA to optimize cloudlet-to-VM assignments for minimal makespan
    (total completion time).
    """

    def makespan(self, x):
        """
        Calculate makespan (total completion time) for cloudlet-to-VM scheduling.

        Args:
            x : one team (solution), where it is a list
                     of VM indices assigned to each cloudlet

        Returns:
            int : Makespan value for the solution x
        """

        vm_workload = [np.zeros(vms[int(vm_idx)]['vm_pes'], np.uint64)
                       for vm_idx in range(len(vms))]
        for cloudlet_idx, vm_idx in enumerate(x):
            min_index = np.argmin(vm_workload[int(vm_idx)])

            vm_workload[int(
                vm_idx)][min_index] += cloudlets[cloudlet_idx]['length']

        for vm_idx in range(len(vms)):
            vm_workload[vm_idx] //= vms[vm_idx]['vm_mips']

        makespan = np.max(vm_workload)
        return makespan
        
    def fitness(self, X):
        """
        Calculate makespan (total completion time) for cloudlet-to-VM scheduling.

        Args:
            X (list): List of teams (solutions), where each solution is a list
                     of VM indices assigned to each cloudlet

        Returns:
            list: Makespan values for each solution in X
        """

        # Initialize VM workload tracking

        fitness = list()
        for x in X:
            makespan = self.makespan(x)
            fitness.append(makespan)

        return fitness


def run():
    global n, vms, cloudlets
    n, vms, cloudlets = get_config()
    cost_config = get_cost_config()
    vms, original_indices = sort_vms(vms)
    start_time = time.time()
    lca = makespan_LCA(n=n, max_xi=len(vms)-1, path_w="lca/Makespan_LCA.txt")
    best = lca.league()
    print(f"Time taken: {time.time() - start_time:.4f} sec")
    best = min(best, key=lca.makespan)
    best = np.floor(best).astype(int)
    selected_vms = [original_indices[i] for i in best]
    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(f"{current_dir}/../makespan_LCA_schedule.json", "w") as f:
        result = {"schedule": selected_vms}
        json.dump(result, f, indent=4)

if __name__ == "__main__":
    run()
