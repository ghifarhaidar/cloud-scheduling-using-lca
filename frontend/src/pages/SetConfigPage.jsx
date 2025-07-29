import React, { useState } from 'react';
import { saveConfig } from "../utils/api";
import {
  defaultFormValues,
  validateForm,
  PreparePayload,
  PrepareCustomConfig,
  defaultCustomConfigValues,
  validateLcaConfig,
  defaultParamTypes
} from "../utils/setConfigPageUtil";

import CustomConfigSection from '../components/CustomConfigSection';
import AlgorithmConfiguration from '../components/AlgorithmConfiguration';
import SimulationConfiguration from '../components/SimulationConfiguration';

export default function SetConfigPage() {
  const [paramTypes, setParamTypes] = useState(defaultParamTypes);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultFormValues);
  const [lcaConfigs, setLcaConfigs] = useState([]);
  const [customConfig, setCustomConfig] = useState(defaultCustomConfigValues);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    console.log(name, value, type)
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };
  const handleAddLcaConfig = () => {
    const errors = validateLcaConfig(formData, paramTypes);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const { config_type, cost_config_type, vm_scheduling_mode, ...lcaOnlyData } = formData;
    const processedLcaConfigs = PreparePayload(formData, paramTypes);


    setLcaConfigs((prev) => [
      ...prev,
      { ...processedLcaConfigs },
    ]);
    setErrors({});
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(formData, customConfig);
    console.log(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (lcaConfigs.length === 0) {
      alert("Please add at least one LCA configuration.");
      return;
    }

    setIsSubmitting(true);
    setErrors({});



    const payload = {
      config_type: formData.config_type,
      cost_config_type: formData.cost_config_type,
      vm_scheduling_mode: formData.vm_scheduling_mode,
      LCA_configs: lcaConfigs,
    };

    if (formData.config_type === 0) {
      payload.custom_config = PrepareCustomConfig(customConfig);
    }
    console.log("Submitting config:", payload);

    try {
      await saveConfig(payload);
      alert("✅ Config saved successfully!");
      setLcaConfigs([]);
    } catch (err) {
      console.error("❌ Error saving config:", err.message);
      alert("❌ Error saving config: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1> Experiments Configuration</h1>
      <div className="mb-lg" >
        <form onSubmit={handleSubmit}>

          {/* --- Algorithm Configuration Card --- */}
          <div className="card">
            <div className="card-body">
              <h2 className="form-section-title grid-title no-gap">🔧 Algorithm Configuration</h2>
              <AlgorithmConfiguration
                formData={formData}
                handleChange={handleChange}
                paramTypes={paramTypes}
                setParamTypes={setParamTypes}
                errors={errors}
              />
              <button
                type="button"
                className="btn btn-secondary mt-3 grid-button"
                onClick={handleAddLcaConfig}
              >
                ➕ Add LCA Config
              </button>
            </div>
          </div>

          {/* --- Simulation Configuration Card --- */}
          <div className="card mt-4">
            <div className="card-body">
              <h2 className="form-section-title grid-title no-gap">🖥️ Simulation Configuration</h2>
              <SimulationConfiguration
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
            </div>
          </div>

          {/* --- Custom Config (if selected) --- */}
          {formData.config_type === 0 && (
            <div className="card mt-4">
              <div className="card-body">
                <h2 className="form-section-title grid-title no-gap">🛠️ Custom Configuration</h2>
                <CustomConfigSection
                  customConfig={customConfig}
                  setCustomConfig={setCustomConfig}
                  errors={errors}
                />
              </div>
            </div>
          )}

          {/* --- Form Action Buttons --- */}
          <div className="flex gap-md mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div> Saving Configuration...
                </>
              ) : (
                <>💾 Save Full Configuration</>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setFormData(defaultFormValues);
                setCustomConfig(defaultCustomConfigValues);
                setParamTypes(defaultParamTypes);
                setErrors({});
                setLcaConfigs([]);
              }}
            >
              🔄 Reset to Defaults
            </button>
          </div>
        </form>
      </div>

      {/* --- Preview Added LCA Configs --- */}
      <div className="card mt-md" >
        <div className="card-body">
          <h3 className='grid-title'>📦 LCA Configs</h3>
          {lcaConfigs.length === 0 ? (
            <p className="card-text">No LCA configs added yet.</p>
          ) : (
            <div className="algorithm-grid grid-full">
              {lcaConfigs.map((cfg, idx) => (
                <div key={idx} className="card ">
                  <div className="code-block">
                    <pre>{JSON.stringify(cfg, null, 2)}</pre>
                  </div>
                  <button
                    className="btn btn-danger btn-sm "
                    onClick={() => {
                      setLcaConfigs(lcaConfigs.filter((_, i) => i !== idx));
                    }}
                  >
                    ❌ Remove
                  </button>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}