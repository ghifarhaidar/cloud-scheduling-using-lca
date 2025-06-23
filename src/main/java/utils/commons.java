package utils;

import org.cloudsimplus.brokers.DatacenterBroker;
import org.cloudsimplus.cloudlets.Cloudlet;
import org.cloudsimplus.cloudlets.CloudletSimple;
import org.cloudsimplus.core.CloudSimPlus;
import org.cloudsimplus.datacenters.Datacenter;
import org.cloudsimplus.datacenters.DatacenterCharacteristicsSimple;
import org.cloudsimplus.datacenters.DatacenterSimple;
import org.cloudsimplus.hosts.Host;
import org.cloudsimplus.hosts.HostSimple;
import org.cloudsimplus.resources.Pe;
import org.cloudsimplus.resources.PeSimple;
import org.cloudsimplus.schedulers.cloudlet.CloudletSchedulerCompletelyFair;
import org.cloudsimplus.schedulers.cloudlet.CloudletSchedulerSpaceShared;
import org.cloudsimplus.utilizationmodels.UtilizationModelFull;
import org.cloudsimplus.vms.Vm;
import org.cloudsimplus.vms.VmCost;
import org.cloudsimplus.vms.VmSimple;
import org.json.JSONArray;
import org.json.JSONObject;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

public class commons {
    /**
     * Creates a Datacenter and its Hosts.
     */

    private static JSONObject config;
    private static JSONObject costConfig;
    public static void initConfig() {
        config = commons.loadConfig("sim_config.json");
        costConfig = commons.loadConfig("sim_cost_config.json");
    }

    public static Datacenter createDatacenter(CloudSimPlus simulation) {
        JSONArray hostsConfig = config.getJSONArray("hosts");

        List<Host> hostList = new ArrayList<>();

        for (int i = 0; i < hostsConfig.length(); i++) {
            JSONObject hostConf = hostsConfig.getJSONObject(i);
            Host host = createHost(hostConf);
            hostList.add(host);
        }
        DatacenterCharacteristicsSimple dcs =  new DatacenterCharacteristicsSimple(costConfig.getInt("CostPerSecond"), costConfig.getInt("CostPerMem"), costConfig.getInt("CostPerStorage"), costConfig.getInt("CostPerBw"));
        return new DatacenterSimple(simulation, hostList).setCharacteristics(dcs);
    }

    public static Host createHost(JSONObject hostConf) {
        int pes = hostConf.getInt("pes");
        int mips = hostConf.getInt("mips");
        List<Pe> peList = new ArrayList<>();
        for (int i = 0; i < pes; i++) {
            peList.add(new PeSimple(mips));
        }

        Host host = new HostSimple(
                hostConf.getInt("ram"),
                hostConf.getLong("bw"),
                hostConf.getLong("storage"),
                peList
        );

        return host;
    }

    /**
     * Creates a list of VMs.
     */
    public static List<Vm> createVms() {
        JSONArray vmArray = config.getJSONArray("vms");
        List<Vm> vmList = new ArrayList<>();

        for (int i = 0; i < vmArray.length(); i++) {
            JSONObject vmConf = vmArray.getJSONObject(i);
            Vm vm = new VmSimple(vmConf.getInt("vm_mips"), vmConf.getInt("vm_pes"));
            vm.setRam(vmConf.getInt("vm_ram"))
                    .setBw(vmConf.getInt("vm_bw"))
                    .setSize(vmConf.getInt("vm_size"))
                    .setCloudletScheduler(new CloudletSchedulerSpaceShared());
            vmList.add(vm);
        }

        return vmList;
    }

    /**
     * Creates a list of Cloudlets.
     */
    public static List<Cloudlet> createCloudlets() {
        JSONArray clArray = config.getJSONArray("cloudlets");
        List<Cloudlet> clList = new ArrayList<>();

        for (int i = 0; i < clArray.length(); i++) {
            JSONObject clConf = clArray.getJSONObject(i);
            Cloudlet cloudlet = new CloudletSimple(clConf.getInt("length"), clConf.getInt("pes"));
            cloudlet.setSizes(clConf.getInt("fileSize"));

            clList.add(cloudlet);
        }

        return clList;
    }


    public static JSONObject loadConfig(String file) {
        try {
            String content = Files.readString(Paths.get(file));
            return new JSONObject(content);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load " + file, e);
        }
    }

    /**
     * Computes and print the cost ($) of resources (processing, bw, memory, storage)
     * for each VM inside the datacenter.
     */
    public static void printTotalVmsCost(Datacenter datacenter0, DatacenterBroker broker0) {
        System.out.println();
        double totalCost = 0.0;
        int totalNonIdleVms = 0;
        double processingTotalCost = 0, memoryTotaCost = 0, storageTotalCost = 0, bwTotalCost = 0;
        for (final Vm vm : broker0.getVmCreatedList()) {
            final var cost = new VmCost(vm);
            processingTotalCost += cost.getProcessingCost();
            memoryTotaCost += cost.getMemoryCost();
            storageTotalCost += cost.getStorageCost();
            bwTotalCost += cost.getBwCost();

            totalCost += cost.getTotalCost();
            totalNonIdleVms += vm.getTotalExecutionTime() > 0 ? 1 : 0;
            System.out.println(cost);
        }

        System.out.printf(
                "Total cost ($) for %3d created VMs from %3d in DC %d: %8.2f$ %13.2f$ %17.2f$ %12.2f$ %15.2f$%n",
                totalNonIdleVms, broker0.getVmsNumber(), datacenter0.getId(),
                processingTotalCost, memoryTotaCost, storageTotalCost, bwTotalCost, totalCost);
    }

}
