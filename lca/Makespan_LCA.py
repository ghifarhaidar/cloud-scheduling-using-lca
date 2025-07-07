import time
from dev import LeagueChampionshipAlgorithm
import os
import json
import random
import numpy as np
import heapq
from collections import defaultdict
from util import get_config, get_cost_config, sort_vms, get_solution, export_results

vms = list()
cloudlets = list()
cost_config = {}


class makespan_LCA(LeagueChampionshipAlgorithm):
    """
    League Championship Algorithm variant for makespan optimization.

    Extends the base LCA to optimize cloudlet-to-VM assignments for minimal makespan
    (total completion time).
    """

    def configure(self):
        self.makespan = self.makespan_time_shared
        if self.mode == "space":
            self.makespan = self.makespan_space_shared

        self.calc_fitness = self.makespan

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
            cloudlet = cloudlets[i]
            vm = vms[vm_index]
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
        vm_finish_times = [
            max(cpu_times) if cpu_times else 0.0 for cpu_times in vm_cpu_queues.values()]
        return max(vm_finish_times)

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

        vm_makespans = []
        for vm_index, task_indices in vm_tasks.items():
            vm = vms[vm_index]
            total_length = sum(cloudlets[i]["length"] for i in task_indices)
            total_exec = total_length / vm["vm_mips"]
            # adjust 0.99 to relate to the number of cloudlets
            degree = vm["vm_pes"] * 0.99
            vm_makespan = (total_exec/vm["vm_pes"]) + context_switch_overhead
            vm_makespans.append(vm_makespan)

        return max(vm_makespans)


def run():
    global n, vms, cloudlets
    n, vms, cloudlets, mode = get_config()
    cost_config = get_cost_config()
    vms, original_indices = sort_vms(vms)
    start_time = time.time()
    lca = makespan_LCA(n=n, max_xi=len(
        vms)-1, path_w="Makespan_LCA.txt", mode=mode)
    best = lca.league()
    running_tme = time.time() - start_time
    print(f"Time taken: {running_tme:.4f} sec")
    export_results("makespan_LCA", best, lca.calc_fitness,
                   original_indices, running_tme)


if __name__ == "__main__":
    run()
