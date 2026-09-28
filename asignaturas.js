// ============================================================
// Asignaturas: lista y ficha con pestañas
// ============================================================
import { esc, icon, linkify, today, DIAS, toMin, fmtShort } from './util.js';
import { horasSemana, lunesDe } from './clases.js';
import * as store from './store.js';
import { asignaturaForm, claseForm, eventoForm, eventoItem, manejarEvento, notaForm, calcularMedia } from './common.js';
import * as docs from './documentos.js';
import * as tests from './tests.js';

export function renderLista(root) {
  const lista = [...store.all('asignaturas')].sort((a, b) => a.nombre.localeCompare(b.nombre));
  const t = today();
  root.innerHTML = `
    <div class="page-head">
      <div><div class="eyebrow">2º curso</div><h1>Asignaturas</h1></div>
      <button class="btn primary" data-act="nueva">${icon('plus')} Nueva asignatura</button>
    </div>
    ${lista.length ? `<div class="cards">${lista.map((a) => {
      const pend = store.all('eventos').filter((e) => e.asignaturaId === a.id && !e.hecho && e.fecha >= t).length;
      const h = horasSemana(lunesDe(t), a.id);
      const { media } = calcularMedia(a.id);
      return `<a class="card subj-card" href="#/asignatura/${a.id}" style="--c:${a.color}">
        <span class="subj-abbr">${esc(a.abrev || '')}</span>
        <h3>${esc(a.nombre)}</h3>
        ${a.profesor ? `<span class="muted small">${esc(a.profesor)}</span>` : ''}
        <div class="subj-meta num">
          <span>${String(+h.toFixed(1)).replace('.', ',')} h esta semana</span>
          <span>${pend} pendiente${pend === 1 ? '' : 's'}</span>
          ${media != null ? `<span>Media ${media.toFixed(2).replace('.', ',')}</span>` : ''}
        </div>
      </a>`;
    }).join('')}</div>` : `<div class="empty"><h3>Aún no hay asignaturas</h3><p>Crea una por cada módulo de 2º: DWEC, DWES, DAW, DIW…</p><button class="btn primary" data-act="nueva">${icon('plus')} Crear la primera</button></div>`}`;
  root.onclick = (e) => { if (e.target.closest('[data-act="nueva"]')) asignaturaForm({}, (a) => (location.hash = `#/asignatura/${a.id}`)); };
}

const tabPorAsig = {};

export function renderDetalle(root, { id }) {
  const a = store.asignatura(id);
  if (!a) { root.innerHTML = `<div class="empty"><h3>Esta asignatura ya no existe</h3><a class="btn" href="#/asignaturas">Volver</a></div>`; root.onclick = null; return; }
  const tab = tabPorAsig[id] || 'resumen';
  const nDocs = store.all('documentos').filter((d) => d.asignaturaId === id).length;
  const nTests = store.all('tests').filter((d) => d.asignaturaId === id).length;
  const nNotas = store.all('notas').filter((d) => d.asignaturaId === id).length;

  root.innerHTML = `
    <a class="btn ghost sm" href="#/asignaturas" style="margin-bottom:10px">${icon('left')} Asignaturas</a>
    <div class="subj-hero" style="--c:${a.color}">
      <div class="row" style="align-items:flex-start">
        <div style="flex:1;min-width:0">
          <div class="subj-abbr">${esc(a.abrev || '')}</div>
          <h1 style="margin-top:4px">${esc(a.nombre)}</h1>
        </div>
        <button class="btn sm" data-act="editar">${icon('edit')} Editar</button>
      </div>
      <dl class="kv" style="margin-top:14px">
        ${a.profesor ? `<dt>Profesor/a</dt><dd>${esc(a.profesor)}</dd>` : ''}
        ${a.email ? `<dt>Correo</dt><dd><a href="mailto:${esc(a.email)}">${esc(a.email)}</a></dd>` : ''}
        ${a.aula ? `<dt>Aula</dt><dd>${esc(a.aula)}</dd>` : ''}
        ${a.enlace ? `<dt>Aula virtual</dt><dd><a href="${esc(a.enlace)}" target="_blank" rel="noopener">${esc(a.enlace.replace(/^https?:\/\//, ''))}</a></dd>` : ''}
      </dl>
    </div>
    <div class="tabs" role="tablist">
      ${[['resumen', 'Resumen'], ['documentos', `Documentos · ${nDocs}`], ['tests', `Tests · ${nTests}`], ['notas', `Notas · ${nNotas}`]].map(([k, l]) => `<button role="tab" class="${tab === k ? 'on' : ''}" data-act="tab" data-t="${k}">${l}</button>`).join('')}
    </div>
    <div id="tab-body">${cuerpo(a, tab)}</div>`;

  root.onclick = (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const { act } = b.dataset;
    if (manejarEvento(act, b.dataset.id)) return;
    if (docs.manejar(act, b.dataset, id)) return;
    if (tests.manejar(act, b.dataset, id)) return;
    if (act === 'tab') { tabPorAsig[id] = b.dataset.t; renderDetalle(root, { id }); }
    if (act === 'editar') asignaturaForm(a);
    if (act === 'nueva-entrega') eventoForm({ asignaturaId: id });
    if (act === 'nueva-clase') claseForm({ asignaturaId: id });
    if (act === 'edit-clase') claseForm(store.get('clases', b.dataset.id));
    if (act === 'nueva-nota') notaForm({ asignaturaId: id });
    if (act === 'edit-nota') notaForm(store.get('notas', b.dataset.id));
  };
  docs.activarDrop(root, id);
}

function cuerpo(a, tab) {
  const id = a.id;
  if (tab === 'documentos') return docs.listaHTML(id);
  if (tab === 'tests') return tests.listaHTML(id);
  if (tab === 'notas') return notasHTML(id);

  const t = today();
  const evs = store.all('eventos').filter((e) => e.asignaturaId === id).sort((x, y) => x.fecha.localeCompare(y.fecha));
  const futuras = evs.filter((e) => e.fecha >= t || !e.hecho);
  const pasadas = evs.filter((e) => e.fecha < t && e.hecho);
  const suyas = store.all('clases').filter((c) => c.asignaturaId === id);
  const semanales = suyas.filter((c) => !c.fecha).sort((x, y) => x.dia - y.dia || toMin(x.inicio) - toMin(y.inicio));
  const puntuales = suyas.filter((c) => c.fecha && c.fecha >= t).sort((x, y) => (x.fecha + x.inicio).localeCompare(y.fecha + y.inicio));
  const clasesPasadas = suyas.filter((c) => c.fecha && c.fecha < t).length;
  const clases = [...semanales, ...puntuales];
  return `<div class="grid-2">
    <div class="stack">
      <div class="card">
        <div class="card-head"><h2>Entregas y exámenes</h2><button class="btn sm" data-act="nueva-entrega">${icon('plus')} Añadir</button></div>
        ${futuras.length ? `<div class="list">${futuras.map((e) => eventoItem(e, { showAsig: false })).join('')}</div>` : `<p class="muted small">No hay nada pendiente.</p>`}
        ${pasadas.length ? `<details style="margin-top:10px"><summary class="muted small" style="cursor:pointer">${pasadas.length} ya entregadas</summary><div class="list">${pasadas.map((e) => eventoItem(e, { showAsig: false })).join('')}</div></details>` : ''}
      </div>
      <div class="card">
        <div class="card-head"><h2>Información</h2></div>
        ${a.info ? `<div class="prose">${linkify(a.info)}</div>` : `<p class="muted small">Guarda aquí criterios de evaluación, temario o normas. Pulsa Editar.</p>`}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><h2>Clases</h2><button class="btn sm" data-act="nueva-clase">${icon('plus')} Añadir</button></div>
      ${clases.length ? `<div class="list">${clases.map((c) => `<button class="item" data-act="edit-clase" data-id="${c.id}">
        <span class="stripe" style="background:${a.color}"></span>
        <div class="grow"><div class="title">${c.fecha ? fmtShort(c.fecha) : 'Cada ' + DIAS[c.dia].toLowerCase()}</div><div class="sub">${c.inicio}–${c.fin}${c.aula ? ' · ' + esc(c.aula) : ''}${c.nota ? ' · ' + esc(c.nota) : ''}</div></div>
        ${icon('edit')}
      </button>`).join('')}</div>` : `<p class="muted small">Sin clases próximas.</p>`}
      ${clasesPasadas ? `<p class="tiny muted" style="margin-top:8px">${clasesPasadas} clase${clasesPasadas > 1 ? 's' : ''} de fechas pasadas.</p>` : ''}
    </div>
  </div>`;
}

function notasHTML(id) {
  const { ns, peso, media, resta, necesita, acumulado } = calcularMedia(id);
  let aviso = '';
  if (resta > 0 && ns.length) {
    if (necesita <= 0) aviso = `Ya tienes el 5 asegurado aunque saques un 0 en lo que queda (${resta} %).`;
    else if (necesita > 10) aviso = `Con el ${resta} % que queda no llegas al 5 ni sacando un 10. Habla con tu profesor/a sobre la recuperación.`;
    else aviso = `Para aprobar necesitas una media de <b>${necesita.toFixed(2).replace('.', ',')}</b> en el ${resta} % que queda.`;
  }
  return `<div class="grid-2">
    <div class="card">
      <div class="card-head"><h2>Calificaciones</h2><button class="btn sm" data-act="nueva-nota">${icon('plus')} Añadir nota</button></div>
      ${ns.length ? `<div class="list">${ns.map((n) => `<button class="item" data-act="edit-nota" data-id="${n.id}">
        <div class="grow"><div class="title">${esc(n.titulo)}</div><div class="sub">Peso ${n.peso} %</div></div>
        <span class="num" style="font:800 20px var(--f-display);color:${n.nota >= 5 ? 'var(--ok)' : 'var(--bad)'}">${String(n.nota).replace('.', ',')}</span>
      </button>`).join('')}</div>` : `<p class="muted small">Apunta cada nota con su peso (%) y verás tu media ponderada.</p>`}
    </div>
    <div class="card">
      <div class="eyebrow">Media ponderada</div>
      <div class="grade-big ${media == null ? '' : media >= 5 ? 'ok' : 'bad'}">${media == null ? '—' : media.toFixed(2).replace('.', ',')}</div>
      <p class="small muted" style="margin-top:6px">${peso} % de la nota evaluado · llevas ${acumulado.toFixed(2).replace('.', ',')} puntos de 10</p>
      ${aviso ? `<p class="small" style="margin-top:12px">${aviso}</p>` : ''}
      <div class="pbar" style="margin-top:14px;--c:var(--pen)"><i style="width:${Math.min(100, peso)}%"></i></div>
    </div>
  </div>`;
}
