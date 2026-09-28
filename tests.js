// ============================================================
// Tests de repaso: crear, importar (JSON), hacer y ver resultados
// ============================================================
import { esc, icon, modal, toast, shuffle, fmtShort, iso, copiar, confirmar } from './util.js';
import * as store from './store.js';
import { asigOptions, nombreCorto } from './common.js';

let filtroAsig = '';

export function renderLista(root) {
  root.innerHTML = `
    <div class="page-head">
      <div><div class="eyebrow">Repaso</div><h1>Tests</h1></div>
      <div class="row">
        <button class="btn" data-act="importar">${icon('upload')} Importar</button>
        <a class="btn primary" href="#/test-editar/nuevo">${icon('plus')} Crear test</a>
      </div>
    </div>
    <div class="chips" style="margin-bottom:14px">
      <button class="chip ${!filtroAsig ? 'on' : ''}" data-act="fasig" data-v="">Todas</button>
      ${store.all('asignaturas').map((a) => `<button class="chip ${filtroAsig === a.id ? 'on' : ''}" data-act="fasig" data-v="${a.id}"><span class="sw" style="background:${a.color}"></span>${esc(a.abrev || a.nombre)}</button>`).join('')}
    </div>
    ${listaHTML(filtroAsig || null, false)}
    <div class="card section">
      <div class="card-head"><h2>Genera tests con IA a partir de tus apuntes</h2></div>
      <p class="small muted">Copia esta instrucción, pégala en Claude junto a tus apuntes (o un PDF) y pega aquí el resultado con "Importar".</p>
      <div class="row" style="margin-top:10px"><button class="btn" data-act="prompt">${icon('copy')} Copiar instrucción</button></div>
    </div>`;
  root.onclick = (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'fasig') { filtroAsig = b.dataset.v; renderLista(root); return; }
    manejar(b.dataset.act, b.dataset, filtroAsig);
  };
}

export function listaHTML(asigId, conBotones = true) {
  const ts = store.all('tests').filter((t) => !asigId || t.asignaturaId === asigId).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  const head = conBotones ? `<div class="row" style="margin-bottom:12px"><a class="btn primary sm" href="#/test-editar/nuevo${asigId ? '?' + asigId : ''}">${icon('plus')} Crear test</a><button class="btn sm" data-act="importar">${icon('upload')} Importar</button></div>` : '';
  if (!ts.length) return `${head}<div class="empty"><h3>Sin tests</h3><p>Crea preguntas tipo test para repasar antes de los exámenes, o impórtalas generadas con IA.</p></div>`;
  return `${head}<div class="cards">${ts.map((t) => {
    const ints = store.all('intentos').filter((i) => i.testId === t.id).sort((a, b) => b.fecha.localeCompare(a.fecha) || (b.createdAt - a.createdAt));
    const mejor = ints.length ? Math.max(...ints.map((i) => Math.round((i.aciertos / i.total) * 100))) : null;
    const a = store.asignatura(t.asignaturaId);
    return `<div class="card stack" style="gap:8px">
      <div class="row"><span class="subj-abbr" style="--c:${a?.color || 'var(--muted)'};color:var(--c)">${esc(a?.abrev || 'General')}</span><span class="spacer"></span><span class="muted tiny num">${t.preguntas.length} preguntas</span></div>
      <h3>${esc(t.titulo)}</h3>
      <p class="small muted num">${ints.length ? `Mejor: ${mejor} % · último: ${Math.round((ints[0].aciertos / ints[0].total) * 100)} % (${fmtShort(ints[0].fecha)})` : 'Aún no lo has hecho'}</p>
      ${mejor != null ? `<div class="pbar" style="--c:${mejor >= 50 ? 'var(--ok)' : 'var(--bad)'}"><i style="width:${mejor}%"></i></div>` : ''}
      <div class="row" style="margin-top:4px"><a class="btn primary sm" href="#/test/${t.id}">${icon('play')} Hacer test</a><a class="btn sm" href="#/test-editar/${t.id}">${icon('edit')} Editar</a></div>
    </div>`;
  }).join('')}</div>`;
}

export function manejar(act, ds, asigId) {
  if (act === 'importar') { importarModal(asigId); return true; }
  if (act === 'prompt') { copiar(PROMPT); return true; }
  return false;
}

// ---------- Importar ----------
const EJEMPLO = `{
  "titulo": "Tema 3: eventos del DOM",
  "asignatura": "DWEC",
  "preguntas": [
    {
      "pregunta": "¿Qué método registra un manejador de eventos?",
      "opciones": ["addEventListener", "onEvent", "attachHandler", "listen"],
      "correcta": 0,
      "explicacion": "addEventListener(tipo, función) es el método estándar."
    }
  ]
}`;
export const PROMPT = `Crea un test de repaso a partir de los apuntes que te paso. Devuélvelo SOLO como JSON válido, sin texto antes ni después, con este formato exacto:
${EJEMPLO}
Reglas: entre 10 y 20 preguntas; 4 opciones por pregunta; "correcta" es el índice (empezando en 0) de la opción buena; mezcla la posición de la respuesta correcta; "explicacion" en una frase; en "asignatura" pon la abreviatura del módulo (por ejemplo DWEC, DWES, DAW, DIW). Escribe en español.`;

function importarModal(asigId = '') {
  const m = modal({
    title: 'Importar test',
    body: `<p class="small muted">Pega el JSON de uno o varios tests (un objeto o una lista). Si viene de una IA con texto alrededor, no pasa nada: busco el JSON dentro.</p>
      <label class="field"><span>Asignatura por defecto</span><select class="input" id="imp-asig">${asigOptions(true).map(([v, t]) => `<option value="${v}" ${v === asigId ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
      <label class="field"><span>JSON</span><textarea class="input code" id="imp-json" placeholder='${esc(EJEMPLO)}'></textarea></label>
      <input type="file" id="imp-file" accept=".json,application/json" hidden>
      <div class="row"><button class="btn sm" data-file>${icon('upload')} Cargar archivo .json</button><button class="btn sm" data-prompt>${icon('copy')} Copiar instrucción para IA</button></div>`,
    foot: `<span class="spacer"></span><button class="btn" data-c>Cancelar</button><button class="btn primary" data-ok>Importar</button>`,
  });
  const ta = m.el.querySelector('#imp-json');
  const fi = m.el.querySelector('#imp-file');
  m.el.querySelector('[data-c]').onclick = m.close;
  m.el.querySelector('[data-file]').onclick = () => fi.click();
  m.el.querySelector('[data-prompt]').onclick = () => copiar(PROMPT);
  fi.onchange = async () => { if (fi.files[0]) ta.value = await fi.files[0].text(); };
  m.el.querySelector('[data-ok]').onclick = () => {
    try {
      const n = importar(ta.value, m.el.querySelector('#imp-asig').value);
      toast(n === 1 ? 'Test importado' : `${n} tests importados`);
      m.close();
    } catch (e) { toast(e.message); }
  };
}

export function importar(texto, asigDefecto = '') {
  let raw = texto.trim();
  const i = raw.search(/[[{]/);
  const j = Math.max(raw.lastIndexOf('}'), raw.lastIndexOf(']'));
  if (i < 0 || j < i) throw new Error('No encuentro ningún JSON');
  let data;
  try { data = JSON.parse(raw.slice(i, j + 1)); } catch { throw new Error('El JSON tiene un error de formato'); }
  const lista = Array.isArray(data) ? data : data.tests || [data];
  let n = 0;
  for (const t of lista) {
    if (!t || !Array.isArray(t.preguntas) || !t.preguntas.length) continue;
    const asig = t.asignatura ? store.all('asignaturas').find((a) => [a.abrev, a.nombre].some((x) => x && x.toLowerCase() === String(t.asignatura).toLowerCase())) : null;
    const preguntas = t.preguntas.map((p) => {
      const opciones = (p.opciones || p.options || []).map(String);
      let correcta = p.correcta ?? p.respuesta ?? p.answer ?? 0;
      if (typeof correcta === 'string' && !/^\d+$/.test(correcta)) correcta = Math.max(0, opciones.indexOf(correcta));
      return { pregunta: String(p.pregunta || p.question || ''), opciones, correcta: Number(correcta), explicacion: String(p.explicacion || p.explanation || '') };
    }).filter((p) => p.pregunta && p.opciones.length >= 2 && p.correcta < p.opciones.length);
    if (!preguntas.length) continue;
    store.put('tests', { titulo: String(t.titulo || t.title || 'Test importado'), asignaturaId: asig?.id || asigDefecto || '', preguntas }, { silent: true });
    n++;
  }
  if (!n) throw new Error('No hay preguntas válidas (cada una necesita "pregunta", "opciones" y "correcta")');
  store.emit();
  return n;
}

// ---------- Editor ----------
let borrador = null;

export function renderEditor(root, { id }) {
  const [tid, asigQ] = id.split('?');
  if (!borrador || borrador._for !== tid) {
    const t = tid === 'nuevo' ? null : store.get('tests', tid);
    borrador = t ? JSON.parse(JSON.stringify(t)) : { titulo: '', asignaturaId: asigQ || '', preguntas: [{ pregunta: '', opciones: ['', '', '', ''], correcta: 0, explicacion: '' }] };
    borrador._for = tid;
  }
  const b = borrador;
  root.innerHTML = `
    <a class="btn ghost sm" href="#/tests" style="margin-bottom:10px">${icon('left')} Tests</a>
    <div class="page-head"><h1>${tid === 'nuevo' ? 'Nuevo test' : 'Editar test'}</h1>
      <div class="row">${tid !== 'nuevo' ? `<button class="btn danger" data-act="borrar">${icon('trash')} Eliminar</button>` : ''}<button class="btn primary" data-act="guardar">${icon('check')} Guardar</button></div></div>
    <div class="form-grid" style="margin-bottom:18px">
      <label class="field"><span>Título *</span><input class="input" id="t-titulo" value="${esc(b.titulo)}" placeholder="Tema 2: funciones"></label>
      <label class="field"><span>Asignatura</span><select class="input" id="t-asig">${asigOptions(true).map(([v, t]) => `<option value="${v}" ${v === b.asignaturaId ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
    </div>
    <div class="stack" id="q-list">${b.preguntas.map((p, i) => `
      <div class="q-editor" data-i="${i}">
        <div class="row"><b>Pregunta ${i + 1}</b><span class="spacer"></span><button class="btn ghost sm danger" data-act="quitar-p" data-i="${i}" ${b.preguntas.length < 2 ? 'disabled' : ''}>${icon('trash')}</button></div>
        <textarea class="input" data-k="pregunta" rows="2" placeholder="Escribe la pregunta">${esc(p.pregunta)}</textarea>
        <div class="stack" style="gap:8px">${p.opciones.map((o, k) => `<div class="q-opt">
          <input type="radio" name="c-${i}" data-k="correcta" value="${k}" ${p.correcta === k ? 'checked' : ''} aria-label="Marcar como correcta">
          <input class="input" data-k="op" data-o="${k}" value="${esc(o)}" placeholder="Opción ${k + 1}">
          ${p.opciones.length > 2 ? `<button class="btn ghost icon" data-act="quitar-o" data-i="${i}" data-o="${k}" aria-label="Quitar opción">${icon('x')}</button>` : ''}
        </div>`).join('')}</div>
        <div class="row">${p.opciones.length < 6 ? `<button class="btn sm" data-act="mas-o" data-i="${i}">${icon('plus')} Opción</button>` : ''}<span class="muted tiny">Marca el círculo de la respuesta correcta</span></div>
        <input class="input" data-k="explicacion" value="${esc(p.explicacion)}" placeholder="Explicación (opcional): por qué es la correcta">
      </div>`).join('')}</div>
    <div class="row" style="margin-top:14px"><button class="btn" data-act="mas-p">${icon('plus')} Añadir pregunta</button><span class="spacer"></span><button class="btn primary" data-act="guardar">${icon('check')} Guardar test</button></div>`;

  const leer = () => {
    b.titulo = root.querySelector('#t-titulo').value;
    b.asignaturaId = root.querySelector('#t-asig').value;
    root.querySelectorAll('.q-editor').forEach((el) => {
      const p = b.preguntas[Number(el.dataset.i)];
      p.pregunta = el.querySelector('[data-k="pregunta"]').value;
      p.explicacion = el.querySelector('[data-k="explicacion"]').value;
      el.querySelectorAll('[data-k="op"]').forEach((o) => (p.opciones[Number(o.dataset.o)] = o.value));
      const c = el.querySelector('[data-k="correcta"]:checked');
      p.correcta = c ? Number(c.value) : 0;
    });
  };
  root.oninput = leer;
  root.onchange = leer;
  root.onclick = async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    leer();
    const i = Number(btn.dataset.i);
    const { act } = btn.dataset;
    if (act === 'mas-p') { b.preguntas.push({ pregunta: '', opciones: ['', '', '', ''], correcta: 0, explicacion: '' }); renderEditor(root, { id }); root.querySelector('.q-editor:last-child textarea')?.focus(); }
    if (act === 'quitar-p') { b.preguntas.splice(i, 1); renderEditor(root, { id }); }
    if (act === 'mas-o') { b.preguntas[i].opciones.push(''); renderEditor(root, { id }); }
    if (act === 'quitar-o') { const p = b.preguntas[i]; const o = Number(btn.dataset.o); p.opciones.splice(o, 1); if (p.correcta >= o && p.correcta > 0) p.correcta--; renderEditor(root, { id }); }
    if (act === 'borrar') {
      if (await confirmar('Se borrará el test y su historial de intentos.')) {
        store.all('intentos').filter((x) => x.testId === tid).forEach((x) => store.remove('intentos', x.id, { silent: true }));
        store.remove('tests', tid); borrador = null; location.hash = '#/tests';
      }
    }
    if (act === 'guardar') {
      if (!b.titulo.trim()) { toast('Ponle un título al test'); return; }
      const preguntas = b.preguntas.map((p) => {
        const ops = p.opciones.map((o) => o.trim());
        const correctaTxt = ops[p.correcta];
        const limpias = ops.filter(Boolean);
        return { pregunta: p.pregunta.trim(), opciones: limpias, correcta: Math.max(0, limpias.indexOf(correctaTxt)), explicacion: p.explicacion.trim() };
      }).filter((p) => p.pregunta && p.opciones.length >= 2);
      if (!preguntas.length) { toast('Añade al menos una pregunta con dos opciones'); return; }
      const { _for, ...resto } = b;
      const rec = store.put('tests', { ...resto, titulo: b.titulo.trim(), preguntas });
      borrador = null;
      toast('Test guardado');
      location.hash = `#/test/${rec.id}`;
    }
  };
}

// ---------- Hacer un test ----------
let partida = null;

export function renderJugar(root, { id }) {
  const t = store.get('tests', id);
  if (!t) { root.innerHTML = `<div class="empty"><h3>Test no encontrado</h3><a class="btn" href="#/tests">Volver</a></div>`; root.onclick = null; return; }
  if (!partida || partida.id !== id) partida = nueva(t);
  const pt = partida;
  const salir = `<a class="btn ghost icon" href="${t.asignaturaId ? '#/asignatura/' + t.asignaturaId : '#/tests'}" aria-label="Salir" data-act="salir">${icon('x')}</a>`;

  if (pt.i >= pt.orden.length) {
    const aciertos = pt.resp.filter((r) => r.ok).length;
    const total = pt.resp.length;
    const pct = Math.round((aciertos / total) * 100);
    if (!pt.guardado) { store.put('intentos', { testId: id, fecha: iso(new Date()), aciertos, total }, { silent: true }); pt.guardado = true; }
    const falladas = pt.resp.filter((r) => !r.ok);
    root.innerHTML = `<div class="player"><div class="player-top">${salir}<span class="spacer"></span></div>
      <div class="q-card stack" style="gap:18px">
        <div class="eyebrow">${esc(t.titulo)}</div>
        <div class="row" style="align-items:flex-end;gap:16px"><div class="grade-big ${pct >= 50 ? 'ok' : 'bad'}">${pct} %</div><p class="muted">${aciertos} de ${total} correctas · nota ${(aciertos / total * 10).toFixed(1).replace('.', ',')}</p></div>
        <div class="row">
          <button class="btn primary" data-act="repetir">${icon('refresh')} Repetir</button>
          ${falladas.length ? `<button class="btn" data-act="falladas">Repetir solo las ${falladas.length} falladas</button>` : ''}
          <a class="btn ghost" href="#/tests">Todos los tests</a>
        </div>
        ${falladas.length ? `<div class="card"><h2 style="margin-bottom:10px">Repasa tus fallos</h2><div class="list">${falladas.map((r) => {
          const p = t.preguntas[r.q];
          return `<div class="item" style="align-items:flex-start"><div class="grow"><div class="title">${esc(p.pregunta)}</div>
            <div class="sub" style="color:var(--bad)">Tu respuesta: ${esc(p.opciones[r.elegida])}</div>
            <div class="sub" style="color:var(--ok)">Correcta: ${esc(p.opciones[p.correcta])}</div>
            ${p.explicacion ? `<div class="sub">${esc(p.explicacion)}</div>` : ''}</div></div>`;
        }).join('')}</div></div>` : `<p>Todo perfecto: ninguna fallada.</p>`}
      </div></div>`;
    root.onclick = (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'repetir') { partida = nueva(t); renderJugar(root, { id }); }
      if (b.dataset.act === 'falladas') { partida = nueva(t, falladas.map((r) => r.q)); renderJugar(root, { id }); }
      if (b.dataset.act === 'salir') partida = null;
    };
    return;
  }

  const qi = pt.orden[pt.i];
  const p = t.preguntas[qi];
  const resp = pt.actual;
  root.innerHTML = `<div class="player">
    <div class="player-top">${salir}<div class="pbar"><i style="width:${(pt.i / pt.orden.length) * 100}%"></i></div><span class="muted small num">${pt.i + 1}/${pt.orden.length}</span></div>
    <div class="player-body q-card" style="width:100%">
      <div class="eyebrow">${esc(nombreCorto(t.asignaturaId) || 'Test')} · ${esc(t.titulo)}</div>
      <div class="q-text">${esc(p.pregunta)}</div>
      <div class="opts">${pt.opOrden[qi].map((k, n) => {
        let cls = '';
        if (resp != null) { if (k === p.correcta) cls = 'right'; else if (k === resp) cls = 'wrong'; }
        return `<button class="opt ${cls}" data-act="op" data-k="${k}" ${resp != null ? 'disabled' : ''}><span class="k">${n + 1}</span><span>${esc(p.opciones[k])}</span></button>`;
      }).join('')}</div>
    </div>
    ${resp != null ? `<div class="checkbar ${resp === p.correcta ? 'ok' : 'bad'}"><div class="in">
      <div class="fb"><h3>${resp === p.correcta ? '¡Correcto!' : 'No es esa'}</h3>${resp !== p.correcta ? `<p class="small">Correcta: <b>${esc(p.opciones[p.correcta])}</b></p>` : ''}${p.explicacion ? `<p class="small">${esc(p.explicacion)}</p>` : ''}</div>
      <button class="btn primary" data-act="sig">${pt.i + 1 < pt.orden.length ? 'Siguiente' : 'Ver resultado'}</button></div></div>` : ''}
  </div>`;
  root.onclick = (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'op' && pt.actual == null) {
      pt.actual = Number(b.dataset.k);
      pt.resp.push({ q: qi, elegida: pt.actual, ok: pt.actual === p.correcta });
      renderJugar(root, { id });
    }
    if (b.dataset.act === 'sig') { pt.i++; pt.actual = null; renderJugar(root, { id }); }
    if (b.dataset.act === 'salir') partida = null;
  };
  const onKey = (e) => {
    if (!document.body.contains(root) || location.hash !== `#/test/${id}`) return document.removeEventListener('keydown', onKey);
    if (pt.actual == null && /^[1-6]$/.test(e.key)) root.querySelectorAll('.opt')[Number(e.key) - 1]?.click();
    else if (pt.actual != null && e.key === 'Enter') root.querySelector('[data-act="sig"]')?.click();
  };
  document.onkeydown = onKey;
  return () => { document.onkeydown = null; };
}

function nueva(t, solo = null) {
  const idxs = solo || t.preguntas.map((_, i) => i);
  const opOrden = {};
  t.preguntas.forEach((p, i) => (opOrden[i] = shuffle(p.opciones.map((_, k) => k))));
  return { id: t.id, orden: shuffle(idxs), opOrden, i: 0, resp: [], actual: null, guardado: false };
}
