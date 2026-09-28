// ============================================================
// Pantalla "Hoy": clases del día, entregas cercanas y la Academia
// ============================================================
import { esc, icon, today, fmtLong, dow, toMin, nowMin, diffDays, DIAS } from './util.js';
import * as store from './store.js';
import * as P from './progreso.js';
import { eventoItem, manejarEvento, eventoForm, claseForm, asignaturaForm } from './common.js';
import { hayDemo, borrarDemo } from './demo.js';

export function render(root) {
  const t = today();
  const d = dow();
  const clases = store.all('clases').filter((c) => c.dia === d).sort((a, b) => toMin(a.inicio) - toMin(b.inicio));
  const ahora = nowMin();
  const actual = clases.find((c) => toMin(c.inicio) <= ahora && ahora < toMin(c.fin));
  const proxima = clases.find((c) => toMin(c.inicio) > ahora);
  const eventos = store.all('eventos').filter((e) => e.tipo !== 'festivo');
  const pendientes = eventos.filter((e) => !e.hecho && diffDays(t, e.fecha) <= 14).sort((a, b) => (a.fecha + (a.hora || '')).localeCompare(b.fecha + (b.hora || '')));
  const vencidas = pendientes.filter((e) => e.fecha < t).length;
  const festivoHoy = store.all('eventos').find((e) => e.tipo === 'festivo' && e.fecha === t);
  const hora = new Date().getHours();
  const saludo = hora < 14 ? 'Buenos días' : hora < 21 ? 'Buenas tardes' : 'Buenas noches';

  root.innerHTML = `
    ${hayDemo() ? `<div class="banner"><b>Datos de ejemplo.</b><span>Así se ve la app con un curso de 2º DAW. Bórralos cuando quieras meter los tuyos.</span><span class="spacer"></span><button class="btn sm" data-act="borrar-demo">Borrar ejemplo</button></div>` : ''}
    <div class="page-head">
      <div><div class="eyebrow">${esc(fmtLong(t))}</div><h1>${saludo}</h1></div>
      <div class="row">
        <button class="btn" data-act="nueva-clase">${icon('plus')} Clase</button>
        <button class="btn primary" data-act="nueva-entrega">${icon('plus')} Entrega</button>
      </div>
    </div>

    ${!store.all('asignaturas').length ? `
      <div class="empty" style="margin-bottom:22px">
        <h3>Empieza por tus asignaturas</h3>
        <p>Crea las asignaturas de 2º, luego añade tu horario y las fechas de entrega.</p>
        <button class="btn primary" data-act="nueva-asig">${icon('plus')} Añadir asignatura</button>
      </div>` : ''}

    <div class="hoy-top">
      <div class="stack">
        ${ahoraCard(actual, proxima, clases, festivoHoy)}
        <div class="card">
          <div class="card-head"><h2>Clases de hoy</h2><a class="btn ghost sm" href="#/horario">Horario ${icon('right')}</a></div>
          ${clases.length ? `<div class="timeline">${clases.map((c) => {
            const a = store.asignatura(c.asignaturaId);
            const past = toMin(c.fin) <= ahora;
            const now = c === actual;
            return `<div class="tl-item ${past ? 'past' : ''} ${now ? 'now' : ''}">
              <span class="t">${c.inicio}</span><span class="b" style="background:${a?.color || 'var(--muted)'}"></span>
              <div><div class="n">${esc(a?.nombre || 'Asignatura')}</div><div class="muted small">${c.inicio}–${c.fin}${c.aula ? ' · ' + esc(c.aula) : ''}${c.nota ? ' · ' + esc(c.nota) : ''}</div></div>
            </div>`;
          }).join('')}</div>` : `<p class="muted">${d >= 5 ? 'Fin de semana: hoy no hay clases.' : 'No tienes clases en el horario para hoy.'}</p>`}
        </div>
      </div>

      <div class="stack">
        ${academiaCard()}
        <div class="card">
          <div class="card-head"><h2>Próximas entregas</h2>${vencidas ? `<span class="tag examen">${vencidas} vencida${vencidas > 1 ? 's' : ''}</span>` : ''}</div>
          ${pendientes.length ? `<div class="list">${pendientes.slice(0, 8).map((e) => eventoItem(e)).join('')}</div>` : `<p class="muted">Nada pendiente en las próximas dos semanas.</p>`}
          <a class="btn ghost sm" href="#/calendario" style="margin-top:8px">Ver calendario ${icon('right')}</a>
        </div>
      </div>
    </div>`;

  root.onclick = (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const { act, id } = b.dataset;
    if (manejarEvento(act, id)) return;
    if (act === 'nueva-entrega') eventoForm();
    if (act === 'nueva-clase') claseForm({ dia: d < 5 ? d : 0 });
    if (act === 'nueva-asig') asignaturaForm();
    if (act === 'borrar-demo') borrarDemo();
  };
}

function ahoraCard(actual, proxima, clases, festivo) {
  if (festivo) return `<div class="card now-card"><div class="eyebrow">Hoy es festivo</div><h2>${esc(festivo.titulo)}</h2><p class="meta">Día no lectivo. Buen momento para adelantar entregas.</p></div>`;
  if (actual) {
    const a = store.asignatura(actual.asignaturaId);
    const pct = Math.round(((nowMin() - toMin(actual.inicio)) / (toMin(actual.fin) - toMin(actual.inicio))) * 100);
    return `<div class="card now-card"><div class="eyebrow">Ahora en clase · quedan ${toMin(actual.fin) - nowMin()} min</div>
      <h2>${esc(a?.nombre || '')}</h2><p class="meta">${actual.inicio}–${actual.fin}${actual.aula ? ' · ' + esc(actual.aula) : ''}${proxima ? ` · Después: ${esc(store.asignatura(proxima.asignaturaId)?.abrev || '')} a las ${proxima.inicio}` : ''}</p>
      <div class="bar"><i style="width:${pct}%"></i></div></div>`;
  }
  if (proxima) {
    const a = store.asignatura(proxima.asignaturaId);
    const falta = toMin(proxima.inicio) - nowMin();
    return `<div class="card now-card"><div class="eyebrow">Siguiente clase · ${falta < 60 ? `en ${falta} min` : `a las ${proxima.inicio}`}</div>
      <h2>${esc(a?.nombre || '')}</h2><p class="meta">${proxima.inicio}–${proxima.fin}${proxima.aula ? ' · ' + esc(proxima.aula) : ''}</p></div>`;
  }
  // Busca la primera clase del siguiente día lectivo
  const todas = store.all('clases');
  for (let i = 1; i <= 7; i++) {
    const dd = (dow() + i) % 7;
    const cs = todas.filter((c) => c.dia === dd).sort((a, b) => toMin(a.inicio) - toMin(b.inicio));
    if (cs.length) {
      const a = store.asignatura(cs[0].asignaturaId);
      return `<div class="card now-card"><div class="eyebrow">${clases.length ? 'Clases terminadas por hoy' : 'Sin clases hoy'} · Próxima: ${i === 1 ? 'mañana' : DIAS[dd].toLowerCase()}</div>
        <h2>${esc(a?.nombre || '')}</h2><p class="meta">${cs[0].inicio}–${cs[0].fin}${cs[0].aula ? ' · ' + esc(cs[0].aula) : ''} · ${cs.length} clases ese día</p></div>`;
    }
  }
  return `<div class="card now-card"><div class="eyebrow">Horario vacío</div><h2>Añade tus clases</h2><p class="meta">Con el horario puesto, aquí verás siempre qué te toca ahora.</p></div>`;
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
        ${sig ? `<a class="btn primary" href="#/leccion/${c.id}/${sig.id}">${icon('play')} ${esc(c.nombre)}: ${esc(sig.titulo)}</a>` : `<a class="btn primary" href="#/academia">Elegir curso</a>`}
      </div>
    </div>
  </div>`;
}
