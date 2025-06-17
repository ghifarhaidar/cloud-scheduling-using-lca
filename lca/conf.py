import os
import json
import random


param_ranges = {
    1: {
        'cloudlet': {
            'count': (100, 1000),
            'length': (20000, 40000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (10, 20),
            'pes': (16, 16),  # Fixed at 16
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000],  # Either 1000 or 2000
        'num_hosts': (1, 1)  # Fixed at 1
    },
    2: {
        'cloudlet': {
            'count': (100, 1000),
            'length': (40000, 60000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (10, 20),
            'pes': (16, 16),  # Fixed at 16
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000],  # Either 1000 or 2000
        'num_hosts': (1, 1)  # Fixed at 1
    },
    3: {
        'cloudlet': {
            'count': (100, 1000),
            'length': (40000, 60000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (20, 40),
            'pes': (16, 16),  # Fixed at 16
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000],  # Either 1000 or 2000
        'num_hosts': (1, 1)  # Fixed at 1
    },
    4: {
        'cloudlet': {
            'count': (1000, 3000),
            'length': (20000, 40000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (40, 60),
            'pes': (16, 16),  # Fixed at 16
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000],  # Either 1000 or 2000
        'num_hosts': (1, 1)  # Fixed at 1
    },
    5: {
        'cloudlet': {
            'count': (1000, 3000),
            'length': (40000, 60000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (40, 60),
            'pes': (16, 16),  # Fixed at 16
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000],  # Either 1000 or 2000
        'num_hosts': (1, 1)  # Fixed at 1
    },
    6: {
        'cloudlet': {
            'count': (1000, 3000),
            'length': (40000, 60000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (60, 100),
            'pes': (16, 16),  # Fixed at 16
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000],  # Either 1000 or 2000
        'num_hosts': (1, 1)  # Fixed at 1
    },
    7: {
        'cloudlet': {
            'count': (3000, 10000),
            'length': (20000, 40000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (40, 60),
            'pes': (16, 16),  # Fixed at 16
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000],  # Either 1000 or 2000
        'num_hosts': (1, 1)  # Fixed at 1
    },
    8: {
        'cloudlet': {
            'count': (3000, 10000),
            'length': (40000, 60000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (40, 60),
            'pes': (16, 16),  # Fixed at 16
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000],  # Either 1000 or 2000
        'num_hosts': (1, 1)  # Fixed at 1
    },
    9: {
        'cloudlet': {
            'count': (3000, 10000),
            'length': (40000, 60000),
            'pes': (1, 1),
            'fileSize': (300, 300),
            'outputSize': (300, 300)
        },
        'VM': {
            'count': (60, 100),
            'pes': (16, 16),  # Fixed at 16
            'ram': (512, 512),
            'bw': (512, 512),
            'size': (1024, 1024)
        },
        'pe_mips_options': [1000, 2000],  # Either 1000 or 2000
        'num_hosts': (1, 1)  # Fixed at 1
    }

}


class CloudSimConfigGenerator:
    def __init__(self, config_type: int):
        self.param_ranges = param_ranges[config_type]

    def generate_value(self, range_def):
        """Generate a random value within a range or from options"""
        if isinstance(range_def, tuple):
            return random.randint(range_def[0], range_def[1])
        elif isinstance(range_def, list):
            return random.choice(range_def)
        return range_def

    def generate_vm(self):
        params = self.param_ranges
        return {
            "vm_mips": self.generate_value(params['pe_mips_options']),
            "vm_pes": self.generate_value(params['VM']['pes']),
            "vm_ram": self.generate_value(params['VM']['ram']),
            "vm_bw": self.generate_value(params['VM']['bw']),
            "vm_size": self.generate_value(params['VM']['size'])
        }

    def generate_host(self):
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
        params = self.param_ranges
        return {
            "pes": self.generate_value(params['cloudlet']['pes']),
            "length": self.generate_value(params['cloudlet']['length']),
            "fileSize": self.generate_value(params['cloudlet']['fileSize']),
            "outputSize": self.generate_value(params['cloudlet']['outputSize'])
        }

    def generate_cloudlets(self):
        params = self.param_ranges
        num_cloudlet = self.generate_value(params['cloudlet']['count'])
        cloud_lets = []
        for i in range(num_cloudlet):
            cloud_let = self.generate_cloudlet()
            cloud_lets.append(cloud_let)
        return cloud_lets

    def generate_config(self):
        params = self.param_ranges
        num_hosts = self.generate_value(params['num_hosts'])

        host, vms = self.generate_host()
        cloudlets = self.generate_cloudlets()
        return {
            'hosts': host,
            'vms': vms,
            'cloudlets': cloudlets
        }


# Save config
generator = CloudSimConfigGenerator(1)
current_dir = os.path.dirname(os.path.abspath(__file__))
with open(f"{current_dir}/../sim_config.json", "w") as f:
    json.dump(generator.generate_config(), f, indent=4)
