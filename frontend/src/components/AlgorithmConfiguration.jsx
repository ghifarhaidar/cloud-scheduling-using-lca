export default function AlgorithmConfiguration({
  formData,
  LType,
  setLType,
  SType,
  setSType,
  handleChange,
  errors
}) {
  return (
    <>
      {/* L Parameter */}
      <div className="form-section">
        <h3 className="form-section-title">📊 League Size (L)</h3>
        <p className="form-description">Configure the number of teams in the league championship algorithm</p>

        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" name="LType" value="single" checked={LType === "single"} onChange={() => setLType("single")} />
            Single value
          </label>
          <label className="radio-option">
            <input type="radio" name="LType" value="range" checked={LType === "range"} onChange={() => setLType("range")} />
            Range of values
          </label>
        </div>

        {LType === "single" ? (
          <div className="form-group">
            <label className="form-label">League Size</label>
            <input type="number" name="L" value={formData.L} onChange={handleChange} min="1" className="form-input form-input-small" />
          </div>
        ) : (
          <div className="form-input-group">
            <InputRange namePrefix="L" values={formData} onChange={handleChange} />
          </div>
        )}
      </div>

      {/* S Parameter */}
      <div className="form-section">
        <h3 className="form-section-title">🏆 Number of Seasons (S)</h3>
        <p className="form-description">Define the number of seasons (iterations) for the algorithm</p>

        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" name="SType" value="single" checked={SType === "single"} onChange={() => setSType("single")} />
            Single value
          </label>
          <label className="radio-option">
            <input type="radio" name="SType" value="range" checked={SType === "range"} onChange={() => setSType("range")} />
            Range of values
          </label>
        </div>

        {SType === "single" ? (
          <div className="form-group">
            <label className="form-label">Number of Seasons</label>
            <input type="number" name="S" value={formData.S} onChange={handleChange} min="1" className="form-input form-input-small" />
          </div>
        ) : (
          <div className="form-input-group">
            <InputRange namePrefix="S" values={formData} onChange={handleChange} />
          </div>
        )}
      </div>

      {/* Algorithm Parameters */}
      <div className="form-section">
        <h3 className="form-section-title">⚙️ Algorithm Parameters</h3>
        <p className="form-description">Fine-tune the LCA algorithm behavior</p>

        {['p_c', 'PSI1', 'PSI2'].map((param) => (
          <div className="form-group" key={param}>
            <label className="form-label">
              {param.toUpperCase()} <span className="form-note">- Range: 0 to 1</span>
            </label>
            <input
              type="number"
              name={param}
              step="0.01"
              value={formData[param]}
              onChange={handleChange}
              className="form-input form-input-small"
            />
            {errors[param] && <div className="error-message">⚠️ {errors[param]}</div>}
          </div>
        ))}
      </div>
    </>
  );
}

function InputRange({ namePrefix, values, onChange }) {
  return (
    <>
      {['from', 'to', 'step'].map((field) => (
        <div className="form-group" key={field}>
          <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
          <input
            type="number"
            name={`${namePrefix}_${field}`}
            value={values[`${namePrefix}_${field}`]}
            onChange={onChange}
            min="1"
            className="form-input form-input-small"
          />
        </div>
      ))}
    </>
  );
}
