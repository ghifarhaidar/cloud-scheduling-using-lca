import { getAllResults } from "../utils/api";

// Define a color palette (expand as needed)
const ALGORITHM_COLORS = [
    '#1e3a8a', '#059669', '#d97706',  // Original colors
    '#7c3aed', '#dc2626', '#0891b2',  // Additional colors
    '#9d174d', '#4d7c0f', '#b45309'   // More fallback colors
];

/**
 * Gets color for an algorithm based on sorted position
 * @param {string} algorithmName 
 * @param {Array<string>} allAlgorithms Sorted array of all algorithm names
 * @returns {string} Color hex code
 */
export const getAlgorithmColor = (algorithmName, index) => {
    return ALGORITHM_COLORS[index % ALGORITHM_COLORS.length];
};

/**
 * Extracts and processes simulation results data from the API with dynamic algorithm detection
 * @returns {Promise<Array>} Array of grouped results ready for display
 */
export const getGroupedResults = async () => {
    try {
        const response = await getAllResults();

        if (!response.success || !response.data?.results) {
            throw new Error('Invalid data structure received from API');
        }

        return response.data.results.map(group => {
            const groupConfig = group.config;

            const runs = group.results.map(run => {
                const { L, S,
                    p_c = null,
                    PSI1 = null,
                    PSI2 = null,
                    q0 = null,
                    config_type, results } = run;

                // Dynamically detect algorithms (any keys ending with _result)
                const algorithms = Object.keys(results.result)
                    .filter(key => key.endsWith('_result'))
                    .map(key => {
                        const algorithm = key.replace('_result', '');
                        const resultKey = `${algorithm}_result`;
                        const simResultKey = `${algorithm}_sim_results`;

                        return {
                            name: algorithm,
                            displayName: algorithm.replace(/_/g, ' '), // More readable
                            color: getAlgorithmColor(algorithm),
                            fitness: results.result[resultKey]?.fitness ?? null,
                            run_time: results.result[resultKey]?.run_time ?? null,
                            makespan: results.simResult[simResultKey]?.makespan ?? null,
                            totalCost: results.simResult[simResultKey]?.totalCost ?? null,
                            processingCost: results.simResult[simResultKey]?.processingCost ?? null,
                            vmCount: results.simResult[simResultKey]?.vmCount ?? null
                        };
                    });

                return {
                    L,
                    S,
                    p_c,
                    PSI1,
                    PSI2,
                    q0,
                    config_type,
                    algorithms,
                    config: {
                        ...groupConfig,
                        L,
                        S,
                        config_type
                    }
                };
            });

            return {
                groupConfig,
                runs
            };
        });

    } catch (error) {
        console.error('Error processing results data:', error);
        throw error;
    }
};

/**
 * Gets all unique algorithm names present in the dataset
 * @param {Array} groupedData The grouped data from getGroupedResults
 * @returns {Array} Sorted array of unique algorithm names
 */
export const getAllAlgorithmNames = (groupedData) => {
    const uniqueNames = new Set();
    groupedData.forEach(group => {
        group.runs.forEach(run => {
            run.algorithms.forEach(algo => uniqueNames.add(algo.name));
        });
    });
    return Array.from(uniqueNames).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
};

/**
 * Gets summary of all configurations
 * @param {Array} groupedData The grouped data from getGroupedResults
 * @returns {Array} Array of configuration summaries
 */
export const getAllConfigurations = (groupedData) => {
    return groupedData.map(group => ({
        ...group.groupConfig,
        runCount: group.runs.length
    }));
};

/**
 * Flattens all results for tables/charts
 * @param {Array} groupedData The grouped data from getGroupedResults
 * @returns {Array} Flat array of all results with algorithm colors
 */
export const getAllResultsFlat = (groupedData) => {
    return groupedData.flatMap(group =>
        group.runs.flatMap(run =>
            run.algorithms.map(algorithm => ({
                ...algorithm,
                L: run.L,
                S: run.S,
                config_type: run.config_type,
                groupConfig: group.groupConfig
            }))
        )
    );
};

export function getSomeParetoSols(data) {
    const clone = obj => JSON.parse(JSON.stringify(obj));

    // Lowest makespan
    const lowestMakespan = data.reduce((min, curr) =>
        curr.makespan < min.makespan ? curr : min
    );

    // Lowest cost
    const lowestCost = data.reduce((min, curr) =>
        curr.cost < min.cost ? curr : min
    );

    // Calculate averages
    const totals = {
        run_time: 0,
        makespan: 0,
        totalCost: 0
    };

    data.forEach(item => {
        const algo = item.algorithms[0];
        totals.run_time += algo.run_time;
        totals.makespan += algo.makespan;
        totals.totalCost += algo.totalCost;
    });

    const count = data.length;
    const avgObj = {
        id: "Average",
        cost: null,
        makespan: null,
        fitness: null,
        config: null,
        algorithms: [
            {
                name: "MO_LCA",
                displayName: "MO LCA",
                fitness: null,
                run_time: totals.run_time / count,
                makespan: totals.makespan / count,
                totalCost: totals.totalCost / count,
                processingCost: null,
                vmCount: null
            }
        ]
    };

    return [lowestMakespan, lowestCost, avgObj];
}


export const getLCAConfigKey = (run) => {
    const cfg = run.config.LCA_configs?.[0] ?? {};
    return JSON.stringify({
        L: cfg.L,
        S: cfg.S,
        p_c: cfg.p_c,
        PSI1: cfg.PSI1,
        PSI2: cfg.PSI2,
        q0: cfg.q0
    });
};
export const createDatasets = (metricData, allAlgorithms ,algorithmColors) => {
    return allAlgorithms.map((algoName) => ({
        label: algoName.replace('_', ' '),
        data: metricData.map((d) => d[algoName] ?? 0),
        backgroundColor: algorithmColors[algoName] + "cc",
        borderColor: algorithmColors[algoName],
        borderWidth: 1,
    }));
};