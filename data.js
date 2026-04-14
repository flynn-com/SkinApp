// SkinTracker - Datenmodell + localStorage CRUD

const DB_KEY = 'skintracker';

// ==================== DATEN-DEFINITIONEN ====================

const SEVERITIES = [
  { id: 'clear', name: 'Rein', emoji: '✨', desc: 'Keine Unreinheiten', score: 10, color: '#4CAF50' },
  { id: 'light', name: 'Mitesser', emoji: '😊', desc: 'Leichte Unreinheiten', score: 7, color: '#FFC107' },
  { id: 'medium', name: 'Pickel', emoji: '😐', desc: 'Sichtbare Pickel', score: 4, color: '#FF9800' },
  { id: 'severe', name: 'Entzündet', emoji: '😣', desc: 'Stark entzündet', score: 1, color: '#F44336' },
];

const ZONES = [
  { id: 'forehead', name: 'Stirn' },
  { id: 'temples', name: 'Schläfen' },
  { id: 'lcheek', name: 'L. Wange' },
  { id: 'rcheek', name: 'R. Wange' },
  { id: 'nose', name: 'Nase' },
  { id: 'mouth', name: 'Mund' },
  { id: 'chin', name: 'Kinn' },
  { id: 'ljaw', name: 'Kiefer L.' },
  { id: 'rjaw', name: 'Kiefer R.' },
];

const FOODS = [
  { id: 'dairy', name: 'Milchprodukte', emoji: '🥛', bad: true },
  { id: 'sugar', name: 'Zucker', emoji: '🍬', bad: true },
  { id: 'fastfood', name: 'Fast Food', emoji: '🍔', bad: true },
  { id: 'alcohol', name: 'Alkohol', emoji: '🍷', bad: true },
  { id: 'chocolate', name: 'Schokolade', emoji: '🍫', bad: true },
  { id: 'spicy', name: 'Scharfes', emoji: '🌶️', bad: true },
  { id: 'bread', name: 'Weißbrot/Pasta', emoji: '🍞', bad: true },
  { id: 'caffeine', name: 'Koffein', emoji: '☕', bad: true },
  { id: 'veggies', name: 'Obst & Gemüse', emoji: '🥗', bad: false },
  { id: 'grains', name: 'Vollkorn', emoji: '🌾', bad: false },
  { id: 'fish', name: 'Fisch', emoji: '🐟', bad: false },
  { id: 'nuts', name: 'Nüsse', emoji: '🥜', bad: false },
  { id: 'tea', name: 'Grüner Tee', emoji: '🍵', bad: false },
  { id: 'probiotics', name: 'Probiotika', emoji: '🫧', bad: false },
];

const MOOD_LEVELS = [
  { rating: 1, emoji: '😣', label: 'Sehr schlecht' },
  { rating: 2, emoji: '😔', label: 'Schlecht' },
  { rating: 3, emoji: '😐', label: 'Okay' },
  { rating: 4, emoji: '😊', label: 'Gut' },
  { rating: 5, emoji: '🤩', label: 'Sehr gut' },
];

const MOOD_TAGS = [
  '😰 Gestresst', '😟 Ängstlich', '😌 Ruhig', '😊 Glücklich',
  '😴 Müde', '⚡ Energie', '😤 Gereizt', '🎯 Fokussiert',
];

const PIMPLE_TYPES = [
  { id: 'blackhead', name: 'Mitesser (Blackhead)', emoji: '⚫', desc: 'Offene verstopfte Pore. Sieht aus wie ein kleiner dunkler Punkt auf der Haut. Nicht entzündet, aber hartnäckig.', color: '#424F60' },
  { id: 'whitehead', name: 'Whitehead', emoji: '⚪', desc: 'Geschlossene verstopfte Pore. Kleine weiße Erhebung unter der Haut. Kann sich entzünden wenn man daran drückt.', color: '#B0BEC5' },
  { id: 'papule', name: 'Papel (roter Pickel)', emoji: '🔴', desc: 'Kleine rote Erhebung ohne Eiter. Fühlt sich fest an und ist empfindlich bei Berührung. Frühe Entzündungsphase.', color: '#E4665C' },
  { id: 'pustule', name: 'Pustel (Eiterpickel)', emoji: '🟡', desc: 'Pickel mit weißem oder gelbem Eiterkopf. Die klassische "reife" Form. Nicht ausdrücken - Narbenrisiko!', color: '#F9B189' },
  { id: 'cyst', name: 'Zyste (unter der Haut)', emoji: '🟣', desc: 'Tief unter der Haut, oft schmerzhaft. Fühlt sich wie ein harter Knubbel an. Kann Wochen bleiben und Narben hinterlassen.', color: '#CC7793' },
  { id: 'nodule', name: 'Knoten (entzündete Beule)', emoji: '🔵', desc: 'Große, harte, tief entzündete Beule. Sehr schmerzhaft, oft ohne sichtbaren Kopf. Bei häufigem Auftreten → Hautarzt!', color: '#546E7A' },
];

const ACHIEVEMENTS = [
  { id: 'streak_3', title: 'Guter Start', desc: '3 Tage Streak', icon: '🔥' },
  { id: 'streak_7', title: 'Eine Woche', desc: '7 Tage Streak', icon: '🔥' },
  { id: 'streak_14', title: 'Zwei Wochen', desc: '14 Tage Streak', icon: '🛡️' },
  { id: 'streak_30', title: 'Monats-Meister', desc: '30 Tage Streak', icon: '👑' },
  { id: 'logs_10', title: 'Fleißiger Logger', desc: '10 Einträge', icon: '📋' },
  { id: 'logs_50', title: 'Daten-Nerd', desc: '50 Einträge', icon: '📊' },
  { id: 'water_7', title: 'Hydrations-Held', desc: '7x ≥2L Wasser', icon: '💧' },
  { id: 'clear_7', title: 'Klare-Haut-Woche', desc: '7 Tage rein', icon: '✨' },
  { id: 'insight', title: 'Muster-Entdecker', desc: 'Erste Korrelation', icon: '💡' },
  { id: 'complete', title: 'Perfektionist', desc: 'Alles ausgefüllt', icon: '✅' },
];

// ==================== DATENBANK ====================

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* corrupt data */ }
  return { logs: {}, settings: defaultSettings() };
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function defaultSettings() {
  return {
    name: '',
    skinType: 'combination',
    moodEnabled: true,
    cycleEnabled: false,
    streak: 0,
    bestStreak: 0,
    lastLogDate: '',
    totalLogs: 0,
    achievements: [],
    savedProducts: [],
  };
}

// ==================== CRUD ====================

function getLog(dateKey) {
  return loadDB().logs[dateKey] || null;
}

function saveLog(dateKey, logData) {
  const db = loadDB();
  db.logs[dateKey] = logData;
  updateStreak(db, dateKey);
  checkAchievements(db);
  saveDB(db);
  return db;
}

function getAllLogs() {
  const db = loadDB();
  return Object.entries(db.logs)
    .map(([key, val]) => ({ dateKey: key, ...val }))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

function getSettings() {
  return loadDB().settings;
}

function updateSettings(patch) {
  const db = loadDB();
  Object.assign(db.settings, patch);
  saveDB(db);
  return db.settings;
}

// ==================== STREAK ====================

function updateStreak(db, dateKey) {
  const s = db.settings;
  if (s.lastLogDate === dateKey) return;

  if (s.lastLogDate) {
    const last = new Date(s.lastLogDate + 'T12:00:00');
    const today = new Date(dateKey + 'T12:00:00');
    const diff = Math.round((today - last) / 86400000);
    s.streak = diff === 1 ? s.streak + 1 : 1;
  } else {
    s.streak = 1;
  }

  if (s.streak > s.bestStreak) s.bestStreak = s.streak;
  s.lastLogDate = dateKey;
  s.totalLogs++;
}

// ==================== ACHIEVEMENTS ====================

function checkAchievements(db) {
  const s = db.settings;
  const logs = Object.entries(db.logs).sort((a, b) => a[0].localeCompare(b[0]));
  const earned = new Set(s.achievements);
  const newOnes = [];

  function grant(id) {
    if (!earned.has(id)) { earned.add(id); newOnes.push(id); }
  }

  // Streak
  if (s.bestStreak >= 3) grant('streak_3');
  if (s.bestStreak >= 7) grant('streak_7');
  if (s.bestStreak >= 14) grant('streak_14');
  if (s.bestStreak >= 30) grant('streak_30');

  // Total logs
  if (s.totalLogs >= 10) grant('logs_10');
  if (s.totalLogs >= 50) grant('logs_50');

  // Consecutive water >= 2L
  let waterStreak = 0;
  for (const [, log] of logs) {
    waterStreak = log.water >= 2 ? waterStreak + 1 : 0;
    if (waterStreak >= 7) { grant('water_7'); break; }
  }

  // Consecutive clear skin
  let clearStreak = 0;
  for (const [, log] of logs) {
    clearStreak = log.severity === 'clear' ? clearStreak + 1 : 0;
    if (clearStreak >= 7) { grant('clear_7'); break; }
  }

  // Complete log (all fields)
  for (const [, log] of logs) {
    if (log.foods && log.foods.length > 0 && log.water > 0 && log.products && log.products.length > 0 && log.mood > 0) {
      grant('complete');
      break;
    }
  }

  s.achievements = [...earned];
  return newOnes;
}

// ==================== WEATHER API (Open-Meteo, kostenlos) ====================

async function fetchWeather() {
  try {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000, maximumAge: 600000 });
    });
    const lat = pos.coords.latitude.toFixed(2);
    const lon = pos.coords.longitude.toFixed(2);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,uv_index&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    const c = data.current;

    // Reverse Geocoding für Stadtnamen
    let city = '';
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&accept-language=de`);
      const geoData = await geoRes.json();
      city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.municipality || '';
    } catch(e) {}

    return {
      temp: Math.round(c.temperature_2m),
      humidity: Math.round(c.relative_humidity_2m),
      uv: Math.round(c.uv_index * 10) / 10,
      code: c.weather_code,
      condition: weatherCondition(c.weather_code),
      city: city,
    };
  } catch (e) {
    return null;
  }
}

function weatherCondition(code) {
  if (code === 0) return 'Klar';
  if (code <= 3) return 'Bewölkt';
  if (code <= 49) return 'Nebel';
  if (code <= 59) return 'Nieselregen';
  if (code <= 69) return 'Regen';
  if (code <= 79) return 'Schnee';
  if (code <= 99) return 'Gewitter';
  return 'Unbekannt';
}

function weatherEmoji(code) {
  if (!code && code !== 0) return '🌡️';
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 49) return '🌫️';
  if (code <= 59) return '🌦️';
  if (code <= 69) return '🌧️';
  if (code <= 79) return '🌨️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}

// ==================== WOCHEN-REPORT ====================

function generateWeeklyReport(logs) {
  const now = new Date();
  const weekLogs = logs.filter(l => {
    const d = new Date(l.dateKey + 'T12:00:00');
    const diff = (now - d) / 86400000;
    return diff >= 0 && diff < 7;
  });
  const prevWeekLogs = logs.filter(l => {
    const d = new Date(l.dateKey + 'T12:00:00');
    const diff = (now - d) / 86400000;
    return diff >= 7 && diff < 14;
  });

  if (weekLogs.length < 3) return null;

  const avgScore = weekLogs.reduce((s, l) => s + severityInfo(l.severity).score, 0) / weekLogs.length;
  const prevAvg = prevWeekLogs.length >= 3
    ? prevWeekLogs.reduce((s, l) => s + severityInfo(l.severity).score, 0) / prevWeekLogs.length
    : null;

  const trend = prevAvg !== null ? avgScore - prevAvg : 0;
  const bestDay = weekLogs.reduce((a, b) => severityInfo(a.severity).score >= severityInfo(b.severity).score ? a : b);
  const worstDay = weekLogs.reduce((a, b) => severityInfo(a.severity).score <= severityInfo(b.severity).score ? a : b);

  // Häufigste Trigger auf schlechten Tagen
  const badDays = weekLogs.filter(l => severityInfo(l.severity).score <= 4);
  const goodDays = weekLogs.filter(l => severityInfo(l.severity).score >= 7);

  const triggerFoods = {};
  badDays.forEach(l => (l.foods || []).forEach(f => { triggerFoods[f] = (triggerFoods[f] || 0) + 1; }));
  const topTrigger = Object.entries(triggerFoods).sort((a, b) => b[1] - a[1])[0];

  const helperFoods = {};
  goodDays.forEach(l => (l.foods || []).forEach(f => { helperFoods[f] = (helperFoods[f] || 0) + 1; }));
  const topHelper = Object.entries(helperFoods).sort((a, b) => b[1] - a[1])[0];

  const avgWater = weekLogs.reduce((s, l) => s + (l.water || 0), 0) / weekLogs.length;
  const avgStress = weekLogs.reduce((s, l) => s + (l.stress || 3), 0) / weekLogs.length;
  const avgSleep = weekLogs.reduce((s, l) => s + (l.sleep || 3), 0) / weekLogs.length;

  // Wetter-Durchschnitt
  const weatherLogs = weekLogs.filter(l => l.weather);
  const avgHumidity = weatherLogs.length > 0
    ? Math.round(weatherLogs.reduce((s, l) => s + l.weather.humidity, 0) / weatherLogs.length)
    : null;

  // Empfehlungen generieren
  const tips = [];
  if (avgWater < 2) tips.push({ emoji: '💧', text: 'Trinke mehr Wasser! Dein Durchschnitt war nur ' + avgWater.toFixed(1) + 'L.' });
  if (avgStress > 3.5) tips.push({ emoji: '🧘', text: 'Dein Stress war hoch. Versuche Entspannungsübungen.' });
  if (avgSleep < 3) tips.push({ emoji: '😴', text: 'Deine Schlafqualität war niedrig. Guter Schlaf hilft der Haut!' });
  if (topTrigger) {
    const f = foodInfo(topTrigger[0]);
    if (f) tips.push({ emoji: '🚫', text: `Versuche nächste Woche ${f.name} zu reduzieren.` });
  }
  if (topHelper) {
    const f = foodInfo(topHelper[0]);
    if (f) tips.push({ emoji: '✅', text: `${f.name} scheint dir gut zu tun - weiter so!` });
  }
  if (trend >= 1) tips.push({ emoji: '📈', text: 'Super Trend! Deine Haut hat sich verbessert.' });
  if (trend <= -1) tips.push({ emoji: '📉', text: 'Deine Haut war diese Woche schlechter. Schau auf die Trigger.' });
  if (avgHumidity !== null && avgHumidity < 40) tips.push({ emoji: '🏜️', text: 'Niedrige Luftfeuchtigkeit! Extra Feuchtigkeitscreme nutzen.' });

  return {
    avgScore: Math.round(avgScore * 10) / 10,
    prevAvg: prevAvg !== null ? Math.round(prevAvg * 10) / 10 : null,
    trend: Math.round(trend * 10) / 10,
    daysLogged: weekLogs.length,
    bestDay, worstDay,
    avgWater: Math.round(avgWater * 10) / 10,
    avgStress: Math.round(avgStress * 10) / 10,
    avgSleep: Math.round(avgSleep * 10) / 10,
    avgHumidity,
    tips,
  };
}

// ==================== ROUTINE-BUILDER ====================

function buildRoutine(logs) {
  if (logs.length < 14) return null;

  const sorted = [...logs].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  const goodDays = sorted.filter(l => severityInfo(l.severity).score >= 7);
  const badDays = sorted.filter(l => severityInfo(l.severity).score <= 4);

  if (goodDays.length < 3) return null;

  // Analysiere was an guten Tagen anders war
  const avgGoodWater = goodDays.reduce((s, l) => s + (l.water || 0), 0) / goodDays.length;
  const avgBadWater = badDays.length > 0 ? badDays.reduce((s, l) => s + (l.water || 0), 0) / badDays.length : 0;
  const avgGoodStress = goodDays.reduce((s, l) => s + (l.stress || 3), 0) / goodDays.length;
  const avgBadStress = badDays.length > 0 ? badDays.reduce((s, l) => s + (l.stress || 3), 0) / badDays.length : 3;
  const avgGoodSleep = goodDays.reduce((s, l) => s + (l.sleep || 3), 0) / goodDays.length;
  const avgBadSleep = badDays.length > 0 ? badDays.reduce((s, l) => s + (l.sleep || 3), 0) / badDays.length : 3;

  const goodExerciseRate = goodDays.filter(l => l.exercise).length / goodDays.length;
  const badExerciseRate = badDays.length > 0 ? badDays.filter(l => l.exercise).length / badDays.length : 0;

  // Finde Foods die auf guten Tagen häufiger vorkommen
  const goodFoodCount = {};
  const badFoodCount = {};
  goodDays.forEach(l => (l.foods || []).forEach(f => { goodFoodCount[f] = (goodFoodCount[f] || 0) + 1; }));
  badDays.forEach(l => (l.foods || []).forEach(f => { badFoodCount[f] = (badFoodCount[f] || 0) + 1; }));

  const goodFoodRate = {};
  const badFoodRate = {};
  for (const f of FOODS) {
    goodFoodRate[f.id] = (goodFoodCount[f.id] || 0) / goodDays.length;
    badFoodRate[f.id] = badDays.length > 0 ? (badFoodCount[f.id] || 0) / badDays.length : 0;
  }

  // Routine zusammenstellen
  const routine = [];

  // Wasser
  const waterTarget = Math.max(2, Math.ceil(avgGoodWater * 2) / 2);
  routine.push({
    icon: '💧', title: 'Wasser',
    text: `Mindestens ${waterTarget.toFixed(1)}L pro Tag trinken`,
    impact: avgGoodWater > avgBadWater ? 'high' : 'medium',
    detail: `An guten Tagen: Ø ${avgGoodWater.toFixed(1)}L${badDays.length ? ` | An schlechten: Ø ${avgBadWater.toFixed(1)}L` : ''}`,
  });

  // Schlaf
  if (avgGoodSleep > avgBadSleep + 0.3) {
    routine.push({
      icon: '🌙', title: 'Schlaf',
      text: `Schlafqualität auf mindestens ${Math.ceil(avgGoodSleep)}/5 bringen`,
      impact: 'high',
      detail: `Gute Haut bei Ø ${avgGoodSleep.toFixed(1)}/5 Schlaf, schlechte bei Ø ${avgBadSleep.toFixed(1)}/5`,
    });
  }

  // Stress
  if (avgBadStress > avgGoodStress + 0.3) {
    routine.push({
      icon: '🧘', title: 'Stress reduzieren',
      text: `Stress unter ${Math.floor(avgGoodStress) + 1}/5 halten`,
      impact: 'high',
      detail: `Schlechte Haut bei Ø ${avgBadStress.toFixed(1)}/5 Stress`,
    });
  }

  // Sport
  if (goodExerciseRate > badExerciseRate + 0.15) {
    routine.push({
      icon: '🏃', title: 'Regelmäßig Sport',
      text: `Mindestens ${Math.round(goodExerciseRate * 7)}x pro Woche trainieren`,
      impact: 'medium',
      detail: `${Math.round(goodExerciseRate * 100)}% der guten Tage mit Sport`,
    });
  }

  // Foods to avoid
  const avoidFoods = FOODS.filter(f => {
    const diff = (badFoodRate[f.id] || 0) - (goodFoodRate[f.id] || 0);
    return diff > 0.15 && f.bad;
  }).sort((a, b) => (badFoodRate[b.id] - goodFoodRate[b.id]) - (badFoodRate[a.id] - goodFoodRate[a.id]));

  if (avoidFoods.length > 0) {
    routine.push({
      icon: '🚫', title: 'Vermeiden',
      text: avoidFoods.slice(0, 3).map(f => f.name).join(', ') + ' reduzieren',
      impact: 'high',
      detail: 'Diese Lebensmittel kommen deutlich häufiger an schlechten Tagen vor',
    });
  }

  // Foods to eat
  const eatFoods = FOODS.filter(f => {
    const diff = (goodFoodRate[f.id] || 0) - (badFoodRate[f.id] || 0);
    return diff > 0.15 && !f.bad;
  }).sort((a, b) => (goodFoodRate[b.id] - badFoodRate[b.id]) - (goodFoodRate[a.id] - badFoodRate[a.id]));

  if (eatFoods.length > 0) {
    routine.push({
      icon: '🥗', title: 'Mehr essen',
      text: eatFoods.slice(0, 3).map(f => f.name).join(', '),
      impact: 'medium',
      detail: 'Diese Lebensmittel kommen häufiger an guten Tagen vor',
    });
  }

  // Geschätzter Score-Boost
  const potentialBoost = routine.filter(r => r.impact === 'high').length * 1.0
    + routine.filter(r => r.impact === 'medium').length * 0.5;

  return { routine, potentialBoost: Math.min(3, Math.round(potentialBoost * 10) / 10) };
}

// ==================== HELPERS ====================

function todayKey() {
  const now = new Date();
  const hour = now.getHours();
  const d = hour < 4 ? new Date(now.getTime() - 86400000) : now;
  return d.toISOString().slice(0, 10);
}

function severityInfo(id) {
  return SEVERITIES.find(s => s.id === id) || SEVERITIES[0];
}

function foodInfo(id) {
  return FOODS.find(f => f.id === id);
}

function formatDate(dateKey) {
  const d = new Date(dateKey + 'T12:00:00');
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
