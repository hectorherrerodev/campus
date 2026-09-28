// ============================================================
// Utilidades compartidas: HTML, fechas, iconos, modales, avisos
// ============================================================

/** Escapa texto para meterlo en HTML de forma segura. */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Id único corto. */
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

// ---------- Fechas ----------
export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const DIAS_C = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
export const DIAS_3 = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const pad = (n) => String(n).padStart(2, '0');
/** Fecha local en formato AAAA-MM-DD. */
export const iso = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => iso(new Date());
export const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); };
/** Días entre dos fechas ISO (b - a). */
export const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
/** Día de la semana empezando en lunes = 0. */
export const dow = (d = new Date()) => (d.getDay() + 6) % 7;
export const toMin = (hhmm) => { if (!hhmm) return 0; const [h, m] = hhmm.split(':').map(Number); return h * 60 + (m || 0); };
export const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
export const fmtLong = (s) => { const d = parseISO(s); return `${DIAS[dow(d)]}, ${d.getDate()} de ${MESES[d.getMonth()]}`; };
export const fmtShort = (s) => { const d = parseISO(s); return `${DIAS_3[dow(d)]} ${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`; };

/** Texto relativo tipo "mañana", "en 3 días", "hace 2 días". */
export function relDay(s) {
  const n = diffDays(today(), s);
  if (n === 0) return 'hoy';
  if (n === 1) return 'mañana';
  if (n === -1) return 'ayer';
  if (n > 1 && n < 7) return `en ${n} días`;
  if (n >= 7 && n < 14) return 'en 1 semana';
  if (n >= 14) return `en ${Math.round(n / 7)} semanas`;
  return `hace ${-n} días`;
}

export const fmtSize = (b) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`);

// ---------- Colores para asignaturas ----------
export const COLORES = ['#2342b5', '#e0613a', '#178a57', '#b53a8f', '#d9a300', '#0f8fa8', '#7a52cc', '#c23b3b', '#5a7d1a', '#6b7280'];

// ---------- Iconos (SVG en línea) ----------
const P = {
  hoy: '<path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/><circle cx="12" cy="12" r="4"/>',
  agenda: '<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="M7.5 13.5h3M7.5 16.5h6"/>',
  horario: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  libros: '<path d="M4 19V5a2 2 0 0 1 2-2h11v16H6a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h13"/><path d="M8 7h6"/>',
  academia: '<path d="M2 9.5 12 5l10 4.5-10 4.5L2 9.5Z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9.5V15"/>',
  mas: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  test: '<path d="M9 11l2 2 4-4"/><rect x="4" y="3" width="16" height="18" rx="3"/>',
  ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z"/>',
  play: '<path d="M8 5.5v13l10.5-6.5L8 5.5Z"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m14 6 4 4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  cloud: '<path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8H7Z"/>',
  sync: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>',
  pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7L20 8.6M20 4v4.6h-4.6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
};
const FILLED = {
  flame: '<path fill="currentColor" d="M12 22c-4.4 0-7.5-3-7.5-7.2 0-3.4 2-5.6 3.8-7.5.4 1.6 1.3 2.8 2.5 3.4-.4-3.5 1.2-6.8 4.2-8.7-.2 2.8 1 4.6 2.6 6.3 1.5 1.6 2.9 3.6 2.9 6.5 0 4.2-3.9 7.2-8.5 7.2Z"/><path fill="#ffd84d" d="M12 21c-2 0-3.4-1.3-3.4-3.2 0-1.6 1-2.6 2-3.6.2 1 .8 1.6 1.6 1.8-.1-1.7.6-3 1.6-3.8.2 1.3.8 2.1 1.4 2.9.6.8 1 1.6 1 2.7 0 1.9-1.8 3.2-4.2 3.2Z"/>',
  heart: '<path fill="currentColor" d="M12 21s-8.5-5.1-8.5-11.2A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.5 3.2C20.5 15.9 12 21 12 21Z"/>',
  bolt: '<path fill="currentColor" d="M13.5 2 4.5 13.5h6L9.5 22l9-11.5h-6L13.5 2Z"/>',
  starf: '<path fill="currentColor" d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z"/>',
  crown: '<path fill="currentColor" d="M3.5 8.5 8 12l4-6.5 4 6.5 4.5-3.5-2 10h-13l-2-10Z"/>',
};
export function icon(name, cls = '') {
  if (FILLED[name]) return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${FILLED[name]}</svg>`;
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
}

// ---------- Avisos ----------
export function toast(msg, ms = 2400) {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

// ---------- Modales ----------
let openCount = 0;
const abiertos = new Set();
/** Cierra todos los modales (al cambiar de pantalla). */
export const cerrarModales = () => [...abiertos].forEach((c) => c());
/**
 * Abre un modal. Devuelve { el, body, close }.
 * `onClose` se llama al cerrarlo por cualquier vía.
 */
export function modal({ title, body = '', foot = '', wide = false, onClose } = {}) {
  const back = document.createElement('div');
  back.className = 'modal-back';
  back.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="modal-head"><h2>${esc(title)}</h2><button class="btn ghost icon" data-close aria-label="Cerrar">${icon('x')}</button></div>
    <div class="modal-body">${body}</div>
    ${foot ? `<div class="modal-foot">${foot}</div>` : ''}
  </div>`;
  document.getElementById('modal-root').appendChild(back);
  openCount++;
  document.body.style.overflow = 'hidden';
  const close = () => {
    abiertos.delete(close);
    if (!back.isConnected) return;
    back.remove();
    openCount--;
    if (!openCount) document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    onClose && onClose();
  };
  const onKey = (e) => { if (e.key === 'Escape' && back === document.getElementById('modal-root').lastElementChild) close(); };
  document.addEventListener('keydown', onKey);
  abiertos.add(close);
  back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
  back.querySelector('[data-close]').onclick = close;
  const first = back.querySelector('input, select, textarea');
  if (first && window.matchMedia('(min-width: 861px)').matches) setTimeout(() => first.focus(), 30);
  return { el: back, body: back.querySelector('.modal-body'), close };
}

/** Confirmación dentro de la página (no usa confirm()). */
export function confirmar(texto, { ok = 'Eliminar', peligro = true } = {}) {
  return new Promise((resolve) => {
    let done = false;
    const m = modal({
      title: '¿Seguro?',
      body: `<p>${esc(texto)}</p>`,
      foot: `<span class="spacer"></span><button class="btn" data-no>Cancelar</button><button class="btn ${peligro ? 'danger solid' : 'primary'}" data-yes>${esc(ok)}</button>`,
      onClose: () => { if (!done) resolve(false); },
    });
    m.el.querySelector('[data-no]').onclick = () => m.close();
    m.el.querySelector('[data-yes]').onclick = () => { done = true; resolve(true); m.close(); };
  });
}

/**
 * Formulario genérico en modal.
 * fields: [{ name, label, type, value, options:[[valor, texto]], required, placeholder, full, hint }]
 * type: text | textarea | select | date | time | number | email | url | color | days | password
 */
export function formModal({ title, fields, submit = 'Guardar', onSubmit, onDelete, deleteText = 'Se eliminará para siempre.' }) {
  const html = `<form class="form-grid" id="fm" novalidate>${fields.map(fieldHTML).join('')}</form>`;
  const foot = `${onDelete ? `<button class="btn danger" data-del type="button">${icon('trash')} Eliminar</button>` : ''}
    <span class="spacer"></span><button class="btn" data-cancel type="button">Cancelar</button>
    <button class="btn primary" data-ok type="button">${esc(submit)}</button>`;
  const m = modal({ title, body: html, foot });
  const form = m.el.querySelector('#fm');
  const send = async () => {
    const data = readForm(form, fields);
    const missing = fields.find((f) => f.required && (data[f.name] === '' || data[f.name] == null || (Array.isArray(data[f.name]) && !data[f.name].length)));
    if (missing) { toast(`Falta: ${missing.label}`); form.querySelector(`[name="${missing.name}"]`)?.focus(); return; }
    const r = await onSubmit(data);
    if (r !== false) m.close();
  };
  form.addEventListener('submit', (e) => { e.preventDefault(); send(); });
  form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); send(); } });
  m.el.querySelector('[data-ok]').onclick = send;
  m.el.querySelector('[data-cancel]').onclick = m.close;
  const del = m.el.querySelector('[data-del]');
  if (del) del.onclick = async () => { if (await confirmar(deleteText)) { onDelete(); m.close(); } };
  return m;
}

function fieldHTML(f) {
  const id = `f-${f.name}`;
  const v = f.value ?? '';
  const req = f.required ? ' *' : '';
  const hint = f.hint ? `<small class="muted tiny">${esc(f.hint)}</small>` : '';
  const wrap = (inner) => `<label class="field ${f.full ? 'full' : ''}" for="${id}"><span>${esc(f.label)}${req}</span>${inner}${hint}</label>`;
  switch (f.type) {
    case 'textarea':
      return wrap(`<textarea class="input ${f.code ? 'code' : ''}" id="${id}" name="${f.name}" placeholder="${esc(f.placeholder || '')}" rows="${f.rows || 4}">${esc(v)}</textarea>`);
    case 'select':
      return wrap(`<select class="input" id="${id}" name="${f.name}">${f.options.map(([val, txt]) => `<option value="${esc(val)}" ${String(val) === String(v) ? 'selected' : ''}>${esc(txt)}</option>`).join('')}</select>`);
    case 'days': {
      const sel = new Set((Array.isArray(v) ? v : [v]).map(Number));
      const n = f.count || 5;
      return `<div class="field ${f.full ? 'full' : ''}"><span>${esc(f.label)}${req}</span><div class="daypick">${DIAS_3.slice(0, n).map((d, i) => `<label><input type="checkbox" name="${f.name}" value="${i}" ${sel.has(i) ? 'checked' : ''}><span>${d}</span></label>`).join('')}</div>${hint}</div>`;
    }
    case 'color':
      return `<div class="field ${f.full ? 'full' : ''}"><span>${esc(f.label)}</span><div class="swatches">${COLORES.map((c, i) => `<label title="${c}"><input type="radio" name="${f.name}" value="${c}" ${c === v || (!v && i === 0) ? 'checked' : ''}><span style="--c:${c}"></span></label>`).join('')}</div></div>`;
    default:
      return wrap(`<input class="input" id="${id}" name="${f.name}" type="${f.type || 'text'}" value="${esc(v)}" placeholder="${esc(f.placeholder || '')}" ${f.step ? `step="${f.step}"` : ''} ${f.min != null ? `min="${f.min}"` : ''} ${f.max != null ? `max="${f.max}"` : ''} autocomplete="${f.autocomplete || 'off'}">`);
  }
}

function readForm(form, fields) {
  const out = {};
  for (const f of fields) {
    if (f.type === 'days') out[f.name] = $$(`[name="${f.name}"]:checked`, form).map((i) => Number(i.value));
    else if (f.type === 'color') out[f.name] = form.querySelector(`[name="${f.name}"]:checked`)?.value || COLORES[0];
    else {
      const el = form.querySelector(`[name="${f.name}"]`);
      let val = el ? el.value.trim() : '';
      if (f.type === 'number') val = val === '' ? null : Number(val.replace(',', '.'));
      out[f.name] = val;
    }
  }
  return out;
}

// ---------- Mini-markdown para teoría y notas ----------
/** Convierte un subconjunto de Markdown en HTML seguro: ```bloques```, `código`, **negrita**, listas "- ". */
export function md(src = '') {
  const parts = String(src).split(/```(?:\w+)?\n?([\s\S]*?)```/g);
  let html = '';
  parts.forEach((p, i) => {
    if (i % 2) { html += `<pre class="code">${esc(p.replace(/\n$/, ''))}</pre>`; return; }
    const blocks = p.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
    for (const b of blocks) {
      const lines = b.split('\n');
      if (lines.every((l) => /^\s*[-•]\s/.test(l))) html += `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-•]\s/, ''))}</li>`).join('')}</ul>`;
      else if (/^#{1,3}\s/.test(b)) html += `<h3>${inline(b.replace(/^#+\s/, ''))}</h3>`;
      else html += `<p>${lines.map(inline).join('<br>')}</p>`;
    }
  });
  return html;
}
export function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}
/** Texto libre con enlaces clicables. */
export const linkify = (s) => esc(s).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');

// ---------- Descargas y portapapeles ----------
export function descargar(nombre, contenido, tipo = 'text/plain') {
  const blob = contenido instanceof Blob ? contenido : new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
export async function copiar(texto, fallbackEl) {
  try { await navigator.clipboard.writeText(texto); toast('Copiado'); }
  catch { if (fallbackEl) { fallbackEl.focus(); fallbackEl.select(); } toast('Selecciona el texto y cópialo'); }
}
