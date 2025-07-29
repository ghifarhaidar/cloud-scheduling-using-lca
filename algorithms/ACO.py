import time
import numpy as np
import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, os.pardir))
sys.path.append(parent_dir)
from lca.util import get_config, get_cost_config, sort_vms, get_solution, export_results


# ACO scheduler
class Ant:
    def __init__(self, lengths, eff_mips, pheromone, alpha=1.0, beta=1.0, Q=100):
        self.lengths = lengths                # array of task lengths, shape (N,)
        self.eff_mips = eff_mips              # array of effective MIPS, shape (V,)
        self.pheromone = pheromone            # array shape (V,N)
        self.alpha = alpha
        self.beta = beta
        self.Q = Q
        self.V, self.N = pheromone.shape
        self.tour = []
        self.tabu = np.zeros(self.N, dtype=bool)
        # cumulative load per VM
        self.TL = np.zeros(self.V)
        # select random start
        first_vm = np.random.randint(self.V)
        first_task = np.random.randint(self.N)
        self.tour.append((first_vm, first_task))
        self.tabu[first_task] = True
        self.TL[first_vm] += self.lengths[first_task]

    def _dij(self):
        # compute matrix of times: (TL[:,None] + lengths[None,:]) / eff_mips[:,None]
        return (self.TL[:, None] + self.lengths[None, :]) / self.eff_mips[:, None]

    def select_next(self):
        # masked times
        times = self._dij()
        # eta = 1/times
        eta = 1.0 / times
        eta[:, self.tabu] = 0
        # tau
        tau = np.power(self.pheromone, self.alpha)
        # probability matrix
        prob = tau * np.power(eta, self.beta)
        # normalize
        total = prob.sum()
        if total <= 0:
            # fallback assign first free task to VM0
            free = np.where(~self.tabu)[0]
            t = free[0]
            self.tour.append((0, t))
            self.tabu[t] = True
            self.TL[0] += self.lengths[t]
            return
        prob /= total
        # flatten and choose
        flat = prob.flatten()
        idx = np.searchsorted(flat.cumsum(), np.random.rand())
        vm, t = divmod(idx, self.N)
        self.tour.append((vm, t))
        self.tabu[t] = True
        self.TL[vm] += self.lengths[t]

    def calc_length(self):
        # compute per-VM times
        times = np.zeros(self.V)
        for vm, t in self.tour:
            times[vm] += self.lengths[t] / self.eff_mips[vm]
        return times.max()

    def calc_delta(self, tour_length):
        delta = np.zeros_like(self.pheromone)
        for vm, t in self.tour:
            delta[vm, t] = self.Q / tour_length
        return delta

class ACO:
    def __init__(self, num_ants=10, max_gen=50, alpha=1.0, beta=1.0, rho=0.5, Q=100):
        self.num_ants = num_ants
        self.max_gen = max_gen
        self.alpha = alpha
        self.beta = beta
        self.rho = rho
        self.Q = Q
        self.best_tour = None
        self.best_length = np.inf

    def run(self, lengths, eff_mips):
        V = eff_mips.shape[0]
        N = lengths.shape[0]
        pheromone = np.full((V, N), 0.1)
        for gen in range(self.max_gen):
            deltas = np.zeros_like(pheromone)
            for _ in range(self.num_ants):
                ant = Ant(lengths, eff_mips, pheromone, self.alpha, self.beta, self.Q)
                for _ in range(1, N):
                    ant.select_next()
                length = ant.calc_length()
                if length < self.best_length:
                    self.best_length = length
                    self.best_tour = list(ant.tour)
                deltas += ant.calc_delta(length)
            pheromone = (1 - self.rho) * pheromone + deltas
        return self.best_tour, self.best_length

    def report(self, best_tour, best_length):
        print(f"Optimal makespan: {best_length:.4f}")
        for vm, task in best_tour:
            print(f"Cloudlet #{task} -> VM #{vm}")


def run():
    # load config
    n, vms_conf, cloudlets_conf, mode = get_config()
    cost_config = get_cost_config()
    vms_conf, original_indices = sort_vms(vms_conf)
    # extract lengths and eff_mips arrays
    lengths = np.array([c['length'] for c in cloudlets_conf])
    eff_mips = np.array([v['vm_mips'] * v['vm_pes'] for v in vms_conf])

    start = time.time()
    aco = ACO(num_ants=n, max_gen=10)
    best_tour, best_length = aco.run(lengths, eff_mips)
    tour_array = np.zeros(n, dtype=int)
    for vm, t in best_tour:
        tour_array[t] = vm
    # aco.report(best_tour, best_length)

    elapsed = time.time() - start
    print(f"Time taken: {elapsed:.4f} sec")

    export_results("ACO", [tour_array], lambda pos: best_length,
                   original_indices, elapsed)

if __name__ == "__main__":
    run()