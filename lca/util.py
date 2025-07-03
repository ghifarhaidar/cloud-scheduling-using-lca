import json
import os
import numpy as np


def get_config():
    with open('sim_config.json', 'r') as file:
        data = json.load(file)
    mode = data['mode']
    vms = data['vms']
    cloudlets = data['cloudlets']
    n = len(cloudlets)
    print("number of vms:", len(vms))
    print("number of cloudlets:", n)
    return n, vms, cloudlets, mode


def get_cost_config():
    with open('sim_cost_config.json', 'r') as file:
        data = json.load(file)

    return data


def sort_vms(vms):
    indexed_vms = list(enumerate(vms))
    # Sort the VMs by vm_mips * vm_pes in descending order (fastest first)
    sorted_indexed_vms = sorted(
        indexed_vms, key=lambda x: x[1]["vm_mips"] * x[1]["vm_pes"], reverse=True)

    sorted_vms = [vm for (index, vm) in sorted_indexed_vms]
    original_indices = [index for (index, vm) in sorted_indexed_vms]

    return sorted_vms, original_indices


def get_solution(name):
    name = name + "_schedule.json"
    with open(name, 'r') as file:
        data = json.load(file)
    return data["schedule"]

def revert_vms_order(vms,original_indices):
    reverted_vms = [0] * len(vms)
    for i in range(len(vms)):
        reverted_vms[original_indices[i]] = vms[i]
    return reverted_vms
     


def export_results(name, best, fitness, original_indices):
    best = min(best, key=fitness)
    fbest = fitness(best)
    best = np.floor(best).astype(int)
    selected_vms = [original_indices[i] for i in best]
    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(f"{current_dir}/../{name}_schedule.json", "w") as f:
        result = {"schedule": selected_vms}
        json.dump(result, f, indent=4)
    with open(f"{current_dir}/../{name}_result.json", "w") as f:
        result = {
            "name": name,
            "fitness": fbest
            }
        json.dump(result, f, indent=4)
