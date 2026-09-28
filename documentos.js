// ============================================================
// Documentos: PDFs y otros archivos por asignatura
// ============================================================
import { esc, icon, modal, toast, fmtSize, fmtShort, iso, confirmar, descargar } from './util.js';
import * as store from './store.js';
import * as files from './files.js';
import * as sync from './sync.js';
import { asigOptions, nombreCorto } from './common.js';

export const TIPOS_DOC = [['apuntes', 'Apuntes'], ['enunciado', 'Enunciado de práctica'], ['examen', 'Examen / modelo'], ['entregado', 'Trabajo entregado'], ['otro', 'Otro']];
const tipoDoc = (t) => (TIPOS_DOC.find((x) => x[0] === t) || [, 'Otro'])[1];
let filtroAsig = '';
let busca = '';

export function render(root) {
  root.innerHTML = `
    <div class="page-head">
      <div><div class="eyebrow">Material</div><h1>Documentos</h1></div>
      <button class="btn primary" data-act="subir">${icon('upload')} Subir archivos</button>
    </div>
    <div class="row" style="margin-bottom:14px">
      <input class="input" id="doc-busca" type="search" placeholder="Buscar por nombre…" value="${esc(busca)}" style="max-width:320px">
      <div class="chips">
        <button class="chip ${!filtroAsig ? 'on' : ''}" data-act="fasig" data-v="">Todas</button>
        ${store.all('asignaturas').map((a) => `<button class="chip ${filtroAsig === a.id ? 'on' : ''}" data-act="fasig" data-v="${a.id}"><span class="sw" style="background:${a.color}"></span>${esc(a.abrev || a.nombre)}</button>`).join('')}
      </div>
    </div>
    <div id="doc-lista">${listaHTML(filtroAsig || null, true)}</div>`;
  const inp = root.querySelector('#doc-busca');
  inp.oninput = () => { busca = inp.value; root.querySelector('#doc-lista').innerHTML = listaHTML(filtroAsig || null, true); };
  root.onclick = (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'fasig') { filtroAsig = b.dataset.v; render(root); return; }
    manejar(b.dataset.act, b.dataset, filtroAsig || '');
  };
  activarDrop(root, filtroAsig || '');
}

/** Lista de documentos. Si asigId es null, muestra todos agrupados. */
export function listaHTML(asigId, conBusqueda = false) {
  let ds = store.all('documentos').filter((d) => !asigId || d.asignaturaId === asigId);
  if (conBusqueda && busca) ds = ds.filter((d) => d.nombre.toLowerCase().includes(busca.toLowerCase()));
  ds.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const head = asigId && !conBusqueda ? `<div class="row" style="margin-bottom:12px"><button class="btn primary sm" data-act="subir">${icon('upload')} Subir archivos</button><span class="muted small">o arrastra aquí tus PDF</span></div>` : '';
  if (!ds.length) return `${head}<div class="empty"><h3>${busca && conBusqueda ? 'Nada coincide con la búsqueda' : 'Sin documentos'}</h3><p>Sube apuntes, enunciados o exámenes en PDF. Se guardan en este dispositivo${sync.usuario() ? ' y en tu nube' : ''}.</p>${busca && conBusqueda ? '' : `<button class="btn" data-act="subir">${icon('upload')} Subir</button>`}</div>`;
  return `${head}<div class="card" style="padding:6px 14px"><div class="list">${ds.map((d) => {
    const ext = (d.ext || '').toLowerCase();
    const cls = ext === 'pdf' ? 'pdf' : /^(png|jpe?g|gif|webp|heic)$/.test(ext) ? 'img' : '';
    return `<div class="item">
      <span class="file-ico ${cls}">${esc((ext || 'doc').slice(0, 4).toUpperCase())}</span>
      <button class="grow" data-act="abrir" data-id="${d.id}" style="background:none;border:0;text-align:left;padding:0;cursor:pointer;min-width:0">
        <div class="title">${esc(d.nombre)}</div>
        <div class="sub">${!asigId && d.asignaturaId ? esc(nombreCorto(d.asignaturaId)) + ' · ' : ''}${esc(tipoDoc(d.tipo))}${d.size ? ' · ' + fmtSize(d.size) : ''} · ${fmtShort(iso(new Date(d.createdAt || Date.now())))}${d.path ? ' · en la nube' : ''}</div>
      </button>
      <button class="btn ghost icon" data-act="editar-doc" data-id="${d.id}" aria-label="Editar">${icon('edit')}</button>
    </div>`;
  }).join('')}</div></div>`;
}

export function manejar(act, ds, asigId) {
  if (act === 'subir') { subirModal(asigId); return true; }
  if (act === 'abrir') { abrir(store.get('documentos', ds.id)); return true; }
  if (act === 'editar-doc') { editar(store.get('documentos', ds.id)); return true; }
  return false;
}

export function activarDrop(root, asigId) {
  root.ondragover = (e) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault(); };
  root.ondrop = (e) => {
    if (!e.dataTransfer?.files?.length) return;
    e.preventDefault();
    subirModal(asigId, [...e.dataTransfer.files]);
  };
}

export function subirModal(asigId = '', iniciales = []) {
  let elegidos = [...iniciales];
  const m = modal({
    title: 'Subir documentos',
    body: `
      <label class="drop" id="drop" for="doc-file">${icon('upload')}<div><b>Elige archivos</b> o arrástralos aquí</div><div class="tiny">PDF, imágenes, Word… (máx. 50 MB cada uno)</div></label>
      <input type="file" id="doc-file" multiple hidden accept=".pdf,image/*,.doc,.docx,.odt,.txt,.md,.zip,.ppt,.pptx,.xls,.xlsx,.sql,.html,.css,.js">
      <div id="elegidos" class="small"></div>
      <div class="form-grid">
        <label class="field"><span>Asignatura</span><select class="input" id="doc-asig">${asigOptions(true).map(([v, t]) => `<option value="${v}" ${v === asigId ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
        <label class="field"><span>Tipo</span><select class="input" id="doc-tipo">${TIPOS_DOC.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>
      </div>`,
    foot: `<span class="spacer"></span><button class="btn" data-c>Cancelar</button><button class="btn primary" data-ok disabled>Subir</button>`,
  });
  const inp = m.el.querySelector('#doc-file');
  const ok = m.el.querySelector('[data-ok]');
  const drop = m.el.querySelector('#drop');
  const pintar = () => {
    m.el.querySelector('#elegidos').innerHTML = elegidos.map((f) => `<div>${esc(f.name)} <span class="muted">· ${fmtSize(f.size)}</span></div>`).join('');
    ok.disabled = !elegidos.length;
    ok.textContent = elegidos.length > 1 ? `Subir ${elegidos.length} archivos` : 'Subir';
  };
  pintar();
  inp.onchange = () => { elegidos = [...inp.files]; pintar(); };
  drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = (e) => { e.preventDefault(); e.stopPropagation(); drop.classList.remove('over'); elegidos = [...e.dataTransfer.files]; pintar(); };
  m.el.querySelector('[data-c]').onclick = m.close;
  ok.onclick = async () => {
    const asignaturaId = m.el.querySelector('#doc-asig').value;
    const tipo = m.el.querySelector('#doc-tipo').value;
    ok.disabled = true; ok.textContent = 'Guardando…';
    let n = 0;
    for (const f of elegidos) {
      if (f.size > 50 * 1048576) { toast(`${f.name} supera 50 MB`); continue; }
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      const rec = store.put('documentos', { asignaturaId, tipo, nombre: f.name, ext, mime: f.type, size: f.size }, { silent: true });
      await files.putLocal(rec.id, f);
      n++;
    }
    store.emit();
    toast(n === 1 ? 'Documento guardado' : `${n} documentos guardados`);
    m.close();
  };
}

async function obtenerBlob(d) {
  let blob = await files.getLocal(d.id);
  if (!blob && d.path) {
    toast('Descargando de la nube…');
    try { blob = await sync.descargarRemoto(d); } catch { blob = null; }
  }
  return blob;
}

async function abrir(d) {
  if (!d) return;
  const blob = await obtenerBlob(d);
  if (!blob) { toast(d.path ? 'Inicia sesión para descargarlo' : 'Este archivo no está en este dispositivo'); return; }
  const tipo = d.mime || blob.type || (d.ext === 'pdf' ? 'application/pdf' : '');
  const url = URL.createObjectURL(tipo && blob.type !== tipo ? new Blob([blob], { type: tipo }) : blob);
  const esPdf = tipo === 'application/pdf';
  const esImg = tipo.startsWith('image/');
  const m = modal({
    title: d.nombre, wide: true,
    body: esPdf ? `<iframe class="viewer" src="${url}" title="${esc(d.nombre)}"></iframe>`
      : esImg ? `<img src="${url}" alt="${esc(d.nombre)}" style="border-radius:10px;margin:0 auto">`
      : `<div class="empty"><h3>Vista previa no disponible</h3><p>Descárgalo para abrirlo con otra app.</p></div>`,
    foot: `<a class="btn" href="${url}" target="_blank" rel="noopener">${icon('ext')} Abrir en pestaña nueva</a><button class="btn" data-dl>${icon('download')} Descargar</button><span class="spacer"></span><button class="btn" data-c>Cerrar</button>`,
    onClose: () => setTimeout(() => URL.revokeObjectURL(url), 60000),
  });
  m.el.querySelector('[data-c]').onclick = m.close;
  m.el.querySelector('[data-dl]').onclick = () => descargar(d.nombre, blob);
}

function editar(d) {
  if (!d) return;
  const m = modal({
    title: 'Editar documento',
    body: `<div class="form-grid">
      <label class="field full"><span>Nombre</span><input class="input" id="de-nombre" value="${esc(d.nombre)}"></label>
      <label class="field"><span>Asignatura</span><select class="input" id="de-asig">${asigOptions(true).map(([v, t]) => `<option value="${v}" ${v === d.asignaturaId ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
      <label class="field"><span>Tipo</span><select class="input" id="de-tipo">${TIPOS_DOC.map(([v, t]) => `<option value="${v}" ${v === d.tipo ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
    </div>`,
    foot: `<button class="btn danger" data-del>${icon('trash')} Eliminar</button><span class="spacer"></span><button class="btn" data-c>Cancelar</button><button class="btn primary" data-ok>Guardar</button>`,
  });
  m.el.querySelector('[data-c]').onclick = m.close;
  m.el.querySelector('[data-ok]').onclick = () => {
    store.put('documentos', { ...d, nombre: m.el.querySelector('#de-nombre').value.trim() || d.nombre, asignaturaId: m.el.querySelector('#de-asig').value, tipo: m.el.querySelector('#de-tipo').value });
    toast('Guardado'); m.close();
  };
  m.el.querySelector('[data-del]').onclick = async () => {
    if (!(await confirmar(`Se borrará "${d.nombre}" de este dispositivo${d.path ? ' y de la nube' : ''}.`))) return;
    await files.delLocal(d.id);
    store.remove('documentos', d.id);
    toast('Documento eliminado'); m.close();
  };
}
