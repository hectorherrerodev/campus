// Cursos de herramientas: Git, GitHub, VS Code y Node.js
export const git = {
  id: 'git', nombre: 'Git', badge: 'GIT', color: '#f05033', categoria: 'Herramientas',
  descripcion: 'Control de versiones desde la terminal: commits, ramas, fusiones y deshacer cambios.',
  unidades: [
    {
      titulo: 'Git desde cero',
      lecciones: [
        {
          id: 'l1', titulo: 'Qué es Git',
          teoria: `**Git** guarda el historial de cambios de tu proyecto. Cada "foto" del proyecto es un **commit**.

Configúralo una vez:
\`\`\`
git config --global user.name "Tu Nombre"
git config --global user.email "tu@correo.com"
\`\`\`
Crear un repositorio en la carpeta actual:
\`\`\`
git init
\`\`\`
Git crea una carpeta oculta \`.git\` con todo el historial.`,
          ejercicios: [
            { t: 'choice', q: '¿Qué es Git?', o: ['Un sistema de control de versiones', 'Una web para alojar código', 'Un editor de código', 'Un lenguaje de programación'], a: 0, e: 'GitHub es la web; Git es la herramienta.' },
            { t: 'input', q: 'Crea un repositorio nuevo', code: 'git ___', a: ['init'] },
            { t: 'choice', q: 'Un commit es…', o: ['Una foto guardada del proyecto', 'Un archivo nuevo', 'Una rama', 'Un servidor'], a: 0 },
            { t: 'input', q: 'Configura tu nombre', code: 'git config --global user.___ "Ana"', a: ['name'] },
            { t: 'choice', q: '¿Dónde guarda Git el historial?', o: ['En la carpeta oculta .git', 'En GitHub siempre', 'En el escritorio', 'En la nube de Microsoft'], a: 0 },
          ],
        },
        {
          id: 'l2', titulo: 'add y commit',
          teoria: `El flujo básico tiene tres zonas:
1. **Directorio de trabajo**: tus archivos.
2. **Staging** (área de preparación): lo que irá en el próximo commit.
3. **Repositorio**: los commits guardados.

\`\`\`
git status              # qué ha cambiado
git add index.html      # prepara un archivo
git add .               # prepara todo
git commit -m "Añade la portada"
git log --oneline       # historial
\`\`\``,
          ejercicios: [
            { t: 'input', q: 'Mira qué archivos han cambiado', code: 'git ___', a: ['status'] },
            { t: 'input', q: 'Prepara todos los cambios', code: 'git add ___', a: ['.', '-A'] },
            { t: 'input', q: 'Guarda con un mensaje', code: 'git commit ___ "Arregla el menú"', a: ['-m'] },
            { t: 'order', q: 'Ordena el flujo', o: ['editar archivos', 'git add .', 'git commit -m "..."', 'git push'] },
            { t: 'choice', q: '¿Qué comando muestra el historial de commits?', o: ['git log', 'git history', 'git show-all', 'git commits'], a: 0 },
            { t: 'pairs', q: 'Une comando y acción', p: [['git status', 'Ver cambios'], ['git add', 'Preparar'], ['git commit', 'Guardar foto'], ['git log', 'Ver historial']] },
          ],
        },
        {
          id: 'l3', titulo: 'Ramas',
          teoria: `Una **rama** es una línea de trabajo paralela. Así pruebas cosas sin romper la principal (\`main\`).
\`\`\`
git branch                 # lista ramas
git switch -c login        # crea la rama "login" y entra
git switch main            # vuelve a main
git merge login            # trae los cambios de login a main
git branch -d login        # borra la rama
\`\`\`
Si dos ramas cambian la misma línea, hay un **conflicto**: Git marca el archivo con \`<<<<<<<\`, \`=======\` y \`>>>>>>>\` y tú eliges qué dejar.`,
          ejercicios: [
            { t: 'input', q: 'Crea la rama "menu" y cámbiate a ella', code: 'git switch ___ menu', a: ['-c'] },
            { t: 'input', q: 'Une la rama "menu" en la actual', code: 'git ___ menu', a: ['merge'] },
            { t: 'choice', q: '¿Para qué sirven las ramas?', o: ['Trabajar en algo sin tocar la rama principal', 'Hacer copias de seguridad en la nube', 'Borrar el historial', 'Compartir archivos por correo'], a: 0 },
            { t: 'choice', q: '¿Cuándo aparece un conflicto?', o: ['Cuando dos ramas cambian las mismas líneas', 'Cuando haces muchos commits', 'Cuando el repo es muy grande', 'Al crear una rama'], a: 0 },
            { t: 'order', q: 'Crea una rama, trabaja y fusiónala', o: ['git switch -c nueva', 'git commit -m "..."', 'git switch main', 'git merge nueva'] },
          ],
        },
        {
          id: 'l4', titulo: 'Deshacer y .gitignore',
          teoria: `- \`git restore archivo\`: descarta cambios sin guardar.
- \`git restore --staged archivo\`: lo saca del staging.
- \`git commit --amend\`: corrige el último commit (si aún no lo has subido).
- \`git revert <id>\`: crea un commit que deshace otro (seguro en repos compartidos).

El archivo **.gitignore** lista lo que Git debe ignorar:
\`\`\`
node_modules/
.env
*.log
\`\`\``,
          ejercicios: [
            { t: 'choice', q: '¿Qué carpeta NUNCA deberías subir en un proyecto Node?', o: ['node_modules/', 'src/', 'public/', 'docs/'], a: 0 },
            { t: 'input', q: 'Archivo con lo que Git debe ignorar', code: '___', a: ['.gitignore'] },
            { t: 'choice', q: '¿Cómo deshaces un commit ya compartido de forma segura?', o: ['git revert', 'git reset --hard', 'Borrar la carpeta .git', 'git delete'], a: 0 },
            { t: 'input', q: 'Descarta los cambios de index.html', code: 'git ___ index.html', a: ['restore', 'checkout'] },
            { t: 'choice', q: '¿Por qué ignorar el archivo .env?', o: ['Tiene contraseñas y claves secretas', 'Ocupa mucho', 'Git no puede leerlo', 'Es obligatorio'], a: 0 },
          ],
        },
      ],
    },
  ],
};

export const github = {
  id: 'github', nombre: 'GitHub', badge: 'GH', color: '#24292f', categoria: 'Herramientas',
  descripcion: 'Sube tus repos, colabora con pull requests y publica webs gratis con GitHub Pages.',
  unidades: [
    {
      titulo: 'Trabajar con GitHub',
      lecciones: [
        {
          id: 'l1', titulo: 'Remotos: push y pull',
          teoria: `**GitHub** aloja repositorios Git en la nube. Un repo en GitHub es un **remoto** (normalmente se llama \`origin\`).
\`\`\`
git remote add origin https://github.com/usuario/proyecto.git
git push -u origin main    # sube tus commits
git pull                   # baja los cambios de otros
git clone https://github.com/usuario/proyecto.git   # copia un repo
\`\`\``,
          ejercicios: [
            { t: 'input', q: 'Sube tus commits', code: 'git ___ origin main', a: ['push'] },
            { t: 'input', q: 'Baja los últimos cambios', code: 'git ___', a: ['pull'] },
            { t: 'input', q: 'Descarga un repo completo', code: 'git ___ https://github.com/user/app.git', a: ['clone'] },
            { t: 'choice', q: 'Por convenio, el remoto principal se llama…', o: ['origin', 'main', 'master', 'github'], a: 0 },
            { t: 'pairs', q: 'Une comando y acción', p: [['push', 'Subir'], ['pull', 'Bajar y fusionar'], ['clone', 'Copiar un repo'], ['fetch', 'Bajar sin fusionar']] },
          ],
        },
        {
          id: 'l2', titulo: 'Pull requests',
          teoria: `Para colaborar sin pisaros:
1. Creas una rama y haces tus commits.
2. La subes: \`git push -u origin mi-rama\`.
3. En GitHub abres un **Pull Request (PR)**: propones fusionar tu rama en \`main\`.
4. Tus compañeros lo **revisan** y comentan.
5. Se hace **merge**.

Un **fork** es tu copia de un repo ajeno, para proponer cambios a proyectos de otros. Las **issues** sirven para apuntar errores y tareas.`,
          ejercicios: [
            { t: 'choice', q: '¿Qué es un pull request?', o: ['Una propuesta para fusionar una rama', 'Un comando para bajar cambios', 'Un tipo de commit', 'Una copia del repo'], a: 0 },
            { t: 'choice', q: '¿Qué es un fork?', o: ['Tu copia de un repositorio de otra persona', 'Una rama local', 'Un error de Git', 'Un archivo de configuración'], a: 0 },
            { t: 'order', q: 'Ordena el flujo de un PR', o: ['crear rama', 'hacer commits', 'git push', 'abrir PR', 'revisión', 'merge'] },
            { t: 'choice', q: '¿Dónde apuntas un error que has encontrado?', o: ['En una issue', 'En el README', 'En un commit vacío', 'En .gitignore'], a: 0 },
            { t: 'pairs', q: 'Une término', p: [['Issue', 'Tarea o error'], ['Pull request', 'Propuesta de cambios'], ['Fork', 'Copia en tu cuenta'], ['README.md', 'Portada del repo']] },
          ],
        },
        {
          id: 'l3', titulo: 'GitHub Pages',
          teoria: `**GitHub Pages** publica gratis webs estáticas (HTML, CSS, JS) desde un repo.

1. Sube tu web a un repo con un \`index.html\` en la raíz.
2. En GitHub: **Settings → Pages**.
3. En *Source* elige la rama \`main\` y la carpeta \`/ (root)\`.
4. En un minuto tendrás la web en \`https://usuario.github.io/repo/\`.

Perfecto para tu portfolio o para una PWA como esta. No sirve para PHP ni bases de datos (para eso, un servidor o servicios como Supabase).`,
          ejercicios: [
            { t: 'choice', q: '¿Qué tipo de web puede alojar GitHub Pages?', o: ['Estática: HTML, CSS y JS', 'PHP con MySQL', 'Cualquier servidor Node', 'Solo WordPress'], a: 0 },
            { t: 'choice', q: '¿Dónde se activa GitHub Pages?', o: ['Settings → Pages', 'Issues → New', 'Actions → Deploy', 'Code → Download'], a: 0 },
            { t: 'input', q: 'Archivo que debe estar en la raíz', code: '___', a: ['index.html'] },
            { t: 'choice', q: '¿Cómo es la URL por defecto?', o: ['usuario.github.io/repo', 'github.com/pages/repo', 'repo.github.com', 'pages.usuario.com'], a: 0 },
          ],
        },
      ],
    },
  ],
};

export const vscode = {
  id: 'vscode', nombre: 'VS Code', badge: 'VSC', color: '#0078d4', categoria: 'Herramientas',
  descripcion: 'Sácale partido al editor: atajos, extensiones, terminal integrada y depuración.',
  unidades: [
    {
      titulo: 'Domina el editor',
      lecciones: [
        {
          id: 'l1', titulo: 'Lo esencial',
          teoria: `**Visual Studio Code** es el editor más usado en desarrollo web.
- Abre una **carpeta** (no archivos sueltos): *Archivo → Abrir carpeta*.
- **Paleta de comandos**: \`Ctrl+Shift+P\` (\`Cmd+Shift+P\` en Mac). Desde ahí lo haces todo.
- **Ir a archivo**: \`Ctrl+P\`.
- **Terminal integrada**: \`Ctrl+ñ\` (teclado español) o *Ver → Terminal*.
- En un HTML vacío, escribe \`!\` y pulsa Tab: **Emmet** genera el esqueleto.`,
          ejercicios: [
            { t: 'choice', q: '¿Qué abre la paleta de comandos?', o: ['Ctrl+Shift+P', 'Ctrl+C', 'Alt+F4', 'Ctrl+Z'], a: 0 },
            { t: 'choice', q: '¿Cómo buscas rápidamente un archivo por su nombre?', o: ['Ctrl+P', 'Ctrl+F', 'Ctrl+S', 'Ctrl+N'], a: 0 },
            { t: 'input', q: 'En un .html vacío, escribe esto + Tab para el esqueleto', code: '___', a: ['!'] },
            { t: 'choice', q: '¿Cómo se llama la función que expande abreviaturas como ul>li*3?', o: ['Emmet', 'IntelliSense', 'Prettier', 'Live Share'], a: 0 },
            { t: 'choice', q: '¿Qué es mejor abrir en VS Code?', o: ['La carpeta del proyecto', 'Cada archivo por separado', 'El escritorio entero', 'Solo el index.html'], a: 0 },
          ],
        },
        {
          id: 'l2', titulo: 'Atajos que ahorran tiempo',
          teoria: `- \`Alt+↑/↓\`: mover la línea.
- \`Shift+Alt+↓\`: duplicar la línea.
- \`Ctrl+D\`: seleccionar la siguiente coincidencia (edición múltiple).
- \`Alt+clic\`: varios cursores.
- \`Ctrl+/\`: comentar/descomentar.
- \`F2\`: renombrar un símbolo en todo el proyecto.
- \`Shift+Alt+F\`: formatear el documento.
- \`Ctrl+Shift+F\`: buscar en todos los archivos.`,
          ejercicios: [
            { t: 'pairs', q: 'Une atajo y acción', p: [['Ctrl+/', 'Comentar'], ['Alt+↑', 'Mover línea arriba'], ['Ctrl+D', 'Siguiente coincidencia'], ['F2', 'Renombrar símbolo']] },
            { t: 'choice', q: '¿Cómo pones varios cursores con el ratón?', o: ['Alt+clic', 'Ctrl+clic derecho', 'Doble clic', 'Shift+rueda'], a: 0 },
            { t: 'choice', q: '¿Qué atajo formatea todo el documento?', o: ['Shift+Alt+F', 'Ctrl+F', 'Ctrl+Shift+P', 'Alt+F4'], a: 0 },
            { t: 'choice', q: '¿Cómo buscas un texto en TODOS los archivos?', o: ['Ctrl+Shift+F', 'Ctrl+F', 'Ctrl+P', 'Ctrl+G'], a: 0 },
            { t: 'choice', q: '¿Qué hace Shift+Alt+↓?', o: ['Duplica la línea hacia abajo', 'Borra la línea', 'Baja al final del archivo', 'Selecciona todo'], a: 0 },
          ],
        },
        {
          id: 'l3', titulo: 'Extensiones y Git integrado',
          teoria: `Extensiones muy útiles para DAW:
- **Live Server**: abre tu HTML con recarga automática.
- **Prettier**: formatea el código al guardar.
- **ESLint**: avisa de errores en JavaScript.
- **Error Lens**: muestra los errores en la misma línea.
- **GitLens**: quién cambió cada línea.
- **PHP Intelephense**, **Vue - Official**, **Angular Language Service** según la asignatura.

La pestaña **Control de código fuente** (\`Ctrl+Shift+G\`) te deja hacer add, commit y push sin escribir comandos.`,
          ejercicios: [
            { t: 'pairs', q: 'Une extensión y utilidad', p: [['Live Server', 'Recarga el navegador al guardar'], ['Prettier', 'Formatea el código'], ['ESLint', 'Detecta errores en JS'], ['GitLens', 'Historial por línea']] },
            { t: 'choice', q: '¿Qué atajo abre el panel de Git?', o: ['Ctrl+Shift+G', 'Ctrl+G', 'Ctrl+Shift+E', 'Ctrl+K'], a: 0 },
            { t: 'choice', q: '¿Qué extensión instalarías para ver tu web actualizándose sola?', o: ['Live Server', 'GitLens', 'Error Lens', 'Docker'], a: 0 },
            { t: 'choice', q: '¿Dónde se instalan las extensiones?', o: ['En la vista Extensiones (Ctrl+Shift+X)', 'Con git install', 'Desde la terminal de Windows', 'En Ajustes → Idioma'], a: 0 },
          ],
        },
      ],
    },
  ],
};

export const node = {
  id: 'node', nombre: 'Node.js', badge: 'NODE', color: '#3c873a', categoria: 'Herramientas',
  descripcion: 'JavaScript fuera del navegador: npm, package.json, módulos y un servidor con Express.',
  unidades: [
    {
      titulo: 'Node y npm',
      lecciones: [
        {
          id: 'l1', titulo: 'Qué es Node.js',
          teoria: `**Node.js** ejecuta JavaScript fuera del navegador: en tu ordenador o en un servidor.
\`\`\`
node -v          # versión instalada
node app.js      # ejecuta un archivo
\`\`\`
Viene con **npm**, el gestor de paquetes. Un proyecto se inicia con:
\`\`\`
npm init -y
\`\`\`
Eso crea **package.json**, la ficha del proyecto: nombre, dependencias y scripts.`,
          ejercicios: [
            { t: 'choice', q: '¿Qué es Node.js?', o: ['Un entorno para ejecutar JavaScript fuera del navegador', 'Un framework de CSS', 'Una base de datos', 'Un navegador'], a: 0 },
            { t: 'input', q: 'Ejecuta el archivo server.js', code: '___ server.js', a: ['node'] },
            { t: 'input', q: 'Crea package.json rápidamente', code: 'npm ___ -y', a: ['init'] },
            { t: 'choice', q: '¿Qué guarda package.json?', o: ['Datos del proyecto, dependencias y scripts', 'El código de las librerías', 'Las contraseñas', 'El historial de Git'], a: 0 },
            { t: 'choice', q: '¿Qué es npm?', o: ['El gestor de paquetes de Node', 'Un editor', 'Un lenguaje', 'Un servidor web'], a: 0 },
          ],
        },
        {
          id: 'l2', titulo: 'Paquetes y scripts',
          teoria: `\`\`\`
npm install express        # dependencia del proyecto
npm install -D vite        # dependencia solo de desarrollo
npm install                # instala todo lo de package.json
\`\`\`
Los paquetes se guardan en \`node_modules/\` (no se sube a Git).

Los **scripts** de package.json se lanzan con \`npm run\`:
\`\`\`
"scripts": { "dev": "vite", "build": "vite build" }
\`\`\`
\`npm run dev\` arranca el servidor de desarrollo.`,
          ejercicios: [
            { t: 'input', q: 'Instala la librería axios', code: 'npm ___ axios', a: ['install', 'i'] },
            { t: 'input', q: 'Lanza el script "dev"', code: 'npm ___ dev', a: ['run'] },
            { t: 'choice', q: '¿Qué hace el flag -D?', o: ['Instala como dependencia de desarrollo', 'Borra el paquete', 'Descarga la documentación', 'Instala globalmente'], a: 0 },
            { t: 'choice', q: 'Clonas un proyecto sin node_modules. ¿Qué haces?', o: ['npm install', 'npm init', 'git pull', 'node install'], a: 0 },
            { t: 'pairs', q: 'Une archivo o carpeta', p: [['package.json', 'Ficha del proyecto'], ['node_modules', 'Paquetes descargados'], ['package-lock.json', 'Versiones exactas'], ['.gitignore', 'Qué no subir']] },
          ],
        },
        {
          id: 'l3', titulo: 'Módulos y Express',
          teoria: `Con **módulos ES** reparte el código en archivos:
\`\`\`
// utils.js
export const sumar = (a, b) => a + b;
// app.js
import { sumar } from './utils.js';
\`\`\`
(En package.json: \`"type": "module"\`.)

**Express** crea un servidor web en pocas líneas:
\`\`\`
import express from 'express';
const app = express();
app.get('/api/hola', (req, res) => res.json({ msg: 'Hola' }));
app.listen(3000);
\`\`\``,
          ejercicios: [
            { t: 'input', q: 'Exporta la función', code: '___ function saludar() { }', a: ['export'] },
            { t: 'input', q: 'Importa desde otro archivo', code: "___ { saludar } from './saludo.js';", a: ['import'] },
            { t: 'input', q: 'Ruta GET en Express', code: "app.___('/usuarios', (req, res) => { ... });", a: ['get'] },
            { t: 'choice', q: '¿Qué hace app.listen(3000)?', o: ['Arranca el servidor en el puerto 3000', 'Espera 3 segundos', 'Crea 3000 rutas', 'Descarga Express'], a: 0 },
            { t: 'choice', q: '¿Cómo responde Express con JSON?', o: ['res.json({...})', 'req.json({...})', 'return JSON', 'res.send.json'], a: 0 },
          ],
        },
      ],
    },
  ],
};
