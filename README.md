# Cloud Scheduling using Multi-Objective League Championship Algorithm

### Project Overview

This project enables testing and analysis of cloud scheduling algorithms, with primary focus on:

- **MO-LCA** (Multi-Objective League Championship Algorithm)
- Comparative analysis with other algorithms (ACO, PSO, Round Robin)
- Performance evaluation in simulated cloud environments

### Key Features

- Multi-objective cloud scheduling optimization using MO-LCA
- Comparative analysis of algorithms (ACO, PSO, Round Robin)
- Modular architecture with orchestration for easy integration
- Interactive web interface for configuration and visualization
- Plugin architecture for the algorithm module for easy algorithms integration
- Cloud simulation environment using CloudSim-Plus framework

### Requirements

- **Python**: 3.7+
- **Node.js**: 20.x+
- **Java**: JDK 17+ (for simulator)
- **Maven**: 3.6+ (for Java build)
- **npm**: 10.x+

## 1. Setup using Conda

```bash
git clone https://github.com/ghifarhaidar/cloud-scheduling-using-lca.git
cd cloud-scheduling-using-lca/
```

## Create and activate a Conda environment

```bash
conda create -n myenv -y
conda init
conda activate myenv
```

## Install required packages

```bash
conda install maven nodejs numpy -y
```

## Install dependencies

```bash
cd backend/
npm install
cd ../frontend/
npm install
cd ..
```

## Build the Java simulator

```bash
python3 run.py --job 3
```

## 2. Setup without Conda (system-wide)

```bash
git clone https://github.com/ghifarhaidar/cloud-scheduling-using-lca.git
cd cloud-scheduling-using-lca/
```

## [Optional] Create and activate a Python virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## Install required system-level tools

### (Assumes you're on Ubuntu or Debian)

```bash
sudo apt-get update
sudo apt-get install -y maven nodejs npm python3-pip
```

## Upgrade pip and install Python deps

```bash
pip install --upgrade pip
pip install numpy
```

## Install backend dependencies

```bash
cd backend/
npm install
cd ..
```

## Install frontend dependencies

```bash
cd frontend/
npm install
cd ..
```

## Build the Java simulator and run the project

```bash
python3 run.py --job 3
```

save your env variable in both the 'frontend/' and 'backend/'

then run npm run start in both backend and frontend folders

## Integration Tests

```bash
pytest tests/test_full_workflow.py
```

## Project Architecture

### Core Components

**1. Algorithms Module**  
Contains implementations of scheduling algorithms:

- **`/lca/`**:
  - `MO_LCA.py`: Multi-Objective League Championship Algorithm
  - `makespan_LCA.py`, `cost_LCA.py` (single-objective variants)
- **`/algorithms/`**:
  - `ACO.py`: Ant Colony Optimization implementation
  - `PSO.py`: Particle Swarm Optimization variant
  - `Round_Robin.py`: Traditional round-robin baseline

**2. CloudSim-Plus Integration (`/src/main/java/`)**

- Custom Java classes extending CloudSim-Plus:
  - `MyDatacenterBroker.java`: Modified broker for custom scheduling
  - `MyVmCost.java`: Custom VM cost modeling
  - `Simulation.java`: Core simulation runner

**3. Backend Service (`/backend/`)**

- Node.js API features:
  - `runOrchestrator.js`: Invokes The main Orchestrator that runs algorithm and simulation execution
  - `resultProcessor.js`: Handles simulation output
  - REST API routes in `api.js` for frontend communication

**4. Frontend Interface (`/frontend/`)**

- React-based UI with:
  - Configuration setup Page (`SetConfigPage.jsx`)
  - Fitness evolution visualization (`FitnessPage.jsx`)
  - Results visualization (`ResultsSection.jsx`)
  - Pareto front visualization (`resultsPage.jsx`)

### Key Workflows

**Simulation Pipeline:**

1. **Configuration Phase**

   - User sets up MO-LCA parameters (population size, iterations, etc.)
   - Configures simulation environment (VM counts, cloudlets, etc.)

2. **Execution Phase**

   - Frontend sends configuration to Backend API
   - Backend orchestrates:  
     a. Runs MO-LCA and other desired scheduling algorithm  
     b. Triggers Java simulator  
     c. Processes CloudSim-Plus output metrics

3. **Visualization Phase**
   - Backend returns processed results to Frontend
   - Interactive React components display:
     - Scheduling performance metrics
     - Comparative algorithm analysis
     - Pareto fronts for multi-objective optimization
     - Fitness evolution

**Plugin Architecture:**

- New algorithms can be added by:
  1. Adding implementation in `/algorithms/`
  2. Updating `configs/all_algorithms.json`
  3. No core changes required

### Configuration System

- JSON configs in `/configs/` control:
  - Algorithm parameters
  - Cloud infrastructure specs

detailed files architecture:

```
.
├── algorithms
│   ├── ACO.py
│   ├── main.py
│   ├── PSO.py
│   └── Round_Robin.py
├── backend
│   ├── config
│   │   ├── config.js
│   │   └── corsOptions.js
│   ├── example.env
│   ├── middleware
│   │   ├── asyncHandler.js
│   │   ├── errorHandler.js
│   │   └── logging.js
│   ├── package.json
│   ├── package-lock.json
│   ├── routes
│   │   └── api.js
│   ├── server.js
│   └── utils
│       ├── fileHandlers.js
│       ├── resultProcessor.js
│       ├── runExperiments.js
│       └── runOrchestrator.js
├── clean_and_update.sh
├── configs
│   └── all_algorithms.json
├── frontend
│   ├── eslint.config.js
│   ├── example.env.local
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── public
│   │   └── icon.svg
│   ├── src
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── components
│   │   │   ├── AlgorithmCard.jsx
│   │   │   ├── AlgorithmConfiguration.jsx
│   │   │   ├── CustomConfigSection.jsx
│   │   │   ├── loadingError.jsx
│   │   │   ├── loading.jsx
│   │   │   ├── NavBar.jsx
│   │   │   ├── ResultsSection.jsx
│   │   │   ├── SelectableAlgorithmCard.jsx
│   │   │   └── SimulationConfiguration.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── pages
│   │   │   ├── EditConfigPage.jsx
│   │   │   ├── FitnessPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   ├── RunPage.jsx
│   │   │   └── SetConfigPage.jsx
│   │   ├── styles
│   │   │   ├── buttons.css
│   │   │   ├── cards.css
│   │   │   ├── navbar.css
│   │   │   └── resultsPage.css
│   │   └── utils
│   │       ├── api.js
│   │       ├── fitnessPageUtil.js
│   │       ├── resultPreprocessing.js
│   │       └── setConfigPageUtil.js
│   └── vite.config.js
├── .github
│   └── workflows
│       └── integration.yml
├── .gitignore
├── lca
│   ├── config.py
│   ├── cost_config.py
│   ├── cost_LCA.py
│   ├── dev.py
│   ├── main.py
│   ├── makespan_LCA.py
│   ├── MO_LCA.py
│   ├── Non_Vectorized_MO_LCA.py
│   ├── util.py
│   └── vectorized_dev.py
├── pom.xml
├── README.md
├── run.py
├── src
│   └── main
│       └── java
│           ├── brokers
│           │   └── MyDatacenterBroker.java
│           ├── org
│           │   └── simulations
│           │       └── Simulation.java
│           ├── utils
│           │   └── commons.java
│           └── vms
│               └── MyVmCost.java
└── tests
    └── test_full_workflow.py
```

## Documentation

Project documentation is available in `/.docs/` directory:
