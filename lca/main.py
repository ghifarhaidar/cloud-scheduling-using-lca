
import Makespan_LCA
import Cost_LCA
import MO_LCA

def run_algorithm(choice):
    """Run the selected algorithm"""
    if choice == '1':
        print("\nRunning Makespan LCA...")
        Makespan_LCA.run()
    elif choice == '2':
        print("\nRunning Cost LCA...")
        Cost_LCA.run()
    elif choice == '3':
        print("\nRunning Multi-Objective LCA...")
        MO_LCA.run()
    elif choice == '4':
        print("\nRunning Makespan LCA...")
        Makespan_LCA.run()
        print("\nRunning Cost LCA...")
        Cost_LCA.run()
        print("\nRunning Multi-Objective LCA...")
        MO_LCA.run()
    else:
        print("Invalid selection")


def main():

    # Simple menu interface
    print("\nAvailable Algorithms:")
    print("1. Makespan LCA")
    print("2. Cost LCA")
    print("3. Multi-Objective LCA")
    print("4. Run all?")

    # Get user input
    choice = input("Select algorithm to run (1-3): ")

    # Run selected algorithm
    run_algorithm(choice)


if __name__ == "__main__":
    main()
