import os
import subprocess

CONFIGURATION_CHOICE = 1
MODE = "time"

generate_new_config = True

change_mode = False
mode = "time"

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


if __name__ == "__main__":
    if generate_new_config:
        mode_input = "1\n"
        run_python_script((
            "y\n" +
            "n\n" +
            "\n"
        ))

    elif change_mode:
        mode_input = "1\n"
        if mode == "time":
            mode_input = "1\n"
        elif mode == "space":
            mode_input = "2\n"
        run_python_script((
            "n\n" +
            "y\n" +
            mode_input +
            "\n"
        ))
    for i in range(1, 4):
        algorithm_choice = str(i)
        algorithm_name = ALGORITHM_NAMES[algorithm_choice]
        print(f"\n=== Running algorithm: {algorithm_name} ===")

        run_python_script((
            "n\n" +
            "n\n" +
            algorithm_choice + "\n"
        ))
        build_java_project(algorithm_name)
        run_java_program((algorithm_choice + "\n"), algorithm_name)
