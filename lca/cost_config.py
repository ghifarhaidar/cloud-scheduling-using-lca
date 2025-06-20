import os
import json


configs = {
    0: {
        'CostPerSecond': 1,
        'CostPerMem': 1,
        'CostPerStorage': 1,
        'CostPerBw': 1
    },
    1: {
        'CostPerSecond': 1,
        'CostPerMem': 0,
        'CostPerStorage': 0,
        'CostPerBw': 0
    }
}


class CloudSimCostConfigGenerator:
    def __init__(self, config_type: int):
        self.config = configs[config_type]

    def generate_config(self):
        return self.config


# Save config
generator = CloudSimCostConfigGenerator(1)
current_dir = os.path.dirname(os.path.abspath(__file__))
with open(f"{current_dir}/../sim_cost_config.json", "w") as f:
    json.dump(generator.generate_config(), f, indent=4)
