# Campus DAW

Tu app para el curso: asignaturas, horario, calendario de entregas, documentos PDF, tests de repaso y notas, más una **Academia** tipo Duolingo con 13 cursos (HTML, CSS, JavaScript, SQL, Python, PHP, Git, GitHub, VS Code, Node.js, React, Vue y Angular).

Está hecha con **HTML, CSS y JavaScript sin frameworks ni compilación**: puedes abrir cualquier archivo y entender lo que hace. Es una **PWA**: se instala en el iPhone y funciona sin conexión. Con **Supabase** (opcional) tienes los mismos datos y PDF en todos tus dispositivos.

## Probarla en tu ordenador

Los módulos de JavaScript no funcionan abriendo el `index.html` con doble clic. Necesitas un servidor local:

- **VS Code**: instala la extensión *Live Server*, clic derecho en `index.html` → *Open with Live Server*.
- **Terminal**: dentro de la carpeta, `npx serve .` (o `python3 -m http.server`) y abre la dirección que te dé.

La primera vez se cargan datos de ejemplo de 2º DAW. Bórralos con el botón del aviso amarillo o desde **Ajustes**.

## Publicarla en GitHub Pages

1. Crea un repositorio en GitHub (por ejemplo `campus-daw`) y sube todos los archivos de esta carpeta:
   ```bash
   git init
   git add .
   git commit -m "Primera versión de Campus DAW"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/campus-daw.git
   git push -u origin main
   ```
2. En GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
3. En un minuto estará en `https://TU_USUARIO.github.io/campus-daw/`.

También funciona en Hostinger: sube la carpeta tal cual a `public_html` (o a una subcarpeta).

## Instalarla en el iPhone

Abre la web en **Safari** → botón **Compartir** → **Añadir a pantalla de inicio**.

## Conectar Supabase (datos en la nube)

1. Crea un proyecto en [supabase.com](https://supabase.com) (el plan gratuito sobra).
2. Ve a **SQL Editor → New query**, pega todo el contenido de `schema.sql` y pulsa **Run**. Crea la tabla, la seguridad (cada usuario solo ve lo suyo) y el almacenamiento para los PDF.
3. Ve a **Project Settings → API** y copia la **Project URL** y la **anon public key**.
4. Pégalas en `config.js`, o en la app: **Ajustes → Cuenta y nube**.
5. En la app, **Crea cuenta** con tu correo. Si Supabase te pide confirmar el correo, confírmalo y luego **Entra**.
   - Para no tener que confirmar: Supabase → **Authentication → Sign In / Providers → Email** → desactiva *Confirm email*.
   - Si publicas en GitHub Pages, añade tu URL en **Authentication → URL Configuration → Site URL**.

Todo lo que tengas en el dispositivo se sube al iniciar sesión. A partir de ahí, cada cambio se sincroniza solo: al guardar, al volver a la app y cada minuto.

> La `anon key` es pública por diseño: lo que protege tus datos son las políticas RLS del `schema.sql`. Nunca pongas la `service_role` key en la app.

## Avisos de entregas

En **Calendario → Exportar con avisos** se genera un archivo `.ics` con tus entregas y exámenes pendientes. Ábrelo en el iPhone y el Calendario te avisará **el día antes y 2 horas antes**. En **Horario → Exportar** tienes lo mismo con tus clases: las semanales se repiten hasta fin de curso (se configura en Ajustes) saltándose los festivos, y las de fecha concreta aparecen solo ese día.

Si añades entregas nuevas, vuelve a exportar: los eventos que ya estaban se actualizan en lugar de duplicarse.

## Tests y cursos con IA

- **Tests** → *Copiar instrucción*: pégala en Claude junto a tus apuntes, copia el JSON que te devuelva y usa **Importar**.
- **Academia** → *Crea tus propios cursos*: igual, para generar cursos nuevos (TypeScript, Docker, el temario de una asignatura…) en el mismo formato que los incluidos.

## Cómo está organizado el código

Todos los archivos van sueltos en la misma carpeta (sin subcarpetas), para subirlos fácil a GitHub.

```
index.html            Estructura de la app
styles.css            Todos los estilos (colores en :root, modo oscuro incluido)
config.js             URL y clave de Supabase
sw.js                 Service worker (funciona sin conexión)
manifest.webmanifest  Datos para instalarla como app
icon-*.png            Iconos
app.js                Arranque y rutas (#/inicio, #/horario…)
store.js              Datos: se guardan en localStorage al momento
sync.js               Sincronización con Supabase
files.js              PDF y archivos en IndexedDB
clases.js             Clases semanales / de fecha concreta, vistas y atrasadas
util.js               Utilidades: fechas, iconos, modales, formularios
ics.js                Exportar al calendario
demo.js               Datos de ejemplo
hoy.js (Inicio), horario.js, calendario.js, asignaturas.js, documentos.js,
tests.js, academia.js, leccion.js, ajustes.js, mas.js, common.js
                      Una pantalla por archivo
progreso.js           XP, racha, vidas y lecciones completadas
cursos.js             Lista de cursos de la Academia
curso-*.js            Contenido de cada curso
schema.sql            Base de datos y permisos de Supabase
```

### Añadir o ampliar un curso

Cada curso es un objeto con unidades → lecciones → ejercicios. Tipos de ejercicio:

```js
{ t: 'choice', q: 'Pregunta', o: ['A', 'B', 'C'], a: 0, e: 'Explicación opcional' }
{ t: 'input',  q: 'Completa', code: 'const x ___ 5;', a: ['=', 'alternativa'] }
{ t: 'order',  q: 'Ordena', o: ['piezas', 'en', 'orden', 'correcto'] }
{ t: 'pairs',  q: 'Une', p: [['izquierda', 'derecha'], ['a', 'b']] }
```

Crea un archivo `curso-algo.js`, impórtalo en `cursos.js` y añade la ruta a la lista de `sw.js`.

### Publicar cambios

Sube los archivos cambiados a GitHub y listo: con conexión, la app descarga siempre la última versión. Si añades un archivo nuevo, apúntalo también en la lista de `sw.js` y sube el número de `VERSION` (`campus-v3`, `campus-v4`…) para que funcione sin conexión.
