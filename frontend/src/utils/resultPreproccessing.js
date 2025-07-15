import { getAllResults } from "../api";

/**
 * Extracts and processes simulation results data from the API
 * @returns {Promise<Array>} Array of grouped results ready for display
 */
export const getGroupedResults = async () => {
    try {
        const response = await getAllResults();

        if (!response.success || !response.data || !response.data.results) {
            throw new Error('Invalid data structure received from API');
        }

        // Process each group (main config + its runs)
        const groupedData = response.data.results.map(group => {
            // Extract the common configuration for this group
            const groupConfig = group.config;

            // Process each run in this group
            const runs = group.results.map(run => {
                const { L, S, config_type, results } = run;

                // Extract result metrics for each algorithm
                const algorithms = ['MO_LCA', 'cost_LCA', 'makespan_LCA'].map(algorithm => {
                    const resultKey = `${algorithm}_result`;
                    const simResultKey = `${algorithm}_sim_results`;

                    return {
                        name: algorithm,
                        fitness: results.result[resultKey].fitness,
                        run_time: results.result[resultKey].run_time,
                        makespan: results.simResult[simResultKey].makespan,
                        totalCost: results.simResult[simResultKey].totalCost,
                        processingCost: results.simResult[simResultKey].processingCost,
                        vmCount: results.simResult[simResultKey].vmCount
                    };
                });

                return {
                    L,
                    S,
                    config_type,
                    algorithms,
                    // Include the run-specific config by merging group config with run-specific values
                    config: {
                        ...groupConfig,
                        L, // Override L from group config if it exists in run
                        S, // Override S from group config if it exists in run
                        config_type // Override config_type from group config if it exists in run
                    }
                };
            });

            return {
                groupConfig,
                runs
            };
        });

        return groupedData;
    } catch (error) {
        console.error('Error processing results data:', error);
        throw error;
    }
};

/**
 * Helper function to get a summary of all configurations
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
 * Helper function to get all results flattened (for tables/charts)
 * @param {Array} groupedData The grouped data from getGroupedResults
 * @returns {Array} Flat array of all results
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