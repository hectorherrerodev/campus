// Menú "Más" (solo se ve en el móvil)
import { icon } from './util.js';
import * as store from './store.js';
import * as sync from './sync.js';

export function render(root) {
  const i = sync.info();
  const n = (c) => store.all(c).length;
  root.innerHTML = `
    <div class="page-head"><h1>Más</h1></div>
    <div class="card" style="padding:4px 14px"><div class="list">
      <a class="item" href="#/documentos">${icon('doc')}<div class="grow"><div class="title">Documentos</div><div class="sub">${n('documentos')} archivos</div></div>${icon('right')}</a>
      <a class="item" href="#/tests">${icon('test')}<div class="grow"><div class="title">Tests</div><div class="sub">${n('tests')} tests de repaso</div></div>${icon('right')}</a>
      <a class="item" href="#/calendario">${icon('agenda')}<div class="grow"><div class="title">Calendario</div><div class="sub">Entregas, exámenes y festivos</div></div>${icon('right')}</a>
      <a class="item" href="#/ajustes">${icon('ajustes')}<div class="grow"><div class="title">Ajustes</div><div class="sub">${i.user ? 'Sincronizado con ' + i.user.email : 'Cuenta, copia de seguridad, preferencias'}</div></div>${icon('right')}</a>
    </div></div>`;
  root.onclick = null;
  root.querySelectorAll('.item svg').forEach((s) => { s.style.width = '20px'; s.style.height = '20px'; s.style.color = 'var(--muted)'; s.style.flex = 'none'; });
}
