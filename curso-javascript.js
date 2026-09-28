export default {
  id: 'js', nombre: 'JavaScript', badge: 'JS', color: '#f0c419', ci: '#1a2030', categoria: 'Lenguajes',
  descripcion: 'El lenguaje de la web: variables, funciones, arrays, objetos, el DOM y peticiones con fetch.',
  unidades: [
    {
      titulo: 'Lo básico',
      lecciones: [
        {
          id: 'l1', titulo: 'Variables',
          teoria: `Una **variable** guarda un valor con un nombre:
\`\`\`
let edad = 20;
const nombre = "Ana";
edad = 21;        // let se puede cambiar
// nombre = "Eva"; ❌ const no se puede reasignar
\`\`\`
- Usa \`const\` por defecto y \`let\` si el valor va a cambiar.
- \`var\` es la forma antigua: evítala.
- Para ver algo en la consola: \`console.log(nombre)\`.`,
          ejercicios: [
            { t: 'choice', q: '¿Qué palabra usarías para un valor que no se reasigna?', o: ['const', 'let', 'var', 'fixed'], a: 0 },
            { t: 'input', q: 'Declara una variable que pueda cambiar', code: '___ puntos = 0;\npuntos = 10;', a: ['let'] },
            { t: 'input', q: 'Muestra el valor en la consola', code: 'console.___(puntos);', a: ['log'] },
            { t: 'choice', q: '¿Qué pasa aquí?', code: 'const x = 5;\nx = 6;', o: ['Da error', 'x vale 6', 'x vale 5 y 6', 'x vale 11'], a: 0, e: 'No se puede reasignar una constante: TypeError.' },
            { t: 'order', q: 'Declara la constante ciudad con el valor "Madrid"', o: ['const', 'ciudad', '=', '"Madrid";'] },
            { t: 'choice', q: '¿Cuál es un nombre de variable válido?', o: ['precioTotal', 'precio total', '2precio', 'precio-total'], a: 0, e: 'Se usa camelCase; no puede empezar por número ni tener espacios o guiones.' },
          ],
        },
        {
          id: 'l2', titulo: 'Tipos y operadores',
          teoria: `Tipos básicos:
- \`string\`: texto entre comillas → \`"hola"\` o \`'hola'\`
- \`number\`: números → \`42\`, \`3.14\`
- \`boolean\`: \`true\` / \`false\`
- \`undefined\` y \`null\`: sin valor

Operadores: \`+ - * / %\` (el \`%\` da el resto).
Compara siempre con \`===\` (igualdad estricta, mira también el tipo).

Las **plantillas** usan comillas invertidas:
\`\`\`
const saludo = \`Hola, \${nombre}\`;
\`\`\``,
          ejercicios: [
            { t: 'choice', q: '¿Qué tipo es true?', o: ['boolean', 'string', 'number', 'undefined'], a: 0 },
            { t: 'choice', q: '¿Cuánto vale 10 % 3?', o: ['1', '3', '3.33', '0'], a: 0, e: '% es el resto de la división: 10 = 3·3 + 1.' },
            { t: 'choice', q: '¿Qué devuelve "5" === 5?', o: ['false', 'true', 'Error', 'undefined'], a: 0, e: '=== compara también el tipo: string no es number.' },
            { t: 'choice', q: '¿Qué devuelve "2" + 2?', o: ['"22"', '4', 'NaN', 'Error'], a: 0, e: 'Si uno es texto, + concatena.' },
            { t: 'input', q: 'Inserta la variable en la plantilla', code: 'const msg = `Hola, ___{nombre}`;', a: ['$'] },
            { t: 'input', q: 'Averigua el tipo de un valor', code: '___ "hola"  // "string"', a: ['typeof'] },
          ],
        },
        {
          id: 'l3', titulo: 'Condicionales',
          teoria: `\`if\` ejecuta código solo si se cumple una condición:
\`\`\`
if (nota >= 5) {
  console.log("Aprobado");
} else if (nota >= 4) {
  console.log("Casi");
} else {
  console.log("Suspenso");
}
\`\`\`
Operadores lógicos: \`&&\` (y), \`||\` (o), \`!\` (no).
Ternario, para casos cortos: \`const txt = edad >= 18 ? "adulto" : "menor";\``,
          ejercicios: [
            { t: 'input', q: 'Completa la condición', code: '___ (edad >= 18) {\n  console.log("Puedes votar");\n}', a: ['if'] },
            { t: 'choice', q: '¿Qué imprime?', code: 'const n = 7;\nif (n > 10) console.log("A");\nelse console.log("B");', o: ['B', 'A', 'AB', 'Nada'], a: 0 },
            { t: 'choice', q: '¿Qué operador significa "y"?', o: ['&&', '||', '!', '&'], a: 0 },
            { t: 'choice', q: '¿Qué vale true || false?', o: ['true', 'false', 'undefined', 'Error'], a: 0 },
            { t: 'order', q: 'Escribe un ternario', o: ['const', 'estado', '=', 'nota >= 5', '?', '"aprobado"', ':', '"suspenso";'] },
            { t: 'choice', q: '¿Qué valor es "falsy" (cuenta como false)?', o: ['0', '"0"', '[]', '"false"'], a: 0, e: 'Son falsy: 0, "", null, undefined, NaN y false.' },
          ],
        },
        {
          id: 'l4', titulo: 'Bucles',
          teoria: `Un **bucle** repite código.
\`\`\`
for (let i = 0; i < 3; i++) {
  console.log(i); // 0, 1, 2
}
\`\`\`
\`while\` repite mientras se cumpla la condición:
\`\`\`
let n = 3;
while (n > 0) { n--; }
\`\`\`
Para recorrer un array, lo más cómodo es \`for...of\`:
\`\`\`
for (const fruta of frutas) console.log(fruta);
\`\`\``,
          ejercicios: [
            { t: 'choice', q: '¿Cuántas veces se repite?', code: 'for (let i = 0; i < 5; i++) { }', o: ['5', '4', '6', 'Infinitas'], a: 0 },
            { t: 'input', q: 'Incrementa i en 1', code: 'for (let i = 0; i < 10; i___) { }', a: ['++', '+=1', '+= 1'] },
            { t: 'input', q: 'Recorre cada elemento del array', code: 'for (const nota ___ notas) {\n  console.log(nota);\n}', a: ['of'] },
            { t: 'choice', q: '¿Qué imprime el último console.log?', code: 'let i = 0;\nwhile (i < 3) i++;\nconsole.log(i);', o: ['3', '2', '0', '4'], a: 0 },
            { t: 'choice', q: '¿Qué palabra sale de un bucle antes de tiempo?', o: ['break', 'exit', 'stop', 'return loop'], a: 0 },
            { t: 'order', q: 'Cabecera de un for de 0 a 9', o: ['for', '(let i = 0;', 'i < 10;', 'i++)'] },
          ],
        },
      ],
    },
    {
      titulo: 'Funciones y datos',
      lecciones: [
        {
          id: 'l5', titulo: 'Funciones',
          teoria: `Una **función** agrupa código reutilizable. Recibe **parámetros** y puede **devolver** un valor con \`return\`:
\`\`\`
function sumar(a, b) {
  return a + b;
}
sumar(2, 3); // 5
\`\`\`
**Función flecha** (muy usada):
\`\`\`
const doble = (n) => n * 2;
\`\`\`
Si solo hay una expresión, la flecha la devuelve sin escribir \`return\`.`,
          ejercicios: [
            { t: 'input', q: 'Devuelve el resultado', code: 'function cuadrado(n) {\n  ___ n * n;\n}', a: ['return'] },
            { t: 'choice', q: '¿Cuánto vale doble(4)?', code: 'const doble = (n) => n * 2;', o: ['8', '4', '42', 'undefined'], a: 0 },
            { t: 'choice', q: '¿Qué devuelve una función sin return?', o: ['undefined', 'null', '0', 'Error'], a: 0 },
            { t: 'order', q: 'Escribe una función flecha que salude', o: ['const', 'saludar', '=', '(nombre)', '=>', '`Hola ${nombre}`;'] },
            { t: 'pairs', q: 'Une cada término', p: [['Parámetro', 'Variable que recibe la función'], ['Argumento', 'Valor que le pasas al llamarla'], ['return', 'Devuelve un resultado']] },
            { t: 'input', q: 'Llama a la función con 5', code: 'function triple(n) { return n * 3; }\nconst r = triple___;', a: ['(5)', '(5);'] },
          ],
        },
        {
          id: 'l6', titulo: 'Arrays',
          teoria: `Un **array** es una lista ordenada. El primer elemento está en la posición **0**.
\`\`\`
const notas = [7, 5, 9];
notas[0];        // 7
notas.length;    // 3
notas.push(8);   // añade al final
\`\`\`
Métodos imprescindibles:
- \`map\`: transforma cada elemento → nuevo array
- \`filter\`: se queda con los que cumplen
- \`find\`: el primero que cumple
- \`reduce\`: acumula en un solo valor
\`\`\`
const aprobadas = notas.filter(n => n >= 5);
\`\`\``,
          ejercicios: [
            { t: 'choice', q: '¿Qué vale frutas[1]?', code: 'const frutas = ["pera", "uva", "kiwi"];', o: ['"uva"', '"pera"', '"kiwi"', 'undefined'], a: 0 },
            { t: 'input', q: 'Añade un elemento al final', code: 'frutas.___("mango");', a: ['push'] },
            { t: 'input', q: 'Número de elementos', code: 'frutas.___  // 3', a: ['length'] },
            { t: 'choice', q: '¿Qué devuelve?', code: '[1, 2, 3].map(n => n * 10)', o: ['[10, 20, 30]', '60', '[1, 2, 3]', '[11, 12, 13]'], a: 0 },
            { t: 'choice', q: '¿Qué devuelve?', code: '[4, 7, 2, 9].filter(n => n > 5)', o: ['[7, 9]', '[4, 2]', '7', '2'], a: 0 },
            { t: 'pairs', q: 'Une método y lo que hace', p: [['map', 'Transforma cada elemento'], ['filter', 'Se queda con los que cumplen'], ['find', 'Devuelve el primero que cumple'], ['reduce', 'Acumula en un valor']] },
          ],
        },
        {
          id: 'l7', titulo: 'Objetos',
          teoria: `Un **objeto** agrupa datos con nombre (**propiedades**):
\`\`\`
const alumno = {
  nombre: "Leo",
  curso: 2,
  aprobado: true,
};
alumno.nombre;        // "Leo"
alumno["curso"];      // 2
alumno.email = "leo@mail.com"; // añade propiedad
\`\`\`
**Desestructuración**: saca propiedades a variables.
\`\`\`
const { nombre, curso } = alumno;
\`\`\`
Los datos que viajan por internet suelen ir en **JSON**, que se parece mucho a un objeto.`,
          ejercicios: [
            { t: 'choice', q: '¿Cómo lees la propiedad precio?', code: 'const p = { nombre: "Ratón", precio: 15 };', o: ['p.precio', 'p->precio', 'p(precio)', 'p[precio()]'], a: 0 },
            { t: 'input', q: 'Saca nombre a una variable', code: 'const { ___ } = usuario;', a: ['nombre'] },
            { t: 'choice', q: '¿Qué imprime?', code: 'const coche = { marca: "Seat" };\ncoche.color = "rojo";\nconsole.log(coche.color);', o: ['"rojo"', 'undefined', 'Error', '"Seat"'], a: 0 },
            { t: 'input', q: 'Convierte un objeto a texto JSON', code: 'const texto = JSON.___(alumno);', a: ['stringify'] },
            { t: 'input', q: 'Convierte texto JSON en objeto', code: 'const obj = JSON.___(texto);', a: ['parse'] },
            { t: 'order', q: 'Crea un objeto con una propiedad', o: ['const', 'perro', '=', '{', 'nombre:', '"Toby"', '};'] },
          ],
        },
      ],
    },
    {
      titulo: 'JavaScript en el navegador',
      lecciones: [
        {
          id: 'l8', titulo: 'El DOM',
          teoria: `El **DOM** es la página HTML convertida en objetos que JavaScript puede leer y cambiar.
\`\`\`
const titulo = document.querySelector("h1");
titulo.textContent = "Nuevo título";
titulo.classList.add("activo");

const items = document.querySelectorAll(".item"); // todos
\`\`\`
Crear elementos:
\`\`\`
const li = document.createElement("li");
li.textContent = "Leche";
lista.append(li);
\`\`\``,
          ejercicios: [
            { t: 'input', q: 'Selecciona el primer elemento con clase "card"', code: 'const c = document.___(".card");', a: ['querySelector'] },
            { t: 'choice', q: '¿Qué devuelve querySelectorAll?', o: ['Una lista de todos los que coinciden', 'Solo el primero', 'Un string', 'El número de elementos'], a: 0 },
            { t: 'input', q: 'Cambia el texto del elemento', code: 'titulo.___ = "Hola";', a: ['textContent', 'innerText'] },
            { t: 'choice', q: '¿Cómo añades la clase "oculto"?', o: ['el.classList.add("oculto")', 'el.class = "oculto"', 'el.addClass("oculto")', 'el.style.class("oculto")'], a: 0 },
            { t: 'order', q: 'Crea un párrafo y añádelo al body', o: ['const p = document.createElement("p");', 'p.textContent = "Hola";', 'document.body.append(p);'] },
            { t: 'choice', q: '¿Por qué es arriesgado innerHTML con datos del usuario?', o: ['Puede inyectar código (XSS)', 'Es más lento siempre', 'No funciona en móviles', 'Borra el CSS'], a: 0 },
          ],
        },
        {
          id: 'l9', titulo: 'Eventos',
          teoria: `Un **evento** es algo que pasa: un clic, una tecla, enviar un formulario.
\`\`\`
boton.addEventListener("click", () => {
  console.log("¡Clic!");
});
\`\`\`
El manejador recibe un objeto evento:
\`\`\`
form.addEventListener("submit", (e) => {
  e.preventDefault(); // evita que la página se recargue
  const datos = new FormData(form);
});
\`\`\`
Eventos frecuentes: \`click\`, \`input\`, \`change\`, \`submit\`, \`keydown\`, \`DOMContentLoaded\`.`,
          ejercicios: [
            { t: 'input', q: 'Escucha el clic', code: 'btn.___("click", saludar);', a: ['addEventListener'] },
            { t: 'input', q: 'Evita que el formulario recargue la página', code: 'form.addEventListener("submit", (e) => {\n  e.___();\n});', a: ['preventDefault'] },
            { t: 'choice', q: '¿Qué evento salta cada vez que escribes en un input?', o: ['input', 'change', 'submit', 'load'], a: 0 },
            { t: 'choice', q: 'En addEventListener("click", saludar()), ¿qué falla?', o: ['Se ejecuta saludar al momento en vez de pasar la función', 'Nada', 'Falta el punto y coma', 'click va en mayúsculas'], a: 0, e: 'Hay que pasar la función (saludar), no su resultado (saludar()).' },
            { t: 'pairs', q: 'Une evento y cuándo ocurre', p: [['click', 'Pulsar con el ratón'], ['submit', 'Enviar un formulario'], ['keydown', 'Pulsar una tecla'], ['DOMContentLoaded', 'HTML cargado']] },
            { t: 'choice', q: 'Dentro del manejador, e.target es…', o: ['El elemento que originó el evento', 'El documento', 'La ventana', 'El tipo de evento'], a: 0 },
          ],
        },
        {
          id: 'l10', titulo: 'Asincronía y fetch',
          teoria: `Algunas tareas tardan (pedir datos a un servidor). JavaScript no se queda esperando: usa **promesas**.

Con \`async\`/\`await\` el código se lee de arriba a abajo:
\`\`\`
async function cargarUsuarios() {
  try {
    const res = await fetch("https://api.ejemplo.com/usuarios");
    if (!res.ok) throw new Error("Error " + res.status);
    const datos = await res.json();
    console.log(datos);
  } catch (err) {
    console.error(err);
  }
}
\`\`\`
- \`await\` solo se usa dentro de funciones \`async\`.
- \`res.json()\` también devuelve una promesa.`,
          ejercicios: [
            { t: 'input', q: 'Espera la respuesta', code: 'const res = ___ fetch(url);', a: ['await'] },
            { t: 'input', q: 'Marca la función para poder usar await', code: '___ function cargar() { ... }', a: ['async'] },
            { t: 'input', q: 'Convierte la respuesta en datos', code: 'const datos = await res.___();', a: ['json'] },
            { t: 'choice', q: '¿Dónde se capturan los errores con async/await?', o: ['En un bloque try/catch', 'En un if', 'En el return', 'No se pueden capturar'], a: 0 },
            { t: 'order', q: 'Ordena las líneas', o: ['const res = await fetch(url);', 'const datos = await res.json();', 'console.log(datos);'] },
            { t: 'choice', q: '¿Qué imprime primero?', code: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nconsole.log("C");', o: ['A, C, B', 'A, B, C', 'B, A, C', 'C, A, B'], a: 0, e: 'setTimeout se ejecuta después, aunque sea con 0 ms.' },
          ],
        },
      ],
    },
  ],
};
