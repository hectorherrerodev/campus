// ============================================================
// Horario: una semana real, con clases semanales y de fecha concreta
// ============================================================
import { esc, icon, DIAS_3, MESES, toMin, nowMin, descargar, today, addDays, parseISO } from './util.js';
import * as store from './store.js';
import { claseForm } from './common.js';
import { icsHorario } from './ics.js';
import { clasesDelDia, festivo, horasSemana, lunesDe, esPuntual } from './clases.js';

export const agendaSeg = (on) => `<div class="seg"><a href="#/horario" class="${on === 'horario' ? 'on' : ''}">Horario</a><a href="#/calendario" class="${on === 'calendario' ? 'on' : ''}">Calendario</a></div>`;

const HORA_PX = 58;
let lunes = null; // lunes de la semana que se está viendo

function tituloSemana(l) {
  const a = parseISO(l), b = parseISO(addDays(l, 6));
  if (a.getMonth() === b.getMonth()) return `${a.getDate()}–${b.getDate()} de ${MESES[a.getMonth()]}`;
  return `${a.getDate()} ${MESES[a.getMonth()].slice(0, 3)} – ${b.getDate()} ${MESES[b.getMonth()].slice(0, 3)}`;
}

export function render(root) {
  const aj = store.state.ajustes;
  const t = today();
  if (!lunes) lunes = lunesDe(t);
  const fechas = Array.from({ length: 7 }, (_, i) => addDays(lunes, i));
  // Muestra sábado/domingo si está activado o si esa semana tienen clases
  let nDias = aj.sabado ? 6 : 5;
  if (clasesDelDia(fechas[5]).length) nDias = Math.max(nDias, 6);
  if (clasesDelDia(fechas[6]).length) nDias = 7;
  const dias = fechas.slice(0, nDias).map((f) => ({ fecha: f, clases: clasesDelDia(f), fest: festivo(f) }));
  const todas = dias.flatMap((d) => d.clases);

  let ini = toMin(aj.horaIni || '08:00');
  let fin = toMin(aj.horaFin || '15:00');
  todas.forEach((c) => { ini = Math.min(ini, toMin(c.inicio)); fin = Math.max(fin, toMin(c.fin)); });
  ini = Math.floor(ini / 60) * 60;
  fin = Math.ceil(fin / 60) * 60;
  const alto = ((fin - ini) / 60) * HORA_PX;
  const ahora = nowMin();
  const y = (m) => ((m - ini) / 60) * HORA_PX;

  const porAsig = {};
  todas.forEach((c) => (porAsig[c.asignaturaId] = (porAsig[c.asignaturaId] || 0) + (toMin(c.fin) - toMin(c.inicio)) / 60));
  const esEsta = lunes === lunesDe(t);
  const hayClases = store.all('clases').length > 0;

  root.innerHTML = `
    <div class="page-head">
      <div><div class="eyebrow">Agenda</div><h1>Horario</h1></div>
      <div class="row">${agendaSeg('horario')}</div>
    </div>
    <div class="row" style="margin-bottom:14px">
      <button class="btn primary" data-act="nueva">${icon('plus')} Añadir clase</button>
      <button class="btn" data-act="ics" ${hayClases ? '' : 'disabled'}>${icon('download')} Exportar a mi calendario</button>
    </div>
    <div class="row" style="margin-bottom:12px;flex-wrap:nowrap">
      <button class="btn ghost icon" data-act="prev" aria-label="Semana anterior">${icon('left')}</button>
      <div style="flex:1;text-align:center"><h2>${tituloSemana(lunes)}</h2><span class="muted small num">${String(+horasSemana(lunes).toFixed(1)).replace('.', ',')} h de clase${esEsta ? ' · esta semana' : ''}</span></div>
      <button class="btn ghost icon" data-act="next" aria-label="Semana siguiente">${icon('right')}</button>
    </div>
    ${esEsta ? '' : `<div class="row" style="justify-content:center;margin:-4px 0 12px"><button class="btn ghost sm" data-act="hoy">Volver a esta semana</button></div>`}
    ${hayClases ? '' : `<div class="empty" style="margin-bottom:14px"><h3>Tu horario está vacío</h3><p>Añade clases que se repiten cada semana o clases en fechas concretas.</p></div>`}
    <div class="sched-wrap">
      <div class="sched" style="grid-template-columns: 48px repeat(${nDias}, minmax(0,1fr)); --hour:${HORA_PX}px">
        <div class="sched-h"></div>
        ${dias.map((d, i) => `<div class="sched-h ${d.fecha === t ? 'today' : ''}"><span>${DIAS_3[i]}</span><small>${parseISO(d.fecha).getDate()}</small></div>`).join('')}
        <div class="sched-times" style="height:${alto}px">${Array.from({ length: (fin - ini) / 60 + 1 }, (_, i) => `<div style="top:${Math.min(i * HORA_PX + (i === 0 ? 8 : 0), alto - 8)}px">${String(ini / 60 + i).padStart(2, '0')}:00</div>`).join('')}</div>
        ${dias.map((d, i) => `<div class="sched-col ${d.fecha === t ? 'today' : ''} ${d.fest ? 'fest' : ''}" data-fecha="${d.fecha}" data-dia="${i}" style="height:${alto}px">
          ${d.fest ? `<div class="tiny muted" style="padding:8px 6px;text-align:center;font-weight:700">${esc(d.fest.titulo)}</div>` : ''}
          ${d.clases.map((c) => {
            const a = store.asignatura(c.asignaturaId);
            const h = y(toMin(c.fin)) - y(toMin(c.inicio));
            return `<button class="blk ${esPuntual(c) ? 'puntual' : ''}" data-act="edit" data-id="${c.id}" style="--c:${a?.color || '#6b7280'};top:${y(toMin(c.inicio)) + 1}px;height:${h - 2}px" title="${esc(a?.nombre || '')} ${c.inicio}–${c.fin}${esPuntual(c) ? ' (solo este día)' : ''}">
              <b>${esc(a?.abrev || a?.nombre || '?')}</b>${h > 40 ? `<span>${c.inicio}${c.aula ? ' · ' + esc(c.aula) : ''}</span>` : ''}</button>`;
          }).join('')}
          ${d.fecha === t && ahora > ini && ahora < fin ? `<div class="nowline" style="top:${y(ahora)}px"></div>` : ''}
        </div>`).join('')}
      </div>
    </div>
    ${Object.keys(porAsig).length ? `<div class="section"><h2>Horas esta semana</h2><div class="chips">${Object.entries(porAsig).sort((a, b) => b[1] - a[1]).map(([id, h]) => {
      const a = store.asignatura(id);
      return `<span class="chip"><span class="sw" style="background:${a?.color}"></span>${esc(a?.abrev || a?.nombre || '?')} · ${String(+h.toFixed(1)).replace('.', ',')} h</span>`;
    }).join('')}</div></div>` : ''}
    <p class="muted tiny" style="margin-top:14px">Borde continuo: clase de todas las semanas. Borde discontinuo: clase de un día concreto. Toca un hueco vacío para añadir una clase ese día.</p>`;

  root.onclick = (e) => {
    const b = e.target.closest('[data-act]');
    if (b) {
      const act = b.dataset.act;
      if (act === 'nueva') claseForm();
      if (act === 'edit') claseForm(store.get('clases', b.dataset.id));
      if (act === 'ics') descargar('horario-campus.ics', icsHorario(), 'text/calendar');
      if (act === 'prev') { lunes = addDays(lunes, -7); render(root); }
      if (act === 'next') { lunes = addDays(lunes, 7); render(root); }
      if (act === 'hoy') { lunes = lunesDe(t); render(root); }
      return;
    }
    const col = e.target.closest('.sched-col');
    if (col) {
      const rect = col.getBoundingClientRect();
      const min = Math.max(ini, ini + Math.floor(((e.clientY - rect.top) / HORA_PX) * 4) * 15);
      const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      claseForm({ dia: Number(col.dataset.dia), fecha: col.dataset.fecha, inicio: hhmm(min), fin: hhmm(min + 55) });
    }
  };
}
