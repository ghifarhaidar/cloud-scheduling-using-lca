package brokers;

import org.cloudsimplus.brokers.DatacenterBrokerSimple;
import org.cloudsimplus.cloudlets.Cloudlet;
import org.cloudsimplus.core.CloudSimPlus;
import org.cloudsimplus.datacenters.Datacenter;
import org.cloudsimplus.vms.Vm;
import org.json.JSONArray;
import org.json.JSONObject;
import utils.commons;

public class MOLCA extends DatacenterBrokerSimple {

    public MOLCA(CloudSimPlus simulation) {
        super(simulation,"MOLCA");

    }
    
    private static JSONArray schedule;
    public void loadSchedule(String file){
        JSONObject config = commons.loadConfig(file);
        schedule = config.getJSONArray("schedule");
    }

    @Override
    protected Vm defaultVmMapper(Cloudlet cloudlet) {
        if (cloudlet.isBoundToVm()) {
            return cloudlet.getVm();
        } else {
            System.out.println(cloudlet.getId());
            return this.getVmFromCreatedList(schedule.getInt((int) cloudlet.getId())) ;
        }
    }

}
