# Cloud Scheduling using MO-LCA

### this project allows to test and analys cloud scheduling algorithms, it focus mainly on MO-LCA

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

# 2. Setup without Conda (system-wide)

```bash
git clone https://github.com/ghifarhaidar/cloud-scheduling-using-lca.git
cd cloud-scheduling-using-lca/
```

# [Optional] Create and activate a Python virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

# Install required system-level tools

### (Assumes you're on Ubuntu or Debian)

```bash
sudo apt-get update
sudo apt-get install -y maven nodejs npm python3-pip
```

# Upgrade pip and install Python deps

```bash
pip install --upgrade pip
pip install numpy
```

# Install backend dependencies

```bash
cd backend/
npm install
cd ..
```

# Install frontend dependencies

```bash
cd frontend/
npm install
cd ..
```

# Build the Java simulator and run the project

```bash
python3 run.py --job 3
```

save your env variable in both the 'frontend/' and 'backend/'

then run npm run start in both backend and frontend folders

## Integration Tests

```bash
pytest tests/test_full_workflow.py
```
