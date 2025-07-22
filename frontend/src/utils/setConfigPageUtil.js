const defaultFormValues = {
    L: 20,
    L_from: 10,
    L_to: 30,
    L_step: 1,
    S: 20,
    S_from: 10,
    S_to: 30,
    S_step: 1,
    p_c: 0.3,
    PSI1: 0.2,
    PSI2: 1,
    config_type: 1,
    cost_config_type: 1,
    vm_scheduling_mode: 'time',
}

const defaultCustomConfigValues = {
    cloudlets: {
        count: 100,
        length: { range: [30000, 60000] },
    },
    vms: {
        count: 20,
        pes: { range: [8, 16] },
    },
}
// Validation function
const validateForm = (formData) => {
    const newErrors = {};

    if (!(formData.p_c > 0 && formData.p_c < 1)) {
        newErrors.p_c = "p_c must be > 0 and < 1";
    }
    if (!(formData.PSI1 >= 0 && formData.PSI1 <= 1)) {
        newErrors.PSI1 = "PSI1 must be between 0 and 1";
    }
    if (!(formData.PSI2 >= 0 && formData.PSI2 <= 1)) {
        newErrors.PSI2 = "PSI2 must be between 0 and 1";
    }
    if (!(formData.config_type >= -1 && formData.config_type <= 6)) {
        newErrors.config_type = "config_type must be 1-6, 0 for custom configuration or -1 for range";
    }
    if (!(formData.cost_config_type === 1 || formData.cost_config_type === 2)) {
        newErrors.cost_config_type = "cost_config_type must be 1 or 2";
    }

    return newErrors;
};

const validateCustomConfig = (customConfig) => {
    const newErrors = {};

    if (!(customConfig.cloudlets.count > 0)) {
        newErrors.cloudlets_count = "Cloudlet count must be greater than 0";
    }
    const [clMin, clMax] = customConfig.cloudlets.length.range;
    if (!(clMin > 0 && clMax >= clMin)) {
        newErrors.cloudlets_length = "Cloudlet length range must be valid (min > 0 and max >= min)";
    }
    const vmCount = customConfig.vms.count;
    if (!(vmCount > 0)) {
        newErrors.vm_count = "vms count must be greater than 0";
    }
    const [vmPesMin, vmPesMax] = customConfig.vms.pes.range;
    if (!(vmPesMin > 0 && vmPesMax >= vmPesMin)) {
        newErrors.vm_pes = "vms PEs range must be valid (min > 0 and max >= min)";
    }

    return newErrors;
};


// Prepare JSON payload
const PreparePayload = (formData, LType, SType) => {

    let jsonPayload = {
        ...formData,
        L_type: LType,
        S_type: SType,
    };

    if (LType === "range") {
        jsonPayload.L = {
            from: formData.L_from,
            to: formData.L_to,
            step: formData.L_step,
        };
        const { L_from, L_to, L_step, ...rest } = jsonPayload;
        jsonPayload = rest;
    } else {
        jsonPayload.L = formData.L;
        const { L_from, L_to, L_step, ...rest } = jsonPayload;
        jsonPayload = rest;
    }

    if (SType === "range") {
        jsonPayload.S = {
            from: formData.S_from,
            to: formData.S_to,
            step: formData.S_step,
        };
        const { S_from, S_to, S_step, ...rest } = jsonPayload;
        jsonPayload = rest;
    } else {
        jsonPayload.S = formData.S;
        const { S_from, S_to, S_step, ...rest } = jsonPayload;
        jsonPayload = rest;
    }
    return jsonPayload;
}


const PrepareCustomConfig = (formData) => {
    return {
        cloudlet: {
            count: { range: [formData.cloudlets.count, formData.cloudlets.count] },
            length: { range: [formData.cloudlets.length.range[0], formData.cloudlets.length.range[1]] },
            pes: { range: [1, 1] },
            fileSize: { range: [300, 300] },
            outputSize: { range: [300, 300] },
        },
        VM: {
            count: { range: [formData.vms.count, formData.vms.count] },
            pes: { range: [formData.vms.pes.range[0], formData.vms.pes.range[1]] },
            ram: { range: [512, 512] },
            bw: { range: [512, 512] },
            size: { range: [1024, 1024] },
        },
        pe_mips_options: [1000, 2000, 4000, 8000],
        num_hosts: { range: [1, 1] },
    };
};



export {
    defaultFormValues,
    validateForm,
    validateCustomConfig,
    PreparePayload,
    PrepareCustomConfig,
    defaultCustomConfigValues,
}