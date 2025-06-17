package utils;

import org.cloudsimplus.cloudlets.Cloudlet;
import org.cloudsimplus.cloudlets.CloudletSimple;
import org.cloudsimplus.core.CloudSimPlus;
import org.cloudsimplus.datacenters.Datacenter;
import org.cloudsimplus.datacenters.DatacenterSimple;
import org.cloudsimplus.hosts.Host;
import org.cloudsimplus.hosts.HostSimple;
import org.cloudsimplus.resources.Pe;
import org.cloudsimplus.resources.PeSimple;
import org.cloudsimplus.schedulers.cloudlet.CloudletSchedulerSpaceShared;
import org.cloudsimplus.utilizationmodels.UtilizationModelFull;
import org.cloudsimplus.vms.Vm;
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
    public static void initConfig() {
        initConfig("sim_config.json");
    }

    public static void initConfig(String file) {
        config = commons.loadConfig(file);
    }

    public static Datacenter createDatacenter(CloudSimPlus simulation) {
        JSONArray hostsConfig = config.getJSONArray("hosts");
        List<Host> hostList = new ArrayList<>();

        for (int i = 0; i < hostsConfig.length(); i++) {
            JSONObject hostConf = hostsConfig.getJSONObject(i);
            Host host = createHost(hostConf);
            hostList.add(host);
        }

        return new DatacenterSimple(simulation, hostList);
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


    private static JSONObject loadConfig(String file) {
        try {
            String content = Files.readString(Paths.get(file));
            return new JSONObject(content);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load sim_config.json", e);
        }
    }
}
