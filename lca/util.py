import json


def get_config():
    with open('sim_config.json', 'r') as file:
        data = json.load(file)

    vms = data['vms']
    cloudlets = data['cloudlets']
    n = len(cloudlets)

    return n, vms, cloudlets


def get_cost_config():
    with open('sim_cost_config.json', 'r') as file:
        data = json.load(file)

    return data
