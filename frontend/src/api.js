const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Get all configs
export async function getConfigs() {
    const res = await fetch(`${API_BASE_URL}/get-configs`);
    if (!res.ok) throw new Error("Failed to fetch configs");
    return await res.json();
}

// Save a config
export async function saveConfig(configData) {
    const res = await fetch(`${API_BASE_URL}/save-config`, {
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
    const res = await fetch(`${API_BASE_URL}/run-experiments`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to run experiments");
    return await res.json();
}

// Get experiment results
export async function getResults() {
    const res = await fetch(`${API_BASE_URL}/get-results`);
    if (!res.ok) throw new Error("Failed to fetch results");
    return await res.json();
}

// Run Python script
export async function runPython(args) {
    const res = await fetch(`${API_BASE_URL}/run-python`, {
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
    const res = await fetch(`${API_BASE_URL}/fitness/all`);
    if (!res.ok) throw new Error("Failed to fetch fitness data");
    return await res.json();
}
