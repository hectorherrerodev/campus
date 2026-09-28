// ============================================================
// Reproductor de lecciones tipo Duolingo
// ============================================================
import { esc, icon, md, inline, shuffle, modal, confirmar } from './util.js';
import * as store from './store.js';
import * as P from './progreso.js';

let S = null; // estado de la sesión en curso

const KIND = { choice: 'Elige la respuesta', input: 'Escribe la respuesta', order: 'Ordena las piezas', pairs: 'Une las parejas' };
const ANIMO_OK = ['¡Correcto!', '¡Muy bien!', '¡Genial!', '¡Eso es!', '¡Perfecto!'];
const ANIMO_MAL = ['No es correcto', 'Casi…', 'Vuelve a intentarlo luego'];

export function render(root, { curso, leccion }) {
  const c = P.curso(curso);
  const l = c && P.leccion(c, leccion);
  if (!l) { root.innerHTML = `<div class="empty"><h3>Lección no encontrada</h3><a class="btn" href="#/academia">Volver</a></div>`; root.onclick = null; return; }
  const key = `${curso}/${leccion}`;
  if (!S || S.key !== key) S = nuevaSesion(c, l.ejercicios.map((ex, i) => ({ ex, k: `${l.id}#${i}` })), { key, leccion: l });
  return pintar(root);
}

export function renderRepaso(root, { curso }) {
  const c = P.curso(curso);
  if (!c) { location.hash = '#/academia'; return; }
  const key = `repaso:${curso}`;
  if (!S || S.key !== key) {
    const items = P.errores(curso).map((k) => ({ ex: P.ejercicio(c, k), k })).filter((x) => x.ex).slice(0, 12);
    if (!items.length) { root.innerHTML = `<div class="empty"><h3>No tienes errores pendientes</h3><p>Cuando falles un ejercicio aparecerá aquí para repasarlo.</p><a class="btn" href="#/curso/${curso}">Volver al curso</a></div>`; root.onclick = null; return; }
    S = nuevaSesion(c, shuffle(items), { key, repaso: true });
  }
  return pintar(root);
}

function nuevaSesion(c, items, extra) {
  return {
    ...extra, curso: c, cola: items.map(prepara), hechos: 0, total: items.length,
    fallosPrimera: new Set(), fase: extra.leccion?.teoria ? 'teoria' : 'ex', res: null, inicio: Date.now(), xp: 0, fin: null,
  };
}

/** Prepara el estado visual de un ejercicio (orden aleatorio, etc.). */
function prepara(item) {
  const { ex } = item;
  const st = { ...item };
  if (ex.t === 'choice') st.orden = shuffle(ex.o.map((_, i) => i)), st.sel = null;
  if (ex.t === 'input') st.valor = '';
  if (ex.t === 'order') st.banco = shuffle([...ex.o, ...(ex.extra || [])].map((txt, i) => ({ txt, i }))), st.elegidas = [];
  if (ex.t === 'pairs') st.izq = shuffle(ex.p.map((_, i) => i)), st.der = shuffle(ex.p.map((_, i) => i)), st.hechas = new Set(), st.selI = null, st.selD = null, st.errores = 0;
  return st;
}

function pintar(root) {
  const s = S;
  const c = s.curso;
  const vidasOn = store.state.ajustes.vidasActivas && !s.repaso;
  const vidas = P.vidas();
  const volver = `#/curso/${c.id}`;
  const top = `<div class="player-top">
    <button class="btn ghost icon" data-act="salir" aria-label="Salir">${icon('x')}</button>
    <div class="pbar"><i style="width:${(s.hechos / s.total) * 100}%"></i></div>
    ${s.leccion?.teoria && s.fase === 'ex' ? `<button class="btn ghost sm" data-act="teoria">Teoría</button>` : ''}
    ${vidasOn ? `<span class="stat">${icon('heart', 'heart')} ${vidas}</span>` : ''}
  </div>`;

  if (vidasOn && vidas <= 0 && s.fase !== 'fin' && !s.res) s.fase = 'sinvidas';

  let body = '';
  let bar = '';
  if (s.fase === 'teoria') {
    body = `<div class="ex-kind">${esc(c.nombre)} · ${esc(s.leccion.titulo)}</div><div class="theory">${md(s.leccion.teoria)}</div>`;
    bar = `<div class="checkbar"><div class="in"><span class="spacer"></span><button class="btn primary" data-act="empezar">Empezar ejercicios</button></div></div>`;
  } else if (s.fase === 'sinvidas') {
    body = `<div class="finish">${icon('heart', 'heart')}<h1>Te has quedado sin vidas</h1>
      <p class="muted">Recuperas una cada 30 minutos (próxima en ${P.minutosSiguienteVida()} min). También puedes repasar tus errores para ganar una, o desactivar las vidas en Ajustes.</p>
      <div class="row" style="justify-content:center">${P.errores(c.id).length ? `<a class="btn primary" href="#/repaso/${c.id}" data-act="reset">Repasar errores</a>` : ''}<a class="btn" href="${volver}" data-act="reset">Volver al curso</a></div></div>`;
  } else if (s.fase === 'fin') {
    const f = s.fin;
    const sig = s.leccion ? P.siguiente(c) : null;
    body = `<div class="finish" style="--c:${c.color}">
      ${icon('starf', '')}
      <h1>${s.repaso ? '¡Repaso terminado!' : '¡Lección completada!'}</h1>
      ${f.subioRacha ? `<p class="stat" style="justify-content:center">${icon('flame', 'flame')} Racha de ${f.racha} ${f.racha === 1 ? 'día' : 'días'}</p>` : ''}
      <div class="finish-stats">
        <div class="fs" style="--c:#e0a800"><span>XP</span><b>+${f.xp}</b></div>
        <div class="fs" style="--c:var(--ok)"><span>Precisión</span><b>${f.precision} %</b></div>
        <div class="fs" style="--c:var(--pen)"><span>Tiempo</span><b>${f.tiempo}</b></div>
      </div>
      <div class="row" style="justify-content:center">
        ${sig ? `<a class="btn primary" href="#/leccion/${c.id}/${sig.id}" data-act="reset">Siguiente: ${esc(sig.titulo)}</a>` : ''}
        <a class="btn ${sig ? '' : 'primary'}" href="${volver}" data-act="reset">Volver al curso</a>
      </div>
    </div>`;
  } else {
    const it = s.cola[0];
    body = ejercicioHTML(it);
    bar = barraHTML(it);
  }

  root.innerHTML = `<div class="player">${top}<div class="player-body">${body}</div>${bar}</div>`;
  const inp = root.querySelector('#ex-input');
  if (inp) {
    inp.value = s.cola[0].valor;
    inp.oninput = () => { s.cola[0].valor = inp.value; root.querySelector('[data-act="comprobar"]').disabled = !inp.value.trim(); };
    if (!s.res) setTimeout(() => inp.focus(), 30);
  }

  root.onclick = async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'reset') { S = null; return; }
    if (act === 'salir') {
      if (s.fase === 'ex' && s.hechos > 0 && !(await confirmar('Si sales ahora perderás el progreso de esta lección.', { ok: 'Salir' }))) return;
      S = null; location.hash = volver; return;
    }
    if (act === 'teoria') { modal({ title: s.leccion.titulo, body: `<div class="theory" style="border:0;padding:0">${md(s.leccion.teoria)}</div>` }); return; }
    if (act === 'empezar') { s.fase = 'ex'; pintar(root); return; }
    if (s.fase !== 'ex') return;
    const it = s.cola[0];
    if (act === 'op' && !s.res) { it.sel = Number(b.dataset.i); pintar(root); }
    if (act === 'tok' && !s.res) { const i = Number(b.dataset.i); if (!it.elegidas.includes(i)) it.elegidas.push(i); pintar(root); }
    if (act === 'untok' && !s.res) { it.elegidas = it.elegidas.filter((x) => x !== Number(b.dataset.i)); pintar(root); }
    if (act === 'pair' && !s.res) parejas(root, it, b.dataset.lado, Number(b.dataset.i));
    if (act === 'comprobar') comprobar(it);
    if (act === 'continuar') continuar();
    if (act === 'comprobar' || act === 'continuar') pintar(root);
  };

  const onKey = (e) => {
    if (!root.isConnected || !S || S !== s) return;
    if (e.target.tagName === 'INPUT' && e.key !== 'Enter') return;
    if (e.key === 'Enter') {
      e.preventDefault();
      (root.querySelector('[data-act="continuar"]') || root.querySelector('[data-act="comprobar"]:not([disabled])') || root.querySelector('[data-act="empezar"]'))?.click();
    } else if (/^[1-9]$/.test(e.key) && s.fase === 'ex' && !s.res) {
      root.querySelectorAll('[data-act="op"], [data-act="tok"]:not(.used)')[Number(e.key) - 1]?.click();
    }
  };
  document.onkeydown = onKey;
  return () => { document.onkeydown = null; };
}

function codeHTML(code) {
  return `<pre class="code">${esc(code).replace(/___/g, '<span class="gap">___</span>')}</pre>`;
}

function ejercicioHTML(it) {
  const { ex } = it;
  const q = ex.q ? `<div class="ex-q">${inline(ex.q)}</div>` : '';
  const head = `<div class="ex-kind">${S.repaso ? 'Repaso · ' : ''}${KIND[ex.t]}</div>${q}${ex.code ? codeHTML(ex.code) : ''}`;
  const r = S.res;
  if (ex.t === 'choice') {
    return `${head}<div class="opts">${it.orden.map((i, n) => {
      let cls = it.sel === i ? 'sel' : '';
      if (r) cls = i === ex.a ? 'right' : it.sel === i ? 'wrong' : '';
      return `<button class="opt ${cls}" data-act="op" data-i="${i}" ${r ? 'disabled' : ''}><span class="k">${n + 1}</span><span class="mono" style="font-family:${/[<>{}()=;.$]/.test(ex.o[i]) ? 'var(--f-mono)' : 'inherit'}">${esc(ex.o[i])}</span></button>`;
    }).join('')}</div>`;
  }
  if (ex.t === 'input') {
    return `${head}<input class="input big" id="ex-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Escribe aquí" ${r ? 'disabled' : ''}>`;
  }
  if (ex.t === 'order') {
    return `${head}
      <div class="answer-line">${it.elegidas.map((i) => `<button class="tok" data-act="untok" data-i="${i}">${esc(it.banco.find((b) => b.i === i).txt)}</button>`).join('')}</div>
      <div class="bank">${it.banco.map((b) => `<button class="tok ${it.elegidas.includes(b.i) ? 'used' : ''}" data-act="tok" data-i="${b.i}">${esc(b.txt)}</button>`).join('')}</div>`;
  }
  if (ex.t === 'pairs') {
    return `${head}<div class="pairs">
      <div class="col">${it.izq.map((i) => `<button class="pair ${it.hechas.has(i) ? 'matched' : ''} ${it.selI === i ? 'sel' : ''}" data-act="pair" data-lado="i" data-i="${i}">${esc(ex.p[i][0])}</button>`).join('')}</div>
      <div class="col">${it.der.map((i) => `<button class="pair ${it.hechas.has(i) ? 'matched' : ''} ${it.selD === i ? 'sel' : ''}" data-act="pair" data-lado="d" data-i="${i}">${esc(ex.p[i][1])}</button>`).join('')}</div>
    </div>`;
  }
  return '';
}

function barraHTML(it) {
  const r = S.res;
  if (r) {
    return `<div class="checkbar ${r.ok ? 'ok' : 'bad'}"><div class="in">
      <div class="fb"><h3>${r.ok ? ANIMO_OK[Math.floor(Math.random() * ANIMO_OK.length)] : ANIMO_MAL[Math.floor(Math.random() * ANIMO_MAL.length)]}</h3>
        ${!r.ok && r.correcta ? `<p class="small">Respuesta correcta: <code>${esc(r.correcta)}</code></p>` : ''}
        ${it.ex.e ? `<p class="small">${inline(it.ex.e)}</p>` : ''}
        ${!r.ok ? `<p class="tiny muted">Volverá a salir al final de la lección.</p>` : ''}</div>
      <button class="btn primary" data-act="continuar">Continuar</button></div></div>`;
  }
  if (it.ex.t === 'pairs') return `<div class="checkbar"><div class="in"><span class="muted small">Toca un elemento de cada columna</span><span class="spacer"></span><button class="btn" data-act="saltar-pairs" disabled>Comprobar</button></div></div>`;
  const listo = it.ex.t === 'choice' ? it.sel != null : it.ex.t === 'order' ? it.elegidas.length > 0 : !!it.valor.trim();
  return `<div class="checkbar"><div class="in"><span class="spacer"></span><button class="btn primary" data-act="comprobar" ${listo ? '' : 'disabled'}>Comprobar</button></div></div>`;
}

const norm = (s, cs) => { let x = String(s).trim().replace(/\s+/g, ' ').replace(/[“”]/g, '"').replace(/[‘’]/g, "'"); return cs ? x : x.toLowerCase(); };

function comprobar(it) {
  const { ex } = it;
  let ok = false;
  let correcta = '';
  if (ex.t === 'choice') { ok = it.sel === ex.a; correcta = ex.o[ex.a]; }
  if (ex.t === 'input') {
    const v = norm(it.valor, ex.cs);
    ok = ex.a.some((a) => norm(a, ex.cs) === v || norm(a, ex.cs) === v.replace(/;$/, ''));
    correcta = ex.a[0];
  }
  if (ex.t === 'order') {
    const dada = it.elegidas.map((i) => it.banco.find((b) => b.i === i).txt);
    ok = dada.length === ex.o.length && dada.every((t, i) => t === ex.o[i]);
    correcta = ex.o.join(' ');
  }
  S.res = { ok, correcta };
  registrar(it, ok);
}

function registrar(it, ok) {
  const c = S.curso;
  if (ok) {
    S.hechos++;
    if (S.repaso) P.quitarError(c.id, it.k);
  } else {
    S.fallosPrimera.add(it.k);
    if (!S.repaso) { P.anotarError(c.id, it.k); if (store.state.ajustes.vidasActivas) P.perderVida(); }
  }
}

function parejas(root, it, lado, i) {
  if (lado === 'i') it.selI = it.selI === i ? null : i; else it.selD = it.selD === i ? null : i;
  if (it.selI != null && it.selD != null) {
    if (it.selI === it.selD) {
      it.hechas.add(it.selI);
      it.selI = it.selD = null;
      if (it.hechas.size === it.ex.p.length) {
        const ok = it.errores === 0;
        S.res = { ok: true, correcta: '' };
        S.hechos++;
        if (!ok) S.fallosPrimera.add(it.k);
      }
    } else {
      it.errores++;
      const a = root.querySelector(`[data-lado="i"][data-i="${it.selI}"]`);
      const b = root.querySelector(`[data-lado="d"][data-i="${it.selD}"]`);
      [a, b].forEach((el) => el && el.classList.add('shake'));
      it.selI = it.selD = null;
      setTimeout(() => pintar(root), 320);
      return;
    }
  }
  pintar(root);
}

function continuar() {
  const s = S;
  const it = s.cola.shift();
  if (!s.res.ok) s.cola.push(prepara({ ex: it.ex, k: it.k }));
  s.res = null;
  if (!s.cola.length) terminar();
}

function terminar() {
  const s = S;
  const c = s.curso;
  const precision = Math.round(((s.total - s.fallosPrimera.size) / s.total) * 100);
  const perfecta = s.fallosPrimera.size === 0;
  const xp = s.repaso ? 5 + s.total : 10 + (perfecta ? 5 : 0);
  const r = P.sumarXP(xp);
  if (s.leccion) P.completarLeccion(c.id, s.leccion.id, precision);
  if (s.repaso) P.recuperarVida();
  const seg = Math.round((Date.now() - s.inicio) / 1000);
  s.fin = { xp, precision, tiempo: `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`, racha: r.racha, subioRacha: r.subioRacha };
  s.fase = 'fin';
  store.emit();
}
