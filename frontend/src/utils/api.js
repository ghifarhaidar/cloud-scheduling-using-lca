const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Get all configs
export async function getConfigs() {
    const res = await fetch(`${API_BASE_URL}/api/configs`);
    if (!res.ok) throw new Error("Failed to fetch configs");
    return await res.json();
}

// Get Run configs
export async function getRunConfigs() {
    const res = await fetch(`${API_BASE_URL}/api/run-configs`);
    if (!res.ok) throw new Error("Failed to fetch run configs");
    return await res.json();
}

export async function resetConfiguration() {
    const res = await fetch(`${API_BASE_URL}/api/run-configs/reset`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) throw new Error('Reset failed');
    return res.json();
}

// Save a config
export async function saveConfig(configData) {
    const res = await fetch(`${API_BASE_URL}/api/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save config");
    }
    return await res.json();
}

// Run experiments
export async function runExperiments() {
    const res = await fetch(`${API_BASE_URL}/api/experiments`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to run experiments");
    return await res.json();
}

// Get experiment results
export async function getResults() {
    const res = await fetch(`${API_BASE_URL}/api/results`);
    if (!res.ok) throw new Error("Failed to fetch results");
    return await res.json();
}


// Get all experiment results
export async function getAllResults() {
    const res = await fetch(`${API_BASE_URL}/api/all-results`);
    if (!res.ok) throw new Error("Failed to fetch results");
    return await res.json();
}

// Run Python script
export async function runPython(args) {
    const res = await fetch(`${API_BASE_URL}/api/run-python`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.output || "Failed to run Python script");
    }
    return await res.json();
}

// Get all fitness data
export async function getAllFitness() {
    const res = await fetch(`${API_BASE_URL}/api/fitness/all`);
    if (!res.ok) throw new Error("Failed to fetch fitness data");
    return await res.json();
}

// Get all algorithms 
export async function getAllAlgorithms() {
    const res = await fetch(`${API_BASE_URL}/api/all-algorithms`);
    if (!res.ok) throw new Error("Failed to fetch fitness data");
    return await res.json();
}

// save run algorithms
export async function saveAlgorithms(algorithmsData) {
    const res = await fetch(`${API_BASE_URL}/api/run-algorithms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(algorithmsData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.output || "Failed to save run algorithms");
    }
    return await res.json();
}

