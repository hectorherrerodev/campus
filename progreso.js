// ============================================================
// Progreso de la Academia: XP, racha, vidas y lecciones hechas
// ============================================================
import * as store from './store.js';
import { today, addDays } from './util.js';
import { CURSOS } from './cursos.js';

export const MAX_VIDAS = 5;
export const REGEN_MS = 30 * 60 * 1000;

const P = () => store.state.progreso;

/** Todos los cursos: los incluidos + los importados por el usuario. */
export function cursos() {
  const extra = store.all('cursosExtra').map((c) => ({ ...c, categoria: c.categoria || 'Mis cursos', extra: true }));
  return [...CURSOS, ...extra];
}
export const curso = (id) => cursos().find((c) => c.id === id);
export const lecciones = (c) => c.unidades.flatMap((u) => u.lecciones);
export const leccion = (c, lid) => lecciones(c).find((l) => l.id === lid);

export function vidas() {
  const p = P();
  if (!store.state.ajustes.vidasActivas) return MAX_VIDAS;
  if (p.vidas >= MAX_VIDAS) return MAX_VIDAS;
  const n = Math.floor((Date.now() - (p.vidasAt || Date.now())) / REGEN_MS);
  if (n > 0) {
    const v = Math.min(MAX_VIDAS, p.vidas + n);
    store.setSingle('progreso', { vidas: v, vidasAt: v >= MAX_VIDAS ? Date.now() : p.vidasAt + n * REGEN_MS }, { silent: true });
    return v;
  }
  return p.vidas;
}
/** Minutos hasta la siguiente vida. */
export function minutosSiguienteVida() {
  const p = P();
  return Math.max(1, Math.ceil((REGEN_MS - (Date.now() - p.vidasAt)) / 60000));
}
export function perderVida() {
  if (!store.state.ajustes.vidasActivas) return MAX_VIDAS;
  const v = vidas();
  const patch = { vidas: Math.max(0, v - 1) };
  if (v >= MAX_VIDAS) patch.vidasAt = Date.now();
  store.setSingle('progreso', patch, { silent: true });
  return patch.vidas;
}
export function recuperarVida() {
  const v = vidas();
  if (v < MAX_VIDAS) store.setSingle('progreso', { vidas: v + 1 }, { silent: true });
}

/** Racha vigente (si ayer no practicaste, se muestra 0). */
export function racha() {
  const p = P();
  if (!p.ultimoDia) return 0;
  if (p.ultimoDia === today() || p.ultimoDia === addDays(today(), -1)) return p.racha;
  return 0;
}
export const xpHoy = () => P().xpDia[today()] || 0;

export function sumarXP(n) {
  const p = P();
  const hoy = today();
  let r = p.racha;
  if (p.ultimoDia !== hoy) r = p.ultimoDia === addDays(hoy, -1) ? p.racha + 1 : 1;
  const xpDia = { ...p.xpDia, [hoy]: (p.xpDia[hoy] || 0) + n };
  // Guardamos solo los últimos 60 días
  const limite = addDays(hoy, -60);
  Object.keys(xpDia).forEach((k) => { if (k < limite) delete xpDia[k]; });
  store.setSingle('progreso', { xpTotal: p.xpTotal + n, xpDia, racha: r, mejorRacha: Math.max(p.mejorRacha || 0, r), ultimoDia: hoy }, { silent: true });
  return { racha: r, subioRacha: r !== p.racha || p.ultimoDia !== hoy };
}

export function completarLeccion(cursoId, lid, precision) {
  const p = P();
  const key = `${cursoId}/${lid}`;
  const prev = p.lecciones[key] || { veces: 0, mejor: 0 };
  store.setSingle('progreso', {
    lecciones: { ...p.lecciones, [key]: { veces: prev.veces + 1, mejor: Math.max(prev.mejor, precision), fecha: today() } },
    ultimoCurso: cursoId,
  }, { silent: true });
}
export const hecha = (cursoId, lid) => !!P().lecciones[`${cursoId}/${lid}`];

export function estadoLecciones(c) {
  const ls = lecciones(c);
  let actualMarcada = false;
  return ls.map((l) => {
    if (hecha(c.id, l.id)) return { l, estado: 'done' };
    if (!actualMarcada) { actualMarcada = true; return { l, estado: 'current' }; }
    return { l, estado: 'locked' };
  });
}
export function siguiente(c) {
  const e = estadoLecciones(c).find((x) => x.estado === 'current');
  return e ? e.l : null;
}
export function progresoCurso(c) {
  const ls = lecciones(c);
  const h = ls.filter((l) => hecha(c.id, l.id)).length;
  return { hechas: h, total: ls.length, pct: ls.length ? Math.round((h / ls.length) * 100) : 0 };
}

// ---------- Errores para repasar ----------
export const errores = (cursoId) => P().errores[cursoId] || [];
export function anotarError(cursoId, exKey) {
  const e = new Set(errores(cursoId)); e.add(exKey);
  store.setSingle('progreso', { errores: { ...P().errores, [cursoId]: [...e].slice(-60) } }, { silent: true });
}
export function quitarError(cursoId, exKey) {
  const e = errores(cursoId).filter((k) => k !== exKey);
  store.setSingle('progreso', { errores: { ...P().errores, [cursoId]: e } }, { silent: true });
}
/** Busca un ejercicio por su clave "leccion#indice". */
export function ejercicio(c, key) {
  const [lid, i] = key.split('#');
  const l = leccion(c, lid);
  return l ? l.ejercicios[Number(i)] : null;
}
