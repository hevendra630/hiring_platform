/**
 * Parses simple duration strings used in JWT expiry config (e.g. "15m", "7d", "1h")
 * into milliseconds. Falls back to treating a bare number as milliseconds.
 */
export default function ms(duration: string): number {
  const match = /^(\d+)\s*(ms|s|m|h|d)?$/.exec(duration.trim());
  if (!match) throw new Error(`Invalid duration string: ${duration}`);

  const value = Number(match[1]);
  const unit = match[2] ?? 'ms';

  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
}
