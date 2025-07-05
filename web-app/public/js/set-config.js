// Toggle visibility of range/single inputs
document.querySelectorAll('input[name="L_type"]').forEach(radio => {
    radio.addEventListener('change', function () {
        document.getElementById('L_single_input').style.display =
            this.value === 'single' ? 'block' : 'none';
        document.getElementById('L_range_input').style.display =
            this.value === 'range' ? 'block' : 'none';
    });
});

document.querySelectorAll('input[name="S_type"]').forEach(radio => {
    radio.addEventListener('change', function () {
        document.getElementById('S_single_input').style.display =
            this.value === 'single' ? 'block' : 'none';
        document.getElementById('S_range_input').style.display =
            this.value === 'range' ? 'block' : 'none';
    });
});

// Validation on submit
document.getElementById('configForm').addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate standard parameters
    const p_c = parseFloat(document.getElementById('p_c').value);
    if (!(p_c > 0 && p_c < 1)) {
        alert('p_c must be greater than 0 and less than 1');
        return;
    }

    const PSI1 = parseFloat(document.getElementById('PSI1').value);
    if (!(PSI1 >= 0 && PSI1 <= 1)) {
        alert('PSI1 must be between 0 and 1');
        return;
    }

    const PSI2 = parseFloat(document.getElementById('PSI2').value);
    if (!(PSI2 >= 0 && PSI2 <= 1)) {
        alert('PSI2 must be between 0 and 1');
        return;
    }

    const config_type = parseInt(document.getElementById('config_type').value);
    if (!((config_type >= 1 && config_type <= 9) || config_type === -1)) {
        alert('config_type must be between 1 and 9 or -1 for range');
        return;
    }

    const cost_config_type = parseInt(document.getElementById('cost_config_type').value);
    if (!(cost_config_type === 1 || cost_config_type === 2)) {
        alert('cost_config_type must be 1 or 2');
        return;
    }

    // Create the data object with proper range handling
    const formData = new FormData(e.target);
    const jsonData = {};

    // Handle L parameter
    if (formData.get('L_type') === 'range') {
        const from = parseInt(document.getElementById('L_from').value);
        const to = parseInt(document.getElementById('L_to').value);
        const step = parseInt(document.getElementById('L_step').value);

        // Validate range values
        if (from >= to) {
            alert('L "From" value must be less than "To" value');
            return;
        }
        if (step <= 0) {
            alert('L step must be greater than 0');
            return;
        }

        jsonData.L_type = 'range';
        jsonData.L = { from, to, step };
    } else {
        jsonData.L_type = 'single';
        jsonData.L = parseInt(formData.get('L'));
    }

    // Handle S parameter
    if (formData.get('S_type') === 'range') {
        const from = parseInt(document.getElementById('S_from').value);
        const to = parseInt(document.getElementById('S_to').value);
        const step = parseInt(document.getElementById('S_step').value);

        // Validate range values
        if (from >= to) {
            alert('S "From" value must be less than "To" value');
            return;
        }
        if (step <= 0) {
            alert('S step must be greater than 0');
            return;
        }

        jsonData.S_type = 'range';
        jsonData.S = { from, to, step };
    } else {
        jsonData.S_type = 'single';
        jsonData.S = parseInt(formData.get('S'));
    }

    // Add other parameters
    jsonData.p_c = p_c;
    jsonData.PSI1 = PSI1;
    jsonData.PSI2 = PSI2;
    jsonData.config_type = config_type;
    jsonData.cost_config_type = cost_config_type;
    jsonData.vm_scheduling_mode = document.querySelector('input[name="vm_scheduling_mode"]:checked').value;
    
    console.log('Form data:', jsonData);

    // Send to backend
    fetch('/save-config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    })
        .then(response => {
            if (!response.ok) throw new Error('response was not ok');
            return response.json();
        })
        .then(data => {
            alert('Config saved successfully!');
        })
        .catch(error => {
            alert('Failed to save config: ' + error.message);
        });
});