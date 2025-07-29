export default function CustomConfigSection({ customConfig, setCustomConfig, errors }) {
    const handleCustomChange = (e) => {
        const { name, value } = e.target;

        // Split the field path, e.g. "cloudlets.length.range.0"
        const path = name.split('.');
        const updatedConfig = structuredClone(customConfig); // Deep copy to avoid mutating state
        let current = updatedConfig;

        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }

        const lastKey = path[path.length - 1];
        const numericValue = Number(value);
        current[lastKey] = isNaN(numericValue) ? value : numericValue;

        setCustomConfig(updatedConfig);
    };


    return (
        <>
            <p className="grid-text card-text">
                Since you've selected a custom configuration, please define the Cloudlet and VM parameters.
            </p>
            {/* Cloudlet Configuration */}
            <div className="form-section">
                <h3 className="form-section-title grid-title">☁️ Cloudlets</h3>
                <p className="form-description">Configure cloudlet parameters</p>

                <div className="form-group">
                    <label className="form-label">Number of Cloudlets</label>
                    <input
                        type="number"
                        name="cloudlets.count"
                        value={customConfig.cloudlets.count}
                        onChange={handleCustomChange}
                        min="1"
                        className="form-input form-input-small"
                    />
                    {errors.cloudlets_count && <div className="error-message">⚠️ {errors.cloudlets_count}</div>}
                </div>

                <div className="form-input-group">
                    <div className="form-group">
                        <label className="form-label">Length From</label>
                        <input
                            type="number"
                            name="cloudlets.length.range.0"
                            value={customConfig.cloudlets.length.range[0]}
                            onChange={handleCustomChange}
                            className="form-input form-input-small"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Length To</label>
                        <input
                            type="number"
                            name="cloudlets.length.range.1"
                            value={customConfig.cloudlets.length.range[1]}
                            onChange={handleCustomChange}
                            className="form-input form-input-small"
                        />
                    </div>
                    {errors.cloudlets_length && <div className="error-message">⚠️ {errors.cloudlets_length}</div>}
                </div>
            </div>

            {/* VM Configuration */}
            <div className="form-section">
                <h3 className="form-section-title grid-title">🖥️ VMs</h3>
                <p className="form-description">Configure VM parameters</p>

                <div className="form-group">
                    <label className="form-label">Number of VMs</label>
                    <input
                        type="number"
                        name="vms.count"
                        value={customConfig.vms.count}
                        onChange={handleCustomChange}
                        min="1"
                        className="form-input form-input-small"
                    />
                    {errors.vm_count && <div className="error-message">⚠️ {errors.vm_count}</div>}
                </div>

                <div className="form-input-group">
                    <div className="form-group">
                        <label className="form-label">PEs From</label>
                        <input
                            type="number"
                            name="vms.pes.range.0"
                            value={customConfig.vms.pes.range[0]}
                            onChange={handleCustomChange}
                            className="form-input form-input-small"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">PEs To</label>
                        <input
                            type="number"
                            name="vms.pes.range.1"
                            value={customConfig.vms.pes.range[1]}
                            onChange={handleCustomChange}
                            className="form-input form-input-small"
                        />
                    </div>
                    {errors.vm_pes && <div className="error-message">⚠️ {errors.vm_pes}</div>}
                </div>
            </div>
        </>
    );
}
