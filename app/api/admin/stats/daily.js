const DAY_MS = 24 * 60 * 60 * 1000;

/** Start of the UTC day `days - 1` days before `now`, i.e. the first bucket of the window. */
export function dailyWindowStart(days, now = new Date()) {
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return new Date(todayUtc - (days - 1) * DAY_MS);
}

/**
 * Turn sparse `{ day, count }` rows (one per UTC day that had data) into a dense
 * series of `days` entries ending today, with 0 for days without rows.
 */
export function fillDailySeries(rows, days, now = new Date()) {
  const counts = new Map();
  for (const row of rows) {
    const key = new Date(row.day).toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) || 0) + Number(row.count));
  }

  const start = dailyWindowStart(days, now).getTime();
  const series = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(start + i * DAY_MS).toISOString().slice(0, 10);
    series.push({ date, count: counts.get(date) || 0 });
  }
  return series;
}
