from collections import defaultdict
import heapq
import time
import os
import sys

import numpy as np
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, os.pardir))
sys.path.append(parent_dir)

from lca.util import get_config, get_cost_config, sort_vms, get_solution, export_results  # nopep8
from lca.dev import LeagueChampionshipAlgorithm  # nopep8


vms = list()
cloudlets = list()
cost_config = {}


class Non_Vectorized_MO_LCA(LeagueChampionshipAlgorithm):
    """
    Multi-Objective League Championship Algorithm variant for cost and makespan optimization.

    Extends the base LCA to optimize cloudlet-to-VM assignments for minimal cost and minimal makespan.
    """

    def configure(self):
        self.vms = np.array(vms)
        self.cloudlets = np.array(cloudlets)
        self.cost_config = cost_config

        self.makespan = self.makespan_time_shared
        if self.mode == "space":
            self.makespan = self.makespan_space_shared

        self.calc_fitness = self.Z

    def makespan_space_shared(self, x):
        """
        Calculate makespan (total completion time) for cloudlet-to-VM scheduling using space shared method.

        Args:
            x : one team (solution), where it is a list
                     of VM indices assigned to each cloudlet

        Returns:
            int : Makespan value for the solution x
        """

        # vm_index -> min-heap of CPU end times
        vm_cpu_queues = defaultdict(list)

        for i, vm_index in enumerate(x):
            vm_index = int(vm_index)
            cloudlet = self.cloudlets[i]
            vm = self.vms[vm_index]
            ext = cloudlet["length"] / vm["vm_mips"]

            # If VM has free CPUs, start immediately
            if len(vm_cpu_queues[vm_index]) < vm["vm_pes"]:
                heapq.heappush(vm_cpu_queues[vm_index], ext)
            else:
                # Wait for the earliest available CPU
                earliest = heapq.heappop(vm_cpu_queues[vm_index])
                finish_time = earliest + ext
                heapq.heappush(vm_cpu_queues[vm_index], finish_time)

        # Find the latest finish time across all CPUs in all VMs
        vm_makespans = [0] * len(self.vms)
        for vm_index, cpu_times in vm_cpu_queues.items():
            vm_makespans[vm_index] = max(cpu_times) if cpu_times else 0.0

        return max(vm_makespans), vm_makespans

    def makespan_time_shared(self, x, context_switch_overhead=0.0):
        """
        Calculate makespan (total completion time) for cloudlet-to-VM scheduling using time shared method.

        Args:
            x : one team (solution), where it is a list
                     of VM indices assigned to each cloudlet

        Returns:
            int : Makespan value for the solution x
        """

        vm_tasks = defaultdict(list)
        for i, vm_index in enumerate(x):
            vm_tasks[int(vm_index)].append(i)

        vm_makespans = [0] * len(self.vms)
        for vm_index, task_indices in vm_tasks.items():
            vm = self.vms[vm_index]
            vm_pes = vm["vm_pes"]
            vm_mips = vm["vm_mips"]

            if len(task_indices) <= vm_pes:
                vm_makespan = max(self.cloudlets[i]["length"]
                                  for i in task_indices) / vm_mips
            else:
                total_length = sum(self.cloudlets[i]["length"]
                                   for i in task_indices)
                total_exec = total_length / vm_mips
                # adjust 0.99 to relate to the number of cloudlets
                degree = vm_pes * (0.985 ** vm_pes)
                vm_makespan = (
                    total_exec/degree) + context_switch_overhead
            vm_makespans[vm_index] = vm_makespan

        return max(vm_makespans), vm_makespans

    def cost(self, x, re_ut=0.8):
        """
        Calculate cost (vms running cost) for cloudlet-to-VM scheduling.

        Args:
            x : one team (solution), where it is a list
                     of VM indices assigned to each cloudlet

        Returns:
            int : Cost value for the solution x
        """

        enecon_vm = []
        makespan, vm_makespans = self.makespan(x)
        p_active = self.cost_config["p_active"]
        p_idle = self.cost_config["p_idle"]
        x = 1 + self.cost_config["x"]
        p_u = self.cost_config["p_u"]
        for j, vm_makespan in enumerate(vm_makespans):
            energy = p_active * vm_makespan + p_idle * (makespan - vm_makespan)
            energy = energy * self.cost_config["CostPerSecond"] * (
                self.vms[j]["vm_mips"] ** x) * self.vms[j]["vm_pes"] / (1000 * (p_u ** x))
            enecon_vm.append(energy)

        act = (max(enecon_vm) - min(enecon_vm)) * \
            re_ut + min(enecon_vm) if enecon_vm else 0.0

        total_cost = sum(enecon_vm) + act
        return total_cost

    def Z(self, x):
        """
        Calculate fitness (Z) for cloudlet-to-VM scheduling.

        Args:
            x : one team (solution), where it is a list
                     of VM indices assigned to each cloudlet

        Returns:
            int : fitness value for the solution x,
            s combining the two values of cost and makespan
        """

        cost = self.cost(x) / self.fitness_scale
        makespan, _ = self.makespan(x)
        makespan /= self.fitness_scale

        z = (0.5 * cost + 0.5 * makespan) * self.fitness_scale
        return z


def run():
    global n, vms, cloudlets, cost_config
    n, vms, cloudlets, mode = get_config()
    cost_config = get_cost_config()
    vms, original_indices = sort_vms(vms)
    start_time = time.time()
    lca = Non_Vectorized_MO_LCA(n=n, max_xi=len(
        vms)-1, path_w="Non_Vectorized_MO_LCA.txt", mode=mode)
    best = lca.league()
    running_tme = time.time() - start_time
    print(f"Time taken: {running_tme:.4f} sec")
    export_results("Non_Vectorized_MO_LCA", best, lca.calc_fitness,
                   original_indices, running_tme)


if __name__ == "__main__":
    run()
