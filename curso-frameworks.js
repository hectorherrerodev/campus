// Cursos de frameworks: React, Vue y Angular
export const react = {
  id: 'react', nombre: 'React', badge: 'RCT', color: '#149eca', categoria: 'Frameworks',
  descripcion: 'Interfaces con componentes: JSX, props, estado con useState, efectos y listas.',
  unidades: [
    {
      titulo: 'Componentes',
      lecciones: [
        {
          id: 'l1', titulo: 'Componentes y JSX',
          teoria: `En React la interfaz se divide en **componentes**: funciones que devuelven **JSX** (HTML dentro de JavaScript).
\`\`\`
function Saludo() {
  const nombre = "Ana";
  return <h1>Hola, {nombre}</h1>;
}
\`\`\`
- El nombre del componente empieza por **mayúscula**.
- Entre \`{ }\` va JavaScript.
- En JSX se usa \`className\` en vez de \`class\`.
- Un componente devuelve **un solo elemento raíz** (o un fragmento \`<>...</>\`).

Se crea un proyecto con \`npm create vite@latest\` y la plantilla React.`,
          ejercicios: [
            { t: 'input', q: 'Atributo de clase en JSX', code: '<div ___="tarjeta">...</div>', a: ['className'] },
            { t: 'choice', q: '¿Cómo metes una variable dentro de JSX?', o: ['{variable}', '${variable}', '{{variable}}', '<%= variable %>'], a: 0 },
            { t: 'choice', q: '¿Qué nombre de componente es correcto?', o: ['TarjetaProducto', 'tarjetaProducto', 'tarjeta-producto', '_tarjeta'], a: 0 },
            { t: 'choice', q: '¿Qué hay de malo aquí?', code: 'return (\n  <h1>Título</h1>\n  <p>Texto</p>\n);', o: ['Hay dos elementos raíz sin envolver', 'Falta className', 'h1 no existe en JSX', 'Nada'], a: 0, e: 'Envuélvelos en un <div> o en un fragmento <>...</>.' },
            { t: 'order', q: 'Escribe un componente', o: ['function Boton() {', 'return <button>OK</button>;', '}'] },
          ],
        },
        {
          id: 'l2', titulo: 'Props',
          teoria: `Las **props** son los datos que un componente padre pasa a un hijo, como atributos:
\`\`\`
function Tarjeta({ titulo, precio }) {
  return <div>{titulo}: {precio} €</div>;
}

<Tarjeta titulo="Teclado" precio={25} />
\`\`\`
- Las props son de **solo lectura**: el hijo no las cambia.
- Los números y variables se pasan con \`{ }\`; los textos, entre comillas.`,
          ejercicios: [
            { t: 'choice', q: '¿Qué son las props?', o: ['Datos que el padre pasa al hijo', 'El estado interno', 'Estilos CSS', 'Rutas de la app'], a: 0 },
            { t: 'input', q: 'Pasa el número 3 como prop', code: '<Estrellas cantidad=___ />', a: ['{3}'] },
            { t: 'input', q: 'Desestructura la prop nombre', code: 'function Hola({ ___ }) {\n  return <p>Hola {nombre}</p>;\n}', a: ['nombre'] },
            { t: 'choice', q: '¿Puede un componente modificar sus props?', o: ['No, son de solo lectura', 'Sí, siempre', 'Solo si son números', 'Solo con useEffect'], a: 0 },
            { t: 'choice', q: '¿Cómo se llama la prop especial con lo que va entre las etiquetas?', code: '<Caja>Contenido</Caja>', o: ['children', 'content', 'inner', 'slot'], a: 0 },
          ],
        },
        {
          id: 'l3', titulo: 'Estado con useState',
          teoria: `El **estado** son datos que cambian y hacen que el componente se vuelva a pintar.
\`\`\`
import { useState } from 'react';

function Contador() {
  const [cuenta, setCuenta] = useState(0);
  return (
    <button onClick={() => setCuenta(cuenta + 1)}>
      Pulsado {cuenta} veces
    </button>
  );
}
\`\`\`
- Nunca cambies el estado directamente (\`cuenta++\`): usa la función \`setCuenta\`.
- Los eventos se escriben en camelCase: \`onClick\`, \`onChange\`, \`onSubmit\`.`,
          ejercicios: [
            { t: 'input', q: 'Hook para el estado', code: 'const [texto, setTexto] = ___("");', a: ['useState'] },
            { t: 'input', q: 'Evento de clic en JSX', code: '<button ___={sumar}>+</button>', a: ['onClick'] },
            { t: 'choice', q: '¿Cómo actualizas el estado "abierto"?', code: 'const [abierto, setAbierto] = useState(false);', o: ['setAbierto(true)', 'abierto = true', 'this.abierto = true', 'useState(true)'], a: 0 },
            { t: 'choice', q: '¿Qué pasa cuando cambia el estado?', o: ['El componente se vuelve a renderizar', 'Se recarga la página', 'Nada', 'Se borra el componente'], a: 0 },
            { t: 'order', q: 'Declara un estado con valor inicial 0', o: ['const', '[n, setN]', '=', 'useState(0);'] },
          ],
        },
        {
          id: 'l4', titulo: 'Listas y efectos',
          teoria: `Para pintar listas se usa \`map\`, y cada elemento necesita una \`key\` única:
\`\`\`
<ul>
  {tareas.map(t => <li key={t.id}>{t.texto}</li>)}
</ul>
\`\`\`
\`useEffect\` ejecuta código después de pintar, por ejemplo para pedir datos:
\`\`\`
useEffect(() => {
  fetch('/api/tareas').then(r => r.json()).then(setTareas);
}, []);   // [] = solo al montar el componente
\`\`\``,
          ejercicios: [
            { t: 'input', q: 'Atributo obligatorio en elementos de una lista', code: '{items.map(i => <li ___={i.id}>{i.nombre}</li>)}', a: ['key'] },
            { t: 'choice', q: '¿Qué método de array se usa para pintar listas?', o: ['map', 'forEach', 'filter', 'push'], a: 0, e: 'map devuelve un array de elementos JSX; forEach no devuelve nada.' },
            { t: 'input', q: 'Hook para efectos secundarios', code: '___(() => { document.title = "Hola"; }, []);', a: ['useEffect'] },
            { t: 'choice', q: '¿Qué significa el array vacío [] en useEffect?', o: ['Se ejecuta solo una vez al montar', 'Se ejecuta en cada render', 'No se ejecuta nunca', 'Se ejecuta al desmontar solo'], a: 0 },
            { t: 'choice', q: '¿Qué pasa si no pones key en una lista?', o: ['React avisa y puede actualizar mal los elementos', 'La lista no se muestra', 'Error de compilación', 'Nada'], a: 0 },
          ],
        },
      ],
    },
  ],
};

export const vue = {
  id: 'vue', nombre: 'Vue', badge: 'VUE', color: '#42b883', categoria: 'Frameworks',
  descripcion: 'El framework progresivo: plantillas, reactividad con ref, directivas y componentes.',
  unidades: [
    {
      titulo: 'Vue 3 básico',
      lecciones: [
        {
          id: 'l1', titulo: 'Plantillas y reactividad',
          teoria: `Un componente de Vue (\`.vue\`) tiene tres bloques: \`<script setup>\`, \`<template>\` y \`<style>\`.
\`\`\`
<script setup>
import { ref } from 'vue';
const cuenta = ref(0);
</script>

<template>
  <button @click="cuenta++">Pulsado {{ cuenta }} veces</button>
</template>
\`\`\`
- \`ref()\` crea un valor **reactivo**: al cambiar, la vista se actualiza.
- En el script se accede con \`cuenta.value\`; en la plantilla, directamente.
- \`{{ }}\` muestra un valor en la plantilla.`,
          ejercicios: [
            { t: 'input', q: 'Muestra la variable en la plantilla', code: '<p>___ mensaje }}</p>', a: ['{{'] },
            { t: 'input', q: 'Crea un valor reactivo', code: 'const nombre = ___("Ana");', a: ['ref'] },
            { t: 'choice', q: 'En <script setup>, ¿cómo lees el valor de un ref llamado total?', o: ['total.value', 'total', 'total()', '$total'], a: 0 },
            { t: 'choice', q: '¿Qué atajo equivale a v-on:click?', o: ['@click', ':click', '#click', '!click'], a: 0 },
            { t: 'pairs', q: 'Une bloque y contenido', p: [['<script setup>', 'Lógica'], ['<template>', 'HTML de la vista'], ['<style scoped>', 'CSS del componente']] },
          ],
        },
        {
          id: 'l2', titulo: 'Directivas',
          teoria: `Las **directivas** son atributos especiales:
- \`v-if\` / \`v-else\`: muestra u oculta según una condición.
- \`v-for\`: repite un elemento → \`<li v-for="t in tareas" :key="t.id">{{ t.texto }}</li>\`
- \`v-bind:src\` o \`:src\`: enlaza un atributo a una variable.
- \`v-model\`: enlace en dos sentidos con un input → \`<input v-model="busqueda">\`
- \`v-on:click\` o \`@click\`: escucha eventos.`,
          ejercicios: [
            { t: 'input', q: 'Muestra solo si hay sesión', code: '<p ___="logueado">Bienvenido</p>', a: ['v-if'] },
            { t: 'input', q: 'Enlaza el input con la variable', code: '<input ___="email">', a: ['v-model'] },
            { t: 'choice', q: '¿Cómo repites un <li> por cada producto?', o: ['v-for="p in productos"', 'v-repeat="productos"', 'v-each="p of productos"', 'for="p in productos"'], a: 0 },
            { t: 'choice', q: '¿Qué significa :src="foto"?', o: ['El atributo src toma el valor de la variable foto', 'src vale el texto "foto"', 'Es un comentario', 'Es un evento'], a: 0 },
            { t: 'pairs', q: 'Une directiva y función', p: [['v-if', 'Condición'], ['v-for', 'Repetir'], ['v-model', 'Doble enlace'], ['@click', 'Evento']] },
          ],
        },
        {
          id: 'l3', titulo: 'Componentes y props',
          teoria: `Un componente hijo declara las props que acepta:
\`\`\`
<!-- Tarjeta.vue -->
<script setup>
const props = defineProps({ titulo: String, precio: Number });
const emit = defineEmits(['comprar']);
</script>
<template>
  <div>{{ titulo }} <button @click="emit('comprar')">Comprar</button></div>
</template>
\`\`\`
El padre lo usa así:
\`\`\`
<Tarjeta titulo="Ratón" :precio="15" @comprar="añadir" />
\`\`\`
Los datos **bajan** con props y los avisos **suben** con eventos (\`emit\`).`,
          ejercicios: [
            { t: 'input', q: 'Declara las props del componente', code: 'const props = ___({ nombre: String });', a: ['defineProps'] },
            { t: 'input', q: 'Declara los eventos que emite', code: "const emit = ___(['cerrar']);", a: ['defineEmits'] },
            { t: 'choice', q: '¿Cómo avisa un hijo a su padre?', o: ['Emitiendo un evento', 'Cambiando las props', 'Con v-model en el padre siempre', 'No puede'], a: 0 },
            { t: 'choice', q: '¿Por qué :precio="15" lleva dos puntos?', o: ['Para pasarlo como número y no como texto', 'Es obligatorio en todas las props', 'Para que sea opcional', 'Para marcarlo como evento'], a: 0 },
          ],
        },
      ],
    },
  ],
};

export const angular = {
  id: 'angular', nombre: 'Angular', badge: 'NG', color: '#dd0031', categoria: 'Frameworks',
  descripcion: 'El framework completo de Google con TypeScript: componentes, plantillas, servicios y rutas.',
  unidades: [
    {
      titulo: 'Angular básico',
      lecciones: [
        {
          id: 'l1', titulo: 'CLI y componentes',
          teoria: `Angular usa **TypeScript** (JavaScript con tipos) y su propia herramienta, la **CLI**:
\`\`\`
npm install -g @angular/cli
ng new mi-app
ng serve            # servidor de desarrollo
ng generate component tarjeta   # o: ng g c tarjeta
\`\`\`
Un componente es una clase con el decorador \`@Component\`:
\`\`\`
@Component({
  selector: 'app-tarjeta',
  templateUrl: './tarjeta.component.html',
})
export class TarjetaComponent {
  titulo = 'Hola';
}
\`\`\``,
          ejercicios: [
            { t: 'input', q: 'Arranca el servidor de desarrollo', code: 'ng ___', a: ['serve'] },
            { t: 'input', q: 'Genera un componente', code: 'ng generate ___ perfil', a: ['component'] },
            { t: 'choice', q: '¿Qué lenguaje usa Angular?', o: ['TypeScript', 'Python', 'PHP', 'Dart'], a: 0 },
            { t: 'input', q: 'Decorador de un componente', code: "@___({ selector: 'app-menu', ... })", a: ['Component'] },
            { t: 'choice', q: '¿Para qué sirve selector?', o: ['Es la etiqueta HTML con la que usas el componente', 'Selecciona el CSS', 'Es el nombre del archivo', 'Elige la ruta'], a: 0 },
          ],
        },
        {
          id: 'l2', titulo: 'Plantillas y enlaces',
          teoria: `Formas de enlazar datos en la plantilla:
- **Interpolación**: \`{{ titulo }}\`
- **Property binding**: \`[src]="fotoUrl"\`
- **Event binding**: \`(click)="guardar()"\`
- **Two-way binding**: \`[(ngModel)]="nombre"\`

Control de flujo (Angular 17+):
\`\`\`
@if (logueado) { <p>Hola</p> }
@for (p of productos; track p.id) { <li>{{ p.nombre }}</li> }
\`\`\``,
          ejercicios: [
            { t: 'pairs', q: 'Une sintaxis y tipo de enlace', p: [['{{ x }}', 'Interpolación'], ['[src]', 'Propiedad'], ['(click)', 'Evento'], ['[(ngModel)]', 'Doble sentido']] },
            { t: 'input', q: 'Escucha el clic', code: '<button ___="borrar()">Borrar</button>', a: ['(click)'] },
            { t: 'input', q: 'Enlace en dos sentidos', code: '<input ___="busqueda">', a: ['[(ngModel)]'] },
            { t: 'choice', q: '¿Cómo repites elementos en Angular 17+?', o: ['@for (item of items; track item.id)', 'v-for="item in items"', 'items.map()', '*repeat="items"'], a: 0 },
            { t: 'choice', q: '¿Qué hace [disabled]="cargando"?', o: ['Desactiva el botón cuando cargando es true', 'Escucha un evento', 'Muestra el texto cargando', 'Nada'], a: 0 },
          ],
        },
        {
          id: 'l3', titulo: 'Servicios y rutas',
          teoria: `Un **servicio** guarda lógica compartida (por ejemplo, llamadas a una API) y se **inyecta** en los componentes:
\`\`\`
@Injectable({ providedIn: 'root' })
export class ProductosService {
  private http = inject(HttpClient);
  listar() { return this.http.get<Producto[]>('/api/productos'); }
}
\`\`\`
Las **rutas** asocian URLs a componentes:
\`\`\`
export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'productos/:id', component: DetalleComponent },
];
\`\`\`
En la plantilla, \`<router-outlet>\` es donde se pinta la página y \`routerLink\` crea los enlaces.`,
          ejercicios: [
            { t: 'choice', q: '¿Para qué sirve un servicio?', o: ['Compartir lógica y datos entre componentes', 'Dar estilos', 'Definir la plantilla', 'Crear rutas'], a: 0 },
            { t: 'input', q: 'Decorador de un servicio', code: "@___({ providedIn: 'root' })", a: ['Injectable'] },
            { t: 'input', q: 'Dónde se pintan las páginas de las rutas', code: '<___></router-outlet>', a: ['router-outlet'] },
            { t: 'choice', q: '¿Cómo creas un enlace a /contacto?', o: ['<a routerLink="/contacto">', '<a href-router="/contacto">', '<router-link to="/contacto">', '<a (route)="contacto">'], a: 0 },
            { t: 'choice', q: '¿Qué clase se usa para peticiones HTTP?', o: ['HttpClient', 'FetchService', 'Axios', 'XMLHttp'], a: 0 },
          ],
        },
      ],
    },
  ],
};
