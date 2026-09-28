// Curso de HTML
// Tipos de ejercicio: choice (opciones), input (escribir), order (ordenar piezas), pairs (unir parejas)
// En "input", ___ en el código marca el hueco que hay que rellenar.
export default {
  id: 'html', nombre: 'HTML', badge: 'HTML', color: '#e34c26', categoria: 'Lenguajes',
  descripcion: 'La estructura de toda página web: etiquetas, enlaces, formularios y HTML semántico.',
  unidades: [
    {
      titulo: 'Primeros pasos',
      lecciones: [
        {
          id: 'l1', titulo: 'Qué es HTML',
          teoria: `**HTML** (HyperText Markup Language) describe la **estructura** de una página: qué es un título, qué es un párrafo, qué es una imagen.

Se escribe con **etiquetas** entre \`< >\`. Casi todas tienen apertura y cierre:
\`\`\`
<p>Esto es un párrafo</p>
\`\`\`
La etiqueta de cierre lleva una barra: \`</p>\`. Lo de dentro es el **contenido**.`,
          ejercicios: [
            { t: 'choice', q: '¿Qué significa HTML?', o: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'HyperLink Text Machine Language'], a: 0 },
            { t: 'choice', q: 'HTML sirve para definir…', o: ['La estructura y el contenido de la página', 'Los colores y la tipografía', 'La lógica y los cálculos', 'La base de datos'], a: 0, e: 'Los estilos son cosa de CSS y la lógica de JavaScript.' },
            { t: 'choice', q: '¿Cuál es una etiqueta de cierre correcta?', o: ['</p>', '<p/>', '<\\p>', '<end p>'], a: 0 },
            { t: 'input', q: 'Cierra el párrafo', code: '<p>Hola mundo___', a: ['</p>'], e: 'El cierre repite el nombre con una barra delante.' },
            { t: 'order', q: 'Construye un párrafo', o: ['<p>', 'Aprendo', 'HTML', '</p>'] },
            { t: 'pairs', q: 'Une cada lenguaje con su función', p: [['HTML', 'Estructura'], ['CSS', 'Estilo'], ['JavaScript', 'Comportamiento']] },
          ],
        },
        {
          id: 'l2', titulo: 'Estructura del documento',
          teoria: `Todo documento HTML tiene el mismo esqueleto:
\`\`\`
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Mi página</title>
  </head>
  <body>
    Lo que se ve
  </body>
</html>
\`\`\`
- \`<head>\`: información sobre la página (título, codificación, CSS).
- \`<body>\`: el contenido visible.`,
          ejercicios: [
            { t: 'choice', q: '¿Qué va dentro de <head>?', o: ['Información de la página, como el <title>', 'Todo el texto visible', 'Solo imágenes', 'Los párrafos'], a: 0 },
            { t: 'choice', q: '¿Dónde se escribe el contenido visible?', o: ['<body>', '<head>', '<meta>', '<title>'], a: 0 },
            { t: 'input', q: 'Primera línea de un documento HTML5', code: '<!___ html>', a: ['DOCTYPE', 'doctype'], e: '<!DOCTYPE html> indica al navegador que es HTML5.' },
            { t: 'choice', q: '¿Para qué sirve <meta charset="UTF-8">?', o: ['Para que se vean bien tildes y eñes', 'Para cargar CSS', 'Para poner el título', 'Para añadir JavaScript'], a: 0 },
            { t: 'order', q: 'Ordena el esqueleto básico', o: ['<html>', '<head>', '</head>', '<body>', '</body>', '</html>'] },
            { t: 'input', q: 'El atributo que indica el idioma', code: '<html ___="es">', a: ['lang'] },
          ],
        },
        {
          id: 'l3', titulo: 'Textos y títulos',
          teoria: `Los títulos van de \`<h1>\` (el más importante) a \`<h6>\`. Solo debería haber **un h1** por página.

- \`<p>\` párrafo
- \`<strong>\` texto importante (negrita)
- \`<em>\` énfasis (cursiva)
- \`<br>\` salto de línea (no tiene cierre)
- \`<ul>\` lista sin orden, \`<ol>\` lista numerada, \`<li>\` cada elemento`,
          ejercicios: [
            { t: 'choice', q: '¿Cuál es el título más importante?', o: ['<h1>', '<h6>', '<head>', '<title>'], a: 0 },
            { t: 'choice', q: '¿Qué etiqueta marca un texto como importante?', o: ['<strong>', '<b-important>', '<big>', '<imp>'], a: 0 },
            { t: 'input', q: 'Cada elemento de una lista va en…', code: '<ul>\n  <___>Manzanas</li>\n</ul>', a: ['li'] },
            { t: 'choice', q: 'Una lista numerada se hace con…', o: ['<ol>', '<ul>', '<nl>', '<list>'], a: 0, e: 'ol = ordered list; ul = unordered list.' },
            { t: 'choice', q: '¿Qué etiqueta NO necesita cierre?', o: ['<br>', '<p>', '<li>', '<h2>'], a: 0 },
            { t: 'order', q: 'Crea una lista con un elemento', o: ['<ul>', '<li>', 'HTML', '</li>', '</ul>'] },
          ],
        },
      ],
    },
    {
      titulo: 'Enlaces, imágenes y formularios',
      lecciones: [
        {
          id: 'l4', titulo: 'Enlaces e imágenes',
          teoria: `Un enlace usa \`<a>\` con el atributo \`href\`:
\`\`\`
<a href="https://ejemplo.com">Visita la web</a>
\`\`\`
Con \`target="_blank"\` se abre en otra pestaña.

Una imagen usa \`<img>\` (sin cierre) con \`src\` y \`alt\`:
\`\`\`
<img src="gato.jpg" alt="Un gato dormido">
\`\`\`
El \`alt\` describe la imagen para lectores de pantalla y si no carga.`,
          ejercicios: [
            { t: 'input', q: 'Atributo que indica el destino del enlace', code: '<a ___="contacto.html">Contacto</a>', a: ['href'] },
            { t: 'choice', q: '¿Cómo abres un enlace en otra pestaña?', o: ['target="_blank"', 'new="tab"', 'open="blank"', 'href="_new"'], a: 0 },
            { t: 'input', q: 'Atributo con la ruta de la imagen', code: '<img ___="logo.png" alt="Logo">', a: ['src'] },
            { t: 'choice', q: '¿Para qué sirve el atributo alt?', o: ['Describir la imagen (accesibilidad)', 'Cambiar su tamaño', 'Ponerle borde', 'Hacerla clicable'], a: 0 },
            { t: 'order', q: 'Escribe un enlace', o: ['<a', 'href="index.html"', '>', 'Inicio', '</a>'] },
            { t: 'pairs', q: 'Une atributo y función', p: [['href', 'Destino del enlace'], ['src', 'Ruta del archivo'], ['alt', 'Texto alternativo'], ['target', 'Dónde se abre']] },
          ],
        },
        {
          id: 'l5', titulo: 'Formularios',
          teoria: `Un formulario agrupa campos con \`<form>\`:
\`\`\`
<form action="/enviar" method="post">
  <label for="email">Correo</label>
  <input type="email" id="email" name="email" required>
  <button type="submit">Enviar</button>
</form>
\`\`\`
- \`type\` cambia el campo: text, email, password, number, date, checkbox…
- \`name\` es el nombre con el que llega el dato al servidor.
- \`<label for>\` se une al \`id\` del campo.
- \`required\` lo hace obligatorio.`,
          ejercicios: [
            { t: 'choice', q: '¿Qué type oculta lo que escribes?', o: ['password', 'hidden', 'secret', 'text'], a: 0 },
            { t: 'input', q: 'Haz el campo obligatorio', code: '<input type="text" name="nombre" ___>', a: ['required'] },
            { t: 'choice', q: 'El atributo for de un <label> debe coincidir con…', o: ['El id del campo', 'El name del campo', 'El type del campo', 'El action del form'], a: 0 },
            { t: 'choice', q: '¿Qué atributo da nombre al dato que llega al servidor?', o: ['name', 'id', 'value', 'label'], a: 0 },
            { t: 'input', q: 'Método HTTP para enviar datos de forma no visible en la URL', code: '<form action="/login" method="___">', a: ['post', 'POST'] },
            { t: 'pairs', q: 'Une cada type con su campo', p: [['email', 'Correo'], ['checkbox', 'Casilla'], ['date', 'Fecha'], ['number', 'Número']] },
          ],
        },
        {
          id: 'l6', titulo: 'HTML semántico',
          teoria: `Las etiquetas **semánticas** dicen qué es cada zona. Ayudan al SEO y a la accesibilidad:
- \`<header>\` cabecera
- \`<nav>\` menú de navegación
- \`<main>\` contenido principal (uno por página)
- \`<article>\` contenido independiente (una noticia)
- \`<section>\` sección temática
- \`<aside>\` contenido lateral
- \`<footer>\` pie

\`<div>\` y \`<span>\` no significan nada: úsalos solo para agrupar.`,
          ejercicios: [
            { t: 'choice', q: '¿Qué etiqueta envuelve el menú principal?', o: ['<nav>', '<menu-main>', '<header>', '<aside>'], a: 0 },
            { t: 'choice', q: '¿Cuántos <main> debería tener una página?', o: ['Uno', 'Uno por sección', 'Ninguno', 'Los que quieras'], a: 0 },
            { t: 'choice', q: 'Una entrada de blog independiente va en…', o: ['<article>', '<div>', '<aside>', '<span>'], a: 0 },
            { t: 'pairs', q: 'Une etiqueta y zona', p: [['<header>', 'Cabecera'], ['<footer>', 'Pie de página'], ['<aside>', 'Barra lateral'], ['<main>', 'Contenido principal']] },
            { t: 'choice', q: '¿Por qué usar HTML semántico?', o: ['Mejora accesibilidad y SEO', 'La página carga el doble de rápido', 'Es obligatorio para que funcione', 'Añade estilos automáticamente'], a: 0 },
            { t: 'order', q: 'Orden típico de una página', o: ['<header>', '<nav>', '<main>', '<footer>'] },
          ],
        },
      ],
    },
  ],
};
