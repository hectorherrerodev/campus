// ============================================================
// Formularios y piezas reutilizadas entre pantallas
// ============================================================
import { esc, icon, formModal, toast, relDay, fmtShort, today, diffDays, DIAS } from './util.js';
import * as store from './store.js';

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
export function claseForm(c = {}) {
  if (sinAsignaturas()) return;
  const aj = store.state.ajustes;
  const nuevo = !c.id;
  formModal({
    title: nuevo ? 'Añadir clase al horario' : 'Editar clase',
    fields: [
      { name: 'asignaturaId', label: 'Asignatura', type: 'select', options: asigOptions(false), value: c.asignaturaId, required: true, full: true },
      nuevo
        ? { name: 'dias', label: 'Días', type: 'days', value: c.dia != null ? [c.dia] : [], count: aj.sabado ? 6 : 5, required: true, full: true, hint: 'Puedes marcar varios días a la vez' }
        : { name: 'dia', label: 'Día', type: 'select', options: DIAS.slice(0, aj.sabado ? 6 : 5).map((d, i) => [i, d]), value: c.dia, full: true },
      { name: 'inicio', label: 'Empieza', type: 'time', value: c.inicio || '08:15', required: true },
      { name: 'fin', label: 'Termina', type: 'time', value: c.fin || '09:10', required: true },
      { name: 'aula', label: 'Aula', value: c.aula ?? store.asignatura(c.asignaturaId)?.aula ?? '', placeholder: 'Opcional' },
      { name: 'nota', label: 'Nota', value: c.nota, placeholder: 'Ej.: desdoble, grupo B' },
    ],
    onSubmit: (d) => {
      if (d.fin <= d.inicio) { toast('La hora de fin debe ser posterior al inicio'); return false; }
      if (!d.aula) d.aula = store.asignatura(d.asignaturaId)?.aula || '';
      if (nuevo) { d.dias.forEach((dia) => store.put('clases', { asignaturaId: d.asignaturaId, dia, inicio: d.inicio, fin: d.fin, aula: d.aula, nota: d.nota }, { silent: true })); store.emit(); toast(d.dias.length > 1 ? `${d.dias.length} clases añadidas` : 'Clase añadida'); }
      else { store.put('clases', { ...c, ...d, dia: Number(d.dia) }); toast('Clase guardada'); }
    },
    onDelete: nuevo ? null : () => { store.remove('clases', c.id); toast('Clase eliminada'); },
    deleteText: 'Se quitará esta clase del horario.',
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
      { name: 'notas', label: 'Notas', type: 'textarea', value: e.notas, full: true, rows: 3, placeholder: 'Qué hay que entregar, dónde, requisitos…' },
    ],
    onSubmit: (d) => { store.put('eventos', { hecho: false, ...e, ...d }); toast(nuevo ? 'Añadido al calendario' : 'Guardado'); },
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
    ${puedeMarcar ? `<button class="check ${ev.hecho ? 'on' : ''}" data-act="toggle-ev" data-id="${ev.id}" aria-label="${ev.hecho ? 'Marcar como pendiente' : 'Marcar como hecha'}">${icon('check')}</button>` : ''}
    <button class="grow" data-act="edit-ev" data-id="${ev.id}" style="background:none;border:0;text-align:left;padding:0;cursor:pointer;min-width:0">
      <div class="title">${esc(ev.titulo)}</div>
      <div class="sub"><span class="tag ${ev.tipo}">${esc(tipoLabel(ev.tipo))}</span>${showAsig && a ? ` · ${esc(a.abrev || a.nombre)}` : ''}${showDate ? ` · ${fmtShort(ev.fecha)}` : ''}${ev.hora ? ` · ${ev.hora}` : ''}</div>
    </button>
    ${ev.tipo !== 'festivo' ? `<span class="when ${late ? 'late' : soon ? 'soon' : ''}">${ev.hecho ? 'Hecha' : late ? 'Vencida' : relDay(ev.fecha)}</span>` : ''}
  </div>`;
}

/** Maneja clics de eventoItem dentro de un contenedor. Devuelve true si lo gestionó. */
export function manejarEvento(act, id) {
  if (act === 'toggle-ev') {
    const ev = store.get('eventos', id);
    if (ev) { store.put('eventos', { ...ev, hecho: !ev.hecho }); if (!ev.hecho) toast('¡Hecho! Una menos'); }
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
