// ============================================================
// Exportar a calendario (.ics) para Calendario de iPhone, Google…
// Así tienes avisos del sistema sin notificaciones push.
// ============================================================
import * as store from './store.js';
import { today, parseISO, dow, addDays } from './util.js';

const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => '\\' + c);
const dt = (fecha, hora) => fecha.replace(/-/g, '') + (hora ? 'T' + hora.replace(':', '') + '00' : '');
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
const TZ = 'Europe/Madrid';

function envolver(eventos) {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Campus DAW//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...eventos, 'END:VCALENDAR']
    .join('\r\n');
}

/** Entregas y exámenes pendientes, con aviso el día antes y 2 h antes. */
export function icsEventos() {
  const t = today();
  const ev = store.all('eventos').filter((e) => e.fecha >= t && !e.hecho).map((e) => {
    const a = store.asignatura(e.asignaturaId);
    const titulo = `${a ? `[${a.abrev || a.nombre}] ` : ''}${e.titulo}`;
    const lines = ['BEGIN:VEVENT', `UID:${e.id}@campus-daw`, `DTSTAMP:${stamp()}`];
    if (e.hora && e.tipo !== 'festivo') {
      const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      const [h, m] = e.hora.split(':').map(Number);
      const t0 = h * 60 + m;
      // Entrega a última hora: el evento termina a esa hora. Si no, dura 30 min (examen: 55).
      const [ini, fin] = t0 >= 23 * 60 ? [t0 - 30, t0] : [t0, Math.min(t0 + (e.tipo === 'examen' ? 55 : 30), 23 * 60 + 59)];
      lines.push(`DTSTART;TZID=${TZ}:${dt(e.fecha, hhmm(ini))}`, `DTEND;TZID=${TZ}:${dt(e.fecha, hhmm(fin))}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${dt(e.fecha)}`, `DTEND;VALUE=DATE:${dt(addDays(e.fecha, 1))}`);
    }
    lines.push(`SUMMARY:${esc(titulo)}`, `DESCRIPTION:${esc(e.notas)}`, `CATEGORIES:${esc(e.tipo)}`);
    if (e.tipo === 'entrega' || e.tipo === 'examen') {
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(titulo)}`, 'TRIGGER:-P1D', 'END:VALARM');
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(titulo)}`, 'TRIGGER:-PT2H', 'END:VALARM');
    }
    lines.push('END:VEVENT');
    return lines.join('\r\n');
  });
  return envolver(ev);
}

/** Horario semanal repetido hasta el fin de curso. */
export function icsHorario() {
  const fin = store.state.ajustes.finCurso || addDays(today(), 270);
  const hoy = today();
  const ev = store.all('clases').map((c) => {
    const a = store.asignatura(c.asignaturaId);
    // Primer día que coincide con el día de la semana de la clase
    let f = hoy;
    for (let i = 0; i < 7; i++) { if (dow(parseISO(f)) === c.dia) break; f = addDays(f, 1); }
    const byday = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'][c.dia];
    return ['BEGIN:VEVENT', `UID:${c.id}@campus-daw`, `DTSTAMP:${stamp()}`,
      `DTSTART;TZID=${TZ}:${dt(f, c.inicio)}`, `DTEND;TZID=${TZ}:${dt(f, c.fin)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${byday};UNTIL=${fin.replace(/-/g, '')}T235959Z`,
      `SUMMARY:${esc(a ? a.abrev || a.nombre : 'Clase')}`, `LOCATION:${esc(c.aula)}`, `DESCRIPTION:${esc(a?.nombre)}`,
      'END:VEVENT'].join('\r\n');
  });
  return envolver(ev);
}
