/**
 * Real-world length unit conversions.
 *
 * Millimeters are the app's internal source of truth for all layout
 * dimensions (see CLAUDE.md); these helpers only convert for display/input
 * purposes and should never be used to change what's actually persisted.
 */

export type LengthUnit = 'mm' | 'in';

const MM_PER_INCH = 25.4;

/** Converts a stored mm value to the given display unit. */
export function mmToUnit(mm: number, unit: LengthUnit): number {
  return unit === 'mm' ? mm : mm / MM_PER_INCH;
}

/** Converts a user-entered value in the given unit back to mm for storage. */
export function unitToMm(value: number, unit: LengthUnit): number {
  return unit === 'mm' ? value : value * MM_PER_INCH;
}

/** Formats a stored mm value as a fixed-precision string in the given unit. */
export function formatLength(mm: number, unit: LengthUnit, fractionDigits = 2): string {
  return mmToUnit(mm, unit).toFixed(fractionDigits);
}
