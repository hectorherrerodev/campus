// ============================================================
// Formularios y piezas reutilizadas entre pantallas
// ============================================================
import { esc, icon, formModal, toast, relDay, fmtShort, fmtLong, today, diffDays, DIAS, dow, parseISO, addDays, modal, toMin, nowMin } from './util.js';
import * as store from './store.js';
import { asistencia, marcarVista, atrasar } from './clases.js';

export const TIPOS_EVENTO = [['entrega', 'Entrega'], ['examen', 'Examen'], ['evento', 'Evento / clase especial'], ['recordatorio', 'Recordatorio'], ['festivo', 'Festivo / no lectivo']];
export const tipoLabel = (t) => (TIPOS_EVENTO.find((x) => x[0] === t) || [, t])[1].split(' /')[0];

export const asigOrdenadas = () => [...store.all('asignaturas')].sort((a, b) => (a.abrev || a.nombre).localeCompare(b.abrev || b.nombre));
export const asigOptions = (ninguna = true) => [...(ninguna ? [['', '— Sin asignatura —']] : []), ...asigOrdenadas().map((a) => [a.id, `${a.abrev ? a.abrev + ' · ' : ''}${a.nombre}`])];
export const nombreCorto = (id) => { const a = store.asignatura(id); return a ? (a.abrev || a.nombre) : ''; };

// ---------- Asignatura ----------
export function asignaturaForm(a = {}, onSaved) {
  formModal({
    title: a.id ? 'Editar asignatura' : 'Nueva asignatura',
    submit: a.id ? 'Guardar' : 'Crear asignatura',
    fields: [
      { name: 'nombre', label: 'Nombre', value: a.nombre, required: true, full: true, placeholder: 'Desarrollo Web en Entorno Cliente' },
      { name: 'abrev', label: 'Abreviatura', value: a.abrev, placeholder: 'DWEC' },
      { name: 'aula', label: 'Aula', value: a.aula, placeholder: 'Aula 2.3' },
      { name: 'profesor', label: 'Profesor/a', value: a.profesor },
      { name: 'email', label: 'Correo del profesor/a', type: 'email', value: a.email },
      { name: 'enlace', label: 'Aula virtual (Moodle, Classroom…)', type: 'url', value: a.enlace, full: true, placeholder: 'https://' },
      { name: 'color', label: 'Color', type: 'color', value: a.color, full: true },
      { name: 'info', label: 'Información y apuntes rápidos', type: 'textarea', value: a.info, full: true, rows: 6, placeholder: 'Criterios de evaluación, temario, normas de entrega…' },
    ],
    onSubmit: (d) => { const r = store.put('asignaturas', { ...a, ...d }); toast(a.id ? 'Asignatura guardada' : 'Asignatura creada'); onSaved && onSaved(r); },
    onDelete: a.id ? () => { store.removeAsignatura(a.id); toast('Asignatura eliminada'); location.hash = '#/asignaturas'; } : null,
    deleteText: 'Se borrará la asignatura con sus clases, entregas, documentos, tests y notas.',
  });
}

function sinAsignaturas() {
  if (store.all('asignaturas').length) return false;
  toast('Primero crea una asignatura');
  asignaturaForm();
  return true;
}

// ---------- Clase del horario ----------
let ultimoModo = 'semanal';

export function claseForm(c = {}) {
  if (sinAsignaturas()) return;
  const aj = store.state.ajustes;
  const nuevo = !c.id;
  const nDias = aj.sabado ? 6 : 5;
  const comunes = [
    { name: 'inicio', label: 'Empieza', type: 'time', value: c.inicio || '08:15', required: true },
    { name: 'fin', label: 'Termina', type: 'time', value: c.fin || '09:10', required: true },
    { name: 'aula', label: 'Aula', value: c.aula ?? store.asignatura(c.asignaturaId)?.aula ?? '', placeholder: 'Opcional' },
    { name: 'nota', label: 'Nota', value: c.nota, placeholder: 'Ej.: desdoble, recuperación' },
  ];
  let campos;
  if (nuevo) {
    campos = [
      { name: 'modo', label: '¿Cuándo es?', type: 'seg', options: [['semanal', 'Cada semana'], ['fechas', 'Fechas concretas']], value: c.modo || ultimoModo, full: true },
      { name: 'dias', label: 'Días de la semana', type: 'days', value: c.dia != null ? [c.dia] : [], count: nDias, required: true, full: true, hint: 'Se repite todas las semanas hasta fin de curso. Puedes marcar varios días.', showIf: ['modo', 'semanal'] },
      { name: 'fechas', label: 'Fechas', type: 'fechas', value: c.fecha ? [c.fecha] : [], required: true, full: true, hint: 'Elige un día y pulsa Añadir. Puedes añadir todas las fechas que quieras.', showIf: ['modo', 'fechas'] },
    ];
  } else if (c.fecha) {
    campos = [{ name: 'fecha', label: 'Fecha', type: 'date', value: c.fecha, required: true, full: true }];
  } else {
    campos = [{ name: 'dia', label: 'Día (cada semana)', type: 'select', options: DIAS.slice(0, nDias).map((d, i) => [i, d]), value: c.dia, full: true }];
  }
  formModal({
    title: nuevo ? 'Añadir clase' : c.fecha ? 'Editar clase (fecha concreta)' : 'Editar clase semanal',
    fields: [{ name: 'asignaturaId', label: 'Asignatura', type: 'select', options: asigOptions(false), value: c.asignaturaId, required: true, full: true }, ...campos, ...comunes],
    onSubmit: (d) => {
      if (d.fin <= d.inicio) { toast('La hora de fin debe ser posterior al inicio'); return false; }
      if (!d.aula) d.aula = store.asignatura(d.asignaturaId)?.aula || '';
      const base = { asignaturaId: d.asignaturaId, inicio: d.inicio, fin: d.fin, aula: d.aula, nota: d.nota };
      if (nuevo) {
        ultimoModo = d.modo;
        const lista = d.modo === 'fechas' ? d.fechas.map((fecha) => ({ ...base, fecha, dia: dow(parseISO(fecha)) })) : d.dias.map((dia) => ({ ...base, dia }));
        lista.forEach((x) => store.put('clases', x, { silent: true }));
        store.emit();
        toast(lista.length > 1 ? `${lista.length} clases añadidas` : 'Clase añadida');
      } else if (c.fecha) {
        store.put('clases', { ...c, ...base, fecha: d.fecha, dia: dow(parseISO(d.fecha)) }); toast('Clase guardada');
      } else {
        store.put('clases', { ...c, ...base, dia: Number(d.dia) }); toast('Clase guardada');
      }
    },
    onDelete: nuevo ? null : () => { store.remove('clases', c.id); toast('Clase eliminada'); },
    deleteText: c.fecha ? 'Se quitará la clase de ese día.' : 'Se quitará esta clase de todas las semanas.',
  });
}

// ---------- Entregas, exámenes y eventos ----------
export function eventoForm(e = {}) {
  const nuevo = !e.id;
  formModal({
    title: nuevo ? 'Nueva entrega o evento' : 'Editar',
    fields: [
      { name: 'titulo', label: 'Título', value: e.titulo, required: true, full: true, placeholder: 'Práctica 3: formularios' },
      { name: 'tipo', label: 'Tipo', type: 'select', options: TIPOS_EVENTO, value: e.tipo || 'entrega' },
      { name: 'asignaturaId', label: 'Asignatura', type: 'select', options: asigOptions(true), value: e.asignaturaId ?? '' },
      { name: 'fecha', label: 'Fecha', type: 'date', value: e.fecha || today(), required: true },
      { name: 'hora', label: 'Hora límite', type: 'time', value: e.hora ?? '23:59' },
      { name: 'estado', label: 'Estado', type: 'seg', options: [['no', 'Pendiente / sin entregar'], ['si', 'Entregada / hecha']], value: e.hecho ? 'si' : 'no', full: true },
      { name: 'notas', label: 'Notas', type: 'textarea', value: e.notas, full: true, rows: 3, placeholder: 'Qué hay que entregar, dónde, requisitos…' },
    ],
    onSubmit: (d) => { const { estado, ...rest } = d; store.put('eventos', { ...e, ...rest, hecho: estado === 'si' }); toast(nuevo ? 'Añadido al calendario' : 'Guardado'); },
    onDelete: nuevo ? null : () => { store.remove('eventos', e.id); toast('Eliminado'); },
  });
}

/** Fila de lista para una entrega/evento. Usa data-act="toggle-ev" y "edit-ev". */
export function eventoItem(ev, { showDate = true, showAsig = true } = {}) {
  const a = store.asignatura(ev.asignaturaId);
  const n = diffDays(today(), ev.fecha);
  const late = !ev.hecho && n < 0 && ev.tipo !== 'festivo';
  const soon = !ev.hecho && n >= 0 && n <= 2;
  const color = a?.color || (ev.tipo === 'festivo' ? 'var(--warn)' : 'var(--muted)');
  const puedeMarcar = ev.tipo === 'entrega' || ev.tipo === 'examen' || ev.tipo === 'recordatorio';
  return `<div class="item ${ev.hecho ? 'done' : ''}">
    <span class="stripe" style="background:${color}"></span>
    ${puedeMarcar ? `<button class="check ${ev.hecho ? 'on' : ''}" data-act="toggle-ev" data-id="${ev.id}" aria-label="${ev.hecho ? (ev.tipo === 'entrega' ? 'Marcar como sin entregar' : 'Marcar como pendiente') : (ev.tipo === 'entrega' ? 'Marcar como entregada' : 'Marcar como hecha')}" title="${ev.tipo === 'entrega' ? (ev.hecho ? 'Entregada' : 'Marcar como entregada') : ''}">${icon('check')}</button>` : ''}
    <button class="grow" data-act="edit-ev" data-id="${ev.id}" style="background:none;border:0;text-align:left;padding:0;cursor:pointer;min-width:0">
      <div class="title">${esc(ev.titulo)}</div>
      <div class="sub"><span class="tag ${ev.tipo}">${esc(tipoLabel(ev.tipo))}</span>${showAsig && a ? ` · ${esc(a.abrev || a.nombre)}` : ''}${showDate ? ` · ${fmtShort(ev.fecha)}` : ''}${ev.hora ? ` · ${ev.hora}` : ''}</div>
    </button>
    ${ev.tipo !== 'festivo' ? `<span class="when ${ev.hecho ? 'ok' : late ? 'late' : soon ? 'soon' : ''}">${estadoTexto(ev, late)}</span>` : ''}
  </div>`;
}

function estadoTexto(ev, late) {
  if (ev.tipo === 'entrega') return ev.hecho ? 'Entregada' : late ? 'Sin entregar' : relDay(ev.fecha);
  if (ev.hecho) return 'Hecho';
  return late ? 'Vencido' : relDay(ev.fecha);
}

/** Maneja clics de eventoItem dentro de un contenedor. Devuelve true si lo gestionó. */
export function manejarEvento(act, id) {
  if (act === 'toggle-ev') {
    const ev = store.get('eventos', id);
    if (ev) { store.put('eventos', { ...ev, hecho: !ev.hecho }); toast(ev.tipo === 'entrega' ? (ev.hecho ? 'Marcada como sin entregar' : '¡Entregada! Una menos') : (ev.hecho ? 'Marcado como pendiente' : '¡Hecho! Uno menos')); }
    return true;
  }
  if (act === 'edit-ev') { const ev = store.get('eventos', id); if (ev) eventoForm(ev); return true; }
  return false;
}

// ---------- Notas (calificaciones) ----------
export function notaForm(n = {}) {
  formModal({
    title: n.id ? 'Editar nota' : 'Añadir nota',
    fields: [
      { name: 'titulo', label: 'Qué se evalúa', value: n.titulo, required: true, full: true, placeholder: 'Examen tema 2' },
      { name: 'nota', label: 'Nota (0-10)', type: 'number', step: '0.01', min: 0, max: 10, value: n.nota, required: true },
      { name: 'peso', label: 'Peso en la nota final (%)', type: 'number', step: '1', min: 0, max: 100, value: n.peso ?? 10, required: true },
    ],
    onSubmit: (d) => {
      if (d.nota < 0 || d.nota > 10) { toast('La nota debe estar entre 0 y 10'); return false; }
      store.put('notas', { ...n, ...d }); toast('Nota guardada');
    },
    onDelete: n.id ? () => store.remove('notas', n.id) : null,
  });
}

/** Media ponderada y lo que necesitas en lo que queda para aprobar. */
export function calcularMedia(asigId) {
  const ns = store.all('notas').filter((n) => n.asignaturaId === asigId && n.nota != null);
  const peso = ns.reduce((s, n) => s + (Number(n.peso) || 0), 0);
  const puntos = ns.reduce((s, n) => s + n.nota * (Number(n.peso) || 0), 0);
  const media = peso ? puntos / peso : null;
  const resta = Math.max(0, 100 - peso);
  const necesita = resta > 0 ? (500 - puntos) / resta : null;
  return { ns, peso, media, resta, necesita, acumulado: puntos / 100 };
}

// ---------- Clases: vista / atrasada ----------

/** Estado de una clase ese día: 'vista', 'pendiente' o '' (sin marcar). */
export function estadoClase(c, fecha) { return asistencia(c, fecha)?.estado || ''; }

/** Botón redondo para marcar la clase como vista (data-act="vista"). */
export function checkClase(c, fecha) {
  const st = estadoClase(c, fecha);
  const futura = fecha > today() || (fecha === today() && toMin(c.inicio) > nowMin());
  if (futura) return '';
  return `<button class="check ${st === 'vista' ? 'on' : ''}" data-act="vista" data-id="${c.id}" data-fecha="${fecha}" aria-label="${st === 'vista' ? 'Marcar como no vista' : 'Marcar como vista'}" title="${st === 'vista' ? 'Vista' : 'Marcar como vista'}">${icon('check')}</button>`;
}

/** Texto corto del estado de una clase. */
export function etiquetaClase(c, fecha) {
  const as = asistencia(c, fecha);
  if (!as) return '';
  if (as.estado === 'vista') return '<span class="tag evento">Vista</span>';
  return `<span class="tag festivo">Por ver ${as.repasarEl ? relDay(as.repasarEl) : ''}</span>`;
}

/** Fila de lista para una clase de un día concreto. */
export function claseItem(c, fecha, { showDate = false } = {}) {
  const a = store.asignatura(c.asignaturaId);
  const st = estadoClase(c, fecha);
  return `<div class="item ${st === 'vista' ? 'visto' : ''}">
    <span class="stripe" style="background:${a?.color || 'var(--muted)'}"></span>
    ${checkClase(c, fecha)}
    <button class="grow" data-act="clase" data-id="${c.id}" data-fecha="${fecha}" style="background:none;border:0;text-align:left;padding:0;cursor:pointer;min-width:0">
      <div class="title">${esc(a?.nombre || 'Asignatura')}</div>
      <div class="sub num">${showDate ? fmtShort(fecha) + ' · ' : ''}${c.inicio}–${c.fin}${c.aula ? ' · ' + esc(c.aula) : ''}${c.nota ? ' · ' + esc(c.nota) : ''}${c.fecha ? ' · solo este día' : ''} ${etiquetaClase(c, fecha)}</div>
    </button>
  </div>`;
}

/** Fila para una clase atrasada (pendiente de ver). */
export function repasoItem(as) {
  const c = store.get('clases', as.claseId);
  const a = store.asignatura(as.asignaturaId);
  const n = as.repasarEl ? diffDays(today(), as.repasarEl) : 0;
  const cls = n < 0 ? 'late' : n === 0 ? 'soon' : '';
  const txt = n < 0 ? `Atrasada ${-n} día${n < -1 ? 's' : ''}` : n === 0 ? 'Verla hoy' : `Verla ${relDay(as.repasarEl)}`;
  return `<div class="item">
    <span class="stripe" style="background:${a?.color || 'var(--muted)'}"></span>
    <button class="check" data-act="vista" data-id="${c.id}" data-fecha="${as.fecha}" aria-label="Marcar como vista" title="Ya la he visto">${icon('check')}</button>
    <button class="grow" data-act="clase" data-id="${c.id}" data-fecha="${as.fecha}" style="background:none;border:0;text-align:left;padding:0;cursor:pointer;min-width:0">
      <div class="title">${esc(a?.nombre || 'Asignatura')}</div>
      <div class="sub">Clase del ${fmtShort(as.fecha)} · ${c.inicio}–${c.fin}${as.nota ? ' · ' + esc(as.nota) : ''}</div>
    </button>
    <span class="when ${cls}">${txt}</span>
  </div>`;
}

/** Ventana con las opciones de una clase concreta. */
export function claseSheet(c, fecha) {
  if (!c) return;
  const a = store.asignatura(c.asignaturaId);
  const as = asistencia(c, fecha);
  const t = today();
  const pasada = fecha < t || (fecha === t && toMin(c.inicio) <= nowMin());
  const sugerida = as?.repasarEl || (fecha >= t ? addDays(fecha, 1) : addDays(t, 1));
  const estadoTxt = as?.estado === 'vista' ? 'La has marcado como vista.'
    : as?.estado === 'pendiente' ? `Pendiente de ver: ${as.repasarEl ? fmtLong(as.repasarEl).toLowerCase() : 'sin fecha'}.`
    : pasada ? 'Sin marcar.' : 'Todavía no ha empezado.';
  const m = modal({
    title: a?.nombre || 'Clase',
    body: `
      <p class="small muted">${esc(fmtLong(fecha))} · ${c.inicio}–${c.fin}${c.aula ? ' · ' + esc(c.aula) : ''}${c.nota ? ' · ' + esc(c.nota) : ''}</p>
      <p><b>${estadoTxt}</b></p>
      <div class="row">
        ${as?.estado === 'vista'
          ? `<button class="btn" data-no-vista>Marcar como no vista</button>`
          : `<button class="btn primary" data-vista>${icon('check')} La he visto</button>`}
      </div>
      <div class="card flat stack" style="padding:14px;gap:10px;background:var(--surface-2);border:0">
        <b>${as?.estado === 'pendiente' ? 'Cambiar el día para verla' : 'Atrasarla: la veré otro día'}</b>
        <p class="tiny muted">Te aparecerá en Inicio y en el Calendario ese día, hasta que la marques como vista.</p>
        <div class="form-grid">
          <label class="field"><span>¿Qué día la ves?</span><input class="input" type="date" id="cs-fecha" value="${sugerida}" min="${t}"></label>
          <label class="field"><span>Nota (opcional)</span><input class="input" id="cs-nota" value="${esc(as?.nota || '')}" placeholder="Ej.: ver vídeo del tema 3"></label>
        </div>
        <div class="row"><button class="btn" data-atrasar>${icon('agenda')} Guardar recordatorio</button>${as?.estado === 'pendiente' ? `<button class="btn ghost" data-quitar>Quitar recordatorio</button>` : ''}</div>
      </div>`,
    foot: `<button class="btn ghost" data-editar>${icon('edit')} Editar clase</button><span class="spacer"></span><button class="btn" data-cerrar>Cerrar</button>`,
  });
  const q = (sel) => m.el.querySelector(sel);
  q('[data-cerrar]').onclick = m.close;
  q('[data-editar]').onclick = () => { m.close(); claseForm(c); };
  if (q('[data-vista]')) q('[data-vista]').onclick = () => { marcarVista(c, fecha, true); toast('Clase marcada como vista'); m.close(); };
  if (q('[data-no-vista]')) q('[data-no-vista]').onclick = () => { marcarVista(c, fecha, false); toast('Marca quitada'); m.close(); };
  if (q('[data-quitar]')) q('[data-quitar]').onclick = () => { marcarVista(c, fecha, false); toast('Recordatorio quitado'); m.close(); };
  q('[data-atrasar]').onclick = () => {
    const d = q('#cs-fecha').value;
    if (!d) { toast('Elige un día'); return; }
    atrasar(c, fecha, d, q('#cs-nota').value.trim());
    toast(`Te la recordaré ${relDay(d)}`);
    m.close();
  };
}

/** Maneja clics de clases (data-act="clase" | "vista"). Devuelve true si lo gestionó. */
export function manejarClase(act, ds) {
  if (act === 'clase') { claseSheet(store.get('clases', ds.id), ds.fecha); return true; }
  if (act === 'vista') {
    const c = store.get('clases', ds.id);
    if (!c) return true;
    const vista = estadoClase(c, ds.fecha) === 'vista';
    marcarVista(c, ds.fecha, !vista);
    toast(vista ? 'Marca quitada' : 'Clase vista');
    return true;
  }
  return false;
}
