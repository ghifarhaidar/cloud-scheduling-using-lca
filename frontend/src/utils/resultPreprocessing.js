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
                const { L, S, config_type, results } = run;

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