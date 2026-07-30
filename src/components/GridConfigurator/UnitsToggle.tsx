/** mm/inch toggle buttons controlling how GridConfigurator displays and accepts length values. */

import type { LengthUnit } from '../../lib/units/units';

interface UnitsToggleProps {
  unit: LengthUnit;
  onChange: (unit: LengthUnit) => void;
}

export function UnitsToggle({ unit, onChange }: UnitsToggleProps) {
  return (
    <div className="units-toggle" role="group" aria-label="Display units">
      <button type="button" aria-pressed={unit === 'mm'} onClick={() => onChange('mm')}>
        mm
      </button>
      <button type="button" aria-pressed={unit === 'in'} onClick={() => onChange('in')}>
        in
      </button>
    </div>
  );
}
