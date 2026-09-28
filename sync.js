// ============================================================
// Sincronización con Supabase (opcional).
// Tabla `items` (una fila por registro) + bucket `documentos`.
// ============================================================
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import * as store from './store.js';
import * as files from './files.js';

const CFG_KEY = 'campus:sb';
const listeners = new Set();
let sb = null;
let user = null;
let estado = 'local'; // local | off | ok | busy | error
let ultimoError = '';
let lastSync = null;
let pushTimer = null;
let syncing = false;

export const onEstado = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const set = (e, err = '') => { estado = e; ultimoError = err; listeners.forEach((fn) => fn(info())); };
export const info = () => ({ estado, user, error: ultimoError, lastSync, configurado: !!getConfig().url });
export const client = () => sb;
export const usuario = () => user;

export function getConfig() {
  let local = {};
  try { local = JSON.parse(localStorage.getItem(CFG_KEY) || '{}'); } catch { /* nada */ }
  return { url: (local.url || SUPABASE_URL || '').trim(), key: (local.key || SUPABASE_ANON_KEY || '').trim() };
}
export function saveConfig(url, key) {
  try { localStorage.setItem(CFG_KEY, JSON.stringify({ url, key })); } catch { /* nada */ }
}

export async function init() {
  const { url, key } = getConfig();
  if (!url || !key) { set('local'); return; }
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    sb = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
    const { data } = await sb.auth.getSession();
    user = data.session?.user || null;
    set(user ? 'ok' : 'off');
    sb.auth.onAuthStateChange((evt, session) => {
      const antes = user?.id;
      user = session?.user || null;
      set(user ? 'ok' : 'off');
      if (user && user.id !== antes) { store.marcarTodoPendiente(); syncNow(); }
    });
    store.onPending(() => { clearTimeout(pushTimer); pushTimer = setTimeout(syncNow, 1500); });
    if (user) syncNow();
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncNow(); });
    window.addEventListener('online', syncNow);
    setInterval(() => { if (document.visibilityState === 'visible') syncNow(); }, 60000);
  } catch (e) {
    console.warn('Supabase no disponible', e);
    set('error', 'No se pudo cargar Supabase (¿sin conexión?)');
  }
}

export async function login(email, password) {
  if (!sb) throw new Error('Configura Supabase primero');
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(traducir(error.message));
}
export async function registro(email, password) {
  if (!sb) throw new Error('Configura Supabase primero');
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw new Error(traducir(error.message));
  return !!data.session; // false => hay que confirmar el correo
}
export async function logout() { if (sb) await sb.auth.signOut(); }

function traducir(m) {
  if (/Invalid login/i.test(m)) return 'Correo o contraseña incorrectos';
  if (/Email not confirmed/i.test(m)) return 'Confirma tu correo antes de entrar (revisa la bandeja de entrada)';
  if (/already registered/i.test(m)) return 'Ese correo ya tiene cuenta. Inicia sesión';
  if (/Password should be/i.test(m)) return 'La contraseña debe tener al menos 6 caracteres';
  return m;
}

/** Sube lo pendiente, baja lo nuevo y sube los PDFs que falten. */
export async function syncNow() {
  if (!sb || !user || syncing || !navigator.onLine) return;
  syncing = true;
  set('busy');
  try {
    // 1) Subir cambios
    const pend = store.pendientes();
    if (pend.length) {
      const rows = pend.map((p) => ({
        user_id: user.id, id: p.id, coleccion: p.col, data: p.data, deleted: p.deleted,
        updated_at: new Date(p.data.updatedAt || Date.now()).toISOString(),
      }));
      for (let i = 0; i < rows.length; i += 200) {
        const { error } = await sb.from('items').upsert(rows.slice(i, i + 200), { onConflict: 'user_id,id' });
        if (error) throw error;
      }
      store.limpiarPendientes(pend.map((p) => p.id));
      // Borrar del Storage los documentos eliminados
      const borrados = pend.filter((p) => p.deleted && p.col === 'documentos' && p.data.path);
      if (borrados.length) await sb.storage.from('documentos').remove(borrados.map((p) => p.data.path));
    }
    // 2) Bajar cambios desde la última vez
    let q = sb.from('items').select('id,coleccion,data,deleted,server_at').order('server_at', { ascending: true }).limit(1000);
    if (store.state._lastPull) q = q.gt('server_at', store.state._lastPull);
    const { data, error } = await q;
    if (error) throw error;
    if (data.length) {
      store.aplicarRemotos(data);
      store.setLastPull(data[data.length - 1].server_at);
    }
    // 3) Subir archivos que solo están en este dispositivo
    for (const d of store.all('documentos').filter((x) => !x.path)) {
      const blob = await files.getLocal(d.id);
      if (!blob) continue;
      const path = `${user.id}/${d.id}${d.ext ? '.' + d.ext : ''}`;
      const up = await sb.storage.from('documentos').upload(path, blob, { upsert: true, contentType: d.mime || blob.type });
      if (!up.error) store.put('documentos', { ...d, path }, { silent: true });
    }
    lastSync = new Date();
    set('ok');
    if (data.length === 1000) setTimeout(syncNow, 100);
  } catch (e) {
    console.warn(e);
    set('error', e.message || 'Error al sincronizar');
  } finally {
    syncing = false;
    if (store.pendientes().length && estado === 'ok') { clearTimeout(pushTimer); pushTimer = setTimeout(syncNow, 1500); }
  }
}

/** Descarga un documento desde Storage (si no está en este dispositivo). */
export async function descargarRemoto(doc) {
  if (!sb || !user || !doc.path) return null;
  const { data, error } = await sb.storage.from('documentos').download(doc.path);
  if (error) throw error;
  await files.putLocal(doc.id, data);
  return data;
}
