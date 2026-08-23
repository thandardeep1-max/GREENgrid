/**
 * Centralized formatting utilities for consistent N/A display across all pages.
 *
 * Rules:
 * - null, undefined, empty string, whitespace-only, NaN, invalid numbers → "N/A"
 * - Valid 0 values → "0" (preserved, NOT "N/A")
 * - Valid false values → "OFF"/falseLabel (preserved, NOT "N/A")
 * - Units are always shown with N/A (e.g., "N/A °C", "N/A %")
 */

// Core validation - returns true only for valid data
export function isValidValue<T>(value: T): value is NonNullable<T> {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) return false;
  return true;
}

// Format with N/A fallback - preserves 0 and false
export function formatValue<T>(value: T | null | undefined, formatter?: (v: T) => string): string {
  if (!isValidValue(value)) return 'N/A';
  if (formatter) return formatter(value);
  return String(value);
}

// Format with unit - always shows unit even with N/A
export function formatWithUnit<T>(value: T | null | undefined, unit: string, formatter?: (v: T) => string): string {
  if (!isValidValue(value)) return `N/A ${unit}`.trim();
  if (formatter) return `${formatter(value)} ${unit}`.trim();
  return `${value} ${unit}`.trim();
}

// For boolean status - preserves false as "OFF"
export function formatStatus(value: boolean | null | undefined, trueLabel = 'ON', falseLabel = 'OFF'): string {
  if (value === null || value === undefined) return 'N/A';
  return value ? trueLabel : falseLabel;
}

// For percentage - preserves 0%
export function formatPercent(value: number | null | undefined): string {
  if (!isValidValue(value)) return 'N/A%';
  return `${value}%`;
}

// For currency (INR) - preserves 0
export function formatCurrencySafe(value: number | null | undefined): string {
  if (!isValidValue(value)) return 'N/A';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value);
}

// For date - returns N/A for invalid
export function formatDateSafe(value: Date | string | number | null | undefined): string {
  if (!isValidValue(value)) return 'N/A';
  const d = new Date(value);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

// For datetime - returns N/A for invalid
export function formatDateTimeSafe(value: Date | string | number | null | undefined): string {
  if (!isValidValue(value)) return 'N/A';
  const d = new Date(value);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// For large numbers with K/M suffix
export function formatNumberCompact(value: number | null | undefined): string {
  if (!isValidValue(value)) return 'N/A';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

// For soil pH - preserves 0
export function formatPH(value: number | null | undefined): string {
  if (!isValidValue(value)) return 'N/A';
  return value.toFixed(1);
}

// For temperature - preserves 0°C
export function formatTemperature(value: number | null | undefined, unit: 'C' | 'F' = 'C'): string {
  if (!isValidValue(value)) return `N/A °${unit}`;
  return `${value}°${unit}`;
}

// For humidity - preserves 0%
export function formatHumidity(value: number | null | undefined): string {
  if (!isValidValue(value)) return 'N/A%';
  return `${value}%`;
}

// For pressure - preserves 0
export function formatPressure(value: number | null | undefined): string {
  if (!isValidValue(value)) return 'N/A hPa';
  return `${value} hPa`;
}

// For wind speed - preserves 0
export function formatWindSpeed(value: number | null | undefined, unit = 'km/h'): string {
  if (!isValidValue(value)) return `N/A ${unit}`;
  return `${value} ${unit}`;
}

// For rainfall - preserves 0mm
export function formatRainfall(value: number | null | undefined): string {
  if (!isValidValue(value)) return 'N/A mm';
  return `${value} mm`;
}

// For confidence scores - preserves 0%
export function formatConfidence(value: number | null | undefined): string {
  if (!isValidValue(value)) return 'N/A%';
  return `${Math.round(value)}%`;
}

// For area (acres/hectares) - preserves 0
export function formatArea(value: number | null | undefined, unit = 'acres'): string {
  if (!isValidValue(value)) return `N/A ${unit}`;
  return `${value} ${unit}`;
}

// For profit/loss - can be negative, preserves 0
export function formatProfit(value: number | null | undefined): string {
  if (!isValidValue(value)) return 'N/A';
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${formatCurrencySafe(value)}`;
}

// For duration (days) - preserves 0
export function formatDuration(value: number | null | undefined, unit = 'days'): string {
  if (!isValidValue(value)) return `N/A ${unit}`;
  return `${value} ${unit}`;
}

// For crop stage progress - preserves 0%
export function formatProgress(value: number | null | undefined): string {
  if (!isValidValue(value)) return 'N/A%';
  return `${Math.min(100, Math.max(0, Math.round(value)))}%`;
}