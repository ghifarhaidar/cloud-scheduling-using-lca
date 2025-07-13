import React, { useState } from 'react';
import { saveConfig } from "../api"; 

export default function SetConfigPage() {
  const [LType, setLType] = useState('single');
  const [SType, setSType] = useState('single');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
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
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value, 
    }));
  };

   // Validation function
   const validateForm = () => {
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
    if (!((formData.config_type >= 1 && formData.config_type <= 9) || formData.config_type === -1)) {
      newErrors.config_type = "config_type must be 1-9 or -1 for range";
    }
    if (!(formData.cost_config_type === 1 || formData.cost_config_type === 2)) {
      newErrors.cost_config_type = "cost_config_type must be 1 or 2";
    }

    return newErrors;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // ❌ Stop submission
    }
    setErrors({}); // ✅ Clear previous errors

    // Prepare JSON payload
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
      const { S_from,S_to , S_step, ...rest } = jsonPayload;
      jsonPayload = rest;
    } else {
      jsonPayload.S = formData.S;
      const { S_from,S_to , S_step, ...rest } = jsonPayload;
      jsonPayload = rest;
    }

    console.log("Submitting config:", jsonPayload);

    try {
      const result = await saveConfig(jsonPayload);
      alert("✅ Config saved successfully!");
    } catch (err) {
      console.error("❌ Error saving config:", err.message);
    }
  };

  return (
    <div className="main p-4">
      <h1 className="text-2xl font-bold mb-4">Set Configuration</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* L parameter */}
        <fieldset>
          <legend className="font-semibold">L (League size):</legend>
          <div>
            <label>
              <input
                type="radio"
                name="LType"
                value="single"
                checked={LType === "single"}
                onChange={() => setLType("single")}
              />
              Single value
            </label>
            <label className="ml-4">
              <input
                type="radio"
                name="LType"
                value="range"
                checked={LType === "range"}
                onChange={() => setLType("range")}
              />
              Range
            </label>
          </div>

          {LType === "single" ? (
            <div>
              <input
                type="number"
                name="L"
                value={formData.L}
                onChange={handleChange}
                min="1"
              />
            </div>
          ) : (
            <div>
              From:{" "}
              <input type="number" name="L_from" value={formData.L_from} onChange={handleChange} min="1" />
              To:{" "}
              <input type="number" name="L_to" value={formData.L_to} onChange={handleChange} min="1" />
              Step:{" "}
              <input type="number" name="L_step" value={formData.L_step} onChange={handleChange} min="1" />
            </div>
          )}
        </fieldset>

        {/* S parameter */}
        <fieldset>
          <legend className="font-semibold">S (Number of seasons):</legend>
          <div>
            <label>
              <input
                type="radio"
                name="SType"
                value="single"
                checked={SType === "single"}
                onChange={() => setSType("single")}
              />
              Single value
            </label>
            <label className="ml-4">
              <input
                type="radio"
                name="SType"
                value="range"
                checked={SType === "range"}
                onChange={() => setSType("range")}
              />
              Range
            </label>
          </div>

          {SType === "single" ? (
            <div>
              <input
                type="number"
                name="S"
                value={formData.S}
                onChange={handleChange}
                min="1"
              />
            </div>
          ) : (
            <div>
              From:{" "}
              <input type="number" name="S_from" value={formData.S_from} onChange={handleChange} min="1" />
              To:{" "}
              <input type="number" name="S_to" value={formData.S_to} onChange={handleChange} min="1" />
              Step:{" "}
              <input type="number" name="S_step" value={formData.S_step} onChange={handleChange} min="1" />
            </div>
          )}
        </fieldset>

        {/* Other parameters */}
        <fieldset>
          <legend className="font-semibold">Other Parameters</legend>
          <div>
            <label>
              p_c:
              <input
                type="number"
                name="p_c"
                step="0.01"
                value={formData.p_c}
                onChange={handleChange}
              />
            </label>
            {errors.p_c && <p className="text-red-600">{errors.p_c}</p>}
          </div>

          <div>
            <label>
              PSI1:
              <input
                type="number"
                name="PSI1"
                step="0.01"
                value={formData.PSI1}
                onChange={handleChange}
              />
            </label>
            {errors.PSI1 && <p className="text-red-600">{errors.PSI1}</p>}
          </div>

          <div>
            <label>
              PSI2:
              <input
                type="number"
                name="PSI2"
                step="0.01"
                value={formData.PSI2}
                onChange={handleChange}
              />
            </label>
            {errors.PSI2 && <p className="text-red-600">{errors.PSI2}</p>}
          </div>
        </fieldset>

        {/* Sim Config */}
        <fieldset>
          <legend className="font-semibold">Sim Configs</legend>
          <div>
            <label>
              config_type:
              <input
                type="number"
                name="config_type"
                value={formData.config_type}
                onChange={handleChange}
                min="-1"
                max="9"
              />
            </label>
            {errors.config_type && <p className="text-red-600">{errors.config_type}</p>}
          </div>

          <div>
            <label>
              cost_config_type:
              <input
                type="number"
                name="cost_config_type"
                value={formData.cost_config_type}
                onChange={handleChange}
                min="1"
                max="2"
              />
            </label>
            {errors.cost_config_type && <p className="text-red-600">{errors.cost_config_type}</p>}
          </div>

          <div>
            <label>
              <input
                type="radio"
                name="vm_scheduling_mode"
                value="time"
                checked={formData.vm_scheduling_mode === "time"}
                onChange={handleChange}
              />
              Time-Shared
            </label>
            <label className="ml-4">
              <input
                type="radio"
                name="vm_scheduling_mode"
                value="space"
                checked={formData.vm_scheduling_mode === "space"}
                onChange={handleChange}
              />
              Space-Shared
            </label>
          </div>
        </fieldset>

        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Submit
        </button>
      </form>
    </div>
  );
}