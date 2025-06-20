import random

def lca_scheduler(cloudlets, vms):
    schedule = []
    for cloudlet in cloudlets:
        best_vm = random.choice(vms)  # Replace with actual LCA logic
        schedule.append((cloudlet["id"], best_vm["id"]))
    return schedule

# Example usage:
cloudlets = [{"id": i, "length": 10000} for i in range(4)]
vms = [{"id": i, "mips": 1000} for i in range(2)]

schedule = lca_scheduler(cloudlets, vms)

# Write result to file
with open("../schedule.txt", "w") as f:
    for cloudlet_id, vm_id in schedule:
        f.write(f"{cloudlet_id},{vm_id}\n")
