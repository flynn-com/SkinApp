// SkinTracker - Main App Logic (Redesign mit 2D Chars + Glass UI)

let currentTab = 0;
let logStep = 0;
const LOG_STEPS = 9; // Haut, Anzahl, Typ, Schmerz, Zonen, Essen, Lifestyle, Mood, Summary

let logState = {
  severity: 'clear',
  pimpleCount: 0, pimpleTypes: new Set(), painLevel: 0,
  zones: new Set(), foods: new Set(),
  water: 1.5, stress: 3, sleep: 3, exercise: false,
  mood: 3, moodTags: new Set(), products: [], routine: false,
};

// ==================== GHOST BUDDY - 2D Character System ====================

// Ghost-Körper Generator
function ghost(w, h, color, eyes, mouth, extras='', anim='float', shine=true) {
  const id = 'g'+Math.random().toString(36).slice(2,8);
  const bx = w/2, by = h*0.42, rr = w*0.32;
  return `<svg class="char-svg ${anim}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color[0]}"/>
        <stop offset="100%" stop-color="${color[1]}"/>
      </linearGradient>
      ${shine ? `<linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.25)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>` : ''}
    </defs>
    <path d="M${bx-rr} ${by} Q${bx-rr} ${by-rr*1.4} ${bx} ${by-rr*1.4} Q${bx+rr} ${by-rr*1.4} ${bx+rr} ${by} L${bx+rr} ${h*0.78} Q${bx+rr*0.7} ${h*0.68} ${bx+rr*0.45} ${h*0.78} Q${bx+rr*0.15} ${h*0.88} ${bx} ${h*0.78} Q${bx-rr*0.15} ${h*0.68} ${bx-rr*0.45} ${h*0.78} Q${bx-rr*0.7} ${h*0.88} ${bx-rr} ${h*0.78}Z"
      fill="url(#${id})"/>
    ${shine ? `<path d="M${bx-rr} ${by} Q${bx-rr} ${by-rr*1.4} ${bx} ${by-rr*1.4} Q${bx+rr} ${by-rr*1.4} ${bx+rr} ${by} L${bx+rr} ${h*0.78} Q${bx+rr*0.7} ${h*0.68} ${bx+rr*0.45} ${h*0.78} Q${bx+rr*0.15} ${h*0.88} ${bx} ${h*0.78} Q${bx-rr*0.15} ${h*0.68} ${bx-rr*0.45} ${h*0.78} Q${bx-rr*0.7} ${h*0.88} ${bx-rr} ${h*0.78}Z"
      fill="url(#${id}s)"/>` : ''}
    ${eyes}
    ${mouth}
    <ellipse cx="${bx-rr*0.55}" cy="${by+rr*0.25}" rx="${rr*0.18}" ry="${rr*0.1}" fill="#E4665C" opacity="0.3"/>
    <ellipse cx="${bx+rr*0.55}" cy="${by+rr*0.25}" rx="${rr*0.18}" ry="${rr*0.1}" fill="#E4665C" opacity="0.3"/>
    ${extras}
  </svg>`;
}

// Augen-Presets
const E = {
  big: (bx,by,r) => `
    <ellipse cx="${bx-r*0.3}" cy="${by}" rx="${r*0.14}" ry="${r*0.18}" fill="#003041"/>
    <ellipse cx="${bx+r*0.3}" cy="${by}" rx="${r*0.14}" ry="${r*0.18}" fill="#003041"/>
    <circle cx="${bx-r*0.28}" cy="${by-r*0.06}" r="${r*0.06}" fill="white" opacity="0.9"/>
    <circle cx="${bx+r*0.32}" cy="${by-r*0.06}" r="${r*0.06}" fill="white" opacity="0.9"/>`,
  sad: (bx,by,r) => `
    <ellipse cx="${bx-r*0.3}" cy="${by}" rx="${r*0.14}" ry="${r*0.18}" fill="#003041"/>
    <ellipse cx="${bx+r*0.3}" cy="${by}" rx="${r*0.14}" ry="${r*0.18}" fill="#003041"/>
    <circle cx="${bx-r*0.28}" cy="${by-r*0.04}" r="${r*0.05}" fill="white" opacity="0.6"/>
    <circle cx="${bx+r*0.32}" cy="${by-r*0.04}" r="${r*0.05}" fill="white" opacity="0.6"/>
    <path d="M${bx-r*0.5} ${by-r*0.3} L${bx-r*0.15} ${by-r*0.2}" stroke="#003041" stroke-width="2" stroke-linecap="round"/>
    <path d="M${bx+r*0.5} ${by-r*0.3} L${bx+r*0.15} ${by-r*0.2}" stroke="#003041" stroke-width="2" stroke-linecap="round"/>`,
  happy: (bx,by,r) => `
    <ellipse cx="${bx-r*0.3}" cy="${by}" rx="${r*0.12}" ry="${r*0.1}" fill="#003041"/>
    <ellipse cx="${bx+r*0.3}" cy="${by}" rx="${r*0.12}" ry="${r*0.1}" fill="#003041"/>`,
};

const CHARS = {
  happy:     ghost(100,110, ['#F9B189','#E4665C'], E.big(50,38,32), `<path d="M38 52 Q50 62 62 52" fill="none" stroke="#003041" stroke-width="2.5" stroke-linecap="round"/>`, `<text x="66" y="16" font-size="15">✨</text><text x="18" y="20" font-size="11">💖</text>`),
  thinking:  ghost(100,110, ['#CC7793','#E4665C'], E.big(50,38,32), `<ellipse cx="50" cy="54" rx="5" ry="3.5" fill="#003041"/>`, `<text x="70" y="18" font-size="16">🤔</text><circle cx="74" cy="28" r="2.5" fill="rgba(255,255,255,0.15)"/><circle cx="78" cy="22" r="1.5" fill="rgba(255,255,255,0.1)"/>`),
  celebrate: ghost(140,150, ['#5ED497','#F9B189'], E.happy(70,54,44), `<path d="M58 70 Q70 84 82 70" fill="#003041"/>`, `<text x="16" y="22" font-size="32">🎉</text><text x="100" y="26" font-size="28">✨</text><text x="6" y="100" font-size="24">⭐</text><text x="112" y="96" font-size="26">🌟</text><text x="56" y="16" font-size="22">🥳</text>`, 'bounce'),
  detail:    ghost(100,110, ['#E4665C','#CC7793'], E.big(50,38,32), `<ellipse cx="50" cy="54" rx="5" ry="3.5" fill="#003041"/>`, `<text x="68" y="16" font-size="15">🔬</text><circle cx="28" cy="30" r="4" fill="#D94040" opacity="0.4"/><circle cx="72" cy="42" r="3" fill="#D94040" opacity="0.35"/>`),
  zones:     ghost(100,110, ['#F9B189','#CC7793'], E.big(50,38,32), `<path d="M40 52 Q50 58 60 52" fill="none" stroke="#003041" stroke-width="2" stroke-linecap="round"/>`, `<text x="14" y="18" font-size="14">👆</text><circle cx="78" cy="44" r="4" fill="none" stroke="#E4665C" stroke-width="2" stroke-dasharray="3,2" opacity="0.5"/><circle cx="24" cy="52" r="3.5" fill="none" stroke="#E4665C" stroke-width="2" stroke-dasharray="3,2" opacity="0.5"/>`),
  food:      ghost(100,110, ['#5ED497','#F9B189'], E.big(50,36,32), `<ellipse cx="50" cy="52" rx="7" ry="5.5" fill="#003041"/><ellipse cx="50" cy="50" rx="4" ry="2" fill="#E4665C" opacity="0.5"/>`, `<text x="8" y="20" font-size="16">🍎</text><text x="74" y="22" font-size="14">🥛</text><text x="4" y="80" font-size="12">🥗</text><text x="78" y="82" font-size="13">🍔</text>`),
  lifestyle: ghost(100,110, ['#64B5F6','#CC7793'], E.big(50,38,32), `<path d="M40 52 Q50 60 60 52" fill="none" stroke="#003041" stroke-width="2.5" stroke-linecap="round"/>`, `<text x="10" y="16" font-size="15">💧</text><text x="74" y="18" font-size="13">🌙</text><text x="4" y="82" font-size="12">🏃</text><text x="78" y="84" font-size="11">🧠</text>`),
  mood:      ghost(100,110, ['#CC7793','#F9B189'], E.big(50,36,32), `<path d="M40 52 Q50 62 60 52" fill="none" stroke="#003041" stroke-width="2.5" stroke-linecap="round"/>`, `<text x="30" y="12" font-size="13">💕</text><text x="58" y="14" font-size="10">💭</text>`),
  summary:   ghost(100,110, ['#F9B189','#E4665C'], E.big(50,38,32), `<path d="M40 52 Q50 62 60 52" fill="none" stroke="#003041" stroke-width="2.5" stroke-linecap="round"/>`, `<text x="12" y="16" font-size="14">📋</text><text x="72" y="18" font-size="12">✅</text><path d="M74 42 L78 46 L86 36" stroke="#5ED497" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`),
  chart:     ghost(90,100, ['#F9B189','#CC7793'], E.big(45,34,28), `<path d="M36 48 Q45 54 54 48" fill="none" stroke="#003041" stroke-width="2" stroke-linecap="round"/>`, `<text x="58" y="14" font-size="12">📊</text><rect x="18" y="66" width="6" height="12" rx="2" fill="white" opacity="0.4"/><rect x="28" y="62" width="6" height="16" rx="2" fill="white" opacity="0.5"/><rect x="38" y="64" width="6" height="14" rx="2" fill="white" opacity="0.4"/><rect x="48" y="60" width="6" height="18" rx="2" fill="white" opacity="0.5"/><rect x="58" y="66" width="6" height="12" rx="2" fill="white" opacity="0.4"/>`),
  profile:   ghost(90,100, ['#424F60','#003041'], `<ellipse cx="36" cy="34" rx="4" ry="4.5" fill="white"/><ellipse cx="54" cy="34" rx="4" ry="4.5" fill="white"/><circle cx="37" cy="33.5" r="1.8" fill="#003041"/><circle cx="55" cy="33.5" r="1.8" fill="#003041"/>`, `<path d="M38 48 Q45 54 52 48" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>`, `<text x="60" y="14" font-size="10">⭐</text>`),
  weather:   ghost(90,100, ['#64B5F6','#F9B189'], E.big(45,34,28), `<path d="M36 48 Q45 54 54 48" fill="none" stroke="#003041" stroke-width="2" stroke-linecap="round"/>`, `<text x="58" y="14" font-size="16">☀️</text><text x="4" y="26" font-size="12">🌧️</text><text x="60" y="72" font-size="10">📍</text>`),
  routine:   ghost(90,100, ['#5ED497','#CC7793'], E.big(45,34,28), `<path d="M36 48 Q45 56 54 48" fill="none" stroke="#003041" stroke-width="2.5" stroke-linecap="round"/>`, `<text x="60" y="14" font-size="13">🎯</text><text x="6" y="18" font-size="11">💪</text><rect x="22" y="68" width="46" height="5" rx="2.5" fill="rgba(0,0,0,0.12)"/><rect x="22" y="68" width="32" height="5" rx="2.5" fill="white" opacity="0.4"/>`),
  report:    ghost(90,100, ['#E4665C','#F9B189'], E.big(45,34,28), `<path d="M38 48 Q45 52 52 48" fill="none" stroke="#003041" stroke-width="2" stroke-linecap="round"/>`, `<text x="58" y="16" font-size="13">📊</text><text x="8" y="20" font-size="11">📋</text><rect x="22" y="64" width="5" height="12" rx="2" fill="white" opacity="0.4"/><rect x="30" y="60" width="5" height="16" rx="2" fill="white" opacity="0.5"/><rect x="38" y="62" width="5" height="14" rx="2" fill="white" opacity="0.4"/><rect x="46" y="58" width="5" height="18" rx="2" fill="white" opacity="0.5"/><rect x="54" y="64" width="5" height="12" rx="2" fill="white" opacity="0.4"/>`),
  nodata:    ghost(100,110, ['#424F60','#003041'], `<ellipse cx="38" cy="40" rx="5" ry="5" fill="rgba(255,255,255,0.5)"/><ellipse cx="62" cy="40" rx="5" ry="5" fill="rgba(255,255,255,0.5)"/><circle cx="39" cy="39" r="2" fill="#003041" opacity="0.5"/><circle cx="63" cy="39" r="2" fill="#003041" opacity="0.5"/>`, `<ellipse cx="50" cy="56" rx="5" ry="3.5" fill="rgba(255,255,255,0.35)"/>`, `<text x="68" y="18" font-size="16">❓</text>`, 'float', false),
};

// Ghost-Severity Mini-Chars (für Listen)
const SEVERITY_CHARS = {
  clear:  ghost(52,58, ['#5ED497','#82F0B8'], `<ellipse cx="20" cy="22" rx="3.5" ry="4" fill="#003041"/><ellipse cx="32" cy="22" rx="3.5" ry="4" fill="#003041"/><circle cx="20.5" cy="21" r="1.5" fill="white" opacity="0.9"/><circle cx="32.5" cy="21" r="1.5" fill="white" opacity="0.9"/>`, `<path d="M21 30 Q26 36 31 30" fill="none" stroke="#003041" stroke-width="2" stroke-linecap="round"/>`, `<text x="36" y="12" font-size="9">✨</text>`, 'none'),
  light:  ghost(52,58, ['#F9B189','#FBC9A3'], `<ellipse cx="20" cy="22" rx="3.5" ry="4" fill="#003041"/><ellipse cx="32" cy="22" rx="3.5" ry="4" fill="#003041"/><circle cx="20.5" cy="21" r="1.5" fill="white" opacity="0.8"/><circle cx="32.5" cy="21" r="1.5" fill="white" opacity="0.8"/>`, `<path d="M22 30 Q26 34 30 30" fill="none" stroke="#003041" stroke-width="2" stroke-linecap="round"/>`, `<circle cx="13" cy="28" r="2" fill="#E4665C" opacity="0.3"/>`, 'none'),
  medium: ghost(52,58, ['#E4665C','#F09080'], `<ellipse cx="20" cy="22" rx="3" ry="3.5" fill="#003041"/><ellipse cx="32" cy="22" rx="3" ry="3.5" fill="#003041"/><circle cx="20.5" cy="21" r="1.3" fill="white" opacity="0.7"/><circle cx="32.5" cy="21" r="1.3" fill="white" opacity="0.7"/>`, `<line x1="22" y1="32" x2="30" y2="32" stroke="#003041" stroke-width="2" stroke-linecap="round"/>`, `<circle cx="13" cy="26" r="2.5" fill="#D94040" opacity="0.4"/><circle cx="40" cy="28" r="2" fill="#D94040" opacity="0.35"/>`, 'none'),
  severe: ghost(52,58, ['#CC7793','#D94040'], `<ellipse cx="20" cy="22" rx="3.5" ry="4" fill="#003041"/><ellipse cx="32" cy="22" rx="3.5" ry="4" fill="#003041"/><circle cx="20.5" cy="21" r="1.3" fill="white" opacity="0.6"/><circle cx="32.5" cy="21" r="1.3" fill="white" opacity="0.6"/><path d="M14 17 L20 19" stroke="#003041" stroke-width="1.5" stroke-linecap="round"/><path d="M38 17 L32 19" stroke="#003041" stroke-width="1.5" stroke-linecap="round"/>`, `<path d="M22 34 Q26 29 30 34" fill="none" stroke="#003041" stroke-width="2" stroke-linecap="round"/>`, `<circle cx="12" cy="26" r="3" fill="#D94040" opacity="0.5"/><circle cx="40" cy="24" r="2.5" fill="#D94040" opacity="0.45"/>`, 'none'),
};

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', () => {
  renderHome();
  renderInsights();
  renderProfile();
});

// ==================== TAB NAVIGATION ====================

function switchTab(idx) {
  currentTab = idx;
  document.querySelectorAll('.page').forEach((p, i) => p.classList.toggle('active', i === idx));
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', i === idx));
  document.getElementById('log-nav').style.display = idx === 1 ? 'flex' : 'none';
  if (idx === 0) renderHome();
  if (idx === 1) { logStep = 0; renderLogStep(); }
  if (idx === 2) renderInsights();
  if (idx === 3) renderProfile();
  document.querySelector('.screen').scrollTop = 0;
}

// ==================== HOME TAB ====================

function renderHome() {
  const s = getSettings();
  const logs = getAllLogs();
  const today = todayKey();
  const todayLog = logs.find(l => l.dateKey === today);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Guten Morgen' : hour < 17 ? 'Guten Tag' : 'Guten Abend';

  document.getElementById('home').innerHTML = `
    <div class="page-title">SkinTracker</div>
    <p class="subtitle" style="margin-bottom:6px">${greet}${s.name ? ', ' + esc(s.name) : ''}</p>

    <div class="char-container">${CHARS.happy}</div>

    <div class="card glow-coral fade-in">
      <div class="streak">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:32px">🔥</span>
          <div><div class="streak-num">${s.streak} Tage</div><span class="caption">Streak</span></div>
        </div>
        <div style="text-align:right">
          <div style="font-size:20px;font-weight:900;color:var(--peach)">${s.bestStreak}</div>
          <span class="caption">Rekord</span>
        </div>
      </div>
    </div>

    ${todayLog ? (() => {
      const info = severityInfo(todayLog.severity);
      return `<div class="card fade-in">
        <div style="display:flex;align-items:center;gap:14px">
          ${SEVERITY_CHARS[todayLog.severity]}
          <div>
            <div style="font-weight:800">Heute: ${info.name}</div>
            <div class="subtitle">Score: ${info.score}/10</div>
          </div>
          <span style="margin-left:auto;font-size:26px;color:var(--good)">✅</span>
        </div>
      </div>`;
    })() : `
      <div class="card card-glow fade-in">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div><div style="font-weight:800">Noch nicht geloggt</div><div class="subtitle">Wie war dein Tag?</div></div>
          <button class="btn btn-accent btn-sm" onclick="switchTab(1)">Loggen ✨</button>
        </div>
      </div>
    `}

    <div class="card fade-in" id="home-weather" style="display:none"></div>

    ${logs.length > 0 ? `
      <div class="card fade-in">
        <div class="section-title">Letzte Tage</div>
        ${logs.slice(0, 5).map(l => {
          const info = severityInfo(l.severity);
          return `<div class="history-item">
            ${SEVERITY_CHARS[l.severity] || '<span style="font-size:22px">' + info.emoji + '</span>'}
            <div style="flex:1"><div style="font-size:13px;font-weight:700">${formatDate(l.dateKey)}</div><span class="caption">${info.name}</span></div>
            <span style="font-weight:800;color:${info.color}">${info.score}/10</span>
          </div>`;
        }).join('')}
      </div>
    ` : ''}
  `;

  // Wetter async laden
  fetchWeather().then(w => {
    const el = document.getElementById('home-weather');
    if (w && el) {
      el.style.display = 'block';
      el.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:32px">${weatherEmoji(w.code)}</span>
          <div>
            <div style="font-weight:800">${w.condition}, ${w.temp}°C</div>
            <div class="caption">💧 ${w.humidity}% · UV ${w.uv}${w.city ? ` · 📍 ${w.city}` : ''}</div>
          </div>
        </div>
      `;
    }
  }).catch(() => {});
}

// ==================== LOG TAB ====================

function renderLogStep() {
  // Effektive Schritt-Nummer berechnen (bei "rein" 3 Steps weniger)
  const isClear = logState.severity === 'clear';
  const effectiveTotal = isClear ? LOG_STEPS - 3 : LOG_STEPS;
  const effectiveStep = isClear ? (logStep <= 0 ? 1 : logStep - 2) : logStep + 1;
  const progress = (effectiveStep / effectiveTotal * 100).toFixed(0);
  document.getElementById('log-progress').style.width = progress + '%';
  document.getElementById('log-step-label').textContent = `Schritt ${effectiveStep} von ${effectiveTotal}`;
  const btnBack = document.getElementById('btn-back');
  const btnNext = document.getElementById('btn-next');
  btnBack.style.display = logStep > 0 ? 'block' : 'none';
  btnNext.textContent = logStep < LOG_STEPS - 1 ? 'Weiter →' : '✓ Speichern';

  const el = document.getElementById('log');
  // Bei "rein" die Pickel-Steps überspringen
  if (logState.severity === 'clear' && logStep >= 1 && logStep <= 3) {
    logStep = 4; // direkt zu Zonen
  }

  switch (logStep) {
    case 0: el.innerHTML = renderStepSkin(); break;
    case 1: el.innerHTML = renderStepCount(); break;
    case 2: el.innerHTML = renderStepType(); break;
    case 3: el.innerHTML = renderStepPain(); break;
    case 4: el.innerHTML = renderStepZones(); break;
    case 5: el.innerHTML = renderStepFood(); break;
    case 6: el.innerHTML = renderStepLifestyle(); break;
    case 7: el.innerHTML = renderStepMood(); break;
    case 8: el.innerHTML = renderStepSummary(); break;
  }
  document.querySelector('.screen').scrollTop = 0;
}

function nextStep() {
  if (logStep < LOG_STEPS - 1) {
    logStep++;
    // Bei "rein" Pickel-Steps überspringen
    if (logState.severity === 'clear' && logStep >= 1 && logStep <= 3) logStep = 4;
    renderLogStep();
  } else {
    doSaveLog();
  }
}
function prevStep() {
  if (logStep > 0) {
    logStep--;
    // Bei "rein" zurück zu Step 0
    if (logState.severity === 'clear' && logStep >= 1 && logStep <= 3) logStep = 0;
    renderLogStep();
  }
}

// Step 0: Hautzustand
function renderStepSkin() {
  return `
    <div class="section-title" style="font-size:22px">Wie ist deine Haut heute?</div>
    <p class="subtitle" style="margin-bottom:4px">Wähle den Zustand</p>
    <div class="char-container">${CHARS.thinking}</div>
    ${SEVERITIES.map(s => {
      const sel = logState.severity === s.id;
      return `<div class="sev-option${sel ? ' selected' : ''}" onclick="pickSeverity('${s.id}')"
        style="${sel ? `background:rgba(228,102,92,0.1);border-color:${s.color}` : ''}">
        <span class="char">${SEVERITY_CHARS[s.id]}</span>
        <div style="flex:1"><div class="name">${s.name}</div><div class="desc">${s.desc}</div></div>
        <div class="sev-check" style="${sel ? `background:${s.color};border-color:${s.color}` : ''}">${sel ? '✓' : ''}</div>
      </div>`;
    }).join('')}
  `;
}
function pickSeverity(id) {
  logState.severity = id;
  if (id === 'clear') { logState.pimpleCount = 0; logState.pimpleTypes = new Set(); logState.painLevel = 0; }
  renderLogStep();
}

// Step 1: Wie viele Pickel?
function renderStepCount() {
  return `
    <div class="section-title" style="font-size:22px">Wie viele Unreinheiten?</div>
    <p class="subtitle" style="margin-bottom:4px">Zähle ungefähr was du siehst</p>
    <div class="char-container">${CHARS.detail}</div>

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <b style="font-size:16px">Anzahl Pickel</b>
        <span style="font-size:28px;font-weight:900;color:var(--coral)">${logState.pimpleCount}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        ${[0,1,2,3,4,5,6,7,8,9,10,15].map(n => {
          const isOn = logState.pimpleCount === n;
          const label = n === 15 ? '15+' : n.toString();
          return `<div style="height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;
            font-weight:900;font-size:17px;cursor:pointer;transition:all 0.25s cubic-bezier(.4,0,.2,1);
            ${isOn
              ? 'background:linear-gradient(135deg,var(--coral),var(--peach));color:white;box-shadow:0 4px 14px rgba(228,102,92,0.35);transform:scale(1.08)'
              : 'background:var(--glass);color:var(--text-sec);border:1px solid var(--glass-border)'}"
            onclick="logState.pimpleCount=${n};renderLogStep()">${label}</div>`;
        }).join('')}
      </div>
    </div>

    <div style="display:flex;gap:8px;padding:12px;background:rgba(249,177,137,0.08);border:1px solid rgba(249,177,137,0.15);border-radius:12px;margin-top:4px">
      <span style="font-size:18px">💡</span>
      <span style="font-size:13px;color:var(--peach);line-height:1.4">Zähle alles was du siehst - Mitesser, Pickel und Entzündungen. Eine ungefähre Zahl reicht!</span>
    </div>
  `;
}

// Step 2: Welche Art?
function renderStepType() {
  return `
    <div class="section-title" style="font-size:22px">Welche Art von Unreinheiten?</div>
    <p class="subtitle" style="margin-bottom:4px">Tippe auf alles was zutrifft</p>
    <div class="char-container">${CHARS.zones}</div>

    ${PIMPLE_TYPES.map(t => {
      const on = logState.pimpleTypes.has(t.id);
      return `
        <div style="display:flex;align-items:center;gap:14px;padding:14px;margin-bottom:8px;border-radius:16px;cursor:pointer;
          transition:all 0.25s cubic-bezier(.4,0,.2,1);
          ${on
            ? `background:${t.color}20;border:1.5px solid ${t.color}60;transform:scale(1.02)`
            : 'background:var(--glass);border:1.5px solid var(--glass-border)'}"
          onclick="togglePimpleType('${t.id}')">

          <div style="width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;
            background:${on ? t.color+'30' : 'var(--glass-strong)'};flex-shrink:0">
            ${t.emoji}
          </div>

          <div style="flex:1;min-width:0">
            <div style="font-weight:800;font-size:15px;${on ? `color:${t.color}` : ''}">${t.name}</div>
            <div style="font-size:12px;color:var(--text-sec);line-height:1.3;margin-top:2px">${t.desc}</div>
          </div>

          <div style="width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;
            transition:all 0.2s;
            ${on
              ? `background:${t.color};color:white;font-size:13px;font-weight:900`
              : 'border:2px solid var(--text-dim)'}">
            ${on ? '✓' : ''}
          </div>
        </div>`;
    }).join('')}

    <div style="display:flex;gap:8px;padding:12px;background:rgba(100,181,246,0.08);border:1px solid rgba(100,181,246,0.15);border-radius:12px;margin-top:4px">
      <span style="font-size:18px">ℹ️</span>
      <span style="font-size:13px;color:#64B5F6;line-height:1.4">Nicht sicher welcher Typ? Kein Problem - wähle einfach was am ehesten passt oder überspringe diesen Schritt.</span>
    </div>
  `;
}
function togglePimpleType(id) { logState.pimpleTypes.has(id) ? logState.pimpleTypes.delete(id) : logState.pimpleTypes.add(id); renderLogStep(); }

// Step 3: Schmerz / Entzündung
function renderStepPain() {
  const levels = [
    { v: 0, label: 'Kein Schmerz', emoji: '😊', desc: 'Keine Unreinheiten spürbar', color: 'var(--good)' },
    { v: 1, label: 'Leicht', emoji: '😐', desc: 'Leichtes Ziehen, kaum spürbar', color: 'var(--ok)' },
    { v: 2, label: 'Mittel', emoji: '😟', desc: 'Spürbar bei Berührung, unangenehm', color: 'var(--warn)' },
    { v: 3, label: 'Stark', emoji: '😣', desc: 'Schmerzt ohne Berührung, pocht', color: 'var(--bad)' },
  ];

  return `
    <div class="section-title" style="font-size:22px">Wie stark sind sie entzündet?</div>
    <p class="subtitle" style="margin-bottom:4px">Wie fühlt sich deine Haut an?</p>
    <div class="char-container">${CHARS.detail}</div>

    ${levels.map(p => {
      const on = logState.painLevel === p.v;
      return `
        <div style="display:flex;align-items:center;gap:14px;padding:16px;margin-bottom:8px;border-radius:16px;cursor:pointer;
          transition:all 0.25s cubic-bezier(.4,0,.2,1);
          ${on
            ? `background:${p.color}18;border:1.5px solid ${p.color}50;transform:scale(1.02)`
            : 'background:var(--glass);border:1.5px solid var(--glass-border)'}"
          onclick="logState.painLevel=${p.v};renderLogStep()">

          <div style="font-size:36px;flex-shrink:0">${p.emoji}</div>

          <div style="flex:1">
            <div style="font-weight:800;font-size:16px">${p.label}</div>
            <div style="font-size:12px;color:var(--text-sec);margin-top:2px">${p.desc}</div>
          </div>

          <div style="width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;
            ${on ? `background:${p.color};color:white;font-size:13px;font-weight:900` : 'border:2px solid var(--text-dim)'}">
            ${on ? '✓' : ''}
          </div>
        </div>`;
    }).join('')}
  `;
}

// Step 4: Zones
function renderStepZones() {
  const color = severityInfo(logState.severity).color;
  return `
    <div class="section-title" style="font-size:22px">Wo sind die Unreinheiten?</div>
    <p class="subtitle" style="margin-bottom:4px">Tippe auf die betroffenen Stellen</p>
    <div class="char-container">${CHARS.zones}</div>
    <div class="zone-grid">
      ${ZONES.map(z => {
        const on = logState.zones.has(z.id);
        return `<div class="zone-btn${on ? ' active' : ''}" style="${on ? `background:linear-gradient(135deg,${color},${color}dd);border-color:${color}` : ''}"
          onclick="toggleZone('${z.id}')">${z.name}</div>`;
      }).join('')}
    </div>
    ${logState.severity === 'clear' ? `<div style="display:flex;gap:8px;padding:10px 12px;background:rgba(94,212,151,0.1);border:1px solid rgba(94,212,151,0.2);border-radius:10px"><span>💚</span><span class="caption" style="color:var(--good)">Reine Haut - du kannst diesen Schritt überspringen!</span></div>` : ''}
  `;
}
function toggleZone(id) { logState.zones.has(id) ? logState.zones.delete(id) : logState.zones.add(id); renderLogStep(); }

// Step 3
function renderStepFood() {
  return `
    <div class="section-title" style="font-size:22px">Was hast du gegessen?</div>
    <p class="subtitle" style="margin-bottom:4px">Wähle alles, was zutrifft</p>
    <div class="char-container">${CHARS.food}</div>
    <div class="caption" style="font-weight:800;margin-bottom:6px;color:var(--warn)">⚡ Potenziell problematisch</div>
    <div class="chip-grid">${FOODS.filter(f=>f.bad).map(f=>chipHTML(f,'bad')).join('')}</div>
    <div class="caption" style="font-weight:800;margin:14px 0 6px;color:var(--good)">💚 Gut für die Haut</div>
    <div class="chip-grid">${FOODS.filter(f=>!f.bad).map(f=>chipHTML(f,'good')).join('')}</div>
  `;
}
function chipHTML(f, type) { const on = logState.foods.has(f.id); return `<div class="chip${on ? ` on-${type}` : ''}" onclick="toggleFood('${f.id}')">${f.emoji} ${f.name}</div>`; }
function toggleFood(id) { logState.foods.has(id) ? logState.foods.delete(id) : logState.foods.add(id); renderLogStep(); }

// Step 4
function renderStepLifestyle() {
  const stressL = ['Entspannt','Wenig','Mittel','Hoch','Sehr hoch'];
  const sleepL = ['Sehr schlecht','Schlecht','Okay','Gut','Sehr gut'];
  return `
    <div class="section-title" style="font-size:22px">Dein Lifestyle heute</div>
    <div class="char-container">${CHARS.lifestyle}</div>
    <div class="rating-row">
      <div class="rating-header"><span><span class="icon">💧</span><b>Wasser</b></span>
        <span style="font-weight:800;color:#64B5F6">${logState.water.toFixed(1)} L</span>
      </div>
      <input type="range" min="0" max="5" step="0.25" value="${logState.water}" oninput="logState.water=parseFloat(this.value);renderLogStep()">
      <div class="quick-btns">
        ${[1,1.5,2,2.5,3].map(v=>`<button class="qbtn ${logState.water===v?'on':'off'}" onclick="logState.water=${v};renderLogStep()">${v.toFixed(1)} L</button>`).join('')}
      </div>
    </div>
    ${ratingHTML('stress','🧠','Stress',logState.stress,stressL,'#E4665C')}
    ${ratingHTML('sleep','🌙','Schlafqualität',logState.sleep,sleepL,'#CC7793')}
    <div class="toggle-row">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:22px">${logState.exercise?'🏃':'🧍'}</span>
        <div><b style="font-size:14px">Sport gemacht?</b><br><span class="caption">${logState.exercise?'Ja! 💪':'Heute kein Sport'}</span></div>
      </div>
      <div class="toggle-sw ${logState.exercise?'on':'off'}" onclick="logState.exercise=!logState.exercise;renderLogStep()"></div>
    </div>
  `;
}
function ratingHTML(key,icon,title,value,labels,color) {
  const idx = Math.max(0,Math.min(value-1,labels.length-1));
  return `<div class="rating-row">
    <div class="rating-header"><span><span class="icon">${icon}</span><b>${title}</b></span><span class="caption">${labels[idx]}</span></div>
    <div class="rating-dots">
      ${[1,2,3,4,5].map(i=>{const cls=i===value?'on':i<value?'on half':'';return `<div class="dot ${cls}" style="${i<=value?`background:${color}`:''}" onclick="logState.${key}=${i};renderLogStep()">${i===value?i:''}</div>`;}).join('')}
    </div>
    <div class="rating-labels"><span class="caption">${labels[0]}</span><span class="caption">${labels[labels.length-1]}</span></div>
  </div>`;
}

// Step 5
function renderStepMood() {
  return `
    <div class="section-title" style="font-size:22px">Wie fühlst du dich?</div>
    <p class="subtitle" style="margin-bottom:4px">Stimmung beeinflusst deine Haut</p>
    <div class="char-container">${CHARS.mood}</div>
    <div class="mood-row">
      ${MOOD_LEVELS.map(m=>`<div class="mood-item${logState.mood===m.rating?' active':''}" onclick="logState.mood=${m.rating};renderLogStep()">
        <div class="mood-emoji">${m.emoji}</div><div class="mood-label">${m.label}</div>
      </div>`).join('')}
    </div>
    <div class="caption" style="font-weight:800;margin-bottom:8px">Was beschreibt dich?</div>
    <div class="chip-grid">
      ${MOOD_TAGS.map(tag=>{const on=logState.moodTags.has(tag);return `<div class="chip${on?' on-good':''}" onclick="toggleMoodTag('${tag}')">${tag}</div>`;}).join('')}
    </div>
  `;
}
function toggleMoodTag(tag) { logState.moodTags.has(tag)?logState.moodTags.delete(tag):logState.moodTags.add(tag); renderLogStep(); }

// Step 6
function renderStepSummary() {
  const info = severityInfo(logState.severity);
  const zoneNames = [...logState.zones].map(id => ZONES.find(z=>z.id===id)?.name||id);
  const foodNames = [...logState.foods].map(id => { const f=foodInfo(id); return f ? `${f.emoji} ${f.name}` : id; });
  return `
    <div class="section-title" style="font-size:22px">Zusammenfassung</div>
    <p class="subtitle" style="margin-bottom:4px">Alles richtig?</p>
    <div class="char-container">${CHARS.summary}</div>
    <div class="card">
      <div style="display:flex;align-items:center;gap:14px">
        ${SEVERITY_CHARS[logState.severity]}
        <div><b style="font-size:16px">${info.name}</b>${zoneNames.length?`<br><span class="caption">${zoneNames.join(', ')}</span>`:''}</div>
      </div>
    </div>
    ${logState.pimpleCount > 0 || logState.pimpleTypes.size > 0 ? `
      <div class="card">
        <div class="section-title" style="font-size:14px;margin-bottom:8px">🔬 Pickel-Details</div>
        <div class="summary-row"><span class="label">Anzahl</span><span class="value">${logState.pimpleCount}</span></div>
        ${logState.pimpleTypes.size > 0 ? `<div class="summary-row"><span class="label">Typen</span><span class="value">${[...logState.pimpleTypes].map(id => {const t = PIMPLE_TYPES.find(p=>p.id===id); return t ? t.emoji + ' ' + t.name : id;}).join(', ')}</span></div>` : ''}
        ${logState.painLevel > 0 ? `<div class="summary-row"><span class="label">Schmerz</span><span class="value">${['Keine','Leicht','Mittel','Stark'][logState.painLevel]}</span></div>` : ''}
      </div>
    ` : ''}
    ${foodNames.length ? `<div class="card"><div class="section-title" style="font-size:14px;margin-bottom:8px">🍽️ Ernährung</div><div class="chip-grid">${foodNames.map(n=>`<span class="chip on-good" style="cursor:default;font-size:11px;padding:5px 10px">${n}</span>`).join('')}</div></div>` : ''}
    <div class="card">
      <div class="section-title" style="font-size:14px;margin-bottom:8px">❤️ Lifestyle</div>
      <div class="summary-row"><span class="label">💧 Wasser</span><span class="value">${logState.water.toFixed(1)} L</span></div>
      <div class="summary-row"><span class="label">🧠 Stress</span><span class="value">${logState.stress}/5</span></div>
      <div class="summary-row"><span class="label">🌙 Schlaf</span><span class="value">${logState.sleep}/5</span></div>
      <div class="summary-row"><span class="label">🏃 Sport</span><span class="value">${logState.exercise?'Ja 💪':'Nein'}</span></div>
    </div>
  `;
}

// Save (mit automatischem Wetter-Tracking)
async function doSaveLog() {
  const data = {
    severity: logState.severity,
    pimpleCount: logState.pimpleCount,
    pimpleTypes: [...logState.pimpleTypes],
    painLevel: logState.painLevel,
    zones: [...logState.zones], foods: [...logState.foods],
    water: logState.water, stress: logState.stress, sleep: logState.sleep,
    exercise: logState.exercise, mood: logState.mood, moodTags: [...logState.moodTags],
    products: logState.products, routine: logState.routine,
    weather: null,
  };

  // Wetter automatisch erfassen (non-blocking)
  try {
    const w = await fetchWeather();
    if (w) data.weather = w;
  } catch (e) { /* Wetter optional */ }

  const db = saveLog(todayKey(), data);
  document.getElementById('cele-streak').textContent = db.settings.streak;
  document.getElementById('cele-score').textContent = severityInfo(logState.severity).score + '/10';
  document.getElementById('cele-char').innerHTML = CHARS.celebrate;
  const cele = document.getElementById('celebration');
  cele.classList.add('show');
  spawnConfetti();
  setTimeout(() => { cele.classList.remove('show'); resetLog(); switchTab(0); }, 3000);
}

function resetLog() {
  logState = { severity:'clear', pimpleCount:0, pimpleTypes:new Set(), painLevel:0, zones:new Set(), foods:new Set(), water:1.5, stress:3, sleep:3, exercise:false, mood:3, moodTags:new Set(), products:[], routine:false };
  logStep = 0;
}

function spawnConfetti() {
  const c = document.getElementById('confetti'); c.innerHTML = '';
  const colors = ['#E4665C','#F9B189','#CC7793','#5ED497','#FFC107','#64B5F6'];
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div'); p.className = 'confetti-piece';
    p.style.left = Math.random()*100+'%'; p.style.top = '-10px';
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    const size = 5+Math.random()*8; p.style.width=size+'px'; p.style.height=(size*0.6)+'px';
    p.style.borderRadius = Math.random()>0.5?'50%':'2px';
    p.style.animationDelay = (Math.random()*0.6)+'s';
    p.style.animationDuration = (2+Math.random())+'s';
    c.appendChild(p);
  }
}

// ==================== INSIGHTS TAB ====================

function renderInsights() {
  const logs = getAllLogs();
  const el = document.getElementById('insights');

  if (logs.length < 7) {
    el.innerHTML = `
      <div class="page-title">Insights</div>
      <div style="text-align:center;padding:30px 0">
        <div class="char-container">${CHARS.nodata}</div>
        <div class="section-title">Noch nicht genug Daten</div>
        <p class="subtitle">Logge mindestens 7 Tage.<br>Du hast ${logs.length}/7.</p>
        <div style="margin:16px auto;width:200px"><div class="progress"><div class="progress-fill" style="width:${logs.length/7*100}%"></div></div></div>
      </div>`;
    return;
  }

  const chartLogs = [...logs].reverse().slice(-21);
  const avg = Math.round(logs.slice(0,14).reduce((s,l)=>s+severityInfo(l.severity).score,0)/Math.max(1,Math.min(14,logs.length)));
  const corrs = computeCorrelations(logs);
  const triggers = corrs.filter(c=>c.direction==='bad').slice(0,3);
  const helpers = corrs.filter(c=>c.direction==='good').slice(0,3);

  el.innerHTML = `
    <div class="page-title">Insights</div>
    <div class="char-container">${CHARS.chart}</div>

    <div class="card fade-in">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="color:var(--peach)">📈</span><span class="section-title" style="margin:0">Verlauf</span>
      </div>
      <div class="bar-chart">
        ${chartLogs.map(l=>{const info=severityInfo(l.severity);return `<div class="bar" style="height:${info.score*10}%;background:linear-gradient(to top,${info.color}80,${info.color})" title="${l.dateKey}"></div>`;}).join('')}
      </div>
      <div style="display:flex;gap:14px;justify-content:center;margin-top:4px">
        <span class="caption">●<span style="color:var(--good)"> Gut</span></span>
        <span class="caption">●<span style="color:var(--ok)"> Okay</span></span>
        <span class="caption">●<span style="color:var(--bad)"> Schlecht</span></span>
      </div>
    </div>

    ${renderHeatmap(logs)}

    <div class="card fade-in">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:26px">📊</span>
        <div><span class="caption" style="font-weight:800">Durchschnitt (14 Tage)</span><br>
          <b style="font-size:18px;color:${avg>=7?'var(--good)':avg>=4?'var(--ok)':'var(--bad)'}">Score: ${avg}/10</b>
        </div>
      </div>
    </div>

    ${triggers.length ? `<div class="section-title" style="margin-top:6px">⚠️ Mögliche Trigger</div>
      ${triggers.map(t=>`<div class="insight bad"><span class="emoji">⚠️</span><div><div class="title">${t.emoji} ${t.name}</div><div class="text">${getInsightText(t)}</div></div></div>`).join('')}` : ''}

    ${helpers.length ? `<div class="section-title" style="margin-top:6px">✅ Gut für deine Haut</div>
      ${helpers.map(t=>`<div class="insight good"><span class="emoji">✅</span><div><div class="title">${t.emoji} ${t.name}</div><div class="text">${getInsightText(t)}</div></div></div>`).join('')}` : ''}

    ${renderWeeklyReport(logs)}
    ${renderRoutineBuilder(logs)}
    ${renderWeatherInsights(logs)}
  `;
}

function renderHeatmap(logs) {
  const days = ['Mo','Di','Mi','Do','Fr','Sa','So'];
  const logMap = {}; logs.forEach(l => logMap[l.dateKey] = l);
  let cells = days.map(d=>`<div class="hm-header">${d}</div>`).join('');
  for (let i = 34; i >= 0; i--) {
    const key = daysAgo(i);
    const log = logMap[key];
    const day = new Date(key+'T12:00:00').getDate();
    let bg = 'rgba(255,255,255,0.04)', fg = 'var(--text-dim)';
    if (log) {
      const score = severityInfo(log.severity).score;
      const f = score/10;
      bg = `rgb(${Math.round(217*(1-f)+94*f)},${Math.round(64*(1-f)+212*f)},${Math.round(64*(1-f)+151*f)})`;
      fg = 'white';
    }
    cells += `<div class="hm-day" style="background:${bg};color:${fg}">${day}</div>`;
  }
  return `<div class="card fade-in"><div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
    <span style="color:var(--peach)">📅</span><span class="section-title" style="margin:0">Heatmap</span></div>
    <div class="heatmap">${cells}</div></div>`;
}

// ==================== WEEKLY REPORT ====================

function renderWeeklyReport(logs) {
  const report = generateWeeklyReport(logs);
  if (!report) return '';

  const trendIcon = report.trend > 0.5 ? '📈' : report.trend < -0.5 ? '📉' : '➡️';
  const trendColor = report.trend > 0.5 ? 'var(--good)' : report.trend < -0.5 ? 'var(--warn)' : 'var(--text-sec)';
  const trendText = report.trend > 0.5 ? `+${report.trend}` : report.trend < -0.5 ? `${report.trend}` : '±0';

  return `
    <div class="section-title" style="margin-top:12px">📋 Wochen-Report</div>
    <div class="char-container">${CHARS.report}</div>
    <div class="card card-glow">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div>
          <div style="font-size:28px;font-weight:900;color:var(--peach)">${report.avgScore}/10</div>
          <span class="caption">Ø Haut-Score diese Woche</span>
        </div>
        <div style="text-align:right">
          <div style="font-size:22px">${trendIcon}</div>
          <span style="font-weight:800;color:${trendColor}">${trendText}</span>
          ${report.prevAvg !== null ? `<br><span class="caption">vs. letzte Woche</span>` : ''}
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-bottom:14px">
        <div class="card" style="flex:1;text-align:center;margin:0;padding:10px">
          <div style="font-size:11px;color:var(--good);font-weight:700">Bester Tag</div>
          ${SEVERITY_CHARS[report.bestDay.severity]}
          <div class="caption" style="margin-top:4px">${formatDate(report.bestDay.dateKey)}</div>
        </div>
        <div class="card" style="flex:1;text-align:center;margin:0;padding:10px">
          <div style="font-size:11px;color:var(--warn);font-weight:700">Schlechtester</div>
          ${SEVERITY_CHARS[report.worstDay.severity]}
          <div class="caption" style="margin-top:4px">${formatDate(report.worstDay.dateKey)}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
        <div style="text-align:center"><span style="font-size:18px">💧</span><br><b>${report.avgWater}L</b><br><span class="caption">Ø Wasser</span></div>
        <div style="text-align:center"><span style="font-size:18px">🧠</span><br><b>${report.avgStress}/5</b><br><span class="caption">Ø Stress</span></div>
        <div style="text-align:center"><span style="font-size:18px">🌙</span><br><b>${report.avgSleep}/5</b><br><span class="caption">Ø Schlaf</span></div>
      </div>

      ${report.tips.length ? `
        <div style="font-weight:800;font-size:13px;margin-bottom:8px">💡 Empfehlungen</div>
        ${report.tips.map(t => `
          <div style="display:flex;gap:8px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--glass-border)">
            <span style="font-size:18px">${t.emoji}</span>
            <span style="font-size:13px;line-height:1.4">${t.text}</span>
          </div>
        `).join('')}
      ` : ''}
    </div>
  `;
}

// ==================== ROUTINE BUILDER ====================

function renderRoutineBuilder(logs) {
  const result = buildRoutine(logs);
  if (!result) return '';

  const impactColors = { high: 'var(--warn)', medium: 'var(--peach)' };

  return `
    <div class="section-title" style="margin-top:12px">🧴 Deine optimale Routine</div>
    <div class="char-container">${CHARS.routine}</div>
    <div class="card" style="background:linear-gradient(135deg,rgba(204,119,147,0.12),rgba(249,177,137,0.08));border-color:rgba(204,119,147,0.2)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div style="font-size:36px">🎯</div>
        <div>
          <div style="font-weight:900;font-size:16px">Potenzial: +${result.potentialBoost} Score</div>
          <span class="caption">Wenn du diese Routine befolgst</span>
        </div>
      </div>

      ${result.routine.map((r, i) => `
        <div style="display:flex;gap:12px;align-items:flex-start;padding:12px 0;${i < result.routine.length - 1 ? 'border-bottom:1px solid var(--glass-border)' : ''}">
          <div style="width:40px;height:40px;border-radius:12px;background:var(--glass-strong);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${r.icon}</div>
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <b style="font-size:14px">${r.title}</b>
              <span style="font-size:10px;font-weight:800;padding:3px 8px;border-radius:8px;background:${impactColors[r.impact]}20;color:${impactColors[r.impact]}">${r.impact === 'high' ? 'Wichtig' : 'Hilfreich'}</span>
            </div>
            <div style="font-size:13px;margin-top:2px">${r.text}</div>
            <div class="caption" style="margin-top:4px;font-style:italic">${r.detail}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ==================== WEATHER INSIGHTS ====================

function renderWeatherInsights(logs) {
  const weatherLogs = logs.filter(l => l.weather);
  if (weatherLogs.length < 5) return '';

  // Korrelation Humidity vs Skin Score
  const humidLogs = weatherLogs.filter(l => l.weather.humidity);
  if (humidLogs.length < 5) return '';

  const avgHumidGood = humidLogs.filter(l => severityInfo(l.severity).score >= 7);
  const avgHumidBad = humidLogs.filter(l => severityInfo(l.severity).score <= 4);

  const goodHumid = avgHumidGood.length > 0 ? Math.round(avgHumidGood.reduce((s, l) => s + l.weather.humidity, 0) / avgHumidGood.length) : null;
  const badHumid = avgHumidBad.length > 0 ? Math.round(avgHumidBad.reduce((s, l) => s + l.weather.humidity, 0) / avgHumidBad.length) : null;

  const latestWeather = weatherLogs[0]?.weather;

  return `
    <div class="section-title" style="margin-top:12px">🌤️ Wetter & Haut</div>
    <div class="char-container">${CHARS.weather}</div>
    <div class="card">
      ${latestWeather ? `
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
          <span style="font-size:36px">${weatherEmoji(latestWeather.code)}</span>
          <div>
            <div style="font-weight:800">${latestWeather.condition}, ${latestWeather.temp}°C</div>
            <div class="caption">💧 ${latestWeather.humidity}% · UV ${latestWeather.uv}${latestWeather.city ? ` · 📍 ${latestWeather.city}` : ''}</div>
          </div>
        </div>
      ` : ''}

      ${goodHumid && badHumid ? `
        <div style="display:flex;gap:10px">
          <div class="card" style="flex:1;margin:0;padding:10px;text-align:center">
            <span style="color:var(--good);font-size:13px;font-weight:700">Gute Haut</span><br>
            <b>${goodHumid}%</b><br><span class="caption">Ø Luftfeucht.</span>
          </div>
          <div class="card" style="flex:1;margin:0;padding:10px;text-align:center">
            <span style="color:var(--warn);font-size:13px;font-weight:700">Schlechte Haut</span><br>
            <b>${badHumid}%</b><br><span class="caption">Ø Luftfeucht.</span>
          </div>
        </div>
      ` : `
        <div class="caption">Mehr Wetter-Daten werden gesammelt...</div>
      `}
    </div>
  `;
}

// ==================== PROFILE TAB ====================

function renderProfile() {
  const s = getSettings();
  const logs = getAllLogs();

  document.getElementById('profile').innerHTML = `
    <div class="page-title">Profil</div>
    <div class="char-container">${CHARS.profile}</div>

    <div class="card fade-in" style="text-align:center">
      <div style="font-size:18px;font-weight:900">${esc(s.name)||'Dein Profil'}</div>
      <div class="caption">${s.totalLogs} Einträge</div>
    </div>

    <div class="card fade-in">
      <div class="section-title">Statistiken</div>
      <div style="display:flex;justify-content:space-around;text-align:center">
        <div><div style="font-size:28px">🔥</div><b style="font-size:20px">${s.streak}</b><br><span class="caption">Streak</span></div>
        <div><div style="font-size:28px">🏆</div><b style="font-size:20px">${s.bestStreak}</b><br><span class="caption">Rekord</span></div>
        <div><div style="font-size:28px">📋</div><b style="font-size:20px">${s.totalLogs}</b><br><span class="caption">Logs</span></div>
      </div>
    </div>

    <div class="card fade-in">
      <div class="section-title">Profil</div>
      <div class="pf-row"><span>Name</span><input class="pf-input" type="text" value="${esc(s.name)}" placeholder="Dein Name" onchange="updateSettings({name:this.value});renderHome()"></div>
    </div>

    <div class="card fade-in">
      <div class="section-title">Achievements</div>
      <div class="badge-grid">
        ${ACHIEVEMENTS.map(a => {
          const unlocked = s.achievements.includes(a.id);
          return `<div class="badge${unlocked?'':' locked'}">
            <div class="badge-icon">${a.icon}</div>
            <div class="badge-title">${a.title}</div>
            <div class="badge-desc">${a.desc}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    ${logs.length ? `<div class="card fade-in">
      <div class="section-title">Verlauf</div>
      ${logs.slice(0,15).map(l=>{const info=severityInfo(l.severity);return `<div class="history-item">
        ${SEVERITY_CHARS[l.severity]||'<span style="font-size:20px">'+info.emoji+'</span>'}
        <div style="flex:1"><div style="font-size:13px;font-weight:700">${formatDate(l.dateKey)}</div><span class="caption">${info.name}</span></div>
        <div style="text-align:right"><b style="color:${info.color}">${info.score}/10</b><br><span class="caption" style="color:#64B5F6">${(l.water||0).toFixed(1)}L</span>${l.weather ? `<br><span class="caption">${weatherEmoji(l.weather.code)} ${l.weather.temp}°</span>` : ''}</div>
      </div>`;}).join('')}
    </div>` : ''}
  `;
}

// ==================== HELPERS ====================

function esc(str) { const d = document.createElement('div'); d.textContent = str||''; return d.innerHTML; }
