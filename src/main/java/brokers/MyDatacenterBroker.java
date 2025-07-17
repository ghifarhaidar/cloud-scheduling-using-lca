package brokers;

import org.cloudsimplus.brokers.DatacenterBrokerSimple;
import org.cloudsimplus.cloudlets.Cloudlet;
import org.cloudsimplus.core.CloudSimPlus;
import org.cloudsimplus.listeners.DatacenterBrokerEventInfo;
import org.cloudsimplus.listeners.EventListener;
import org.cloudsimplus.vms.Vm;
import org.json.JSONArray;
import org.json.JSONObject;
import utils.commons;

/**
 * Custom DatacenterBroker implementation that extends CloudSimPlus's basic broker
 * to support schedule-based cloudlet-to-VM mapping from JSON configuration.
 */
public class MyDatacenterBroker extends DatacenterBrokerSimple {

    public MyDatacenterBroker(CloudSimPlus simulation,String name) {
        super(simulation,name);
    }
    
    private static JSONArray schedule;

    /**
     * Loads the scheduling configuration from a JSON file.
     *
     * @param file Path to the JSON configuration file containing the schedule
     */
    public void loadSchedule(String file){
        JSONObject config = commons.loadConfig(file, "");
        schedule = config.getJSONArray("schedule");
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
        } else {
            return this.getVmFromCreatedList(schedule.getInt((int) cloudlet.getId())) ;
        }
    }

}
