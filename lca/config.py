import os
import json
import random

# Predefined configuration templates for different cloud simulation models
param_ranges = {
    0: {
        'cloudlet': {
            'count': (4, 4),
            'length': (20000, 40000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (4, 4),
            'pes': (8, 8),
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000, 4000, 8000],
        'num_hosts': (1, 1)
    },
    1: {
        'cloudlet': {
            'count': (200, 200),
            'length': (20000, 40000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (10, 10),
            'pes': (8, 16),
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000, 4000, 8000],
        'num_hosts': (1, 1)
    },
    2: {
        'cloudlet': {
            'count': (200, 200),
            'length': (40000, 60000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (20, 20),
            'pes': (8, 16),
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000, 4000, 8000],
        'num_hosts': (1, 1)
    },
    3: {
        'cloudlet': {
            'count': (200, 200),
            'length': (40000, 60000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (30, 30),
            'pes': (8, 16),
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000, 4000, 8000],
        'num_hosts': (1, 1)
    },
    4: {
        'cloudlet': {
            'count': (300, 300),
            'length': (20000, 40000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (10, 10),
            'pes': (8, 16),
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000, 4000, 8000],
        'num_hosts': (1, 1)
    },
    5: {
        'cloudlet': {
            'count': (300, 300),
            'length': (30000, 60000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (20, 20),
            'pes': (8, 16),
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000, 4000, 8000],
        'num_hosts': (1, 1)
    },
    6: {
        'cloudlet': {
            'count': (300, 300),
            'length': (40000, 60000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (30, 30),
            'pes': (8, 16),
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000, 4000, 8000],
        'num_hosts': (1, 1)
    },
    7: {
        'cloudlet': {
            'count': (400, 400),
            'length': (20000, 40000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (10, 10),
            'pes': (8, 16),
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000, 4000, 8000],
        'num_hosts': (1, 1)
    },
    8: {
        'cloudlet': {
            'count': (400, 400),
            'length': (40000, 60000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (20, 20),
            'pes': (8, 16),
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000, 4000, 8000],
        'num_hosts': (1, 1)
    },
    9: {
        'cloudlet': {
            'count': (400, 400),
            'length': (40000, 60000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (30, 30),
            'pes': (8, 16),
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000, 4000, 8000],
        'num_hosts': (1, 1)
    }
}


class CloudSimConfigGenerator:
    """
    Generates randomized cloud simulation configurations based on parameter ranges.

    This class creates complete cloud simulation environments including:
    - Virtual Machines (VMs) with randomized specifications
    - Host machines with resources scaled to accommodate VMs
    - Cloudlet workloads with varied characteristics

    Attributes:
        param_ranges (dict): Configuration template defining parameter ranges
    """

    def __init__(self, config_type: int, mode):
        """
        Initialize the generator with a specific configuration template.

        Args:
            config_type (int): Index of the configuration template to use
        """
        self.param_ranges = param_ranges[config_type]
        self.mode = mode

    def generate_value(self, range_def):
        """Generate a random value within a range or from options

        Args:
            range_def: Range definition (tuple, list, or single value)

        Returns:
            int: Generated value
        """
        if isinstance(range_def, tuple):
            return random.randint(range_def[0], range_def[1])
        elif isinstance(range_def, list):
            return random.choice(range_def)
        return range_def

    def generate_vm(self):
        """
        Generate a single Virtual Machine configuration.

        Returns:
            dict: VM configuration with: (vm_mips, vm_pes, vm_ram, vm_bw, vm_size)
        """
        params = self.param_ranges
        return {
            "vm_mips": self.generate_value(params['pe_mips_options']),
            "vm_pes": self.generate_value(params['VM']['pes']),
            "vm_ram": self.generate_value(params['VM']['ram']),
            "vm_bw": self.generate_value(params['VM']['bw']),
            "vm_size": self.generate_value(params['VM']['size'])
        }

    def generate_host(self):
        """
        Generate host configuration capable of running generated VMs.

        Returns:
            tuple: (hosts_config, vms_config) where:
                hosts_config: List of host configurations
                vms_config: List of generated VM configurations
        """
        params = self.param_ranges
        num_vm = self.generate_value(params['VM']['count'])

        total_pes = 0
        total_ram = 0
        total_bw = 0
        total_size = 0
        vm_mips = max(params['pe_mips_options'])

        vms = []
        for i in range(num_vm):
            vm = self.generate_vm()
            vms.append(vm)

            total_pes += vm['vm_pes']
            total_ram += vm['vm_ram']
            total_bw += vm['vm_bw']
            total_size += vm['vm_size']

        host_config = {
            'pes': int(total_pes * 1.2),  # 20% overhead
            'mips': int(vm_mips * 1.5),  # Host is 50% faster than VMs
            'ram': int(total_ram * 1.3),  # 30% overhead
            'bw': int(total_bw * 1.3),    # 30% overhead
            'storage': int(total_size * 1.3),  # 30% overhead
        }
        hosts = [host_config]
        return hosts, vms

    def generate_cloudlet(self):
        """
        Generate a single cloudlet workload definition.

        Returns:
            dict: Cloudlet configuration with: (pes, length, fileSize, outputSize)
        """
        params = self.param_ranges
        return {
            "pes": self.generate_value(params['cloudlet']['pes']),
            "length": self.generate_value(params['cloudlet']['length']),
            "fileSize": self.generate_value(params['cloudlet']['fileSize']),
            "outputSize": self.generate_value(params['cloudlet']['outputSize'])
        }

    def generate_cloudlets(self):
        """
        Generate multiple cloudlet workloads.

        Returns:
            list: Collection of cloudlet configurations
        """
        params = self.param_ranges
        num_cloudlet = self.generate_value(params['cloudlet']['count'])
        cloud_lets = []
        for i in range(num_cloudlet):
            cloud_let = self.generate_cloudlet()
            cloud_lets.append(cloud_let)
        return cloud_lets

    def generate_config(self):
        """
        Generate complete simulation configuration.

        Returns:
            dict: Simulation environment with:
                - hosts: host configurations
                - vms: Virtual machine configurations
                - cloudlets: Tasks workload configurations
        """
        params = self.param_ranges
        num_hosts = self.generate_value(params['num_hosts'])

        host, vms = self.generate_host()
        cloudlets = self.generate_cloudlets()
        return {
            'mode': self.mode,
            'hosts': host,
            'vms': vms,
            'cloudlets': cloudlets
        }


# Save config
def generate_config(CONFIGURATION_CHOICE=1, MODE="time"):

    generator = CloudSimConfigGenerator(CONFIGURATION_CHOICE, MODE)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(f"{current_dir}/../sim_config.json", "w") as f:
        json.dump(generator.generate_config(), f, indent=4)
