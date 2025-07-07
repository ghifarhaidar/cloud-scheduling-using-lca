import json
import os
import numpy as np

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))


def read_lca_parameters():
    """
    Reads LCA parameters from the given JSON file and returns them as a dictionary.
    """
    LCA_parameters_path = os.path.join(BASE_DIR, "LCA_parameters.json")
    with open(LCA_parameters_path, 'r') as file:
        params = json.load(file)

    return params


def get_config():
    sim_config_path = os.path.join(BASE_DIR, "sim_config.json")
    with open(sim_config_path, 'r') as file:
        data = json.load(file)
    mode = data['mode']
    vms = data['vms']
    cloudlets = data['cloudlets']
    n = len(cloudlets)
    print("number of vms:", len(vms))
    print("number of cloudlets:", n)
    return n, vms, cloudlets, mode


def get_cost_config():
    sim_cost_config_path = os.path.join(BASE_DIR, "sim_cost_config.json")
    with open(sim_cost_config_path, 'r') as file:
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
    solution_file = os.path.join(BASE_DIR, f"{name}_schedule.json")
    with open(solution_file, 'r') as file:
        data = json.load(file)
    return data["schedule"]


def revert_vms_order(vms, original_indices):
    reverted_vms = [0] * len(vms)
    for i in range(len(vms)):
        reverted_vms[original_indices[i]] = vms[i]
    return reverted_vms


def export_results(name, best, fitness, original_indices, running_tme):
    best = min(best, key=fitness)
    fbest = fitness(best)
    best = np.floor(best).astype(int)
    selected_vms = [original_indices[i] for i in best]

    schedule_file = os.path.join(BASE_DIR, f"{name}_schedule.json")
    result_file = os.path.join(BASE_DIR, f"results/{name}_result.json")

    with open(schedule_file, "w") as file:
        result = {"schedule": selected_vms}
        json.dump(result, file, indent=4)
    with open(result_file, "w") as file:
        result = {
            "name": name,
            "fitness": fbest,
            "run_time": running_tme
        }
        json.dump(result, file, indent=4)


def change_in_vm_scheduling_method(name):
    config_file = os.path.join(BASE_DIR, "sim_config.json")
    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(config_file, 'r') as file:
        data = json.load(file)

    data['mode'] = name

    with open(config_file, 'w') as file:
        json.dump(data, file, indent=4)
    print(f"method changed to {name} shared")
