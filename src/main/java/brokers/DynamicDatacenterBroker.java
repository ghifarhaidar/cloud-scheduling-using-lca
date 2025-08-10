package brokers;

import org.cloudsimplus.brokers.DatacenterBrokerSimple;
import org.cloudsimplus.cloudlets.Cloudlet;
import org.cloudsimplus.core.CloudSimPlus;
import org.cloudsimplus.listeners.DatacenterBrokerEventInfo;
import org.cloudsimplus.listeners.EventListener;
import org.cloudsimplus.vms.Vm;
import org.json.JSONArray;
import org.json.JSONObject;
import org.simulations.DynamicSimulation;
import utils.commons;

import java.io.BufferedReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Custom DatacenterBroker implementation that extends CloudSimPlus's basic broker
 * to support schedule-based cloudlet-to-VM mapping from JSON configuration.
 */
public class DynamicDatacenterBroker extends DatacenterBrokerSimple {

    public DynamicDatacenterBroker(CloudSimPlus simulation,String name) {
        super(simulation,name);
        this.currentAssignments = new HashMap<>();
        this.vmCloudletMap = new HashMap<>();
    }

    private static JSONArray schedule;
    private Map<Long, Integer> currentAssignments; // Track current cloudlet->VM mappings
    private Map<Integer, List<Long>> vmCloudletMap;

    /**
     * Loads the scheduling configuration from a JSON file.
     *
     * @param file Path to the JSON configuration file containing the schedule
     */
    public void loadSchedule(String file){
        JSONObject config = commons.loadConfig(file, "");
        schedule = config.getJSONArray("schedule");

        updateCurrentAssignments();
    }
    private void updateCurrentAssignments() {
        // Keep all existing assignments, only add new ones
        for (int cloudletId = 0; cloudletId < schedule.length(); cloudletId++) {
            // Only update if this cloudlet isn't already assigned
            if (!currentAssignments.containsKey((long)cloudletId)) {
                int vmId = schedule.getInt(cloudletId);

                // Map cloudlet to VM
                currentAssignments.put((long)cloudletId, vmId);

                // Map VM to list of cloudlets
                vmCloudletMap.computeIfAbsent(vmId, k -> new ArrayList<>())
                        .add((long)cloudletId);
            }
        }
    }
    /**
     * Custom VM mapper that assigns cloudlets to VMs based on a predefined schedule.
     *
     * @param cloudlet The cloudlet being mapped to a VM
     * @return The VM assigned to this cloudlet from the schedule
     */
    @Override
    protected Vm defaultVmMapper(Cloudlet cloudlet) {
        if (cloudlet.isBoundToVm()) {
            return cloudlet.getVm();
        }

        // Check if we have a schedule entry for this cloudlet
        Integer vmId = currentAssignments.get(cloudlet.getId());
        if (vmId != null) {
            return getVmFromCreatedList(vmId);
        }

        // Fallback to simple round-robin if no schedule
        return Vm.NULL;
    }

    public void onCloudletFinish(Cloudlet cloudlet) {
        // Remove finished cloudlet from tracking
        currentAssignments.remove(cloudlet.getId());

        // Update VM-cloudlet mappings
        for (List<Long> cloudlets : vmCloudletMap.values()) {
            cloudlets.remove(cloudlet.getId());
        }

        // Trigger dynamic scheduling
        triggerDynamicScheduleUpdate();
    }

    public void triggerDynamicScheduleUpdate() {
        try {
            // 1. Export current state to JSON
            exportCurrentState();

            // 2. Execute Python scheduler
            ProcessBuilder pb = new ProcessBuilder("python3", "run.py", "--job", "5", "--name", DynamicSimulation.name);
            pb.redirectErrorStream(true);
            Process p = pb.start();
            // Read the output (both stdout and stderr)
            BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("[Python Process] " + line);
            }

            p.waitFor();
            System.out.println("ProcessBuilder: " + pb.toString());
            System.out.println("Exit value: " + p.exitValue());

            // 3. Reload updated schedule
            loadSchedule(DynamicSimulation.name + "_schedule.json");
        } catch (Exception e) {
            DynamicSimulation.log.error("Error in dynamic scheduling", e);
        }
    }

    private void exportCurrentState() {
        JSONObject state = new JSONObject();

        // Add currently running cloudlets per VM
        JSONArray vmStates = new JSONArray();
        for (Vm vm : getVmCreatedList()) {
            JSONObject vmState = new JSONObject();
            vmState.put("vm_id", vm.getId());

            // Get cloudlets currently running or waiting on this VM
            JSONArray cloudlets = new JSONArray();
            List<Cloudlet> cloudletList = getCloudletSubmittedList().stream()
                    .filter(cl -> !cl.isFinished() &&
                            currentAssignments.getOrDefault(cl.getId(), -1) == vm.getId())
                    .collect(Collectors.toList());

            for (Cloudlet cl : cloudletList) {
                JSONObject clInfo = new JSONObject();
                clInfo.put("cloudlet_id", cl.getId());
                cloudlets.put(clInfo);
            }

            vmState.put("cloudlets", cloudlets);
            vmStates.put(vmState);
        }

        state.put("vm_states", vmStates);

        // Write to file
        try (FileWriter file = new FileWriter("current_state.json")) {
            file.write(state.toString());
        } catch (IOException e) {
            DynamicSimulation.log.error("Failed to export current state", e);
        }
    }

}
