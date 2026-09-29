// ============================================================
// Almacén de datos local-first.
// Todo se guarda en localStorage al momento; si hay sesión en
// Supabase, sync.js sube los cambios pendientes y baja los nuevos.
// ============================================================
import { uid, today } from './util.js';

const KEY = 'campus:v1';
export const COLECCIONES = ['asignaturas', 'clases', 'eventos', 'documentos', 'tests', 'intentos', 'notas', 'cursosExtra', 'asistencias'];
export const SINGLES = ['progreso', 'ajustes'];

export const defaultProgreso = () => ({
  id: 'progreso', xpTotal: 0, xpDia: {}, racha: 0, mejorRacha: 0, ultimoDia: null,
  vidas: 5, vidasAt: Date.now(), lecciones: {}, errores: {}, ultimoCurso: null, updatedAt: 0,
});
export const defaultAjustes = () => ({
  id: 'ajustes', metaXP: 30, vidasActivas: true, sabado: false, horaIni: '08:00', horaFin: '15:00',
  finCurso: `${new Date().getMonth() >= 7 ? new Date().getFullYear() + 1 : new Date().getFullYear()}-06-20`,
  demoCargada: false, updatedAt: 0,
});

const blank = () => {
  const s = { _pend: {}, _lastPull: null };
  COLECCIONES.forEach((c) => (s[c] = []));
  s.progreso = defaultProgreso();
  s.ajustes = defaultAjustes();
  return s;
};

let memoryOnly = false;
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const data = JSON.parse(raw);
    const s = blank();
    COLECCIONES.forEach((c) => (s[c] = Array.isArray(data[c]) ? data[c] : []));
    s.progreso = { ...defaultProgreso(), ...(data.progreso || {}) };
    s.ajustes = { ...defaultAjustes(), ...(data.ajustes || {}) };
    s._pend = data._pend || {};
    s._lastPull = data._lastPull || null;
    return s;
  } catch {
    memoryOnly = true;
    return blank();
  }
}

export const state = load();
export const isMemoryOnly = () => memoryOnly;

let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { memoryOnly = true; }
  }, 60);
}

// ---------- Suscripciones ----------
const subs = new Set();
export const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn); };
function emit(origen = 'local') { subs.forEach((fn) => fn(origen)); }

let pushHook = null;
/** sync.js registra aquí la función que sube cambios. */
export const onPending = (fn) => (pushHook = fn);
function markPending(col, id, deleted = false) {
  state._pend[id] = { col, deleted };
  pushHook && pushHook();
}

// ---------- Lectura ----------
export const all = (col) => state[col] || [];
export const get = (col, id) => all(col).find((x) => x.id === id);
export const asignatura = (id) => get('asignaturas', id);
export const colorDe = (asigId) => asignatura(asigId)?.color || '#6b7280';

// ---------- Escritura ----------
/** Crea o actualiza un registro. Devuelve el registro guardado. */
export function put(col, obj, { silent = false } = {}) {
  const list = state[col];
  const rec = { ...obj, id: obj.id || uid(), updatedAt: Date.now() };
  if (!rec.createdAt) rec.createdAt = rec.updatedAt;
  const i = list.findIndex((x) => x.id === rec.id);
  if (i >= 0) list[i] = rec; else list.push(rec);
  markPending(col, rec.id);
  persist();
  if (!silent) emit();
  return rec;
}

export function remove(col, id, { silent = false } = {}) {
  const list = state[col];
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return;
  const [old] = list.splice(i, 1);
  state._pend[id] = { col, deleted: true, data: { ...old, updatedAt: Date.now() } };
  pushHook && pushHook();
  persist();
  if (!silent) emit();
}

/** Guarda un "single" (progreso o ajustes). */
export function setSingle(name, patch, { silent = false } = {}) {
  state[name] = { ...state[name], ...patch, id: name, updatedAt: Date.now() };
  markPending(name, name);
  persist();
  if (!silent) emit();
  return state[name];
}

/** Borra un registro y todo lo que cuelga de una asignatura. */
export function removeAsignatura(id) {
  ['clases', 'eventos', 'documentos', 'tests', 'notas', 'asistencias'].forEach((c) => {
    all(c).filter((x) => x.asignaturaId === id).forEach((x) => remove(c, x.id, { silent: true }));
  });
  remove('asignaturas', id);
}

// ---------- Utilidades para sync ----------
export function pendientes() {
  return Object.entries(state._pend).map(([id, p]) => {
    const data = p.deleted ? (p.data || { id, updatedAt: Date.now() }) : (SINGLES.includes(p.col) ? state[p.col] : get(p.col, id));
    return { id, col: p.col, deleted: !!p.deleted, data };
  }).filter((p) => p.data);
}
export function limpiarPendientes(ids) { ids.forEach((id) => delete state._pend[id]); persist(); }
export function setLastPull(ts) { state._lastPull = ts; persist(); }

/** Aplica filas que llegan de Supabase. Devuelve true si cambió algo. */
export function aplicarRemotos(rows) {
  let cambios = false;
  for (const r of rows) {
    const col = r.coleccion;
    const data = r.data || {};
    if (state._pend[r.id] && (state._pend[r.id].data?.updatedAt || (SINGLES.includes(col) ? state[col].updatedAt : get(col, r.id)?.updatedAt) || 0) > (data.updatedAt || 0)) continue;
    if (SINGLES.includes(col)) {
      if (!r.deleted && (data.updatedAt || 0) > (state[col].updatedAt || 0)) {
        state[col] = { ...(col === 'progreso' ? defaultProgreso() : defaultAjustes()), ...data };
        cambios = true;
      }
      continue;
    }
    if (!state[col]) continue;
    const list = state[col];
    const i = list.findIndex((x) => x.id === r.id);
    if (r.deleted) {
      if (i >= 0 && (list[i].updatedAt || 0) <= (data.updatedAt || 0)) { list.splice(i, 1); cambios = true; }
    } else if (i < 0) { list.push(data); cambios = true; }
    else if ((list[i].updatedAt || 0) < (data.updatedAt || 0)) { list[i] = data; cambios = true; }
  }
  if (cambios) { persist(); emit('remote'); }
  return cambios;
}

/** Marca todo como pendiente (para subir datos locales la primera vez que inicias sesión). */
export function marcarTodoPendiente() {
  COLECCIONES.forEach((c) => all(c).forEach((x) => (state._pend[x.id] = state._pend[x.id] || { col: c })));
  SINGLES.forEach((s) => { if (state[s].updatedAt) state._pend[s] = { col: s }; });
  persist();
}

// ---------- Copia de seguridad ----------
export function exportar() {
  const out = { app: 'campus-daw', version: 1, exportado: new Date().toISOString() };
  COLECCIONES.forEach((c) => (out[c] = state[c]));
  SINGLES.forEach((s) => (out[s] = state[s]));
  return JSON.stringify(out, null, 2);
}
export function importar(json) {
  const data = typeof json === 'string' ? JSON.parse(json) : json;
  if (data.app !== 'campus-daw') throw new Error('Este archivo no es una copia de Campus DAW');
  COLECCIONES.forEach((c) => { if (Array.isArray(data[c])) { state[c] = data[c].map((x) => ({ ...x, updatedAt: Date.now() })); state[c].forEach((x) => (state._pend[x.id] = { col: c })); } });
  SINGLES.forEach((s) => { if (data[s]) { state[s] = { ...state[s], ...data[s], updatedAt: Date.now() }; state._pend[s] = { col: s }; } });
  persist();
  pushHook && pushHook();
  emit();
}
export function borrarLocal() {
  try { localStorage.removeItem(KEY); } catch { /* nada */ }
}

// ---------- Conveniencias ----------
export const hoyISO = today;
export function persistNow() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* nada */ } }
export { emit };
