
package vms;

import lombok.Getter;
import org.cloudsimplus.datacenters.DatacenterCharacteristics;
import org.cloudsimplus.vms.Vm;
import org.cloudsimplus.vms.VmCost;
import utils.commons;

import java.util.Objects;

/**
 * Computes the monetary ($) cost to run a given VM,
 * including the {@link #getTotalCost() total cost}
 * and individual resource cost, namely:
 * the processing power, bandwidth, memory and storage cost.
 *
 */
public class MyVmCost extends VmCost {

    /**
     * Creates an instance to compute the monetary cost ($) to run a given VM.
     * @param vm the VM to compute its monetary cost
     */
    public MyVmCost(final Vm vm) {
        super(vm);
    }

    /**
     * {@return the characteristics of the Datacenter} where the VM is running.
     * Such characteristics include the price to run a VM in such a Datacenter.
     */
    private DatacenterCharacteristics getDcCharacteristics() {
        return getVm().getHost().getDatacenter().getCharacteristics();
    }

    /**
     * {@return the memory monetary cost ($)} of the resource allocated to the VM
     */
    public double getMemoryCost() {
        return getDcCharacteristics().getCostPerMem() * getVm().getRam().getCapacity();
    }

    /**
     * {@return the bandwidth monetary cost ($)} of the resource allocated to the VM
     */
    public double getBwCost() {
        return getDcCharacteristics().getCostPerBw() * getVm().getBw().getCapacity();
    }

    /**
     * {@return the processing monetary cost ($)} of the PEs allocated from the PM hosting the VM,
     * considering the VM's PEs number and total execution time.
     */
    public double getProcessingCost() {
        return getActiveProcessingCost() + getIdleProcessingCost();
    }
    public double getActiveProcessingCost() {
        if(getVm().getLastBusyTime() < 0){
            return 0;
        }
        double x = commons.costConfig.getDouble("x");
        double p_u = commons.costConfig.getDouble("p_u");
        double p_active = commons.costConfig.getDouble("p_active");
        final double costPerMI = getDcCharacteristics().getCostPerSecond() / 1000;
        return p_active * costPerMI * Math.pow(getVm().getMips() , 1 + x)  * getVm().getPesNumber()* getVm().getLastBusyTime() / Math.pow(p_u, 1 + x);
    }
    public double getIdleProcessingCost() {
        double x = commons.costConfig.getDouble("x");
        double p_u = commons.costConfig.getDouble("p_u");
        double p_idle = commons.costConfig.getDouble("p_idle");
        final double costPerMI = getDcCharacteristics().getCostPerSecond() / 1000;
        final double idleTme = getVm().getTotalExecutionTime() - getVm().getLastBusyTime();
        return p_idle * costPerMI * Math.pow(getVm().getMips() , 1 + x)  * getVm().getPesNumber()* idleTme / Math.pow(p_u, 1 + x);
//        return costPerMI * getVm().getTotalMipsCapacity() * idleTme ;
    }

    /**
     * {@return the storage monetary cost ($)} of the resource allocated to the VM
     */
    public double getStorageCost() {
        return getDcCharacteristics().getCostPerStorage() * getVm().getStorage().getCapacity();
    }

    /**
     * {@return the total monetary cost ($)} of all resources allocated to the VM,
     * namely the processing power, bandwidth, memory and storage.
     */
    public double getTotalCost() {
        return getProcessingCost() + getStorageCost() + getMemoryCost() + getBwCost();
    }

    @Override
    public String toString() {
        return
                "%s costs ($) for %8.2f active seconds - CPU: %8.2f$ %8.2f idle seconds - CPU: %8.2f$ RAM: %8.2f$ Storage: %8.2f$ BW: %8.2f$ Total: %8.2f$"
                        .formatted(getVm(), getVm().getLastBusyTime(), getActiveProcessingCost(),getVm().getTotalExecutionTime() - getVm().getLastBusyTime(), getIdleProcessingCost(), getMemoryCost(), getStorageCost(), getBwCost(), getTotalCost());
    }
}