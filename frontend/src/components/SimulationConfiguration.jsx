export default function SimulationConfiguration({ formData, handleChange, errors }) {
  return (
    <>
      <p className="grid-text card-text">Configure the cloud simulation environment</p>
      {/* Configuration Type */}
      <div className="form-section">
        <h3 className="form-section-title grid-title">⚙️ Configuration Type</h3>
        <p className="form-description">Values: 1–6, 0 for custom, -1 for range</p>

        <div className="form-group">
          <input
            type="number"
            name="config_type"
            value={formData.config_type}
            onChange={handleChange}
            min="-1"
            max="6"
              className="form-input form-input-small"
          />
          {errors.config_type && <div className="error-message">⚠️ {errors.config_type}</div>}
        </div>
      </div>

      {/* Cost Configuration Type */}
      <div className="form-section">
        <h3 className="form-section-title grid-title">💰 Cost Configuration</h3>
        <p className="form-description">Values: 1 or 2</p>

        <div className="form-group">
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

      {/* VM Scheduling Mode */}
      <div className="form-section">
        <h3 className="form-section-title grid-title">⏱️ VM Scheduling</h3>
        <p className="form-description">Select VM scheduling mode</p>

        <div className="radio-group">
          {['time', 'space'].map((mode) => (
            <label className="radio-option" key={mode}>
              <input
                type="radio"
                name="vm_scheduling_mode"
                value={mode}
                checked={formData.vm_scheduling_mode === mode}
                onChange={handleChange}
              />
              {mode.charAt(0).toUpperCase() + mode.slice(1)}-Shared
            </label>
          ))}
        </div>
      </div>
    </>

  );
}