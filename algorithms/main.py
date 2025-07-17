import importlib
import sys


def run_algorithm(algorithm_name):
    """Run the selected algorithm"""

    try:
        # Dynamically import and run the module
        module = importlib.import_module(f"{algorithm_name}")
        module.run()
    except ImportError:
        print(
            f"Error: Algorithm '{algorithm_name}' not found in this directory")
        sys.exit(1)
    except AttributeError:
        print(f"Error: Algorithm '{algorithm_name}' has no 'run' function")
        sys.exit(1)


def main():
    # Get algorithm name from stdin (passed from parent script)
    if not sys.stdin.isatty():  # Check if input is being piped
        algorithm_name = sys.stdin.read().strip()
    else:
        algorithm_name = input("Enter algorithm name: ").strip()

    if not algorithm_name:
        print("Error: No algorithm name provided")
        sys.exit(1)

    run_algorithm(algorithm_name)


if __name__ == "__main__":
    main()
