# Cloud Scheduling using MO-LCA

### this project allows to test and analys cloud scheduling algorithms, it focus mainly on MO-LCA

### Key Features

- Multi-objective cloud scheduling optimization using MO-LCA
- Comparative analysis of algorithms (ACO, PSO, Round Robin)
- Modular architecture for easy algorithm integration
- Interactive web interface for configuration and visualization

### Requirements

- **Python**: 3.8+
- **Node.js**: 16.x+
- **Java**: JDK 11+ (for simulator)
- **Maven**: 3.6+ (for Java build)
- **npm**: 8.x+

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

over files all architecture:

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
