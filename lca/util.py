import json
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
