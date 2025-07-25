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
    p_c_from: 0.1,
    p_c_to: 0.9,
    p_c_step: 0.1,
    PSI1: 0.2,
    PSI1_from: 0.1,
    PSI1_to: 1,
    PSI1_step: 0.1,
    PSI2: 1,
    PSI2_from: 0.1,
    PSI2_to: 1,
    PSI2_step: 0.1,
    q0: 1,
    q0_from: 1,
    q0_to: 5,
    q0_step: 1,
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

const defaultParamTypes = {
    LType: 'single',
    SType: 'single',
    p_cType: 'single',
    PSI1Type: 'single',
    PSI2Type: 'single',
    q0Type: 'single',
}

const LCA_Params_ranges = {
    L_min: 1,
    S_min: 1,
    p_c_min: 0,
    p_c_max: 1,
    q0_min: 1,
    PSI1_min: 0,
    PSI1_max: 1,
    PSI2_min: 0,
    PSI2_max: 1,

}
const validateLcaConfig = (formData, paramTypes) => {
    let newErrors = {};

    const validateRange = (name, minVal, maxVal, exclusiveMin = false, exclusiveMax = false) => {
        const from = formData[`${name}_from`];
        const to = formData[`${name}_to`];
        const step = formData[`${name}_step`];

        if (exclusiveMin ? !(from > minVal) : !(from >= minVal)) {
            newErrors[`${name}_from`] = `${name} from must be ${exclusiveMin ? '>' : '≥'} ${minVal}`;
        }
        if (maxVal && (exclusiveMax ? !(from < maxVal) : !(from <= maxVal))) {
            newErrors[`${name}_from`] = `${name} from must be ${exclusiveMax ? '<' : '≤'} ${maxVal}`;
        }
        if (!(to >= from)) {
            newErrors[`${name}_to`] = `${name} to must be ≥ from`;
        }
        if (maxVal && (exclusiveMax ? !(to < maxVal) : !(to <= maxVal))) {
            newErrors[`${name}_to`] = `${name} to must be ${exclusiveMax ? '<' : '≤'} ${maxVal}`;
        }
        if (!(step > 0)) {
            newErrors[`${name}_step`] = `${name} step must be > 0`;
        }
    };

    const validateSingle = (name, minVal, maxVal = null, exclusiveMin = false, exclusiveMax = false) => {
        const val = formData[name];
        if (exclusiveMin ? !(val > minVal) : !(val >= minVal)) {
            newErrors[name] = `${name} must be ${exclusiveMin ? '>' : '≥'} ${minVal}`;
        }
        if (
            maxVal !== null &&
            (exclusiveMax ? !(val < maxVal) : !(val <= maxVal))
        ) {
            newErrors[name] = `${name} must be ${exclusiveMax ? '<' : '≤'} ${maxVal}`;
        }
    };

    // Validate L
    if (paramTypes.LType === 'range') {
        validateRange('L', LCA_Params_ranges.L_min);
    } else {
        validateSingle('L', LCA_Params_ranges.L_min);
    }

    // Validate S
    if (paramTypes.SType === 'range') {
        validateRange('S', LCA_Params_ranges.S_min);
    } else {
        validateSingle('S', LCA_Params_ranges.S_min);
    }

    // Validate p_c
    if (paramTypes.p_cType === 'range') {
        validateRange('p_c', LCA_Params_ranges.p_c_min, LCA_Params_ranges.p_c_max, true, true);
    } else {
        validateSingle('p_c', LCA_Params_ranges.p_c_min, LCA_Params_ranges.p_c_max, true, true);
    }

    // Validate PSI1
    if (paramTypes.PSI1Type === 'range') {
        validateRange('PSI1', LCA_Params_ranges.PSI1_min, LCA_Params_ranges.PSI1_max);
    } else {
        validateSingle('PSI1', LCA_Params_ranges.PSI1_min, LCA_Params_ranges.PSI1_max);
    }

    // Validate PSI2
    if (paramTypes.PSI2Type === 'range') {
        validateRange('PSI2', LCA_Params_ranges.PSI2_min, LCA_Params_ranges.PSI2_max);
    } else {
        validateSingle('PSI2', LCA_Params_ranges.PSI2_min, LCA_Params_ranges.PSI2_max);
    }

    // Validate q0
    if (paramTypes.q0Type === 'range') {
        validateRange('q0', LCA_Params_ranges.q0_min);
    } else {
        validateSingle('q0', LCA_Params_ranges.q0_min);
    }

    console.log(newErrors);
    return newErrors;
}

// Validation function
const validateForm = (formData, customConfig) => {
    let newErrors = {};

    if (formData.config_type < -1 || formData.config_type > 6) {
        newErrors.config_type = "Configuration type must be between -1 and 6";
    }

    if (![1, 2].includes(Number(formData.cost_config_type))) {
        newErrors.cost_config_type = "Cost configuration type must be 1 or 2";
    }

    // Only validate customConfig if user selected custom config
    if (Number(formData.config_type) === 0) {
        const customErrors = validateCustomConfig(customConfig);
        newErrors = { ...newErrors, ...customErrors };
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


const PreparePayload = (formData, paramTypes) => {
    let jsonPayload = {
        L_type: paramTypes["LType"],
        S_type: paramTypes["SType"],
        p_c_type: paramTypes["p_cType"],
        PSI1_type: paramTypes["PSI1Type"],
        PSI2_type: paramTypes["PSI2Type"],
        q0_type: paramTypes["q0Type"],
    };

    // Handle algorithm params
    ['L', 'S', 'p_c', 'PSI1', 'PSI2', 'q0'].forEach((param) => {
        if (paramTypes[`${param}Type`] === 'range') {
            jsonPayload[param] = {
                from: formData[`${param}_from`],
                to: formData[`${param}_to`],
                step: formData[`${param}_step`],
            };
        } else {
            jsonPayload[param] = formData[param];
        }
    });

    return jsonPayload;
};


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
    validateLcaConfig,
    defaultParamTypes,
}