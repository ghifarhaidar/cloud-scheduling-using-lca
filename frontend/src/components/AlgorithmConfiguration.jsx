export default function AlgorithmConfiguration({
  formData,
  handleChange,
  errors,
  paramTypes,
  setParamTypes
}) {
  return (
    <>
      {/* L Parameter */}
      <div className="form-section">
        <h3 className="form-section-title">📊 League Size (L)</h3>
        <p className="form-description">Configure the number of teams in the league championship algorithm</p>

        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" name="LType" value="single" checked={paramTypes['LType'] === "single"} onChange={() =>
              setParamTypes((prev) => ({ ...prev, ['LType']: "single" }))
            } />
            Single value
          </label>
          <label className="radio-option">
            <input type="radio" name="LType" value="range" checked={paramTypes['LType'] === "range"} onChange={() =>
              setParamTypes((prev) => ({ ...prev, ['LType']: "range" }))
            } />
            Range of values
          </label>
        </div>

        {paramTypes['LType'] === "single" ? (
          <div className="form-group">
            <label className="form-label">League Size</label>
            <input type="number" name="L" value={formData.L} onChange={handleChange} min="1" className="form-input form-input-small" />
            {errors["L"] && <div className="error-message">⚠️ {errors["L"]}</div>}
          </div>
        ) : (
          <div className="form-input-group">
            <InputRange namePrefix="L" values={formData} onChange={handleChange} errors={errors} />
          </div>
        )}
      </div>

      {/* S Parameter */}
      <div className="form-section">
        <h3 className="form-section-title">🏆 Number of Seasons (S)</h3>
        <p className="form-description">Define the number of seasons (iterations) for the algorithm</p>

        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" name="SType" value="single" checked={paramTypes['SType'] === "single"} onChange={() =>
              setParamTypes((prev) => ({ ...prev, ['SType']: "single" }))
            } />
            Single value
          </label>
          <label className="radio-option">
            <input type="radio" name="SType" value="range" checked={paramTypes['SType'] === "range"} onChange={() =>
              setParamTypes((prev) => ({ ...prev, ['SType']: "range" }))
            } />
            Range of values
          </label>
        </div>

        {paramTypes['SType'] === "single" ? (
          <div className="form-group">
            <label className="form-label">Number of Seasons</label>
            <input type="number" name="S" value={formData.S} onChange={handleChange} min="1" className="form-input form-input-small" />
            {errors["S"] && <div className="error-message">⚠️ {errors["S"]}</div>}
          </div>
        ) : (
          <div className="form-input-group">
            <InputRange namePrefix="S" values={formData} onChange={handleChange} errors={errors} />
          </div>
        )}
      </div>

      {/* Algorithm Parameters */}
      <div className="form-section">
        <h3 className="form-section-title">⚙️ Algorithm Parameters</h3>
        <p className="form-description">Fine-tune the LCA algorithm behavior</p>

        {['p_c', 'PSI1', 'PSI2', 'q0'].map((param) => (
          <div className="form-section" key={param}>
            <h3 className="form-section-title">{param.toUpperCase()}</h3>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name={`${param}Type`}
                  value="single"
                  checked={paramTypes[`${param}Type`] === "single"}
                  onChange={() =>
                    setParamTypes((prev) => ({ ...prev, [`${param}Type`]: "single" }))
                  }
                />
                Single value
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name={`${param}Type`}
                  value="range"
                  checked={paramTypes[`${param}Type`] === "range"}
                  onChange={() =>
                    setParamTypes((prev) => ({ ...prev, [`${param}Type`]: "range" }))
                  }
                />
                Range of values
              </label>
            </div>

            {paramTypes[`${param}Type`] === "single" ? (
              <div className="form-group">
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
            ) : (
              <div className="form-input-group">
                <InputRange
                  namePrefix={param}
                  values={formData}
                  onChange={handleChange}
                  step={['q0'].includes(param) ? 1 : 0.01}
                  errors={errors}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function InputRange({ namePrefix, values, onChange, step = 1, errors = {} }) {
  return (
    <>
      {['from', 'to', 'step'].map((field) => {
        const name = `${namePrefix}_${field}`;
        return (
          <div className="form-group" key={field}>
            <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              type="number"
              name={name}
              value={values[name]}
              onChange={onChange}
              min="0"
              step={step}
              className="form-input form-input-small"
            />
            {errors[name] && <div className="error-message">⚠️ {errors[name]}</div>}
          </div>
        );
      })}
    </>
  );
}