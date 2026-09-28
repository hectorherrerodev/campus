// ============================================================
// Calendario mensual: clases, entregas, exámenes y festivos
// ============================================================
import { esc, icon, today, iso, parseISO, dow, MESES, DIAS_3, fmtLong, descargar, diffDays } from './util.js';
import * as store from './store.js';
import { eventoItem, manejarEvento, eventoForm, claseForm, TIPOS_EVENTO } from './common.js';
import { clasesDelDia, esPuntual } from './clases.js';
import { agendaSeg } from './horario.js';
import { icsEventos } from './ics.js';

let mes = null;      // Date del día 1 del mes que se ve
let sel = null;      // día seleccionado (ISO)
let filtro = 'todos';
let verClases = true;

export function render(root) {
  const t = today();
  if (!mes) { const d = new Date(); mes = new Date(d.getFullYear(), d.getMonth(), 1); }
  if (!sel) sel = t;
  const eventos = store.all('eventos').filter((e) => filtro === 'todos' || e.tipo === filtro || (filtro === 'pendientes' && !e.hecho && e.tipo !== 'festivo'));
  const porDia = {};
  eventos.forEach((e) => (porDia[e.fecha] = porDia[e.fecha] || []).push(e));
  Object.values(porDia).forEach((l) => l.sort((a, b) => (a.hora || '').localeCompare(b.hora || '')));

  const primero = new Date(mes);
  const inicio = new Date(primero); inicio.setDate(1 - dow(primero));
  const celdas = [];
  for (let i = 0; i < 42; i++) { const d = new Date(inicio); d.setDate(inicio.getDate() + i); celdas.push(d); }
  const semanas = celdas[35].getMonth() !== mes.getMonth() ? 5 : 6;

  const delDia = (porDia[sel] || []);
  const clasesSel = clasesDelDia(sel);
  const proximos = eventos.filter((e) => e.fecha >= t && e.tipo !== 'festivo' && !e.hecho).sort((a, b) => (a.fecha + (a.hora || '')).localeCompare(b.fecha + (b.hora || ''))).slice(0, 10);

  root.innerHTML = `
    <div class="page-head">
      <div><div class="eyebrow">Agenda</div><h1>Calendario</h1></div>
      <div class="row">${agendaSeg('calendario')}</div>
    </div>
    <div class="row" style="margin-bottom:14px">
      <button class="btn primary" data-act="nuevo">${icon('plus')} Entrega</button>
      <button class="btn" data-act="nueva-clase">${icon('plus')} Clase</button>
      <button class="btn" data-act="ics">${icon('download')} Exportar con avisos</button>
      <span class="spacer"></span>
      <div class="chips"><button class="chip ${verClases ? 'on' : ''}" data-act="ver-clases">${verClases ? icon('check') + ' ' : ''}Clases</button>${[['todos', 'Todo'], ['pendientes', 'Pendiente'], ...TIPOS_EVENTO.slice(0, 2)].map(([v, l]) => `<button class="chip ${filtro === v ? 'on' : ''}" data-act="filtro" data-v="${v}">${l.split(' /')[0]}</button>`).join('')}</div>
    </div>
    <div class="grid-2">
      <div class="cal">
        <div class="row" style="padding:12px 12px 8px">
          <button class="btn ghost icon" data-act="prev" aria-label="Mes anterior">${icon('left')}</button>
          <h2 style="flex:1;text-align:center;text-transform:capitalize">${MESES[mes.getMonth()]} ${mes.getFullYear()}</h2>
          <button class="btn ghost icon" data-act="next" aria-label="Mes siguiente">${icon('right')}</button>
        </div>
        <div class="row" style="justify-content:center;padding:0 0 8px"><button class="btn ghost sm" data-act="hoy">Hoy</button></div>
        <div class="cal-grid">
          ${DIAS_3.map((d) => `<div class="cal-dow">${d}</div>`).join('')}
          ${celdas.slice(0, semanas * 7).map((d) => {
            const k = iso(d);
            const evs = porDia[k] || [];
            const fest = evs.some((e) => e.tipo === 'festivo');
            const cls = verClases ? clasesDelDia(k) : [];
            return `<button class="cal-day ${d.getMonth() !== mes.getMonth() ? 'out' : ''} ${k === t ? 'today' : ''} ${k === sel ? 'sel' : ''} ${fest ? 'fest' : ''}" data-act="dia" data-d="${k}" aria-label="${fmtLong(k)}${cls.length ? `, ${cls.length} clases` : ''}${evs.length ? `, ${evs.length} eventos` : ''}">
              <span class="d">${d.getDate()}</span>
              ${cls.length ? `<span class="cal-strip" title="${cls.length} clases">${cls.map((c) => `<i style="--c:${store.asignatura(c.asignaturaId)?.color || '#6b7280'}"></i>`).join('')}</span><span class="cal-ncls">${cls.length} clase${cls.length > 1 ? 's' : ''}</span>` : ''}
              ${evs.slice(0, 3).map((e) => `<span class="cal-ev ${e.hecho ? 'done' : ''}" style="--c:${colorEv(e)}">${esc(e.titulo)}</span>`).join('')}
              ${evs.length > 3 ? `<span class="tiny muted">+${evs.length - 3} más</span>` : ''}
              <span class="cal-dots">${evs.slice(0, 4).map((e) => `<i style="--c:${colorEv(e)}"></i>`).join('')}</span>
            </button>`;
          }).join('')}
        </div>
      </div>
      <div class="stack">
        <div class="card">
          <div class="card-head"><h2 style="text-transform:none">${esc(fmtLong(sel))}</h2></div>
          <div class="row" style="margin:-4px 0 10px"><button class="btn sm" data-act="nueva-clase-dia">${icon('plus')} Clase este día</button><button class="btn sm" data-act="nuevo-dia">${icon('plus')} Entrega o evento</button></div>
          ${clasesSel.length ? `<div class="day-label" style="margin-top:6px">Clases</div><div class="list">${clasesSel.map((c) => {
            const a = store.asignatura(c.asignaturaId);
            return `<button class="item" data-act="edit-clase" data-id="${c.id}">
              <span class="stripe" style="background:${a?.color || 'var(--muted)'}"></span>
              <div class="grow"><div class="title">${esc(a?.nombre || 'Asignatura')}</div><div class="sub num">${c.inicio}–${c.fin}${c.aula ? ' · ' + esc(c.aula) : ''}${c.nota ? ' · ' + esc(c.nota) : ''}${esPuntual(c) ? ' · solo este día' : ''}</div></div>
              ${icon('edit')}</button>`;
          }).join('')}</div>` : ''}
          ${delDia.length ? `<div class="day-label" style="margin-top:12px">Entregas y eventos</div><div class="list">${delDia.map((e) => eventoItem(e, { showDate: false })).join('')}</div>` : ''}
          ${!clasesSel.length && !delDia.length ? `<p class="muted small">Nada este día.</p>` : ''}
        </div>
        <div class="card">
          <div class="card-head"><h2>Lo próximo</h2></div>
          ${proximos.length ? `<div class="list">${proximos.map((e) => eventoItem(e)).join('')}</div>` : `<p class="muted small">No hay entregas pendientes.</p>`}
        </div>
      </div>
    </div>
    <p class="muted tiny" style="margin-top:14px">Las barritas de colores de cada día son tus clases. "Exportar con avisos" genera un archivo .ics con tus entregas y exámenes pendientes (las clases se exportan desde Horario). Ábrelo en el iPhone y el Calendario te avisará el día antes y 2 horas antes.</p>`;

  root.onclick = (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const { act, id } = b.dataset;
    if (manejarEvento(act, id)) return;
    if (act === 'prev') { mes = new Date(mes.getFullYear(), mes.getMonth() - 1, 1); render(root); }
    if (act === 'next') { mes = new Date(mes.getFullYear(), mes.getMonth() + 1, 1); render(root); }
    if (act === 'hoy') { const d = new Date(); mes = new Date(d.getFullYear(), d.getMonth(), 1); sel = today(); render(root); }
    if (act === 'dia') {
      sel = b.dataset.d;
      const d = parseISO(sel);
      if (d.getMonth() !== mes.getMonth()) mes = new Date(d.getFullYear(), d.getMonth(), 1);
      render(root);
      if (window.innerWidth < 1060) document.querySelector('.grid-2 .stack')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (act === 'filtro') { filtro = b.dataset.v; render(root); }
    if (act === 'ver-clases') { verClases = !verClases; render(root); }
    if (act === 'nueva-clase') claseForm();
    if (act === 'nueva-clase-dia') claseForm({ fecha: sel, dia: dow(parseISO(sel)), modo: 'fechas' });
    if (act === 'edit-clase') claseForm(store.get('clases', id));
    if (act === 'nuevo') eventoForm();
    if (act === 'nuevo-dia') eventoForm({ fecha: sel });
    if (act === 'ics') descargar('entregas-campus.ics', icsEventos(), 'text/calendar');
  };
}

function colorEv(e) {
  if (e.tipo === 'festivo') return 'var(--warn)';
  return store.asignatura(e.asignaturaId)?.color || '#6b7280';
}
export { diffDays };
