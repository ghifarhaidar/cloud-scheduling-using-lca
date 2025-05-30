package org.simulations;

import org.cloudsimplus.brokers.DatacenterBroker;
import org.cloudsimplus.brokers.DatacenterBrokerSimple;
import org.cloudsimplus.builders.tables.CloudletsTableBuilder;
import org.cloudsimplus.cloudlets.Cloudlet;
import org.cloudsimplus.core.CloudSimPlus;
import org.cloudsimplus.datacenters.Datacenter;
import org.cloudsimplus.vms.Vm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.util.List;
import utils.commons;

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
        commons.initConfig();

        datacenter0 = commons.createDatacenter(simulation);
        broker0 = new DatacenterBrokerSimple(simulation);

        vmList = commons.createVms();
        cloudletList = commons.createCloudlets();

        broker0.submitVmList(vmList);
        broker0.submitCloudletList(cloudletList);
        simulation.start();

        final var cloudletFinishedList = broker0.getCloudletFinishedList();
        new CloudletsTableBuilder(cloudletFinishedList).build();
    }



}
