// ============================================================
// Clases: semanales (se repiten cada semana) o en fechas concretas
// Una clase semanal tiene `dia` (0 = lunes). Una puntual tiene `fecha` (AAAA-MM-DD).
// ============================================================
import * as store from './store.js';
import { dow, parseISO, toMin, addDays, today, nowMin } from './util.js';

export const esPuntual = (c) => !!c.fecha;

/** ¿Ese día es festivo / no lectivo? */
export const festivo = (fecha) => store.all('eventos').find((e) => e.tipo === 'festivo' && e.fecha === fecha);

/** Clases de un día concreto, ordenadas por hora. Los festivos no tienen clases semanales. */
export function clasesDelDia(fecha) {
  const d = dow(parseISO(fecha));
  const fin = store.state.ajustes.finCurso;
  const esFestivo = !!festivo(fecha);
  return store.all('clases')
    .filter((c) => (esPuntual(c) ? c.fecha === fecha : !esFestivo && c.dia === d && (!fin || fecha <= fin)))
    .sort((a, b) => toMin(a.inicio) - toMin(b.inicio));
}

/**
 * Próximos días con clase a partir de hoy (incluye lo que queda de hoy).
 * Devuelve [{ fecha, clases }] con como mucho `dias` días con clase, buscando hasta `limite` días.
 */
export function proximosDias(dias = 3, limite = 60, { hoyEntero = false } = {}) {
  const out = [];
  const t = today();
  const ahora = nowMin();
  for (let i = 0; i < limite && out.length < dias; i++) {
    const f = addDays(t, i);
    let cs = clasesDelDia(f);
    if (i === 0 && !hoyEntero) cs = cs.filter((c) => toMin(c.fin) > ahora);
    if (cs.length) out.push({ fecha: f, clases: cs });
  }
  return out;
}

/** Horas de clase en la semana que empieza el lunes `lunes`. */
export function horasSemana(lunes, asigId = null) {
  let min = 0;
  for (let i = 0; i < 7; i++) {
    clasesDelDia(addDays(lunes, i)).filter((c) => !asigId || c.asignaturaId === asigId).forEach((c) => (min += toMin(c.fin) - toMin(c.inicio)));
  }
  return min / 60;
}

export const lunesDe = (fecha) => addDays(fecha, -dow(parseISO(fecha)));

// ---------- Seguimiento: clase vista o pendiente de ver ----------
// Cada clase de un día concreto puede tener un registro en "asistencias":
// { claseId, asignaturaId, fecha, estado: 'vista' | 'pendiente', repasarEl, nota }

export const asistId = (c, fecha) => `${c.id}_${fecha}`;
export const asistencia = (c, fecha) => store.get('asistencias', asistId(c, fecha));

export function marcarVista(c, fecha, vista = true) {
  const prev = asistencia(c, fecha);
  if (!vista) { if (prev) store.remove('asistencias', prev.id); return; }
  store.put('asistencias', { ...(prev || {}), id: asistId(c, fecha), claseId: c.id, asignaturaId: c.asignaturaId, fecha, inicio: c.inicio, fin: c.fin, estado: 'vista', repasarEl: null });
}

export function atrasar(c, fecha, repasarEl, nota = '') {
  const prev = asistencia(c, fecha);
  store.put('asistencias', { ...(prev || {}), id: asistId(c, fecha), claseId: c.id, asignaturaId: c.asignaturaId, fecha, inicio: c.inicio, fin: c.fin, estado: 'pendiente', repasarEl, nota });
}

/** Clases pendientes de ver (atrasadas), ordenadas por el día elegido para verlas. */
export function pendientesDeVer() {
  return store.all('asistencias')
    .filter((x) => x.estado === 'pendiente' && store.get('clases', x.claseId))
    .sort((a, b) => (a.repasarEl || '').localeCompare(b.repasarEl || '') || a.fecha.localeCompare(b.fecha));
}
export const repasosDelDia = (fecha) => pendientesDeVer().filter((x) => x.repasarEl === fecha);
