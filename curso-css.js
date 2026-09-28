export default {
  id: 'css', nombre: 'CSS', badge: 'CSS', color: '#2965f1', categoria: 'Lenguajes',
  descripcion: 'Da estilo a tus páginas: selectores, modelo de caja, Flexbox, Grid y responsive.',
  unidades: [
    {
      titulo: 'Fundamentos',
      lecciones: [
        {
          id: 'l1', titulo: 'Reglas y selectores',
          teoria: `Una regla CSS tiene **selector** y **declaraciones**:
\`\`\`
h1 {
  color: red;
  font-size: 32px;
}
\`\`\`
Selectores básicos:
- \`p\` → todas las etiquetas p
- \`.aviso\` → elementos con class="aviso"
- \`#menu\` → el elemento con id="menu"
- \`nav a\` → los a que están dentro de un nav`,
          ejercicios: [
            { t: 'choice', q: '¿Cómo seleccionas elementos con class="boton"?', o: ['.boton', '#boton', 'boton', '*boton'], a: 0 },
            { t: 'choice', q: '¿Cómo seleccionas el elemento con id="cabecera"?', o: ['#cabecera', '.cabecera', '@cabecera', 'id:cabecera'], a: 0 },
            { t: 'input', q: 'Separador entre propiedad y valor', code: 'p { color___ blue; }', a: [':'] },
            { t: 'input', q: 'Cada declaración termina con…', code: 'p { color: blue___ }', a: [';'] },
            { t: 'order', q: 'Escribe una regla que ponga los párrafos en gris', o: ['p', '{', 'color:', 'gray;', '}'] },
            { t: 'pairs', q: 'Une selector y qué selecciona', p: [['p', 'Todos los párrafos'], ['.nota', 'Elementos con clase nota'], ['#logo', 'Elemento con id logo'], ['ul li', 'li dentro de ul']] },
          ],
        },
        {
          id: 'l2', titulo: 'Colores y texto',
          teoria: `Los colores se pueden escribir de varias formas:
- Nombre: \`red\`
- Hexadecimal: \`#ff0000\`
- RGB: \`rgb(255, 0, 0)\`
- Con transparencia: \`rgba(255, 0, 0, 0.5)\`

Propiedades de texto frecuentes: \`color\`, \`font-family\`, \`font-size\`, \`font-weight\`, \`text-align\`, \`line-height\`.
El fondo se cambia con \`background-color\`.`,
          ejercicios: [
            { t: 'choice', q: '¿Qué propiedad cambia el color del texto?', o: ['color', 'text-color', 'font-color', 'foreground'], a: 0 },
            { t: 'input', q: 'Propiedad para el color de fondo', code: 'body { ___: #f5f5f5; }', a: ['background-color', 'background'] },
            { t: 'choice', q: '#ffffff es…', o: ['Blanco', 'Negro', 'Rojo', 'Transparente'], a: 0 },
            { t: 'choice', q: '¿Qué propiedad centra el texto?', o: ['text-align: center', 'align: center', 'font-align: middle', 'center: true'], a: 0 },
            { t: 'input', q: 'Pon el texto en negrita', code: 'strong { font-weight: ___; }', a: ['bold', '700'] },
            { t: 'choice', q: 'En rgba(0, 0, 0, 0.5), el 0.5 es…', o: ['La opacidad', 'El brillo', 'El tamaño', 'El grosor'], a: 0 },
          ],
        },
        {
          id: 'l3', titulo: 'El modelo de caja',
          teoria: `Cada elemento es una **caja** con cuatro capas, de dentro a fuera:
1. **content**: el contenido
2. **padding**: relleno interior
3. **border**: el borde
4. **margin**: espacio exterior

\`\`\`
.caja {
  padding: 16px;
  border: 2px solid black;
  margin: 20px;
  box-sizing: border-box;
}
\`\`\`
Con \`box-sizing: border-box\`, el \`width\` incluye padding y borde. Casi siempre es lo que quieres.`,
          ejercicios: [
            { t: 'order', q: 'Ordena las capas de dentro a fuera', o: ['content', 'padding', 'border', 'margin'] },
            { t: 'choice', q: '¿Qué propiedad crea espacio FUERA del borde?', o: ['margin', 'padding', 'gap', 'spacing'], a: 0 },
            { t: 'choice', q: '¿Qué propiedad crea espacio DENTRO del borde?', o: ['padding', 'margin', 'outline', 'inset'], a: 0 },
            { t: 'input', q: 'Haz que el width incluya padding y borde', code: '* { box-sizing: ___; }', a: ['border-box'] },
            { t: 'choice', q: 'margin: 10px 20px; significa…', o: ['10px arriba/abajo y 20px izquierda/derecha', '10px izquierda y 20px derecha', '10px arriba y 20px abajo', '10px en todo y 20px de borde'], a: 0 },
            { t: 'input', q: 'Borde de 1px, sólido y gris', code: '.card { border: 1px ___ gray; }', a: ['solid'] },
          ],
        },
      ],
    },
    {
      titulo: 'Maquetación',
      lecciones: [
        {
          id: 'l4', titulo: 'Flexbox',
          teoria: `**Flexbox** coloca elementos en una fila o columna:
\`\`\`
.contenedor {
  display: flex;
  justify-content: space-between; /* eje principal */
  align-items: center;            /* eje cruzado */
  gap: 12px;
}
\`\`\`
- \`flex-direction: column\` los apila en vertical.
- \`flex-wrap: wrap\` deja que salten de línea.
- En un hijo, \`flex: 1\` hace que ocupe el espacio sobrante.`,
          ejercicios: [
            { t: 'input', q: 'Activa Flexbox en el contenedor', code: '.menu { display: ___; }', a: ['flex'] },
            { t: 'choice', q: '¿Qué propiedad alinea en el eje principal?', o: ['justify-content', 'align-items', 'text-align', 'place-self'], a: 0 },
            { t: 'choice', q: '¿Qué propiedad alinea en el eje cruzado?', o: ['align-items', 'justify-content', 'vertical-align', 'flex-cross'], a: 0 },
            { t: 'choice', q: '¿Cómo pones los hijos en columna?', o: ['flex-direction: column', 'flex: column', 'display: column', 'direction: vertical'], a: 0 },
            { t: 'input', q: 'Separación de 16px entre hijos', code: '.fila { display: flex; ___: 16px; }', a: ['gap'] },
            { t: 'pairs', q: 'Une valor de justify-content y resultado', p: [['center', 'Todo en el centro'], ['space-between', 'Extremos pegados a los bordes'], ['flex-end', 'Todo al final'], ['flex-start', 'Todo al principio']] },
          ],
        },
        {
          id: 'l5', titulo: 'Grid',
          teoria: `**CSS Grid** crea rejillas de filas y columnas:
\`\`\`
.galeria {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
\`\`\`
- \`fr\` es una fracción del espacio libre.
- \`repeat(3, 1fr)\` = tres columnas iguales.
- \`repeat(auto-fill, minmax(200px, 1fr))\` crea tantas columnas como quepan, de mínimo 200px.
- Un hijo puede ocupar varias columnas con \`grid-column: span 2\`.`,
          ejercicios: [
            { t: 'input', q: 'Activa Grid', code: '.layout { display: ___; }', a: ['grid'] },
            { t: 'choice', q: 'grid-template-columns: 1fr 2fr; crea…', o: ['2 columnas, la segunda el doble de ancha', '3 columnas iguales', '2 filas', '1 columna de 2fr'], a: 0 },
            { t: 'input', q: 'Cuatro columnas iguales', code: 'grid-template-columns: repeat(4, ___);', a: ['1fr'] },
            { t: 'choice', q: '¿Cómo hace un hijo para ocupar 2 columnas?', o: ['grid-column: span 2', 'columns: 2', 'grid-width: 2', 'span: 2'], a: 0 },
            { t: 'choice', q: '¿Cuándo usar Grid en vez de Flexbox?', o: ['Para rejillas en dos dimensiones', 'Para centrar un solo texto', 'Nunca, hacen lo mismo', 'Solo para tablas de datos'], a: 0, e: 'Flexbox es de una dimensión (fila o columna); Grid, de dos.' },
            { t: 'order', q: 'Rejilla responsive de tarjetas', o: ['grid-template-columns:', 'repeat(auto-fill,', 'minmax(200px,', '1fr));'] },
          ],
        },
        {
          id: 'l6', titulo: 'Responsive',
          teoria: `Una web **responsive** se adapta al tamaño de pantalla.

1. En el HTML, siempre:
\`\`\`
<meta name="viewport" content="width=device-width, initial-scale=1">
\`\`\`
2. Las **media queries** aplican estilos según el ancho:
\`\`\`
@media (max-width: 600px) {
  .menu { flex-direction: column; }
}
\`\`\`
3. Usa unidades relativas: \`%\`, \`rem\` (relativa a la fuente raíz), \`vw\`/\`vh\` (ancho/alto de la ventana).

**Mobile first**: diseña primero para móvil y añade \`min-width\` para pantallas grandes.`,
          ejercicios: [
            { t: 'input', q: 'Regla para aplicar estilos por tamaño de pantalla', code: '___ (max-width: 768px) { ... }', a: ['@media'] },
            { t: 'choice', q: '1rem equivale a…', o: ['El tamaño de fuente del elemento raíz (html)', '1 píxel', 'El 1 % de la pantalla', 'El tamaño de fuente del padre'], a: 0 },
            { t: 'choice', q: '100vw es…', o: ['El ancho total de la ventana', '100 píxeles', 'El ancho del padre', 'El alto de la ventana'], a: 0 },
            { t: 'choice', q: 'En "mobile first", las media queries suelen usar…', o: ['min-width', 'max-width', 'only-mobile', 'device-height'], a: 0 },
            { t: 'choice', q: 'Sin la meta viewport, en el móvil la página…', o: ['Se ve como un escritorio en miniatura', 'No carga', 'Se ve igual', 'Pierde los estilos'], a: 0 },
            { t: 'pairs', q: 'Une unidad y referencia', p: [['rem', 'Fuente raíz'], ['em', 'Fuente del elemento'], ['vh', 'Alto de ventana'], ['%', 'Tamaño del padre']] },
          ],
        },
      ],
    },
  ],
};
