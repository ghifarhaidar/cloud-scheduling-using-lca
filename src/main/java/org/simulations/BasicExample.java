package org.simulations;

import brokers.MyDatacenterBroker;
import org.cloudsimplus.brokers.DatacenterBroker;
import org.cloudsimplus.builders.tables.CloudletsTableBuilder;
import org.cloudsimplus.cloudlets.Cloudlet;
import org.cloudsimplus.core.CloudSimPlus;
import org.cloudsimplus.datacenters.Datacenter;
import org.cloudsimplus.vms.Vm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.util.List;
import java.util.Scanner;

import utils.commons;

public class BasicExample {
    private static final Logger log = LoggerFactory.getLogger(BasicExample.class);
    private final CloudSimPlus simulation;
    private final DatacenterBroker broker0;
    private final List<Vm> vmList;
    private final List<Cloudlet> cloudletList;
    private final Datacenter datacenter0;

    public static void main(String[] args) {
        // Get user input for scheduling algorithm
        Scanner scanner = new Scanner(System.in);
        System.out.println("Available scheduling algorithms:");
        System.out.println("1. Makespan LCA");
        System.out.println("2. Cost LCA");
        System.out.println("3. Multi-Objective LCA");
        System.out.print("Select algorithm to run (1-3): ");
        int choice = scanner.nextInt();
        String algorithm = switch (choice) {
            case 1 -> "makespan_LCA";
            case 2 -> "cost_LCA";
            case 3 -> "MO_LCA";
            default -> {
                System.out.println("Invalid choice. Defaulting to cost_LCA.");
                yield "cost_LCA";
            }
        };

        new BasicExample(algorithm);
    }

    public static String name;

    private BasicExample(String algorithm) {
        /*Enables just some level of log messages.
          Make sure to import org.cloudsimplus.util.Log;*/
//        Log.setLevel(Level.TRACE)

        name = algorithm;
        log.info("Running simulation with {} algorithm", name);

        simulation = new CloudSimPlus();
        commons.initConfig();

        datacenter0 = commons.createDatacenter(simulation);
        broker0 = new MyDatacenterBroker(simulation,name);
        ((MyDatacenterBroker) broker0).loadSchedule(name + "_schedule.json");

        vmList = commons.createVms();
        cloudletList = commons.createCloudlets();

        broker0.submitVmList(vmList);
        broker0.submitCloudletList(cloudletList);

        simulation.start();

        final var cloudletFinishedList = broker0.getCloudletFinishedList();
        new CloudletsTableBuilder(cloudletFinishedList).build();
        commons.printTotalVmsCost(datacenter0,broker0);
        commons.exportResult(datacenter0, broker0);
    }



}
