import React, { useState } from 'react';
import { saveConfig } from "../utils/api";
import {
  defaultFormValues,
  validateForm,
  validateCustomConfig,
  PreparePayload,
  PrepareCustomConfig,
  defaultCustomConfigValues
} from "../utils/setConfigPageUtil";

import CustomConfigSection from '../components/CustomConfigSection';
import AlgorithmConfiguration from '../components/AlgorithmConfiguration';
import SimulationConfiguration from '../components/SimulationConfiguration';

export default function SetConfigPage() {
  const [LType, setLType] = useState('single');
  const [SType, setSType] = useState('single');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultFormValues);
  const [lcaConfigs, setLcaConfigs] = useState([]);
  const [customConfig, setCustomConfig] = useState(defaultCustomConfigValues);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };
  const handleAddLcaConfig = () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const { config_type, cost_config_type, vm_scheduling_mode, ...lcaOnlyData } = formData;
    const processedLcaConfigs = PreparePayload(lcaOnlyData, LType, SType);


    setLcaConfigs((prev) => [
      ...prev,
      { ...processedLcaConfigs, L_type: LType, S_type: SType },
    ]);
    setErrors({});
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.config_type === 0) {
      // Validate custom config if "custom" type selected
      const customErrors = validateCustomConfig(customConfig);
      if (Object.keys(customErrors).length > 0) {
        setErrors(customErrors);
        return;
      }
    }
    const validationErrors = validateForm(formData);
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
              <h2 className="form-section-title">🔧 Algorithm Configuration</h2>
              <AlgorithmConfiguration
                formData={formData}
                LType={LType}
                setLType={setLType}
                SType={SType}
                setSType={setSType}
                handleChange={handleChange}
                errors={errors}
              />
              <button
                type="button"
                className="btn btn-secondary mt-3"
                onClick={handleAddLcaConfig}
              >
                ➕ Add LCA Config
              </button>
            </div>
          </div>

          {/* --- Simulation Configuration Card --- */}
          <div className="card mt-4">
            <div className="card-body">
              <h2 className="form-section-title">🖥️ Simulation Configuration</h2>
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
                <h2 className="form-section-title">🛠️ Custom Configuration</h2>
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
                setLType("single");
                setSType("single");
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
          <h3>📦 LCA Configs</h3>
          {lcaConfigs.length === 0 ? (
            <p className="card-text">No LCA configs added yet.</p>
          ) : (
            <div className="algorithm-grid ">
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