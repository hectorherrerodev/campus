// ============================================================
// Inicio: lo que está pasando ahora, próximas clases y entregas
// ============================================================
import { esc, icon, today, fmtLong, fmtShort, toMin, nowMin, diffDays, addDays, DIAS, dow, parseISO } from './util.js';
import * as store from './store.js';
import * as P from './progreso.js';
import { eventoItem, manejarEvento, eventoForm, claseForm, asignaturaForm, manejarClase, checkClase, etiquetaClase, repasoItem } from './common.js';
import { hayDemo, borrarDemo } from './demo.js';
import { clasesDelDia, proximosDias, festivo, esPuntual, pendientesDeVer } from './clases.js';

const DIAS_ENTREGAS = 30;

/** "Hoy", "Mañana" o "Miércoles 30 sep". */
function nombreDia(fecha) {
  const n = diffDays(today(), fecha);
  if (n === 0) return 'Hoy';
  if (n === 1) return 'Mañana';
  const d = parseISO(fecha);
  return `${DIAS[dow(d)]} ${fmtShort(fecha).split(' ').slice(1).join(' ')}`;
}

export function render(root) {
  const t = today();
  const ahora = nowMin();
  const hoyClases = clasesDelDia(t);
  const actual = hoyClases.find((c) => toMin(c.inicio) <= ahora && ahora < toMin(c.fin));
  const proximos = proximosDias(2, 60, { hoyEntero: true });
  const porVer = pendientesDeVer();
  const porVerHoy = porVer.filter((x) => x.repasarEl && x.repasarEl <= t).length;
  const siguienteBusqueda = proximosDias(3);
  const siguiente = siguienteBusqueda.flatMap((d) => d.clases.map((c) => ({ ...c, _fecha: d.fecha }))).find((c) => c !== actual && !(c._fecha === t && toMin(c.inicio) <= ahora));

  const eventos = store.all('eventos').filter((e) => e.tipo !== 'festivo');
  const pendientes = eventos.filter((e) => !e.hecho && diffDays(t, e.fecha) <= DIAS_ENTREGAS).sort((a, b) => (a.fecha + (a.hora || '')).localeCompare(b.fecha + (b.hora || '')));
  const vencidas = pendientes.filter((e) => e.fecha < t).length;
  const estaSemana = pendientes.filter((e) => e.fecha >= t && diffDays(t, e.fecha) < 7).length;
  const proxFestivo = store.all('eventos').filter((e) => e.tipo === 'festivo' && e.fecha >= t).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  const hora = new Date().getHours();
  const saludo = hora < 14 ? 'Buenos días' : hora < 21 ? 'Buenas tardes' : 'Buenas noches';

  root.innerHTML = `
    ${hayDemo() ? `<div class="banner"><b>Datos de ejemplo.</b><span>Así se ve la app con un curso de 2º DAW. Bórralos cuando quieras meter los tuyos.</span><span class="spacer"></span><button class="btn sm" data-act="borrar-demo">Borrar ejemplo</button></div>` : ''}
    <div class="page-head">
      <div><div class="eyebrow">${esc(fmtLong(t))} · ${saludo}</div><h1>Inicio</h1></div>
      <div class="row">
        <button class="btn" data-act="nueva-clase">${icon('plus')} Clase</button>
        <button class="btn primary" data-act="nueva-entrega">${icon('plus')} Entrega</button>
      </div>
    </div>

    ${!store.all('asignaturas').length ? `
      <div class="empty" style="margin-bottom:22px">
        <h3>Empieza por tus asignaturas</h3>
        <p>Crea las asignaturas de 2º, luego añade tus clases y las fechas de entrega.</p>
        <button class="btn primary" data-act="nueva-asig">${icon('plus')} Añadir asignatura</button>
      </div>` : ''}

    <div class="hoy-top">
      <div class="stack">
        ${ahoraCard(actual, siguiente, hoyClases, festivo(t))}
        ${porVer.length ? `<div class="card">
          <div class="card-head"><h2>Clases por ver</h2>${porVerHoy ? `<span class="tag festivo">${porVerHoy} para hoy</span>` : ''}</div>
          <div class="list">${porVer.slice(0, 6).map(repasoItem).join('')}</div>
          ${porVer.length > 6 ? `<p class="tiny muted" style="margin-top:6px">Y ${porVer.length - 6} más.</p>` : ''}
        </div>` : ''}
        <div class="card">
          <div class="card-head"><h2>Próximas clases</h2><a class="btn ghost sm" href="#/horario">Ver semana ${icon('right')}</a></div>
          ${proximos.length ? proximos.map((d) => `
            <div class="day-group">
              <div class="day-label ${d.fecha === t ? 'today' : ''}">${nombreDia(d.fecha)}</div>
              <div class="timeline">${d.clases.map((c) => claseFila(c, d.fecha, c === actual)).join('')}</div>
            </div>`).join('') : `<p class="muted">No tienes clases en las próximas semanas. Añádelas desde el Horario.</p>`}
          ${proxFestivo && diffDays(t, proxFestivo.fecha) <= 21 ? `<p class="small muted" style="margin-top:14px">Próximo festivo: <b>${esc(proxFestivo.titulo)}</b>, ${nombreDia(proxFestivo.fecha).toLowerCase()}.</p>` : ''}
        </div>
      </div>

      <div class="stack">
        <div class="card">
          <div class="card-head"><h2>Próximas entregas</h2>${vencidas ? `<span class="tag examen">${vencidas} vencida${vencidas > 1 ? 's' : ''}</span>` : estaSemana ? `<span class="tag entrega">${estaSemana} esta semana</span>` : ''}</div>
          ${pendientes.length ? `<div class="list">${pendientes.slice(0, 8).map((e) => eventoItem(e)).join('')}</div>` : `<p class="muted">Nada pendiente en el próximo mes.</p>`}
          <a class="btn ghost sm" href="#/calendario" style="margin-top:8px">Ver calendario ${icon('right')}</a>
        </div>
        ${academiaCard()}
      </div>
    </div>`;

  root.onclick = (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const { act, id } = b.dataset;
    if (manejarEvento(act, id)) return;
    if (manejarClase(act, b.dataset)) return;
    if (act === 'nueva-entrega') eventoForm();
    if (act === 'nueva-clase') claseForm({ dia: dow() < 5 ? dow() : 0, fecha: t });
    if (act === 'edit-clase') claseForm(store.get('clases', id));
    if (act === 'nueva-asig') asignaturaForm();
    if (act === 'borrar-demo') borrarDemo();
  };
}

function claseFila(c, fecha, esAhora) {
  const a = store.asignatura(c.asignaturaId);
  const pasada = fecha === today() && toMin(c.fin) <= nowMin();
  return `<div class="tl-item ${esAhora ? 'now' : ''} ${pasada ? 'past' : ''}">
    <span class="t">${c.inicio}</span><span class="b" style="background:${a?.color || 'var(--muted)'}"></span>
    <button data-act="clase" data-id="${c.id}" data-fecha="${fecha}" style="background:none;border:0;text-align:left;cursor:pointer;color:inherit;padding:0;min-width:0">
      <div class="n">${esc(a?.nombre || 'Asignatura')}${esAhora ? ' <span class="tag entrega">Ahora</span>' : ''}</div>
      <div class="muted small">${c.inicio}–${c.fin}${c.aula ? ' · ' + esc(c.aula) : ''}${c.nota ? ' · ' + esc(c.nota) : ''}${esPuntual(c) ? ' · solo este día' : ''} ${etiquetaClase(c, fecha)}</div>
    </button>
    ${checkClase(c, fecha)}
  </div>`;
}

function ahoraCard(actual, siguiente, hoyClases, fest) {
  if (actual) {
    const a = store.asignatura(actual.asignaturaId);
    const pct = Math.round(((nowMin() - toMin(actual.inicio)) / (toMin(actual.fin) - toMin(actual.inicio))) * 100);
    const sigHoy = siguiente && siguiente._fecha === today() ? siguiente : null;
    return `<div class="card now-card"><div class="eyebrow">Ahora en clase · quedan ${toMin(actual.fin) - nowMin()} min</div>
      <h2>${esc(a?.nombre || '')}</h2><p class="meta">${actual.inicio}–${actual.fin}${actual.aula ? ' · ' + esc(actual.aula) : ''}${sigHoy ? ` · Después: ${esc(store.asignatura(sigHoy.asignaturaId)?.abrev || '')} a las ${sigHoy.inicio}` : ''}</p>
      <div class="bar"><i style="width:${pct}%"></i></div></div>`;
  }
  if (siguiente) {
    const a = store.asignatura(siguiente.asignaturaId);
    const esHoy = siguiente._fecha === today();
    const falta = toMin(siguiente.inicio) - nowMin();
    const cuando = esHoy ? (falta < 60 ? `en ${falta} min` : `hoy a las ${siguiente.inicio}`) : `${nombreDia(siguiente._fecha).toLowerCase()} a las ${siguiente.inicio}`;
    const pre = fest ? `Hoy es festivo (${esc(fest.titulo)})` : !esHoy && hoyClases.length ? 'Clases terminadas por hoy' : !esHoy ? 'Hoy no tienes clase' : 'Siguiente clase';
    return `<div class="card now-card"><div class="eyebrow">${pre} · ${!esHoy ? 'Próxima: ' : ''}${cuando}</div>
      <h2>${esc(a?.nombre || '')}</h2><p class="meta">${siguiente.inicio}–${siguiente.fin}${siguiente.aula ? ' · ' + esc(siguiente.aula) : ''}</p></div>`;
  }
  return `<div class="card now-card"><div class="eyebrow">Sin clases próximas</div><h2>Añade tus clases</h2><p class="meta">Con el horario puesto, aquí verás siempre qué te toca ahora y qué viene después.</p></div>`;
}

function academiaCard() {
  const meta = store.state.ajustes.metaXP || 30;
  const xp = P.xpHoy();
  const pct = Math.min(1, xp / meta);
  const r = 32, C = 2 * Math.PI * r;
  const cid = store.state.progreso.ultimoCurso || 'html';
  const c = P.curso(cid) || P.cursos()[0];
  const sig = c && P.siguiente(c);
  return `<div class="card">
    <div class="card-head"><h2>Academia</h2><div class="stat-row small">
      <span class="stat">${icon('flame', 'flame')} ${P.racha()}</span>
      <span class="stat">${icon('heart', 'heart')} ${P.vidas()}</span>
    </div></div>
    <div class="streak-card">
      <div class="ring"><svg viewBox="0 0 76 76"><circle cx="38" cy="38" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="8"/><circle cx="38" cy="38" r="${r}" fill="none" stroke="${pct >= 1 ? 'var(--ok)' : 'var(--pen)'}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/></svg>
        <div class="lbl"><div>${xp}<small>/ ${meta} XP</small></div></div></div>
      <div class="stack" style="gap:8px">
        <p class="small muted">${pct >= 1 ? 'Meta diaria cumplida. La racha sigue viva.' : `Te faltan ${meta - xp} XP para la meta de hoy.`}</p>
        ${sig ? `<a class="btn primary" href="#/leccion/${c.id}/${sig.id}" style="white-space:normal;text-align:left">${icon('play')} ${esc(c.nombre)}: ${esc(sig.titulo)}</a>` : `<a class="btn primary" href="#/academia">Elegir curso</a>`}
      </div>
    </div>
  </div>`;
}
export { addDays };
