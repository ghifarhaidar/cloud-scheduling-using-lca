export default function CustomConfigSection({ customConfig, setCustomConfig ,errors}) {
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
        <div className="form-section">
            <h3 className="form-section-title">⚙️ Custom Configuration</h3>
            <p style={{ color: 'var(--secondary-gray)', marginBottom: 'var(--spacing-lg)' }}>
                Since you've selected a custom configuration, please define the Cloudlet and VM parameters.
            </p>

            {/* Cloudlet Config */}
            <div className="form-subsection">
                <h4>☁️ Cloudlet Configuration</h4>
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
                        <label className="form-label">Cloudlet Length From</label>
                        <input
                            type="number"
                            name="cloudlets.length.range.0"
                            value={customConfig.cloudlets.length.range[0]}
                            onChange={handleCustomChange}
                            className="form-input form-input-small"
                        />
                        {errors.cloudlets_length && <div className="error-message">⚠️ {errors.cloudlets_length}</div>}

                    </div>
                    <div className="form-group">
                        <label className="form-label">Cloudlet Length To</label>
                        <input
                            type="number"
                            name="cloudlets.length.range.1"
                            value={customConfig.cloudlets.length.range[1]}
                            onChange={handleCustomChange}
                            className="form-input form-input-small"
                        />
                    </div>
                </div>
            </div>

            {/* VM Config */}
            <div className="form-subsection">
                <h4>🖥️ VM Configuration</h4>
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
                        <label className="form-label">VMs PEs From</label>
                        <input
                            type="number"
                            name="vms.pes.range.0"
                            value={customConfig.vms.pes.range[0]}
                            onChange={handleCustomChange}
                            className="form-input form-input-small"
                        />
                        {errors.vm_pes && <div className="error-message">⚠️ {errors.vm_pes}</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">VMs PEs To</label>
                        <input
                            type="number"
                            name="vms.pes.range.1"
                            value={customConfig.vms.pes.range[1]}
                            onChange={handleCustomChange}
                            className="form-input form-input-small"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
