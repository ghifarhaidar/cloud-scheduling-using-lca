from dev import LeagueChampionshipAlgorithm
import os
import json
import random
import numpy as np


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


def get_config():
    global n, vms, cloudlets

    with open('sim_config.json', 'r') as file:
        data = json.load(file)

    vms = data['vms']
    cloudlets = data['cloudlets']

    n = len(cloudlets)

# this needs to be updated so it suport multi pes for each vm and cloudlet if needed


class makespan_LCA(LeagueChampionshipAlgorithm):

    def fitness(self, X):
        """
        Calculate makespan (total completion time) for cloudlet-to-VM scheduling.
        """

        # Initialize VM workload tracking
        vm_workload = np.zeros(len(vms))

        fitness = list()
        # Calculate completion time for each VM
        for x in X:
            for cloudlet_idx, vm_idx in enumerate(x):
                execution_time = cloudlets[cloudlet_idx]['length'] / \
                    vms[int(vm_idx)]['vm_mips']
                vm_workload[int(vm_idx)] += execution_time

            makespan = np.max(vm_workload)
            fitness.append(makespan)

        return fitness


if __name__ == "__main__":
    get_config()
    lca = makespan_LCA(n=n, max_xi=len(vms)-1, path_w="lca/Makespan_LCA.txt")
    best = lca.league()
    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(f"{current_dir}/../makespan_LCA_schedule.json", "w") as f:
        result = {"schedule": best[0]}
        json.dump(result, f, indent=4)
