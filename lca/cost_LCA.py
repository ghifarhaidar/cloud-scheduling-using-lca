import time
import heapq
from collections import defaultdict
import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, os.pardir))
sys.path.append(parent_dir)

from lca.util import get_config, get_cost_config, sort_vms, get_solution, export_results  # nopep8
from lca.dev import LeagueChampionshipAlgorithm  # nopep8


vms = list()
cloudlets = list()
cost_config = {}


class cost_LCA(LeagueChampionshipAlgorithm):
    """
    League Championship Algorithm variant for cost optimization.

    Extends the base LCA to optimize cloudlet-to-VM assignments for minimal cost
    (vms running cost).
    """

    def configure(self):
        self.makespan = self.makespan_time_shared
        if self.mode == "space":
            self.makespan = self.makespan_space_shared

        self.calc_fitness = self.cost

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
        vm_finish_times = [0] * len(vms)
        for vm_index, cpu_times in vm_cpu_queues.items():
            vm_finish_times[vm_index] = max(cpu_times) if cpu_times else 0.0

        return max(vm_finish_times), vm_finish_times

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

        vm_makespans = [0] * len(vms)
        for vm_index, task_indices in vm_tasks.items():
            vm = vms[vm_index]
            vm_pes = vm["vm_pes"]
            vm_mips = vm["vm_mips"]

            if len(task_indices) <= vm_pes:
                vm_makespan = max(cloudlets[i]["length"]
                                  for i in task_indices) / vm_mips
            else:
                total_length = sum(cloudlets[i]["length"]
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
        p_active = cost_config["p_active"]
        p_idle = cost_config["p_idle"]
        x = 1 + cost_config["x"]
        p_u = cost_config["p_u"]
        for j, vm_makespan in enumerate(vm_makespans):
            energy = p_active * vm_makespan + p_idle * (makespan - vm_makespan)
            energy = energy * cost_config["CostPerSecond"] * (
                vms[j]["vm_mips"] ** x) * vms[j]["vm_pes"] / (1000 * (p_u ** x))
            enecon_vm.append(energy)

        act = (max(enecon_vm) - min(enecon_vm)) * \
            re_ut + min(enecon_vm) if enecon_vm else 0.0

        total_cost = sum(enecon_vm) + act
        return total_cost


def run():
    global n, vms, cloudlets, cost_config
    n, vms, cloudlets, mode = get_config()
    cost_config = get_cost_config()
    vms, original_indices = sort_vms(vms)
    start_time = time.time()
    lca = cost_LCA(n=n, max_xi=len(vms)-1,
                   path_w="Cost_LCA.txt", mode=mode)
    best = lca.league()
    running_tme = time.time() - start_time
    print(f"Time taken: {running_tme:.4f} sec")
    export_results("cost_LCA", best, lca.calc_fitness,
                   original_indices, running_tme)


if __name__ == "__main__":
    run()
