// ============================================================
// Ajustes: cuenta, sincronización, preferencias y copias
// ============================================================
import { esc, icon, toast, descargar, confirmar, today } from './util.js';
import * as store from './store.js';
import * as sync from './sync.js';
import { hayDemo, borrarDemo, cargarDemo } from './demo.js';

export function render(root) {
  const aj = store.state.ajustes;
  const i = sync.info();
  const cfg = sync.getConfig();

  root.innerHTML = `
    <div class="page-head"><div><div class="eyebrow">App</div><h1>Ajustes</h1></div></div>
    <div class="grid-2">
      <div class="stack">
        <div class="card stack">
          <div class="card-head" style="margin:0"><h2>Cuenta y nube</h2>${icon('cloud')}</div>
          ${cuentaHTML(i, cfg)}
        </div>
        <div class="card stack">
          <h2>Copia de seguridad</h2>
          <p class="small muted">Descarga todos tus datos en un archivo (sin los PDF) o restaura una copia.</p>
          <div class="row">
            <button class="btn" data-act="exportar">${icon('download')} Descargar copia</button>
            <button class="btn" data-act="importar">${icon('upload')} Restaurar copia</button>
            <input type="file" id="imp-backup" accept=".json,application/json" hidden>
          </div>
          <div class="row">
            ${hayDemo() ? `<button class="btn" data-act="borrar-demo">Borrar datos de ejemplo</button>` : `<button class="btn" data-act="cargar-demo">Cargar datos de ejemplo</button>`}
            <button class="btn danger" data-act="borrar-todo">${icon('trash')} Borrar todo en este dispositivo</button>
          </div>
        </div>
      </div>
      <div class="stack">
        <div class="card stack">
          <h2>Academia</h2>
          <label class="field"><span>Meta diaria</span>
            <select class="input" id="aj-meta">${[[10, 'Relajada · 10 XP'], [20, 'Normal · 20 XP'], [30, 'Seria · 30 XP'], [50, 'Intensa · 50 XP']].map(([v, t]) => `<option value="${v}" ${aj.metaXP === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
          <label class="row" style="cursor:pointer"><input type="checkbox" id="aj-vidas" ${aj.vidasActivas ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--pen)"> <span><b>Vidas activadas</b><br><span class="small muted">Pierdes una por fallo y se recupera una cada 30 minutos</span></span></label>
        </div>
        <div class="card stack">
          <h2>Horario y curso</h2>
          <label class="row" style="cursor:pointer"><input type="checkbox" id="aj-sab" ${aj.sabado ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--pen)"> <b>Mostrar el sábado</b></label>
          <div class="form-grid">
            <label class="field"><span>El horario empieza a las</span><input class="input" type="time" id="aj-ini" value="${aj.horaIni}"></label>
            <label class="field"><span>y termina a las</span><input class="input" type="time" id="aj-fin" value="${aj.horaFin}"></label>
            <label class="field full"><span>Fin de curso (para exportar el horario)</span><input class="input" type="date" id="aj-finc" value="${aj.finCurso}"></label>
          </div>
        </div>
        <div class="card stack">
          <h2>Instalar en el iPhone</h2>
          <ol class="small" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px">
            <li>Abre la web en <b>Safari</b>.</li>
            <li>Pulsa el botón <b>Compartir</b> (el cuadrado con la flecha).</li>
            <li>Elige <b>Añadir a pantalla de inicio</b>.</li>
          </ol>
          <p class="tiny muted">Se abrirá a pantalla completa como una app y funcionará sin conexión.</p>
        </div>
      </div>
    </div>`;

  const bind = (sel, ev, fn) => { const el = root.querySelector(sel); if (el) el.addEventListener(ev, fn); };
  bind('#aj-meta', 'change', (e) => { store.setSingle('ajustes', { metaXP: Number(e.target.value) }); toast('Meta guardada'); });
  bind('#aj-vidas', 'change', (e) => store.setSingle('ajustes', { vidasActivas: e.target.checked }));
  bind('#aj-sab', 'change', (e) => store.setSingle('ajustes', { sabado: e.target.checked }));
  bind('#aj-ini', 'change', (e) => store.setSingle('ajustes', { horaIni: e.target.value || '08:00' }));
  bind('#aj-fin', 'change', (e) => store.setSingle('ajustes', { horaFin: e.target.value || '15:00' }));
  bind('#aj-finc', 'change', (e) => store.setSingle('ajustes', { finCurso: e.target.value }));
  bind('#imp-backup', 'change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try { store.importar(await f.text()); toast('Copia restaurada'); } catch (err) { toast(err.message); }
  });
  bind('#sb-form', 'submit', (e) => e.preventDefault());

  root.onclick = async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'exportar') descargar(`campus-daw-${today()}.json`, store.exportar(), 'application/json');
    if (act === 'importar') root.querySelector('#imp-backup').click();
    if (act === 'borrar-demo') { borrarDemo(); toast('Datos de ejemplo borrados'); }
    if (act === 'cargar-demo') { cargarDemo(); toast('Datos de ejemplo cargados'); }
    if (act === 'borrar-todo' && await confirmar('Se borrarán todos los datos guardados en este dispositivo. Lo que esté en la nube no se toca.', { ok: 'Borrar todo' })) {
      store.borrarLocal();
      try { indexedDB.deleteDatabase('campus-files'); } catch { /* nada */ }
      location.hash = '#/hoy';
      location.reload();
    }
    if (act === 'guardar-sb') {
      const url = root.querySelector('#sb-url').value.trim();
      const key = root.querySelector('#sb-key').value.trim();
      if (url && !/^https:\/\/.+/.test(url)) { toast('La URL debe empezar por https://'); return; }
      sync.saveConfig(url, key);
      toast('Guardado. Recargando…');
      setTimeout(() => location.reload(), 600);
    }
    if (act === 'login' || act === 'registro') {
      const email = root.querySelector('#sb-email').value.trim();
      const pass = root.querySelector('#sb-pass').value;
      if (!email || !pass) { toast('Escribe correo y contraseña'); return; }
      b.disabled = true;
      try {
        if (act === 'login') { await sync.login(email, pass); toast('Sesión iniciada'); }
        else { const dentro = await sync.registro(email, pass); toast(dentro ? 'Cuenta creada' : 'Te hemos enviado un correo para confirmar la cuenta'); }
      } catch (err) { toast(err.message); }
      b.disabled = false;
      render(root);
    }
    if (act === 'sync') { await sync.syncNow(); toast(sync.info().estado === 'ok' ? 'Sincronizado' : sync.info().error || 'No se pudo sincronizar'); render(root); }
    if (act === 'logout') { await sync.logout(); toast('Sesión cerrada'); render(root); }
    if (act === 'cambiar-sb') { root.querySelector('#sb-cfg').hidden = false; b.hidden = true; }
  };
}

function cuentaHTML(i, cfg) {
  const cfgForm = (oculto) => `<div id="sb-cfg" class="stack" ${oculto ? 'hidden' : ''}>
    <p class="small muted">Conecta tu proyecto de Supabase para tener los mismos datos y PDF en el iPhone y en el ordenador. Los pasos están en el README.</p>
    <label class="field"><span>Project URL</span><input class="input" id="sb-url" value="${esc(cfg.url)}" placeholder="https://xxxx.supabase.co"></label>
    <label class="field"><span>Anon public key</span><input class="input" id="sb-key" value="${esc(cfg.key)}" placeholder="eyJhbGciOi…"></label>
    <div class="row"><button class="btn primary" data-act="guardar-sb">Guardar y conectar</button></div>
  </div>`;
  if (!i.configurado) {
    return `<p>Ahora mismo tus datos se guardan <b>solo en este dispositivo</b>.</p>${cfgForm(false)}`;
  }
  if (i.estado === 'error' && !i.user) return `<p class="small" style="color:var(--bad)">${esc(i.error)}</p>${cfgForm(false)}`;
  if (!i.user) {
    return `<form id="sb-form" class="stack">
      <p class="small muted">Inicia sesión para sincronizar. Lo que ya tengas en este dispositivo se subirá a tu cuenta.</p>
      <label class="field"><span>Correo</span><input class="input" id="sb-email" type="email" autocomplete="email"></label>
      <label class="field"><span>Contraseña</span><input class="input" id="sb-pass" type="password" autocomplete="current-password"></label>
      <div class="row"><button class="btn primary" type="button" data-act="login">Entrar</button><button class="btn" type="button" data-act="registro">Crear cuenta</button></div>
    </form>
    <button class="btn ghost sm" data-act="cambiar-sb">Cambiar proyecto de Supabase</button>${cfgForm(true)}`;
  }
  return `<div class="item" style="border:0;padding:0">${icon('user')}<div class="grow"><div class="title">${esc(i.user.email)}</div>
      <div class="sub">${i.estado === 'error' ? `<span style="color:var(--bad)">${esc(i.error)}</span>` : i.lastSync ? `Última sincronización: ${i.lastSync.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : 'Conectado'}</div></div></div>
    <div class="row"><button class="btn" data-act="sync">${icon('sync')} Sincronizar ahora</button><button class="btn ghost" data-act="logout">Cerrar sesión</button></div>
    <button class="btn ghost sm" data-act="cambiar-sb">Cambiar proyecto de Supabase</button>${cfgForm(true)}`;
}
