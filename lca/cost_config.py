import os
import json

# Predefined configuration templates for different cost models
configs = {
    0: {
        'CostPerSecond': 2,
        'CostPerMem': 1,
        'CostPerStorage': 1,
        'CostPerBw': 1
    },
    1: {
        'CostPerSecond': 2,
        'CostPerMem': 0,
        'CostPerStorage': 0,
        'CostPerBw': 0
    }
}


class CloudSimCostConfigGenerator:
    """
    Generates cost configuration files for cloud simulation scenarios.

    Attributes:
        config (dict): The selected cost configuration template
    """

    def __init__(self, config_type: int):
        self.config = configs[config_type]

    def generate_config(self):
        return self.config


# Save config
def generate_cost_config(COST_CONFIGURATION_CHOICE=1):
    generator = CloudSimCostConfigGenerator(COST_CONFIGURATION_CHOICE)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(f"{current_dir}/../sim_cost_config.json", "w") as f:
        json.dump(generator.generate_config(), f, indent=4)
