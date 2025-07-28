import requests
import time
import subprocess
import pytest
import os

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(THIS_DIR, ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

# API_BASE_URL = "localhost:3000"  # or http://172.25.1.141:3000 
API_BASE_URL = "http://172.25.1.141:3000"  # or localhost:3000

@pytest.fixture(scope="session", autouse=True)
def backend():
    """Start the backend server and build the Java simulator"""
    
    # Step 1: Build/prepare the simulator
    build_proc = subprocess.run(
        ["python3", "run.py", "--job", "3"],
        cwd=ROOT_DIR, 
        capture_output=True,
        text=True
    )
    print(">>> JAVA BUILD OUTPUT >>>")
    print(build_proc.stdout)
    print(build_proc.stderr)
    assert build_proc.returncode == 0, "Java build failed"

    # Step 2: Start the backend server
    backend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=BACKEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    time.sleep(5)  # wait for backend to be ready
    yield

    # Step 3: Teardown
    backend_proc.terminate()

def test_full_workflow():
    # 1. Reset existing configs
    res = requests.post(f"{API_BASE_URL}/api/run-configs/reset")
    assert res.status_code == 200

    # 2. Add a run configuration
    config_data = {
            "config_type": 1,
            "cost_config_type": 1,
            "vm_scheduling_mode": "time",
            "LCA_configs": [
                {
                    "L_type": "single",
                    "S_type": "single",
                    "p_c_type": "single",
                    "PSI1_type": "single",
                    "PSI2_type": "single",
                    "q0_type": "single",
                    "L": 20,
                    "S": 20,
                    "p_c": 0.3,
                    "PSI1": 0.2,
                    "PSI2": 1,
                    "q0": 1
                }
            ]
        }

    res = requests.post(
        f"{API_BASE_URL}/api/config",
        json=config_data,
        headers={"Content-Type": "application/json"}
    )
    assert res.status_code == 200

    # 3. Select algorithms to run
    algorithms_data = {
            "algorithms": [
                {
                    "name": "MO_LCA",
                    "directory": "lca"
                },
                {
                    "name": "ACO",
                    "directory": "algorithms"
                }
            ]
        }
    res = requests.post(
        f"{API_BASE_URL}/api/run-algorithms",
        json=algorithms_data,
        headers={"Content-Type": "application/json"}
    )
    assert res.status_code == 200

    # 4. Trigger experiment execution
    res = requests.post(f"{API_BASE_URL}/api/experiments")
    assert res.status_code == 200

    # 5. Get all results
    res = requests.get(f"{API_BASE_URL}/api/all-results")
    assert res.status_code == 200
    results = res.json()

    data = results['data']['results']
    # 6. Validate structure of results
    assert isinstance(data, list)
    for experiment in data:
        for result in experiment['results']:
            # Check that 'results' exists and contains 'result' and 'simResult'
            assert 'results' in result
            assert 'result' in result['results']
            assert 'simResult' in result['results']
            
            # Check that there's at least one '*_result' key
            algo_result = result['results']['result']
            assert any(key.endswith('_result') for key in algo_result.keys())
            
            # Check that there's at least one '*_sim_results' key
            sim_result = result['results']['simResult']
            assert any(key.endswith('_sim_results') for key in sim_result.keys())
            
            # Get the first matching metrics entry (order doesn't matter)
            metrics_key = next(key for key in sim_result.keys() if key.endswith('_sim_results'))
            metrics = sim_result[metrics_key]
            assert 'makespan' in metrics