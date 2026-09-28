// ============================================================
// Horario semanal
// ============================================================
import { esc, icon, DIAS_3, dow, toMin, nowMin, descargar } from './util.js';
import * as store from './store.js';
import { claseForm } from './common.js';
import { icsHorario } from './ics.js';

export const agendaSeg = (on) => `<div class="seg"><a href="#/horario" class="${on === 'horario' ? 'on' : ''}">Horario</a><a href="#/calendario" class="${on === 'calendario' ? 'on' : ''}">Calendario</a></div>`;

const HORA_PX = 58;

export function render(root) {
  const aj = store.state.ajustes;
  const nDias = aj.sabado ? 6 : 5;
  const clases = store.all('clases').filter((c) => c.dia < nDias);
  let ini = toMin(aj.horaIni || '08:00');
  let fin = toMin(aj.horaFin || '15:00');
  clases.forEach((c) => { ini = Math.min(ini, toMin(c.inicio)); fin = Math.max(fin, toMin(c.fin)); });
  ini = Math.floor(ini / 60) * 60;
  fin = Math.ceil(fin / 60) * 60;
  const alto = ((fin - ini) / 60) * HORA_PX;
  const hoy = dow();
  const ahora = nowMin();
  const y = (m) => ((m - ini) / 60) * HORA_PX;

  const horasSem = clases.reduce((s, c) => s + (toMin(c.fin) - toMin(c.inicio)), 0) / 60;
  const porAsig = {};
  clases.forEach((c) => (porAsig[c.asignaturaId] = (porAsig[c.asignaturaId] || 0) + (toMin(c.fin) - toMin(c.inicio)) / 60));

  root.innerHTML = `
    <div class="page-head">
      <div><div class="eyebrow">Agenda</div><h1>Horario</h1></div>
      <div class="row">${agendaSeg('horario')}</div>
    </div>
    <div class="row" style="margin-bottom:14px">
      <button class="btn primary" data-act="nueva">${icon('plus')} Añadir clase</button>
      <button class="btn" data-act="ics" ${clases.length ? '' : 'disabled'}>${icon('download')} Exportar a mi calendario</button>
      <span class="spacer"></span>
      <span class="muted small num">${horasSem.toFixed(1).replace('.', ',')} h/semana</span>
    </div>
    ${clases.length ? '' : `<div class="empty" style="margin-bottom:14px"><h3>Tu horario está vacío</h3><p>Añade una clase y marca todos los días en que se repite.</p></div>`}
    <div class="sched-wrap">
      <div class="sched" style="grid-template-columns: 48px repeat(${nDias}, minmax(0,1fr)); --hour:${HORA_PX}px">
        <div class="sched-h"></div>
        ${DIAS_3.slice(0, nDias).map((d, i) => `<div class="sched-h ${i === hoy ? 'today' : ''}"><span>${d}</span></div>`).join('')}
        <div class="sched-times" style="height:${alto}px">${Array.from({ length: (fin - ini) / 60 + 1 }, (_, i) => `<div style="top:${Math.min(i * HORA_PX + (i === 0 ? 8 : 0), alto - 8)}px">${String(ini / 60 + i).padStart(2, '0')}:00</div>`).join('')}</div>
        ${Array.from({ length: nDias }, (_, d) => `<div class="sched-col ${d === hoy ? 'today' : ''}" data-dia="${d}" style="height:${alto}px">
          ${clases.filter((c) => c.dia === d).map((c) => {
            const a = store.asignatura(c.asignaturaId);
            const h = y(toMin(c.fin)) - y(toMin(c.inicio));
            return `<button class="blk" data-act="edit" data-id="${c.id}" style="--c:${a?.color || '#6b7280'};top:${y(toMin(c.inicio)) + 1}px;height:${h - 2}px" title="${esc(a?.nombre || '')} ${c.inicio}–${c.fin}">
              <b>${esc(a?.abrev || a?.nombre || '?')}</b>${h > 40 ? `<span>${c.inicio}${c.aula ? ' · ' + esc(c.aula) : ''}</span>` : ''}</button>`;
          }).join('')}
          ${d === hoy && ahora > ini && ahora < fin ? `<div class="nowline" style="top:${y(ahora)}px"></div>` : ''}
        </div>`).join('')}
      </div>
    </div>
    ${Object.keys(porAsig).length ? `<div class="section"><h2>Horas por asignatura</h2><div class="chips">${Object.entries(porAsig).sort((a, b) => b[1] - a[1]).map(([id, h]) => {
      const a = store.asignatura(id);
      return `<span class="chip"><span class="sw" style="background:${a?.color}"></span>${esc(a?.abrev || a?.nombre || '?')} · ${String(+h.toFixed(1)).replace('.', ',')} h</span>`;
    }).join('')}</div></div>` : ''}
    <p class="muted tiny" style="margin-top:14px">Toca un hueco vacío para añadir una clase ese día. "Exportar" crea un archivo .ics que puedes abrir en el Calendario del iPhone para ver las clases allí.</p>`;

  root.onclick = (e) => {
    const b = e.target.closest('[data-act]');
    if (b) {
      if (b.dataset.act === 'nueva') claseForm();
      if (b.dataset.act === 'edit') claseForm(store.get('clases', b.dataset.id));
      if (b.dataset.act === 'ics') descargar('horario-campus.ics', icsHorario(), 'text/calendar');
      return;
    }
    const col = e.target.closest('.sched-col');
    if (col) {
      const rect = col.getBoundingClientRect();
      const min = ini + Math.floor(((e.clientY - rect.top) / HORA_PX) * 4) * 15;
      const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      claseForm({ dia: Number(col.dataset.dia), inicio: hhmm(min), fin: hhmm(min + 55) });
    }
  };
}
