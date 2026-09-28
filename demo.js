// ============================================================
// Datos de ejemplo (2º DAW) para ver la app funcionando.
// Todos llevan demo:true y se pueden borrar desde el aviso o Ajustes.
// ============================================================
import * as store from './store.js';
import * as files from './files.js';
import { today, addDays, uid, dow, parseISO } from './util.js';
const laborable = (f) => { const d = dow(parseISO(f)); return d >= 5 ? addDays(f, 7 - d) : f; };

export function cargarDemo() {
  const A = [
    { abrev: 'DWEC', nombre: 'Desarrollo Web en Entorno Cliente', color: '#d9a300', profesor: 'Profesor/a de ejemplo', aula: 'Aula 2.3', info: 'JavaScript en el navegador: DOM, eventos, fetch, módulos y un framework (React o Vue).\n\nEvaluación: prácticas 40 %, exámenes 60 %.\nAula virtual: https://moodle.example.com' },
    { abrev: 'DWES', nombre: 'Desarrollo Web en Entorno Servidor', color: '#7a52cc', profesor: 'Profesor/a de ejemplo', aula: 'Aula 2.3', info: 'Programación en el servidor con PHP y bases de datos MySQL. API REST al final del curso.' },
    { abrev: 'DAW', nombre: 'Despliegue de Aplicaciones Web', color: '#0f8fa8', profesor: 'Profesor/a de ejemplo', aula: 'Lab. 1', info: 'Servidores web (Apache, Nginx), Docker, Git, DNS, HTTPS e integración continua.' },
    { abrev: 'DIW', nombre: 'Diseño de Interfaces Web', color: '#e0613a', profesor: 'Profesor/a de ejemplo', aula: 'Aula 2.1', info: 'Diseño responsive, accesibilidad, CSS avanzado, Figma y usabilidad.' },
    { abrev: 'IPE II', nombre: 'Itinerario Personal para la Empleabilidad II', color: '#178a57', profesor: 'Profesor/a de ejemplo', aula: 'Aula 1.4', info: 'Emprendimiento, plan de empresa y búsqueda de empleo.' },
    { abrev: 'PROY', nombre: 'Proyecto Intermodular', color: '#2342b5', profesor: 'Profesor/a de ejemplo', aula: 'Lab. 1', info: 'Proyecto final: una aplicación web completa. Entrega de anteproyecto, memoria y defensa.' },
  ].map((a) => store.put('asignaturas', { ...a, email: '', enlace: '', demo: true }, { silent: true }));
  const id = Object.fromEntries(A.map((a) => [a.abrev, a.id]));

  const franjas = [['08:15', '09:10'], ['09:10', '10:05'], ['10:05', '11:00'], ['11:30', '12:25'], ['12:25', '13:20'], ['13:20', '14:15']];
  const horario = [
    ['DWEC', 'DWEC', 'DWES', 'DIW', 'DIW', 'IPE II'],
    ['DWES', 'DWES', 'DAW', 'DAW', 'DWEC', 'PROY'],
    ['DIW', 'DIW', 'DWEC', 'DWEC', 'IPE II', 'DAW'],
    ['DWES', 'DWES', 'DWEC', 'DAW', 'DAW', 'PROY'],
    ['DWEC', 'DIW', 'DWES', 'DWES', 'IPE II', 'PROY'],
  ];
  horario.forEach((dia, d) => dia.forEach((abrev, f) => {
    const a = A.find((x) => x.abrev === abrev);
    store.put('clases', { asignaturaId: a.id, dia: d, inicio: franjas[f][0], fin: franjas[f][1], aula: a.aula, demo: true }, { silent: true });
  }));

  const t = today();
  const ev = [
    ['DWEC', 'entrega', 'Práctica 2: manipulación del DOM', 2, '23:59'],
    ['DIW', 'entrega', 'Maqueta responsive en Figma', 5, '23:59'],
    ['DWES', 'entrega', 'Formulario PHP con validación', 9, '14:00'],
    ['DWEC', 'examen', 'Examen tema 1-2 (JS básico)', 12, '08:15'],
    ['PROY', 'entrega', 'Anteproyecto del proyecto final', 16, '23:59'],
    ['DAW', 'examen', 'Examen práctico: Apache y Nginx', 20, '10:05'],
    ['IPE II', 'entrega', 'Análisis DAFO de tu idea de empresa', -1, '23:59'],
    ['DWES', 'entrega', 'Ejercicios de variables y arrays en PHP', -3, '23:59', true],
  ];
  ev.forEach(([ab, tipo, titulo, dd, hora, hecho]) => store.put('eventos', { asignaturaId: id[ab], tipo, titulo, fecha: dd < 0 ? addDays(t, dd) : laborable(addDays(t, dd)), hora, hecho: !!hecho, notas: '', demo: true }, { silent: true }));
  const y = Number(t.slice(0, 4));
  const curso = Number(t.slice(5, 7)) >= 8 ? y : y - 1;
  [[`${curso}-10-12`, 'Fiesta Nacional'], [`${curso}-11-01`, 'Todos los Santos'], [`${curso}-12-06`, 'Día de la Constitución'], [`${curso}-12-08`, 'Inmaculada Concepción']]
    .forEach(([fecha, titulo]) => store.put('eventos', { asignaturaId: '', tipo: 'festivo', titulo, fecha, hora: '', hecho: false, notas: '', demo: true }, { silent: true }));

  [['Práctica 1: calculadora', 8.5, 10], ['Examen tema 1', 6.8, 30], ['Ejercicios de clase', 9, 10]]
    .forEach(([titulo, nota, peso]) => store.put('notas', { asignaturaId: id.DWEC, titulo, nota, peso, demo: true }, { silent: true }));
  [['Práctica PHP básico', 7.5, 15]].forEach(([titulo, nota, peso]) => store.put('notas', { asignaturaId: id.DWES, titulo, nota, peso, demo: true }, { silent: true }));

  store.put('tests', {
    asignaturaId: id.DWEC, titulo: 'Tema 1: fundamentos de JavaScript', demo: true,
    preguntas: [
      { pregunta: '¿Qué palabra declara una variable que NO se puede reasignar?', opciones: ['var', 'let', 'const', 'static'], correcta: 2, explicacion: 'const crea una referencia que no se puede reasignar.' },
      { pregunta: '¿Qué devuelve typeof null?', opciones: ['"null"', '"object"', '"undefined"', '"number"'], correcta: 1, explicacion: 'Es un error histórico del lenguaje: typeof null es "object".' },
      { pregunta: '¿Qué operador compara valor y tipo?', opciones: ['==', '=', '===', '!='], correcta: 2, explicacion: '=== es la igualdad estricta: no convierte tipos.' },
      { pregunta: '¿Qué método añade un elemento al final de un array?', opciones: ['push()', 'pop()', 'shift()', 'unshift()'], correcta: 0, explicacion: 'push() añade al final; unshift() al principio.' },
      { pregunta: '¿Cómo seleccionas el primer elemento con la clase "item"?', opciones: ['document.get(".item")', 'document.querySelector(".item")', 'document.querySelectorAll("item")', 'document.class("item")'], correcta: 1, explicacion: 'querySelector acepta selectores CSS y devuelve el primero.' },
    ],
  }, { silent: true });

  const docId = uid();
  store.put('documentos', { id: docId, asignaturaId: id.DWEC, nombre: 'Guía didáctica DWEC (ejemplo).pdf', tipo: 'apuntes', ext: 'pdf', mime: 'application/pdf', size: 0, demo: true }, { silent: true });
  const pdf = miniPDF(['Guia didactica - DWEC (documento de ejemplo)', '', 'Unidades:', '1. Sintaxis basica de JavaScript', '2. Funciones y objetos', '3. El DOM y los eventos', '4. Asincronia: promesas, async/await y fetch', '5. Modulos y herramientas (npm, Vite)', '6. Introduccion a React', '', 'Evaluacion: practicas 40 %, examenes 60 %.', '', 'Sube tus propios PDF desde la seccion Documentos.']);
  files.putLocal(docId, pdf).then(() => {
    const d = store.get('documentos', docId);
    if (d) store.put('documentos', { ...d, size: pdf.size }, { silent: true });
  });

  store.setSingle('ajustes', { demoCargada: true }, { silent: true });
  store.emit();
}

export function borrarDemo() {
  ['asignaturas', 'clases', 'eventos', 'documentos', 'tests', 'notas'].forEach((c) =>
    store.all(c).filter((x) => x.demo).forEach((x) => { if (c === 'documentos') files.delLocal(x.id); store.remove(c, x.id, { silent: true }); }));
  store.emit();
}
export const hayDemo = () => store.all('asignaturas').some((a) => a.demo);

/** PDF de una página con líneas de texto (solo ASCII). */
function miniPDF(lines) {
  const content = ['BT', '/F1 13 Tf', '56 780 Td', '18 TL', ...lines.map((l, i) => `${i === 0 ? '/F1 17 Tf ' : i === 1 ? '/F1 12 Tf ' : ''}(${l.replace(/[()\\]/g, '\\$&')}) '`), 'ET'].join('\n');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let out = '%PDF-1.4\n';
  const offs = [];
  objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('')}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([out], { type: 'application/pdf' });
}
