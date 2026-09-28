// ============================================================
// Arranque, navegación y rutas
// ============================================================
import { icon, esc, toast, cerrarModales } from './util.js';
import * as store from './store.js';
import * as sync from './sync.js';
import { cargarDemo } from './demo.js';

import * as hoy from './hoy.js';
import * as horario from './horario.js';
import * as calendario from './calendario.js';
import * as asignaturas from './asignaturas.js';
import * as documentos from './documentos.js';
import * as tests from './tests.js';
import * as academia from './academia.js';
import * as leccion from './leccion.js';
import * as ajustes from './ajustes.js';
import * as mas from './mas.js';

const ROUTES = [
  { path: 'hoy', view: hoy.render, nav: 'hoy', title: 'Hoy' },
  { path: 'horario', view: horario.render, nav: 'agenda', title: 'Horario' },
  { path: 'calendario', view: calendario.render, nav: 'agenda', title: 'Calendario' },
  { path: 'asignaturas', view: asignaturas.renderLista, nav: 'asignaturas', title: 'Asignaturas' },
  { path: 'asignatura/:id', view: asignaturas.renderDetalle, nav: 'asignaturas', title: 'Asignatura' },
  { path: 'documentos', view: documentos.render, nav: 'documentos', title: 'Documentos' },
  { path: 'tests', view: tests.renderLista, nav: 'tests', title: 'Tests' },
  { path: 'test/:id', view: tests.renderJugar, nav: 'tests', title: 'Test', immersive: true, auto: false },
  { path: 'test-editar/:id', view: tests.renderEditor, nav: 'tests', title: 'Editar test', auto: false },
  { path: 'academia', view: academia.renderInicio, nav: 'academia', title: 'Academia' },
  { path: 'curso/:id', view: academia.renderCurso, nav: 'academia', title: 'Curso' },
  { path: 'leccion/:curso/:leccion', view: leccion.render, nav: 'academia', title: 'Lección', immersive: true, auto: false },
  { path: 'repaso/:curso', view: leccion.renderRepaso, nav: 'academia', title: 'Repaso', immersive: true, auto: false },
  { path: 'ajustes', view: ajustes.render, nav: 'ajustes', title: 'Ajustes' },
  { path: 'mas', view: mas.render, nav: 'mas', title: 'Más' },
];

const NAV = [
  { id: 'hoy', label: 'Hoy', href: '#/hoy', icon: 'hoy' },
  { id: 'agenda', label: 'Agenda', href: '#/horario', icon: 'agenda' },
  { id: 'asignaturas', label: 'Asignaturas', href: '#/asignaturas', icon: 'libros' },
  { id: 'documentos', label: 'Documentos', href: '#/documentos', icon: 'doc' },
  { id: 'tests', label: 'Tests', href: '#/tests', icon: 'test' },
  { id: 'academia', label: 'Academia', href: '#/academia', icon: 'academia' },
  { id: 'ajustes', label: 'Ajustes', href: '#/ajustes', icon: 'ajustes' },
];
const TABS = ['hoy', 'agenda', 'asignaturas', 'academia', 'mas'];
const MAS_IDS = ['documentos', 'tests', 'ajustes', 'mas'];

const app = document.getElementById('app');
let current = null;
let cleanup = null;

function match(hash) {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (!parts.length) return { route: ROUTES[0], params: {} };
  for (const r of ROUTES) {
    const rp = r.path.split('/');
    if (rp.length !== parts.length) continue;
    const params = {};
    if (rp.every((seg, i) => (seg.startsWith(':') ? ((params[seg.slice(1)] = parts[i]), true) : seg === parts[i]))) return { route: r, params };
  }
  return { route: ROUTES[0], params: {} };
}

function render({ keepScroll = false } = {}) {
  const { route, params } = match(location.hash);
  const changed = !current || current.route !== route || JSON.stringify(current.params) !== JSON.stringify(params);
  current = { route, params };
  if (cleanup) { try { cleanup(); } catch { /* nada */ } cleanup = null; }
  document.body.classList.toggle('immersive', !!route.immersive);
  document.title = `${route.title} · Campus DAW`;
  const y = window.scrollY;
  const r = route.view(app, params);
  if (typeof r === 'function') cleanup = r;
  if (changed && !keepScroll) window.scrollTo(0, 0); else window.scrollTo(0, y);
  pintarNav(route.nav);
}

function pintarNav(active) {
  document.getElementById('nav-main').innerHTML = NAV.map((n, i) =>
    `${i === 3 ? '<div class="nav-label">Material</div>' : ''}${i === 5 ? '<div class="nav-label">Aprender</div>' : ''}${i === 6 ? '<div class="nav-label">App</div>' : ''}
    <a class="nav-link ${n.id === active ? 'active' : ''}" href="${n.href}">${icon(n.icon)}<span>${n.label}</span></a>`).join('');
  const tabActive = MAS_IDS.includes(active) ? 'mas' : active;
  document.getElementById('tabbar').innerHTML = TABS.map((id) => {
    const n = id === 'mas' ? { id: 'mas', label: 'Más', href: '#/mas', icon: 'mas' } : NAV.find((x) => x.id === id);
    return `<a class="tab ${id === tabActive ? 'active' : ''}" href="${n.href}">${icon(n.icon)}<span>${n.label}</span></a>`;
  }).join('');
}

function pintarSync(i) {
  const el = document.getElementById('sync-pill');
  const txt = {
    local: 'Guardado en este dispositivo',
    off: 'Sin sesión · solo local',
    ok: `Sincronizado${i.user?.email ? ' · ' + i.user.email : ''}`,
    busy: 'Sincronizando…',
    error: i.error || 'Error de sincronización',
  }[i.estado];
  const cls = i.estado === 'ok' ? 'on' : i.estado === 'busy' ? 'busy' : '';
  el.innerHTML = `<span class="dot ${cls}"></span><span>${esc(txt)}</span>`;
  el.title = txt;
}

// Re-pintar cuando cambian los datos (salvo en pantallas con estado propio)
let raf = null;
store.subscribe(() => {
  if (current && current.route.auto === false) return;
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => render({ keepScroll: true }));
});
sync.onEstado((i) => {
  pintarSync(i);
  if (current && ['ajustes', 'mas'].includes(current.route.nav)) render({ keepScroll: true });
});
window.addEventListener('hashchange', () => { cerrarModales(); render(); });

// ---------- Arranque ----------
if (!store.state.ajustes.demoCargada && !store.all('asignaturas').length) {
  cargarDemo();
}
pintarSync(sync.info());
render();
sync.init();

if (store.isMemoryOnly()) toast('Este navegador no deja guardar datos: se perderán al cerrar');

// Service worker para que funcione sin conexión y se pueda instalar
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch { /* nada */ }
}
