// SkinTracker - Pearson Correlation Engine

function computeCorrelations(logs) {
  if (logs.length < 14) return [];

  const sorted = [...logs].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  const scores = sorted.map(l => severityInfo(l.severity).score);
  const results = [];

  // Food correlations
  for (const food of FOODS) {
    const factor = sorted.map(l => (l.foods || []).includes(food.id) ? 1 : 0);
    const present = factor.filter(v => v > 0).length;
    const absent = factor.filter(v => v === 0).length;
    if (present < 5 || absent < 5) continue;

    const best = bestLagCorrelation(factor, scores);
    if (best && Math.abs(best.r) >= 0.25) {
      results.push({
        name: food.name,
        emoji: food.emoji,
        type: 'food',
        r: best.r,
        lag: best.lag,
        n: sorted.length,
        direction: best.r > 0 ? 'good' : 'bad',
      });
    }
  }

  // Water correlation
  const waterVals = sorted.map(l => l.water || 0);
  const waterBest = bestLagCorrelation(waterVals, scores);
  if (waterBest && Math.abs(waterBest.r) >= 0.2) {
    results.push({
      name: 'Viel Wasser', emoji: '💧', type: 'lifestyle',
      r: waterBest.r, lag: waterBest.lag, n: sorted.length,
      direction: waterBest.r > 0 ? 'good' : 'bad',
    });
  }

  // Stress (inverted - high stress = bad)
  const stressVals = sorted.map(l => l.stress || 3);
  const stressBest = bestLagCorrelation(stressVals, scores);
  if (stressBest && Math.abs(stressBest.r) >= 0.2) {
    results.push({
      name: 'Stress', emoji: '🧠', type: 'lifestyle',
      r: stressBest.r, lag: stressBest.lag, n: sorted.length,
      direction: stressBest.r > 0 ? 'good' : 'bad',
    });
  }

  // Sleep quality
  const sleepVals = sorted.map(l => l.sleep || 3);
  const sleepBest = bestLagCorrelation(sleepVals, scores);
  if (sleepBest && Math.abs(sleepBest.r) >= 0.2) {
    results.push({
      name: 'Schlafqualität', emoji: '🌙', type: 'lifestyle',
      r: sleepBest.r, lag: sleepBest.lag, n: sorted.length,
      direction: sleepBest.r > 0 ? 'good' : 'bad',
    });
  }

  // Exercise
  const exVals = sorted.map(l => l.exercise ? 1 : 0);
  if (exVals.filter(v => v > 0).length >= 5) {
    const exBest = bestLagCorrelation(exVals, scores);
    if (exBest && Math.abs(exBest.r) >= 0.2) {
      results.push({
        name: 'Sport', emoji: '🏃', type: 'lifestyle',
        r: exBest.r, lag: exBest.lag, n: sorted.length,
        direction: exBest.r > 0 ? 'good' : 'bad',
      });
    }
  }

  return results.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
}

function bestLagCorrelation(factor, scores) {
  let bestR = 0, bestLag = 0;
  for (let lag = 0; lag <= 3; lag++) {
    const x = factor.slice(0, factor.length - lag);
    const y = scores.slice(lag);
    const n = Math.min(x.length, y.length);
    if (n < 10) continue;
    const r = pearson(x.slice(0, n), y.slice(0, n));
    if (Math.abs(r) > Math.abs(bestR)) { bestR = r; bestLag = lag; }
  }
  if (Math.abs(bestR) < 0.15) return null;
  return { r: bestR, lag: bestLag };
}

function pearson(x, y) {
  const n = x.length;
  if (n < 3) return 0;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx, dy = y[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 0 : num / denom;
}

function getInsightText(result) {
  const dir = result.direction === 'bad' ? 'schlechter' : 'besser';
  const lagText = result.lag === 0 ? 'am selben Tag' : result.lag === 1 ? 'am nächsten Tag' : `${result.lag} Tage später`;

  if (result.type === 'food') {
    return `Wenn du ${result.name} konsumierst, ist deine Haut ${lagText} tendenziell ${dir}.`;
  }
  return `Bei ${result.name} ist deine Haut ${lagText} tendenziell ${dir}.`;
}
