/**
 * Fuzzy subsequence score: -1 if `q` is not a subsequence of `text`, otherwise
 * higher is better. Consecutive matches score a bonus, and matches nearer the
 * start of the text are preferred.
 */
export function subsequenceScore(q, text) {
  if (!q) return 0;
  let from = 0;
  let score = 0;
  let prev = -2;
  for (const c of q) {
    const found = text.indexOf(c, from);
    if (found === -1) return -1;
    score += found === prev + 1 ? 2 : 1;
    prev = found;
    from = found + 1;
  }
  return score - text.indexOf(q[0]) * 0.05;
}

/**
 * Filter + rank apps against a query by matching name or exec. Empty query
 * returns the list unchanged.
 * @param {string} query
 * @param {Array<{ name: string, exec: string }>} apps
 */
export function searchApps(query, apps) {
  const q = query.trim().toLowerCase();
  if (!q) return apps;
  return apps
    .map((a) => ({ a, s: Math.max(subsequenceScore(q, a.name.toLowerCase()), subsequenceScore(q, a.exec.toLowerCase())) }))
    .filter((x) => x.s >= 0)
    .sort((x, y) => y.s - x.s)
    .map((x) => x.a);
}
