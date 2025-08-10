package org.simulations;

import brokers.DynamicDatacenterBroker;
import brokers.MyDatacenterBroker;
import org.cloudsimplus.brokers.DatacenterBroker;
import org.cloudsimplus.builders.tables.CloudletsTableBuilder;
import org.cloudsimplus.cloudlets.Cloudlet;
import org.cloudsimplus.core.CloudSimPlus;
import org.cloudsimplus.datacenters.Datacenter;
import org.cloudsimplus.listeners.EventInfo;
import org.cloudsimplus.vms.Vm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.util.List;
import java.util.Scanner;

import utils.commons;

public class DynamicSimulation {
    public static final Logger log = LoggerFactory.getLogger(Simulation.class);
    private final CloudSimPlus simulation;
    private final DynamicDatacenterBroker broker;
    private final List<Vm> vmList;
    private final List<Cloudlet> cloudletList;
    private final Datacenter datacenter;

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String algorithm = scanner.nextLine();
        new DynamicSimulation(algorithm);
    }

    public static String name;

    private DynamicSimulation(String algorithm) {
        /*Enables just some level of log messages.
          Make sure to import org.cloudsimplus.util.Log;*/
//        Log.setLevel(Level.TRACE)

        name = algorithm;
        log.info("Running simulation with {} algorithm", name);

        simulation = new CloudSimPlus();
        commons.initConfig();

        datacenter = commons.createDatacenter(simulation);
        broker = new DynamicDatacenterBroker(simulation,name);
        broker.triggerDynamicScheduleUpdate();

        vmList = commons.createVms();
        cloudletList = commons.createCloudlets();

        broker.submitVmList(vmList);
        broker.submitCloudletList(cloudletList);
        simulation.addOnClockTickListener(this::onClockTick);

        simulation.start();

        final var cloudletFinishedList = broker.getCloudletFinishedList();
        new CloudletsTableBuilder(cloudletFinishedList).build();
        commons.printTotalVmsCost(datacenter,broker);
        commons.exportResult(datacenter, broker, name);
    }
    private void onClockTick(EventInfo info) {
        // Check for finished cloudlets since last tick
        broker.getCloudletFinishedList().forEach(cloudlet -> {
            broker.onCloudletFinish(cloudlet);
        });
    }


}
