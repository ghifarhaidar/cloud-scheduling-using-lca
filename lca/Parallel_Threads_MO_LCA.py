from collections import defaultdict
import heapq
import time
import os
import sys
from joblib import Parallel, delayed

import numpy as np
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, os.pardir))
sys.path.append(parent_dir)

from lca.util import get_config, get_cost_config, sort_vms, get_solution, export_results  # nopep8
from lca.MO_LCA import MO_LCA  # nopep8

vms = list()
cloudlets = list()
cost_config = {}


class Parallel_Threads_MO_LCA(MO_LCA):
    """
    Parallelized Multi-Objective LCA: inherits MO_LCA, parallelizes fitness and next generation.
    """

    def __init__(self, max_workers=None, **kwargs):
        super().__init__(**kwargs)
        self.max_workers = max_workers or os.cpu_count()

    def configure(self):
        self.vms = np.array(vms)
        self.cloudlets = np.array(cloudlets)
        self.cost_config = cost_config

        self.makespan = self.makespan_time_shared
        if self.mode == "space":
            self.makespan = self.makespan_space_shared

        self.calc_fitness = self.Z
        

    def fitness(self, X, chunk_size=5):
        """
        Parallel fitness evaluation of each team using joblib with chunking.
        """
        def evaluate_chunk(chunk):
            return [100 * self.calc_fitness(x) / self.fitness_scale for x in chunk]

        # Create chunks of X
        chunks = [X[i:i + chunk_size] for i in range(0, len(X), chunk_size)]

        # Process chunks in parallel
        chunk_results = Parallel(n_jobs=self.max_workers, backend="threading")(
            delayed(evaluate_chunk)(chunk) for chunk in chunks
        )

        # Flatten results
        results = [item for sublist in chunk_results for item in sublist]

        return results
    

    def calc_nextX(self, t, fX, f_best, X, B, Y, nextX, chunk_size=5):
        """
        Parallel team updates using joblib with chunking.
        """
        def update_chunk(l_chunk):
            updates = []
            for l in l_chunk:
                teamA, teamB, teamC, teamD = self.teamClassification(t, l)
                w1 = self.winORlose(teamA, teamB, fX, f_best)
                w2 = self.winORlose(teamC, teamD, fX, f_best)
                team = self.setTeamFormation(
                    X, B, Y, teamA, teamB, teamC, teamD, w1, w2)
                updates.append((teamA, team))
            return updates

        # Create chunks of indices
        chunks = [range(i, min(i + chunk_size, self.L))
                for i in range(0, self.L, chunk_size)]

        # Process chunks in parallel
        chunk_results = Parallel(n_jobs=self.max_workers, backend="threading")(
            delayed(update_chunk)(chunk) for chunk in chunks
        )

        # Flatten results and apply updates
        for updates in chunk_results:
            for teamA, team in updates:
                nextX[teamA] = team

        return nextX




def run():
    global n, vms, cloudlets, cost_config
    n, vms, cloudlets, mode = get_config()
    cost_config = get_cost_config()
    vms, original_indices = sort_vms(vms)
    start_time = time.time()
    lca = Parallel_Threads_MO_LCA(n=n, max_xi=len(
        vms)-1, path_w="Parallel_Threads_MO_LCA.txt", mode=mode)
    best = lca.league()
    running_tme = time.time() - start_time
    print(f"Time taken: {running_tme:.4f} sec")
    export_results("Parallel_Threads_MO_LCA", best, lca.calc_fitness,
                   original_indices, running_tme)


if __name__ == "__main__":
    run()
