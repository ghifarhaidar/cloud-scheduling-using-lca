
import Makespan_LCA
import Cost_LCA
import MO_LCA

def run_configurations():
    """Execute the config scripts to generate JSON files"""
    print("Generating configuration files...")

    import config # Generates sim_config.json
    import cost_config  # Generates sim_cost_config.json

    print("Configuration files generated successfully")


def run_algorithm(choice):
    """Run the selected algorithm"""
    if choice == '1':
        print("\nRunning Makespan LCA...")
        Makespan_LCA.run()  # Assuming you add a run() function
    elif choice == '2':
        print("\nRunning Cost LCA...")
        Cost_LCA.run()
    elif choice == '3':
        print("\nRunning Multi-Objective LCA...")
        MO_LCA.run()
    else:
        print("Invalid selection")


def main():
    # Generate configuration files first
    run_configurations()

    # Simple menu interface
    print("\nAvailable Algorithms:")
    print("1. Makespan LCA")
    print("2. Cost LCA")
    print("3. Multi-Objective LCA")

    # Get user input
    choice = input("Select algorithm to run (1-3): ")

    # Run selected algorithm
    run_algorithm(choice)


if __name__ == "__main__":
    main()
