/**
 * Form controls for editing a GridConfig: layout mode (uniform vs custom
 * per-row), row/column counts, spacing, border distance, and display unit.
 * All numeric inputs are shown in `config.displayUnit` but converted to/from
 * mm before being written back, since mm is the stored source of truth.
 */

import type { GridConfig } from '../../lib/grid/gridConfig';
import { mmToUnit, unitToMm, type LengthUnit } from '../../lib/units/units';
import { UnitsToggle } from './UnitsToggle';

interface GridConfiguratorProps {
  config: GridConfig;
  onChange: (config: GridConfig) => void;
}

export function GridConfigurator({ config, onChange }: GridConfiguratorProps) {
  const unit = config.displayUnit;

  function setUnit(displayUnit: LengthUnit) {
    onChange({ ...config, displayUnit });
  }

  function setMode(mode: 'uniform' | 'custom') {
    if (mode === config.layout.mode) return;
    if (mode === 'uniform') {
      onChange({ ...config, layout: { mode: 'uniform', rows: 3, cols: 3 } });
    } else {
      onChange({ ...config, layout: { mode: 'custom', rowCounts: [3, 3, 3] } });
    }
  }

  function setSpacing(displayValue: number) {
    onChange({ ...config, spacingMm: unitToMm(displayValue, unit) });
  }

  function setBorder(displayValue: number) {
    onChange({ ...config, borderMm: unitToMm(displayValue, unit) });
  }

  function setUniformRows(rows: number) {
    if (config.layout.mode !== 'uniform') return;
    onChange({ ...config, layout: { ...config.layout, rows } });
  }

  function setUniformCols(cols: number) {
    if (config.layout.mode !== 'uniform') return;
    onChange({ ...config, layout: { ...config.layout, cols } });
  }

  function setRowCount(index: number, count: number) {
    if (config.layout.mode !== 'custom') return;
    const rowCounts = [...config.layout.rowCounts];
    rowCounts[index] = count;
    onChange({ ...config, layout: { mode: 'custom', rowCounts } });
  }

  function addRow() {
    if (config.layout.mode !== 'custom') return;
    onChange({ ...config, layout: { mode: 'custom', rowCounts: [...config.layout.rowCounts, 3] } });
  }

  function removeRow(index: number) {
    if (config.layout.mode !== 'custom') return;
    const rowCounts = config.layout.rowCounts.filter((_, i) => i !== index);
    onChange({ ...config, layout: { mode: 'custom', rowCounts } });
  }

  return (
    <section className="grid-configurator">
      <div className="grid-configurator__row">
        <label>
          Layout mode
          <select value={config.layout.mode} onChange={(e) => setMode(e.target.value as 'uniform' | 'custom')}>
            <option value="uniform">Uniform</option>
            <option value="custom">Custom per-row</option>
          </select>
        </label>
        <UnitsToggle unit={unit} onChange={setUnit} />
      </div>

      {config.layout.mode === 'uniform' ? (
        <div className="grid-configurator__row">
          <label>
            Rows
            <input
              type="number"
              min={1}
              value={config.layout.rows}
              onChange={(e) => setUniformRows(Number(e.target.value))}
            />
          </label>
          <label>
            Columns
            <input
              type="number"
              min={1}
              value={config.layout.cols}
              onChange={(e) => setUniformCols(Number(e.target.value))}
            />
          </label>
        </div>
      ) : (
        <div className="grid-configurator__rows">
          {config.layout.rowCounts.map((count, index) => (
            <div className="grid-configurator__row" key={index}>
              <label>
                {`Row ${index + 1} cards`}
                <input
                  type="number"
                  min={1}
                  value={count}
                  onChange={(e) => setRowCount(index, Number(e.target.value))}
                />
              </label>
              <button type="button" onClick={() => removeRow(index)} aria-label={`Remove row ${index + 1}`}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addRow}>
            Add row
          </button>
        </div>
      )}

      <div className="grid-configurator__row">
        <label>
          {`Spacing (${unit})`}
          <input
            type="number"
            min={0}
            step="0.1"
            value={mmToUnit(config.spacingMm, unit).toFixed(2)}
            onChange={(e) => setSpacing(Number(e.target.value))}
          />
        </label>
        <label>
          {`Border distance (${unit})`}
          <input
            type="number"
            min={0}
            step="0.1"
            value={mmToUnit(config.borderMm, unit).toFixed(2)}
            onChange={(e) => setBorder(Number(e.target.value))}
          />
        </label>
      </div>
    </section>
  );
}
