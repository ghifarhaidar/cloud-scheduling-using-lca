import time
import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, os.pardir))
sys.path.append(parent_dir)
from lca.util import get_config, get_cost_config, sort_vms, get_solution, export_results


vms = list()
cloudlets = list()
cost_config = {}

class RoundRobin(object):
    def get_solution(self):
        m = len(vms)
        """Returns a round robin team"""
        return [i % m for i in range(n)]


def run():
    global n, vms, cloudlets, cost_config
    n, vms, cloudlets, mode = get_config()
    cost_config = get_cost_config()
    vms, original_indices = sort_vms(vms)
    start_time = time.time()
    round_robin = RoundRobin()
    best = [round_robin.get_solution()]
    running_tme = time.time() - start_time
    print(f"Time taken: {running_tme:.4f} sec")
    export_results("Round_Robin", best, lambda x: None,
                   original_indices, running_tme)


if __name__ == "__main__":
    run()