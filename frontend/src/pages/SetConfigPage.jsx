import React, { useState } from 'react';
import { saveConfig } from "../utils/api";
import { defaultFormValues, validateForm, PreparePayload } from "../utils/setConfigPageUtil";
export default function SetConfigPage() {
  const [LType, setLType] = useState('single');
  const [SType, setSType] = useState('single');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultFormValues);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // ❌ Stop submission
    }
    setErrors({}); // ✅ Clear previous errors
    setIsSubmitting(true);
    const jsonPayload = PreparePayload(formData, LType, SType);

    console.log("Submitting config:", jsonPayload);

    try {
      const result = await saveConfig(jsonPayload);
      alert("✅ Config saved successfully!");
    } catch (err) {
      console.error("❌ Error saving config:", err.message);
      alert("❌ Error saving config: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Algorithm Configuration</h1>

      <div className="form-container">
        <form onSubmit={handleSubmit}>

          {/* L parameter */}
          <div className="form-section">
            <h3 className="form-section-title">
              📊 League Size (L)
            </h3>
            <p style={{ color: 'var(--secondary-gray)', marginBottom: 'var(--spacing-lg)' }}>
              Configure the number of teams in the league championship algorithm
            </p>

            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="LType"
                  value="single"
                  checked={LType === "single"}
                  onChange={() => setLType("single")}
                />
                Single value
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="LType"
                  value="range"
                  checked={LType === "range"}
                  onChange={() => setLType("range")}
                />
                Range of values
              </label>
            </div>

            {LType === "single" ? (
              <div className="form-group">
                <label className="form-label">League Size</label>
                <input
                  type="number"
                  name="L"
                  value={formData.L}
                  onChange={handleChange}
                  min="1"
                  className="form-input form-input-small"
                />
              </div>
            ) : (
              <div className="form-input-group">
                <div className="form-group">
                  <label className="form-label">From</label>
                  <input
                    type="number"
                    name="L_from"
                    value={formData.L_from}
                    onChange={handleChange}
                    min="1"
                    className="form-input form-input-small"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">To</label>
                  <input
                    type="number"
                    name="L_to"
                    value={formData.L_to}
                    onChange={handleChange}
                    min="1"
                    className="form-input form-input-small"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Step</label>
                  <input
                    type="number"
                    name="L_step"
                    value={formData.L_step}
                    onChange={handleChange}
                    min="1"
                    className="form-input form-input-small"
                  />
                </div>
              </div>
            )}
          </div>

          {/* S parameter */}
          <div className="form-section">
            <h3 className="form-section-title">
              🏆 Number of Seasons (S)
            </h3>
            <p style={{ color: 'var(--secondary-gray)', marginBottom: 'var(--spacing-lg)' }}>
              Define the number of seasons (iterations) for the algorithm
            </p>

            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="SType"
                  value="single"
                  checked={SType === "single"}
                  onChange={() => setSType("single")}
                />
                Single value
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="SType"
                  value="range"
                  checked={SType === "range"}
                  onChange={() => setSType("range")}
                />
                Range of values
              </label>
            </div>

            {SType === "single" ? (
              <div className="form-group">
                <label className="form-label">Number of Seasons</label>
                <input
                  type="number"
                  name="S"
                  value={formData.S}
                  onChange={handleChange}
                  min="1"
                  className="form-input form-input-small"
                />
              </div>
            ) : (
              <div className="form-input-group">
                <div className="form-group">
                  <label className="form-label">From</label>
                  <input
                    type="number"
                    name="S_from"
                    value={formData.S_from}
                    onChange={handleChange}
                    min="1"
                    className="form-input form-input-small"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">To</label>
                  <input
                    type="number"
                    name="S_to"
                    value={formData.S_to}
                    onChange={handleChange}
                    min="1"
                    className="form-input form-input-small"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Step</label>
                  <input
                    type="number"
                    name="S_step"
                    value={formData.S_step}
                    onChange={handleChange}
                    min="1"
                    className="form-input form-input-small"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Algorithm Parameters */}
          <div className="form-section">
            <h3 className="form-section-title">
              ⚙️ Algorithm Parameters
            </h3>
            <p style={{ color: 'var(--secondary-gray)', marginBottom: 'var(--spacing-lg)' }}>
              Fine-tune the LCA algorithm behavior
            </p>

            <div className="form-input-group">
              <div className="form-group">
                <label className="form-label">
                  Crossover Probability (p_c)
                  <span style={{ fontSize: '0.875rem', color: 'var(--secondary-gray)' }}> - Range: 0 to 1</span>
                </label>
                <input
                  type="number"
                  name="p_c"
                  step="0.01"
                  value={formData.p_c}
                  onChange={handleChange}
                  className="form-input form-input-small"
                />
                {errors.p_c && <div className="error-message">⚠️ {errors.p_c}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  PSI1 Parameter
                  <span style={{ fontSize: '0.875rem', color: 'var(--secondary-gray)' }}> - Range: 0 to 1</span>
                </label>
                <input
                  type="number"
                  name="PSI1"
                  step="0.01"
                  value={formData.PSI1}
                  onChange={handleChange}
                  className="form-input form-input-small"
                />
                {errors.PSI1 && <div className="error-message">⚠️ {errors.PSI1}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  PSI2 Parameter
                  <span style={{ fontSize: '0.875rem', color: 'var(--secondary-gray)' }}> - Range: 0 to 1</span>
                </label>
                <input
                  type="number"
                  name="PSI2"
                  step="0.01"
                  value={formData.PSI2}
                  onChange={handleChange}
                  className="form-input form-input-small"
                />
                {errors.PSI2 && <div className="error-message">⚠️ {errors.PSI2}</div>}
              </div>
            </div>
          </div>

          {/* Simulation Configuration */}
          <div className="form-section">
            <h3 className="form-section-title">
              🖥️ Simulation Configuration
            </h3>
            <p style={{ color: 'var(--secondary-gray)', marginBottom: 'var(--spacing-lg)' }}>
              Configure the cloud simulation environment
            </p>

            <div className="form-input-group">
              <div className="form-group">
                <label className="form-label">
                  Configuration Type
                  <span style={{ fontSize: '0.875rem', color: 'var(--secondary-gray)' }}> - Values: 1-9 or -1 for range</span>
                </label>
                <input
                  type="number"
                  name="config_type"
                  value={formData.config_type}
                  onChange={handleChange}
                  min="-1"
                  max="9"
                  className="form-input form-input-small"
                />
                {errors.config_type && <div className="error-message">⚠️ {errors.config_type}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Cost Configuration Type
                  <span style={{ fontSize: '0.875rem', color: 'var(--secondary-gray)' }}> - Values: 1 or 2</span>
                </label>
                <input
                  type="number"
                  name="cost_config_type"
                  value={formData.cost_config_type}
                  onChange={handleChange}
                  min="1"
                  max="2"
                  className="form-input form-input-small"
                />
                {errors.cost_config_type && <div className="error-message">⚠️ {errors.cost_config_type}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">VM Scheduling Mode</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="vm_scheduling_mode"
                    value="time"
                    checked={formData.vm_scheduling_mode === "time"}
                    onChange={handleChange}
                  />
                  Time-Shared
                </label>
                <label className="radio-option">
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
            </div>
          </div>

          <div className="flex gap-md">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Saving Configuration...
                </>
              ) : (
                <>
                  💾 Save Configuration
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setFormData(defaultFormValues);
                setLType('single');
                setSType('single');
                setErrors({});
              }}
            >
              🔄 Reset to Defaults
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}