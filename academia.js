// ============================================================
// Academia: inicio con cursos y ruta de lecciones de cada curso
// ============================================================
import { esc, icon, modal, toast, today, addDays, DIAS_C, dow, parseISO, copiar, confirmar } from './util.js';
import * as store from './store.js';
import * as P from './progreso.js';
import { CATEGORIAS } from './cursos.js';

export function renderInicio(root) {
  const p = store.state.progreso;
  const meta = store.state.ajustes.metaXP || 30;
  const xpHoy = P.xpHoy();
  const dias = Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6));
  const maxXP = Math.max(meta, ...dias.map((d) => p.xpDia[d] || 0));
  const ult = p.ultimoCurso && P.curso(p.ultimoCurso);
  const sig = ult && P.siguiente(ult);
  const vidas = P.vidas();
  const todos = P.cursos();

  root.innerHTML = `
    <div class="page-head">
      <div><div class="eyebrow">Aprende a programar</div><h1>Academia</h1></div>
      <div class="stat-row">
        <span class="stat" title="Racha de días">${icon('flame', 'flame')} ${P.racha()} ${P.racha() === 1 ? 'día' : 'días'}</span>
        <span class="stat" title="Vidas">${icon('heart', 'heart')} ${store.state.ajustes.vidasActivas ? vidas : '∞'}</span>
        <span class="stat" title="XP total">${icon('bolt', 'bolt')} ${p.xpTotal} XP</span>
      </div>
    </div>
    <div class="grid-2">
      <div class="card aca-hero">
        <div class="stack" style="gap:8px">
          <div class="eyebrow">Hoy</div>
          <h2 style="font-size:24px"><span class="num">${xpHoy}</span> / ${meta} XP</h2>
          <div class="pbar" style="--c:${xpHoy >= meta ? 'var(--ok)' : 'var(--pen)'};max-width:320px"><i style="width:${Math.min(100, (xpHoy / meta) * 100)}%"></i></div>
          <p class="small muted">${xpHoy >= meta ? '¡Meta diaria cumplida!' : 'Cada lección da 10 XP, y 5 más si no fallas ninguna.'}${store.state.ajustes.vidasActivas && vidas < P.MAX_VIDAS ? ` Próxima vida en ${P.minutosSiguienteVida()} min.` : ''}</p>
          ${ult && sig ? `<a class="btn primary" style="align-self:flex-start;margin-top:6px" href="#/leccion/${ult.id}/${sig.id}">${icon('play')} Seguir con ${esc(ult.nombre)}</a>` : ''}
        </div>
        <div class="week" aria-label="XP de los últimos 7 días">${dias.map((d) => {
          const v = p.xpDia[d] || 0;
          return `<div class="d ${v >= meta ? 'goal' : ''} ${d === today() ? 'today' : ''}"><b>${v || ''}</b><i style="height:${Math.max(4, (v / maxXP) * 64)}px"></i><span>${DIAS_C[dow(parseISO(d))]}</span></div>`;
        }).join('')}</div>
      </div>
      <div class="card stack" style="gap:10px">
        <h2>Tu progreso</h2>
        <div class="list">${todos.filter((c) => P.progresoCurso(c).hechas > 0).slice(0, 5).map((c) => {
          const pr = P.progresoCurso(c);
          return `<a class="item" href="#/curso/${c.id}"><span class="badge" style="--c:${c.color};--ci:${c.ci || '#fff'};width:34px;height:34px;border-radius:10px;font-size:10px">${esc(c.badge)}</span>
            <div class="grow"><div class="title">${esc(c.nombre)}</div><div class="pbar" style="--c:${c.color};margin-top:6px"><i style="width:${pr.pct}%"></i></div></div><span class="small muted num">${pr.hechas}/${pr.total}</span></a>`;
        }).join('') || '<p class="small muted">Aún no has empezado ningún curso. Te recomiendo HTML → CSS → JavaScript, en ese orden.</p>'}</div>
        <p class="tiny muted">Mejor racha: ${p.mejorRacha || 0} días · Lecciones completadas: ${Object.keys(p.lecciones).length}</p>
      </div>
    </div>
    ${CATEGORIAS.map((cat) => {
      const cs = todos.filter((c) => c.categoria === cat);
      if (!cs.length) return '';
      return `<div class="section"><h2>${cat}</h2><div class="cards">${cs.map((c) => {
        const pr = P.progresoCurso(c);
        return `<a class="card course-card" href="#/curso/${c.id}" style="--c:${c.color};--ci:${c.ci || '#fff'}">
          <span class="badge">${esc(c.badge)}</span>
          <div class="stack" style="gap:6px;flex:1;min-width:0">
            <h3>${esc(c.nombre)}</h3>
            <p class="tiny muted" style="overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${esc(c.descripcion || '')}</p>
            <div class="row" style="gap:8px"><div class="pbar" style="flex:1"><i style="width:${pr.pct}%"></i></div><span class="tiny muted num">${pr.hechas}/${pr.total}</span></div>
          </div>
        </a>`;
      }).join('')}</div></div>`;
    }).join('')}
    <div class="card section">
      <div class="card-head"><h2>Crea tus propios cursos</h2></div>
      <p class="small muted">¿Quieres practicar TypeScript, Docker o el temario de una asignatura? Pide a Claude un curso con la instrucción de abajo e impórtalo.</p>
      <div class="row" style="margin-top:10px"><button class="btn" data-act="prompt">${icon('copy')} Copiar instrucción</button><button class="btn primary" data-act="importar">${icon('upload')} Importar curso</button></div>
    </div>`;

  root.onclick = (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'prompt') copiar(PROMPT_CURSO);
    if (b.dataset.act === 'importar') importarCurso();
  };
}

const OFFSETS = [0, 44, 72, 44, 0, -44, -72, -44];

export function renderCurso(root, { id }) {
  const c = P.curso(id);
  if (!c) { root.innerHTML = `<div class="empty"><h3>Curso no encontrado</h3><a class="btn" href="#/academia">Volver</a></div>`; root.onclick = null; return; }
  const estados = P.estadoLecciones(c);
  const pr = P.progresoCurso(c);
  const errs = P.errores(c.id).length;
  let n = 0;
  root.innerHTML = `
    <a class="btn ghost sm" href="#/academia" style="margin-bottom:10px">${icon('left')} Academia</a>
    <div class="page-head">
      <div class="row" style="gap:14px;align-items:center;flex-wrap:nowrap">
        <span class="badge" style="--c:${c.color};--ci:${c.ci || '#fff'}">${esc(c.badge)}</span>
        <div><h1>${esc(c.nombre)}</h1><p class="small muted">${pr.hechas} de ${pr.total} lecciones · ${pr.pct} %</p></div>
      </div>
      <div class="row">
        ${errs ? `<a class="btn" href="#/repaso/${c.id}">${icon('refresh')} Repasar errores (${errs})</a>` : ''}
        ${c.extra ? `<button class="btn danger" data-act="borrar-curso">${icon('trash')} Quitar curso</button>` : ''}
      </div>
    </div>
    <p class="muted" style="max-width:60ch">${esc(c.descripcion || '')}</p>
    <div class="path" style="--c:${c.color};--ci:${c.ci || '#fff'}">
      ${c.unidades.map((u, ui) => `
        <div class="unit-head"><div class="eyebrow">Unidad ${ui + 1}</div><h2>${esc(u.titulo)}</h2></div>
        ${u.lecciones.map((l) => {
          const st = estados.find((x) => x.l.id === l.id).estado;
          const off = OFFSETS[n++ % OFFSETS.length];
          return `<div class="node-wrap ${st}" style="transform:translateX(${off}px)">
            <button class="node ${st}" data-act="leccion" data-l="${l.id}" aria-label="${esc(l.titulo)} (${st === 'done' ? 'completada' : st === 'current' ? 'siguiente' : 'bloqueada'})">
              ${icon(st === 'done' ? 'check' : st === 'current' ? 'starf' : 'lock')}
            </button>
            <span class="node-label">${esc(l.titulo)}</span>
          </div>`;
        }).join('')}
      `).join('')}
      <div class="node-wrap" style="margin-top:14px"><div class="node ${pr.hechas === pr.total ? 'done' : ''}" style="cursor:default">${icon('crown')}</div><span class="node-label">${pr.hechas === pr.total ? '¡Curso completado!' : 'Meta del curso'}</span></div>
    </div>`;

  root.onclick = async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'leccion') abrirLeccion(c, b.dataset.l, estados.find((x) => x.l.id === b.dataset.l).estado);
    if (b.dataset.act === 'borrar-curso' && await confirmar('Se quitará este curso importado.')) {
      store.remove('cursosExtra', c.id); location.hash = '#/academia';
    }
  };
}

function abrirLeccion(c, lid, estado) {
  const l = P.leccion(c, lid);
  const info = store.state.progreso.lecciones[`${c.id}/${lid}`];
  const m = modal({
    title: l.titulo,
    body: `<p class="muted small">${l.ejercicios.length} ejercicios${l.teoria ? ' · con explicación inicial' : ''}</p>
      ${estado === 'done' ? `<p>Completada ${info.veces} ${info.veces === 1 ? 'vez' : 'veces'} · mejor precisión ${info.mejor} %.</p>` : ''}
      ${estado === 'locked' ? '<p>Esta lección está después de otras que aún no has hecho. Puedes empezarla igualmente si ya dominas lo anterior.</p>' : ''}`,
    foot: `<span class="spacer"></span><button class="btn" data-c>Cerrar</button><a class="btn primary" href="#/leccion/${c.id}/${lid}">${icon('play')} ${estado === 'done' ? 'Repasar' : 'Empezar'}</a>`,
  });
  m.el.querySelector('[data-c]').onclick = m.close;
  m.el.querySelector('a.btn').onclick = () => m.close();
}

// ---------- Importar cursos ----------
const PROMPT_CURSO = `Crea un curso corto tipo Duolingo para aprender [TEMA]. Devuélvelo SOLO como JSON válido, sin texto alrededor, con este formato:
{
  "id": "tema-corto-sin-espacios",
  "nombre": "Nombre del curso",
  "badge": "ABC",
  "color": "#3366cc",
  "descripcion": "Una frase",
  "unidades": [
    { "titulo": "Unidad 1", "lecciones": [
      { "id": "l1", "titulo": "Título de la lección",
        "teoria": "Explicación breve para principiantes. Puedes usar \`código\`, **negrita**, listas con '- ' y bloques con tres comillas invertidas.",
        "ejercicios": [
          { "t": "choice", "q": "Pregunta", "o": ["correcta", "falsa", "falsa", "falsa"], "a": 0, "e": "Explicación" },
          { "t": "input", "q": "Completa", "code": "código con ___ en el hueco", "a": ["respuesta", "alternativa"] },
          { "t": "order", "q": "Ordena", "o": ["piezas", "en", "el", "orden", "correcto"] },
          { "t": "pairs", "q": "Une", "p": [["izquierda", "derecha"], ["a", "b"], ["c", "d"]] }
        ] }
    ] }
  ]
}
Reglas: 2-3 unidades, 2-3 lecciones por unidad, 5-6 ejercicios por lección mezclando los cuatro tipos, "a" en choice es el índice de la correcta (varía su posición), badge de máximo 4 letras, en español y para alguien que empieza desde cero.`;

function importarCurso() {
  const m = modal({
    title: 'Importar curso',
    body: `<p class="small muted">Pega el JSON del curso. Busco el JSON aunque venga con texto alrededor.</p>
      <label class="field"><span>JSON del curso</span><textarea class="input code" id="cur-json" placeholder='{ "id": "typescript", "nombre": "TypeScript", ... }'></textarea></label>`,
    foot: `<button class="btn" data-p>${icon('copy')} Copiar instrucción</button><span class="spacer"></span><button class="btn" data-c>Cancelar</button><button class="btn primary" data-ok>Importar</button>`,
  });
  m.el.querySelector('[data-c]').onclick = m.close;
  m.el.querySelector('[data-p]').onclick = () => copiar(PROMPT_CURSO);
  m.el.querySelector('[data-ok]').onclick = () => {
    try {
      const txt = m.el.querySelector('#cur-json').value;
      const i = txt.indexOf('{'), j = txt.lastIndexOf('}');
      if (i < 0 || j < i) throw new Error('No encuentro el JSON');
      const c = JSON.parse(txt.slice(i, j + 1));
      if (!c.nombre || !Array.isArray(c.unidades) || !c.unidades.length) throw new Error('Falta "nombre" o "unidades"');
      const idBase = String(c.id || c.nombre).toLowerCase().normalize('NFD').replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '') || 'curso';
      const existe = P.cursos().some((x) => x.id === idBase && !x.extra);
      const id = existe ? `${idBase}-mio` : idBase;
      c.unidades.forEach((u, ui) => (u.lecciones || []).forEach((l, li) => {
        l.id = String(l.id || `u${ui + 1}l${li + 1}`);
        l.ejercicios = (l.ejercicios || []).filter((ex) => ['choice', 'input', 'order', 'pairs'].includes(ex.t));
        if (!Array.isArray(l.ejercicios) || !l.ejercicios.length) throw new Error(`La lección "${l.titulo}" no tiene ejercicios válidos`);
      }));
      // Evitar ids de lección repetidos
      const vistos = new Set();
      c.unidades.forEach((u) => u.lecciones.forEach((l, k) => { while (vistos.has(l.id)) l.id += `-${k}`; vistos.add(l.id); }));
      store.put('cursosExtra', { ...c, id, badge: String(c.badge || c.nombre.slice(0, 3)).slice(0, 4).toUpperCase(), color: /^#[0-9a-f]{6}$/i.test(c.color) ? c.color : '#2342b5', categoria: 'Mis cursos' });
      toast('Curso importado');
      m.close();
      location.hash = `#/curso/${id}`;
    } catch (e) { toast(e.message.startsWith('Unexpected') ? 'El JSON tiene un error de formato' : e.message); }
  };
}
