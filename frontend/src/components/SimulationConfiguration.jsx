export default function SimulationConfiguration({ formData, handleChange, errors }) {
  return (
    <div className="form-section">
      <h3 className="form-section-title">🖥️ Simulation Configuration</h3>
      <p className="form-description">Configure the cloud simulation environment</p>

      <div className="form-input-group">
        <div className="form-group">
          <label className="form-label">
            Configuration Type
            <span className="form-note"> - Values: 1–6, 0 for custom, -1 for range</span>
          </label>
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

        <div className="form-group">
          <label className="form-label">
            Cost Configuration Type
            <span className="form-note"> - Values: 1 or 2</span>
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
    </div>
  );
}
