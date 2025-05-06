package org.simulations;

import org.cloudsimplus.brokers.DatacenterBroker;
import org.cloudsimplus.brokers.DatacenterBrokerSimple;
import org.cloudsimplus.builders.tables.CloudletsTableBuilder;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 * A minimal but organized, structured and re-usable CloudSim Plus example
 * which shows good coding practices for creating simulation scenarios.
 *
 * <p>It defines a set of constants that enables a developer
 * to change the number of Hosts, VMs and Cloudlets to create
 * and the number of {@link Pe}s for Hosts, VMs and Cloudlets.</p>
 *
 * @author Manoel Campos da Silva Filho
 * @since CloudSim Plus 1.0
 */
public class BasicExample {
    private static final Logger log = LoggerFactory.getLogger(BasicExample.class);
    private final CloudSimPlus simulation;
    private final DatacenterBroker broker0;
    private final List<Vm> vmList;
    private final List<Cloudlet> cloudletList;
    private final Datacenter datacenter0;

    public static void main(String[] args) {
        new BasicExample();
    }

    private BasicExample() {
        /*Enables just some level of log messages.
          Make sure to import org.cloudsimplus.util.Log;*/
//        Log.setLevel(Level.TRACE);

        simulation = new CloudSimPlus();
        JSONObject config = loadConfig();

        datacenter0 = createDatacenter(config);
        broker0 = new DatacenterBrokerSimple(simulation);

        vmList = createVms(config);
        cloudletList = createCloudlets(config);

        broker0.submitVmList(vmList);
        broker0.submitCloudletList(cloudletList);
        simulation.start();

        final var cloudletFinishedList = broker0.getCloudletFinishedList();
        new CloudletsTableBuilder(cloudletFinishedList).build();
    }

    /**
     * Creates a Datacenter and its Hosts.
     */
    private Datacenter createDatacenter(JSONObject config) {
        JSONArray hostsConfig = config.getJSONArray("hosts");
        List<Host> hostList = new ArrayList<>();

        for (int i = 0; i < hostsConfig.length(); i++) {
            JSONObject hostConf = hostsConfig.getJSONObject(i);
            Host host = createHost(hostConf);
            hostList.add(host);
        }

        return new DatacenterSimple(simulation, hostList);
    }

    private Host createHost(JSONObject hostConf) {
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
    private List<Vm> createVms(JSONObject config) {
        JSONArray vmArray = config.getJSONArray("vms");
        List<Vm> vmList = new ArrayList<>();

        for (int i = 0; i < vmArray.length(); i++) {
            JSONObject vmConf = vmArray.getJSONObject(i);
            Vm vm = new VmSimple(vmConf.getInt("mips"), vmConf.getInt("pes"));
            vm.setRam(vmConf.getInt("ram"))
                    .setBw(vmConf.getInt("bw"))
                    .setSize(vmConf.getInt("size"))
                    .setCloudletScheduler(new CloudletSchedulerSpaceShared());
            vmList.add(vm);
        }

        return vmList;
    }

    /**
     * Creates a list of Cloudlets.
     */
    private List<Cloudlet> createCloudlets(JSONObject config) {
        JSONArray clArray = config.getJSONArray("cloudlets");
        List<Cloudlet> clList = new ArrayList<>();
        var utilization = new UtilizationModelFull();

        for (int i = 0; i < clArray.length(); i++) {
            JSONObject clConf = clArray.getJSONObject(i);
            Cloudlet cloudlet = new CloudletSimple(clConf.getInt("length"), clConf.getInt("pes"),utilization);
            cloudlet.setSizes(clConf.getInt("fileSize"));

            clList.add(cloudlet);
        }

        return clList;
    }


    private JSONObject loadConfig() {
        try {
            String content = Files.readString(Paths.get("sim_config.json"));
            return new JSONObject(content);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load sim_config.json", e);
        }
    }

}
