"""
this is a vectorized version of Non_Vectorized_MO_LCA.py,
check Non_Vectorized_MO_LCA.py for code documentation.

it uses numpy for its calculations.
"""
from collections import defaultdict
import time
import os
import sys

import numpy as np

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, os.pardir))
sys.path.append(parent_dir)

from lca.util import get_config, get_cost_config, sort_vms, get_solution, export_results  # nopep8
from lca.vectorize_dev import LeagueChampionshipAlgorithm  # nopep8


vms = list()
cloudlets = list()
cost_config = {}


class MO_LCA(LeagueChampionshipAlgorithm):
    """
    Vectorized Multi-Objective League Championship Algorithm for cost and makespan optimization.
    """

    def configure(self):
        self.vms = np.array(vms)
        self.cloudlets = np.array(cloudlets)
        self.cost_config = cost_config

        self.vm_mips = np.array([vm["vm_mips"] for vm in self.vms])
        self.vm_pes = np.array([vm["vm_pes"] for vm in self.vms])
        self.cloudlet_lengths = np.array([c["length"] for c in self.cloudlets])

        self.makespan = self.makespan_time_shared
        if self.mode == "space":
            self.makespan = self.makespan_space_shared

        self.calc_fitness = self.Z
        self.makespan_scale , _= self.makespan(np.array(self.round_robin()))
        self.cost_scale = self.cost(np.array(self.round_robin()))

    def makespan_space_shared(self, x):
        vm_mips = self.vm_mips
        vm_pes = self.vm_pes
        cloudlet_lengths = self.cloudlet_lengths

        x_int = x.astype(int)
        num_vms = len(vm_mips)

        # Calculate execution times for all cloudlets
        ext_times = cloudlet_lengths / vm_mips[x_int]

        # Initialize makespans
        vm_makespans = np.zeros(num_vms)

        for vm_idx in range(num_vms):
            # Get all cloudlets assigned to this VM
            assigned_mask = (x_int == vm_idx)
            assigned_ext = ext_times[assigned_mask]

            if len(assigned_ext) == 0:
                continue

            pes = vm_pes[vm_idx]

            # Initialize PE finish times
            pe_times = np.zeros(pes)

            # Distribute tasks to the PE that will finish earliest
            for ext in assigned_ext:
                pe_idx = np.argmin(pe_times)
                pe_times[pe_idx] += ext

            vm_makespans[vm_idx] = np.max(pe_times)

        return np.max(vm_makespans), vm_makespans

    def makespan_time_shared(self, x, context_switch_overhead=0.0):
        vm_mips = self.vm_mips
        vm_pes = self.vm_pes
        cloudlet_lengths = self.cloudlet_lengths

        x_int = x.astype(int)
        num_vms = len(vm_mips)

        # Calculate total lengths and counts per VM
        vm_task_sums = np.bincount(
            x_int, weights=cloudlet_lengths, minlength=num_vms)
        vm_task_counts = np.bincount(x_int, minlength=num_vms)

        # Create mask for all VM-cloudlet assignments
        vm_indices = np.arange(num_vms)[:, np.newaxis]
        assignment_mask = (x_int == vm_indices)

        # For underutilized VMs: find max cloudlet length
        # Set lengths to -inf where not assigned to handle empty VMs
        masked_lengths = np.where(assignment_mask, cloudlet_lengths, -np.inf)
        max_lengths = np.max(masked_lengths, axis=1)
        max_lengths[max_lengths == -np.inf] = 0  # Handle unassigned VMs

        # Calculate degree of degradation for overloaded VMs
        degree = vm_pes * (0.985 ** vm_pes)

        # Compute makespans
        underutilized = vm_task_counts <= vm_pes
        vm_makespans = np.where(
            underutilized,
            max_lengths / vm_mips,
            (vm_task_sums / (vm_mips * degree)) + context_switch_overhead
        )

        return np.max(vm_makespans), vm_makespans

    def cost(self, x, re_ut=0.8):
        makespan, vm_makespans = self.makespan(x)
        vm_mips = self.vm_mips
        vm_pes = self.vm_pes

        p_active = self.cost_config["p_active"]
        p_idle = self.cost_config["p_idle"]
        CostPerSecond = self.cost_config["CostPerSecond"]
        power_x = 1 + self.cost_config["x"]
        p_u = self.cost_config["p_u"]

        # Vectorized energy computation
        energy_active = p_active * vm_makespans
        energy_idle = p_idle * (makespan - vm_makespans)
        energy_total = (energy_active + energy_idle) * CostPerSecond * \
            (vm_mips ** power_x) * vm_pes / (1000 * (p_u ** power_x))

        act = (np.max(energy_total) - np.min(energy_total)) * \
            re_ut + np.min(energy_total)
        total_cost = np.sum(energy_total) + act

        return total_cost

    def Z(self, x):
        cost = self.cost(x) / self.cost_scale
        makespan, _ = self.makespan(x)
        makespan /= self.makespan_scale

        z = (0.3 * cost + 0.7 * makespan) * self.fitness_scale
        return z


def run():
    global n, vms, cloudlets, cost_config
    n, vms, cloudlets, mode = get_config()
    cost_config = get_cost_config()
    vms, original_indices = sort_vms(vms)
    start_time = time.time()
    lca = MO_LCA(n=n, max_xi=len(vms)-1,
                 path_w="MO_LCA.txt", mode=mode)
    best = lca.league()
    running_time = time.time() - start_time
    print(f"Time taken: {running_time:.4f} sec")
    export_results("MO_LCA", best, lca.calc_fitness,
                   original_indices, running_time)


if __name__ == "__main__":
    run()
