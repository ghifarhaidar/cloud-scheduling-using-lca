import time
import numpy as np
import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, os.pardir))
sys.path.append(parent_dir)
from lca.util import get_config, get_cost_config, sort_vms, get_solution, export_results

# PSO scheduler
class PSO:
    def __init__(self, num_particles=30, max_iter=500, w=0.9, c1=2.0, c2=2.0, alpha=0.3):
        self.num_particles = num_particles
        self.max_iter = max_iter
        self.w = w
        self.c1 = c1
        self.c2 = c2
        self.alpha = alpha
        self.best_position = None
        self.best_fitness = np.inf

    def _initialize(self, N, V):
        positions = np.random.randint(0, V, size=(self.num_particles, N))
        velocities = np.random.uniform(-1, 1, size=(self.num_particles, N))
        pbest_pos = positions.copy()
        pbest_fit = np.full(self.num_particles, np.inf)
        return positions, velocities, pbest_pos, pbest_fit

    def _fitness(self, assignment, time_matrix):
        # time_matrix: shape (N, V) of execution times
        # total execution time
        total_time = time_matrix[np.arange(assignment.size), assignment].sum()
        # makespan per VM
        vm_loads = np.zeros(time_matrix.shape[1])
        for task, vm in enumerate(assignment):
            vm_loads[vm] += time_matrix[task, vm]
        makespan = vm_loads.max()
        # combined objective
        return self.alpha * total_time + (1 - self.alpha) * makespan

    def run(self, time_matrix):
        N, V = time_matrix.shape
        pos, vel, pbest_pos, pbest_fit = self._initialize(N, V)
        gbest_pos = None
        gbest_fit = np.inf

        for it in range(self.max_iter):
            for i in range(self.num_particles):
                assignment = pos[i].astype(int)
                fit = self._fitness(assignment, time_matrix)
                if fit < pbest_fit[i]:
                    pbest_fit[i] = fit
                    pbest_pos[i] = assignment.copy()
                if fit < gbest_fit:
                    gbest_fit = fit
                    gbest_pos = assignment.copy()
            # update velocity and position
            r1 = np.random.rand(self.num_particles, N)
            r2 = np.random.rand(self.num_particles, N)
            vel = (self.w * vel
                   + self.c1 * r1 * (pbest_pos - pos)
                   + self.c2 * r2 * (gbest_pos - pos))
            pos = pos + vel
            pos = np.floor(pos).astype(int) % V
            # if it % 10 == 0:
            #     print(f"Iteration {it}, best fitness: {gbest_fit:.4f}")

        self.best_position = gbest_pos
        self.best_fitness = gbest_fit
        return gbest_pos, gbest_fit

    def report(self):
        print(f"Best fitness: {self.best_fitness:.4f}")
        for task, vm in enumerate(self.best_position):
            print(f"Cloudlet #{task} -> VM #{vm}")


def run():
    # load configurations
    _, vms_conf, cloudlets_conf, _ = get_config()
    # cost_config available but not used for time-based schedule
    _ = get_cost_config()
    vms_conf, original_indices = sort_vms(vms_conf)

    # build time matrix: time = cloudlet.length / (vm_mips * vm_pes)
    lengths = np.array([c['length'] for c in cloudlets_conf])
    eff_mips = np.array([v['vm_mips'] * v['vm_pes'] for v in vms_conf])
    time_matrix = lengths[:, None] / eff_mips[None, :]

    start = time.time()
    pso = PSO(num_particles=len(cloudlets_conf), max_iter=500)
    best_pos, best_fit = pso.run(time_matrix)
    # pso.report()

    elapsed = time.time() - start
    print(f"Time taken: {elapsed:.4f} sec")

    export_results(
        "PSO", [best_pos.tolist()],
        lambda pos: best_fit,
        original_indices, elapsed)

if __name__ == "__main__":
    run()
