/* ════════════════════════════════════════════════════════════════
   RaidHelper Viewer — app.js
   ════════════════════════════════════════════════════════════════ */

// ── Constants ──────────────────────────────────────────────────────
const REFRESH_MS = 15 * 60 * 1000;  // 5 minutes

// ── i18n ───────────────────────────────────────────────────────────
const STRINGS = {
  es: {
    recargar:      "Recargar",
    configuracion: "Config",
    periodo:       "Período",
    servidor:      "Servidor",
    buscar:        "Buscar",
    fecha:         "Fecha",
    dias7:         "Próximos 7 días",
    dias14:        "Próximos 14 días",
    dias30:        "Próximos 30 días",
    diasTodos:     "Todos",
    todosServ:     "Todos los servidores",
    colInscrito:   "Inscrito",
    colFecha:      "Fecha",
    colHora:       "Hora",
    colServidor:   "Servidor",
    colRaid:       "Raid",
    colPartic:     "👥 Participantes",
    colRol:        "Rol",
    placeholderBuscar: "título, servidor, líder...",
    placeholderFecha:  "dd/mm  o  dd/mm/aaaa",
    statusLoading: "⏳ Consultando...",
    statusOk:      "✅ {n} evento(s)",
    statusFallidos:" | ⚠ sin resp: {f}",
    statusExpired: "⚠ Token expirado",
    statusError:   "⚠ Error de red",
    emptyFilter:   "Sin eventos para los filtros actuales",
    emptyExpired:  "⚠ Token expirado o inválido.\nPresiona Config → volvé a configurar el token.",
    inscritoLabel: "Inscrito como:",
    detServidor:   "Servidor",
    detFecha:      "Fecha",
    detLider:      "Líder",
    detCanal:      "Canal",
    detRaidId:     "Raid ID",
    detDesc:       "Descripción",
    detSinDesc:    "Sin descripción",
    detSinAnotados:"Sin anotados aún.",
    detTotal:      "Total anotados: {n}",
    detEsc:        "ESC o click fuera para cerrar",
    dayNames:      ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],
  },
  en: {
    recargar:      "Reload",
    configuracion: "Config",
    periodo:       "Period",
    servidor:      "Server",
    buscar:        "Search",
    fecha:         "Date",
    dias7:         "Next 7 days",
    dias14:        "Next 14 days",
    dias30:        "Next 30 days",
    diasTodos:     "All",
    todosServ:     "All servers",
    colInscrito:   "Signed Up",
    colFecha:      "Date",
    colHora:       "Time",
    colServidor:   "Server",
    colRaid:       "Raid",
    colPartic:     "👥 Participants",
    colRol:        "Role",
    placeholderBuscar: "title, server, leader...",
    placeholderFecha:  "dd/mm  or  dd/mm/yyyy",
    statusLoading: "⏳ Loading...",
    statusOk:      "✅ {n} event(s)",
    statusFallidos:" | ⚠ no resp: {f}",
    statusExpired: "⚠ Token expired",
    statusError:   "⚠ Network error",
    emptyFilter:   "No events match the current filters",
    emptyExpired:  "⚠ Token expired or invalid.\nPress Config to reconfigure your token.",
    inscritoLabel: "Signed up as:",
    detServidor:   "Server",
    detFecha:      "Date",
    detLider:      "Leader",
    detCanal:      "Channel",
    detRaidId:     "Raid ID",
    detDesc:       "Description",
    detSinDesc:    "No description",
    detSinAnotados:"No sign-ups yet.",
    detTotal:      "Total signed up: {n}",
    detEsc:        "ESC or click outside to close",
    dayNames:      ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
  }
};

let _lang = localStorage.getItem('rhv_lang') || 'es';

function t(key, vars) {
  let s = STRINGS[_lang]?.[key] ?? STRINGS['es'][key] ?? key;
  if (vars) Object.keys(vars).forEach(k => { s = s.replace(`{${k}}`, vars[k]); });
  return s;
}

// ── State ──────────────────────────────────────────────────────────
let _allEvents    = [];
let _fallidos     = [];
let _accessToken  = '';
let _apiKey       = '';
let _refreshTimer = null;
let _retryTimer   = null;
let _tokenExpired = false;

// ── Init ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  _accessToken = localStorage.getItem('rhv_token')  || '';
  _apiKey      = localStorage.getItem('rhv_apikey') || '';

  if (!_accessToken) {
    window.location.href = '/config';
    return;
  }

  setupEventListeners();
  applyLang();
  loadEvents();
  _refreshTimer = setInterval(loadEvents, REFRESH_MS);
});

// ── Language ───────────────────────────────────────────────────────
function toggleLang() {
  _lang = _lang === 'es' ? 'en' : 'es';
  localStorage.setItem('rhv_lang', _lang);
  applyLang();
  // Re-render with new language (dates, column headers, etc.)
  renderTable(getFilteredEvents());
}

function applyLang() {
  document.documentElement.lang = _lang;

  // data-i18n text nodes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  // Select options
  document.querySelectorAll('[data-i18n-opt]').forEach(el => {
    el.textContent = t(el.dataset.i18nOpt);
  });

  // Placeholders
  document.getElementById('inp-buscar').placeholder = t('placeholderBuscar');
  document.getElementById('inp-fecha').placeholder  = t('placeholderFecha');

  // Lang button label
  document.getElementById('btn-lang').textContent = `🌐 ${_lang.toUpperCase()}`;
}

// ── Config redirect ────────────────────────────────────────────────
function goConfig() {
  window.location.href = '/config';
}

// ── Load events from server ────────────────────────────────────────
function cancelRetry() {
  if (_retryTimer) { clearTimeout(_retryTimer); _retryTimer = null; }
}

async function loadEvents() {
  cancelRetry();
  setStatus('loading');
  showLoading(true);

  try {
    const res = await fetch('/api/eventos', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        accessToken: _accessToken,
        apiKey:      _apiKey || '',
      })
    });
    const data = await res.json();

    if (!data.ok) {
      if (data.error === 'token_expirado') {
        _tokenExpired = true;
        setStatus('expired');
        showEmpty('expired');
      } else {
        setStatus('error');
      }
      showLoading(false);
      return;
    }

    _tokenExpired = false;
    _allEvents    = data.eventos  || [];
    _fallidos     = data.fallidos || [];

    updateServerSelect();
    renderTable(getFilteredEvents());
    setStatus('ok');

    // Primer reintento silencioso 5s después de terminar la carga
    if (_fallidos.length > 0) {
      _retryTimer = setTimeout(() => retryFallidos(0), 5000);
    }
  } catch {
    setStatus('error');
  } finally {
    showLoading(false);
  }
}

// ── Filtering ──────────────────────────────────────────────────────
function getFilteredEvents() {
  const dias     = document.getElementById('sel-dias').value;
  const servidor = document.getElementById('sel-servidor').value;
  const texto    = document.getElementById('inp-buscar').value.trim().toLowerCase();
  const fecha    = document.getElementById('inp-fecha').value.trim();

  const ahora = Date.now() / 1000;
  const limite = dias === '0' ? Infinity : ahora + parseInt(dias) * 86400;

  return _allEvents.filter(ev => {
    const unixtime = parseInt(ev.unixtime);

    // Period
    if (unixtime > limite) return false;

    // Server (exact match — options populated from event data)
    if (servidor && ev._servidor !== servidor) return false;

    // Free text
    if (texto) {
      const title  = (ev.displayTitle || ev.title || '').toLowerCase();
      const srv    = (ev._servidor || '').toLowerCase();
      const leader = (ev.leader || ev.leadername || '').toLowerCase();
      if (!title.includes(texto) && !srv.includes(texto) && !leader.includes(texto)) return false;
    }

    // Date
    if (fecha) {
      const dt   = new Date(unixtime * 1000);
      const dd   = String(dt.getDate()).padStart(2, '0');
      const mm   = String(dt.getMonth() + 1).padStart(2, '0');
      const yyyy = String(dt.getFullYear());
      const parts = fecha.split('/');
      if (parts.length === 2) {
        if (dd !== parts[0] || mm !== parts[1]) return false;
      } else if (parts.length === 3) {
        if (dd !== parts[0] || mm !== parts[1] || yyyy !== parts[2]) return false;
      }
    }

    return true;
  });
}

function updateServerSelect() {
  const select = document.getElementById('sel-servidor');
  const prev   = select.value;

  // Unique server names from ALL loaded events
  const names = [...new Set(_allEvents.map(ev => ev._servidor).filter(Boolean))].sort();

  select.innerHTML = `<option value="">${t('todosServ')}</option>`;
  names.forEach(name => {
    const opt = document.createElement('option');
    opt.value       = name;
    opt.textContent = name;
    select.appendChild(opt);
  });

  // Restore selection if still valid
  if (names.includes(prev)) select.value = prev;
}

// ── Rendering ──────────────────────────────────────────────────────
function getColorClass(unixtime) {
  const dt       = new Date(unixtime * 1000);
  const evDay    = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const now      = new Date();
  const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((evDay - today) / 86400000);
  if (diffDays === 0) return 'color-today';
  if (diffDays === 1) return 'color-tomorrow';
  if (diffDays <= 7)  return 'color-week';
  return 'color-later';
}

function formatFecha(unixtime) {
  const dt      = new Date(unixtime * 1000);
  const days    = t('dayNames');
  const dayName = days[dt.getDay()];
  const dd      = String(dt.getDate()).padStart(2, '0');
  const mm      = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy    = dt.getFullYear();
  return `${dayName} ${dd}/${mm}/${yyyy}`;
}

function formatHora(unixtime) {
  const dt = new Date(unixtime * 1000);
  return `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
}

function renderTable(eventos) {
  const tbody    = document.getElementById('eventos-body');
  const emptyEl  = document.getElementById('empty-state');
  const tableEl  = document.getElementById('eventos-table');

  tbody.innerHTML = '';

  if (!eventos.length) {
    tableEl.style.display = 'none';
    showEmpty('filter');
    return;
  }

  tableEl.style.display = '';
  emptyEl.classList.add('hidden');

  eventos.forEach((ev, idx) => {
    const colorClass = getColorClass(parseInt(ev.unixtime));
    const signup     = ev._signup;
    const rol        = signup ? `${signup.name || ''} · ${signup.specName || ''}` : '';
    const inscrito   = ev._anotado ? '✅' : '';
    const titulo     = (ev.displayTitle || ev.title || '—').substring(0, 40);
    const servidor   = (ev._servidor || '?').substring(0, 22);

    const tr = document.createElement('tr');
    tr.className = colorClass;
    tr.dataset.idx = idx;
    tr.innerHTML = `
      <td class="col-inscrito">${inscrito}</td>
      <td>${formatFecha(parseInt(ev.unixtime))}</td>
      <td class="col-hora">${formatHora(parseInt(ev.unixtime))}</td>
      <td>${escHtml(servidor)}</td>
      <td>${escHtml(titulo)}</td>
      <td class="col-partic">${ev.signupcount ?? '?'}</td>
      <td>${escHtml(rol)}</td>
    `;
    tr.addEventListener('click', () => openModal(ev.raidId, ev));
    tbody.appendChild(tr);
  });
}

// ── Silent retry for failed servers ───────────────────────────────
async function retryFallidos(attempt) {
  if (!_fallidos.length) return;
  try {
    const res = await fetch('/api/reintentar', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        accessToken: _accessToken,
        apiKey:      _apiKey || '',
        fallidos:    _fallidos,
      })
    });
    const data = await res.json();
    if (data.ok && data.eventos.length) {
      // Merge evitando duplicados por raidId
      const existingIds = new Set(_allEvents.map(ev => String(ev.raidId)));
      const nuevos      = data.eventos.filter(ev => !existingIds.has(String(ev.raidId)));
      if (nuevos.length) {
        _allEvents = [..._allEvents, ...nuevos].sort((a, b) => a.unixtime - b.unixtime);
        updateServerSelect();
        renderTable(getFilteredEvents());
      }
    }
    _fallidos = data.fallidos || [];
    setStatus('ok');
  } catch {
    // Silencioso
  } finally {
    // Encadenar siguiente intento si quedan fallidos y no se agotaron los intentos
    if (_fallidos.length > 0 && attempt < 2) {
      _retryTimer = setTimeout(() => retryFallidos(attempt + 1), 20000);
    }
  }
}

// ── Modal ──────────────────────────────────────────────────────────
async function openModal(raidId, ev) {
  const overlay  = document.getElementById('modal-overlay');
  const content  = document.getElementById('modal-content');
  overlay.classList.remove('hidden');
  content.innerHTML = `<div class="spinner" style="margin:40px auto"></div>`;

  try {
    const res  = await fetch('/api/detalle', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({accessToken: _accessToken, raidId: String(raidId)})
    });
    const data = await res.json();
    if (data.ok) {
      renderModal(data.detalle, ev._signup);
    } else {
      content.innerHTML = `<p style="color:var(--today);padding:20px">${t('statusError')}</p>`;
    }
  } catch {
    content.innerHTML = `<p style="color:var(--today);padding:20px">${t('statusError')}</p>`;
  }
}

function renderModal(detalle, signup) {
  const content = document.getElementById('modal-content');
  const fecha   = formatFechaDetalle(parseInt(detalle.unixtime || 0));
  const desc    = (detalle.description || '').trim() || t('detSinDesc');
  const titulo  = detalle.displayTitle || detalle.title || '?';

  let html = '';

  // Signup banner
  if (signup) {
    const name    = signup.name     || '?';
    const spec    = signup.specName || '?';
    const clase   = signup.className || '?';
    html += `
      <div class="modal-signup-banner">
        ${t('inscritoLabel')} <strong>${escHtml(name)}</strong>
        · <strong>${escHtml(spec)}</strong>
        · <span style="opacity:.7">${escHtml(clase)}</span>
      </div>`;
  }

  // Title
  html += `<div class="modal-title">${escHtml(titulo)}</div>`;

  // Meta
  html += `<div class="modal-meta">
    <span class="meta-label">${t('detServidor')}:</span> <span>${escHtml(detalle.servername || '?')}</span>
    <span class="meta-label">${t('detFecha')}:</span>     <span>${fecha}</span>
    <span class="meta-label">${t('detLider')}:</span>     <span>${escHtml(detalle.leadername || '?')}</span>
    <span class="meta-label">${t('detCanal')}:</span>     <span>#${escHtml(detalle.channelName || '?')}</span>
    <span class="meta-label">${t('detRaidId')}:</span>    <span>${escHtml(String(detalle.raidid || '?'))}</span>
  </div>`;

  // Description
  html += `
    <div style="font-size:12px;color:var(--muted);font-weight:600;margin-bottom:6px">
      ${t('detDesc')}
    </div>
    <div class="modal-desc">${escHtml(desc)}</div>`;

  // Signups
  const signups = detalle.signups || [];
  if (signups.length) {
    html += renderSignups(signups);
  } else {
    html += `<p style="color:var(--muted);font-size:13px">${t('detSinAnotados')}</p>`;
  }

  html += `<div class="modal-esc-hint">${t('detEsc')}</div>`;
  content.innerHTML = html;
}

function renderSignups(signups) {
  const ROLES = ['Tanks', 'Healers', 'Melee', 'Ranged'];
  const ROLE_CLASS = {Tanks: 'role-tanks', Healers: 'role-healers', Melee: 'role-melee', Ranged: 'role-ranged'};

  const primaryByRole = {};
  let totalPrimary = 0;
  signups.forEach(s => {
    if (s.status !== 'primary') return;
    totalPrimary++;
    const role = s.role || 'Other';
    if (!primaryByRole[role]) primaryByRole[role] = [];
    primaryByRole[role].push(s);
  });

  let html = '<div class="signups-section">';

  ROLES.forEach(role => {
    const members = primaryByRole[role];
    if (!members) return;
    members.sort((a, b) => (a.position || 99) - (b.position || 99));
    const cssClass = ROLE_CLASS[role] || 'role-other';
    html += `<div class="role-group ${cssClass}">
      <div class="role-header">── ${escHtml(role)} (${members.length}) ──</div>`;
    members.forEach(m => {
      const note = m.note ? ` <span class="signup-note">(${escHtml(m.note)})</span>` : '';
      html += `<div class="signup-row">
        <span class="signup-pos">${m.position ?? '?'}</span>
        <span class="signup-name">${escHtml(m.name || '?')}</span>
        <span class="signup-spec">${escHtml(m.class || '')} / ${escHtml(m.spec || '')}</span>
        ${note}
      </div>`;
    });
    html += `</div>`;
  });

  // Bench / Tentative / Late / Absence
  ['Bench', 'Tentative', 'Late', 'Absence'].forEach(estado => {
    const extras = signups.filter(s =>
      s.status === 'default' && (s.class || '').toLowerCase() === estado.toLowerCase()
    );
    if (!extras.length) return;
    html += `<div class="role-group role-other">
      <div class="role-header">── ${estado} (${extras.length}) ──</div>`;
    extras.forEach(m => {
      html += `<div class="signup-row">
        <span class="signup-name" style="opacity:.6">${escHtml(m.name || '?')}</span>
      </div>`;
    });
    html += `</div>`;
  });

  html += `</div>`;
  html += `<div class="modal-total">${t('detTotal', {n: totalPrimary})}</div>`;
  return html;
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-content').innerHTML = '';
}

// ── UI helpers ─────────────────────────────────────────────────────
function showLoading(show) {
  document.getElementById('loading-overlay').classList.toggle('hidden', !show);
}

function showEmpty(type) {
  const el  = document.getElementById('empty-state');
  const msg = document.getElementById('empty-msg');
  document.getElementById('eventos-table').style.display = 'none';
  if (type === 'expired') {
    msg.textContent = t('emptyExpired');
  } else {
    msg.textContent = t('emptyFilter');
  }
  el.classList.remove('hidden');
}

function setStatus(state) {
  const badge = document.getElementById('status-badge');
  badge.className = 'status-badge';

  if (state === 'loading') {
    badge.classList.add('loading');
    badge.textContent = t('statusLoading');
  } else if (state === 'expired') {
    badge.classList.add('error');
    badge.textContent = t('statusExpired');
  } else if (state === 'error') {
    badge.classList.add('error');
    badge.textContent = t('statusError');
  } else {
    badge.classList.add('ok');
    const aviso = _fallidos.length ? t('statusFallidos', {f: _fallidos.length}) : '';
    badge.textContent = t('statusOk', {n: _allEvents.length}) + aviso;
  }
}

function formatFechaDetalle(unixtime) {
  if (!unixtime) return '?';
  const dt = new Date(unixtime * 1000);
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mi = String(dt.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${dt.getFullYear()} ${hh}:${mi}`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Event listeners ────────────────────────────────────────────────
function setupEventListeners() {
  // Filter changes → re-render locally
  ['sel-dias', 'sel-servidor'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      renderTable(getFilteredEvents());
    });
  });

  let debounceTimer;
  ['inp-buscar', 'inp-fecha'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => renderTable(getFilteredEvents()), 180);
    });
  });

  // Modal: close on overlay click or ESC
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}
