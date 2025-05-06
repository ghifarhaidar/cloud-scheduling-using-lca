import json

config = {
    "hosts": [
        {
            "pes": 8,
            "mips": 1000,
            "ram": 2048,
            "bw": 10000,
            "storage": 1_000_000
        }
    ],
    "vms": [
        {
            "pes": 4,
            "mips": 1000,
            "ram": 512,
            "bw": 1000,
            "size": 10_000
        },
        {
            "pes": 4,
            "mips": 1000,
            "ram": 512,
            "bw": 1000,
            "size": 10_000
        }
    ],
    "cloudlets": [
        {
            "pes": 2,
            "length": 10000,
            "fileSize": 300,
            "outputSize": 300
        }
    ] * 4  # 4 identical cloudlets
}

# Save config
with open("../sim_config.json", "w") as f:
    json.dump(config, f, indent=2)
