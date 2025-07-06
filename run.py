import os
import subprocess
import argparse
from lca.util import change_in_vm_scheduling_method
import lca.config
import lca.cost_config

CONFIGURATION_CHOICE = 1
COST_CONFIGURATION_CHOICE = 1
MODE = "time"


ALGORITHM_NAMES = {
    "1": "makespan_LCA",
    "2": "cost_LCA",
    "3": "MO_LCA"
}

# Get absolute path to this script's directory
SCRIPT_DIR = ""


def build_java_project(algorithm_name):
    build_log_file = os.path.join(
        SCRIPT_DIR, "logs", f"build_{algorithm_name}.log")
    print(f"🔨 Building Java project... (log: {build_log_file})")
    # for clean build
    # build = subprocess.run(["mvn", "clean", "package"], text=True)
    with open(build_log_file, "w") as build_log:
        result = subprocess.run(["mvn", "package"],
                                text=True,
                                stdout=build_log,
                                stderr=subprocess.STDOUT)

    if result.returncode != 0:
        print(f"❌ Maven build failed! Check {build_log_file}")
        exit(1)
    print(f"✅ Maven build succeeded! (log: {build_log_file})")


def run_java_program(input, algorithm_name):
    run_log_file = os.path.join(
        SCRIPT_DIR, "logs", f"run_{algorithm_name}.log")
    print(f"\n🚀 Running Java program... (log: {run_log_file})")
    with open(run_log_file, "w") as run_log:
        result = subprocess.run([
            "mvn", "exec:java",
            "-Dexec.mainClass=org.simulations.BasicExample"
        ],
            input=input, text=True,
            stdout=run_log,
            stderr=subprocess.STDOUT)

    if result.returncode != 0:
        print(f"❌ Java program execution failed! Check {run_log_file}")
        exit(1)
    print(f"✅ Java program finished! (log: {run_log_file})")


def run_python_script(inputs):
    python_file = os.path.join(SCRIPT_DIR, "lca", "main.py")
    print(f"\n🐍 Running Python script {python_file}.")
    result = subprocess.run(["python3", python_file],
                            input=inputs,
                            text=True)
    if result.returncode != 0:
        print("❌ Python script execution failed!")
        exit(1)
    print("✅ Python script finished successfully!")


def generate_config(inputs):
    print("\n🐍 Generating configuration files...")

    if inputs.config_type is not None:
        CONFIGURATION_CHOICE = inputs.config_type
    if inputs.cost_config_type is not None:
        COST_CONFIGURATION_CHOICE = inputs.cost_config_type
    if inputs.vm_scheduling_mode is not None:
        MODE = inputs.vm_scheduling_mode

    lca.config.generate_config(CONFIGURATION_CHOICE, MODE)
    lca.cost_config.generate_cost_config(COST_CONFIGURATION_CHOICE)

    print("✅ Configuration files generated successfully")


def edit_config(inputs):
    print("\n🐍 Editing configuration files...")

    if inputs.cost_config_type is not None:
        COST_CONFIGURATION_CHOICE = inputs.cost_config_type
        lca.cost_config.generate_cost_config(COST_CONFIGURATION_CHOICE)
    if inputs.vm_scheduling_mode is not None:
        MODE = inputs.vm_scheduling_mode
        change_in_vm_scheduling_method(MODE)

    print("✅ Configuration files edited successfully")


def main():

    parser = argparse.ArgumentParser(
        description="Run the LCA algorithm and simulations, or configure parameters."
    )

    parser.add_argument(
        '--job', type=int, choices=[0, 1, 2], default=0,
        help=(
            "Job type: "
            "0 = run algorithm and simulations (default), "
            "1 = generate config, "
            "2 = edit config"
        )
    )
    parser.add_argument(
        '--config-type', type=int, choices=range(1, 10),
        help="(Job 1 only) Configuration type: integer between 1 and 9."
    )
    parser.add_argument(
        '--cost-config-type', type=int, choices=[0, 1],
        help="(Job 1 and 2) Cost configuration type: 0 or 1."
    )
    parser.add_argument(
        '--vm-scheduling-mode', type=str, choices=["time", "space"],
        help="(Job 1 and 2) VM scheduling mode: 'time shared' or 'space shared'."
    )

    args = parser.parse_args()
    print(args)

    # ✅ Validate arguments for specific jobs
    if args.job == 1:
        if args.config_type is None or args.cost_config_type is None or args.vm_scheduling_mode is None:
            parser.error(
                "Job 1 requires --config-type, --cost-config-type, and --vm-scheduling-mode."
            )
    elif args.job == 2:
        if args.cost_config_type is None and args.vm_scheduling_mode is None:
            parser.error(
                "Job 2 requires --cost-config-type or --vm-scheduling-mode."
            )

    if args.job == 0:
        for i in range(1, 4):
            algorithm_choice = str(i)
            algorithm_name = ALGORITHM_NAMES[algorithm_choice]
            print(f"\n=== Running algorithm: {algorithm_name} ===")

            run_python_script((
                algorithm_choice + "\n"
            ))
            build_java_project(algorithm_name)
            run_java_program((algorithm_choice + "\n"), algorithm_name)
    if args.job == 1:
        generate_config(args)
    if args.job == 2:
        edit_config(args)


if __name__ == "__main__":
    main()
