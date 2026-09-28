export default {
  id: 'python', nombre: 'Python', badge: 'PY', color: '#3776ab', categoria: 'Lenguajes',
  descripcion: 'Un lenguaje claro y versátil: variables, condiciones, bucles, listas, funciones y diccionarios.',
  unidades: [
    {
      titulo: 'Lo básico',
      lecciones: [
        {
          id: 'l1', titulo: 'Variables y print',
          teoria: `En Python no se declara el tipo ni se usa \`let\`: basta con asignar.
\`\`\`
nombre = "Ana"
edad = 20
print(nombre, edad)
print(f"Hola, {nombre}")   # f-string
\`\`\`
- Los comentarios empiezan por \`#\`.
- No hace falta \`;\` al final.
- Los nombres se escriben en \`snake_case\`: \`precio_total\`.`,
          ejercicios: [
            { t: 'input', q: 'Muestra el texto por pantalla', code: '___("Hola mundo")', a: ['print'] },
            { t: 'choice', q: '¿Cómo empieza un comentario en Python?', o: ['#', '//', '--', '/*'], a: 0 },
            { t: 'input', q: 'Completa la f-string', code: 'print(___"Tengo {edad} años")', a: ['f'] },
            { t: 'choice', q: '¿Qué estilo de nombres se usa en Python?', o: ['precio_total', 'precioTotal', 'PrecioTotal', 'precio-total'], a: 0 },
            { t: 'choice', q: '¿Qué tipo tiene 3.5?', o: ['float', 'int', 'str', 'double'], a: 0 },
            { t: 'input', q: 'Pide un dato al usuario', code: 'nombre = ___("¿Cómo te llamas? ")', a: ['input'] },
          ],
        },
        {
          id: 'l2', titulo: 'Condiciones',
          teoria: `En Python los bloques se marcan con **sangría** (4 espacios) y dos puntos:
\`\`\`
if nota >= 5:
    print("Aprobado")
elif nota >= 4:
    print("Casi")
else:
    print("Suspenso")
\`\`\`
Operadores lógicos en palabras: \`and\`, \`or\`, \`not\`.`,
          ejercicios: [
            { t: 'input', q: 'Termina la línea del if', code: 'if edad >= 18___\n    print("Mayor de edad")', a: [':'] },
            { t: 'input', q: 'La palabra para "si no, si…"', code: 'if x > 0:\n    ...\n___ x == 0:\n    ...', a: ['elif'] },
            { t: 'choice', q: '¿Qué marca un bloque de código en Python?', o: ['La sangría', 'Las llaves { }', 'begin / end', 'Los paréntesis'], a: 0 },
            { t: 'choice', q: '¿Cómo se escribe "y" lógico?', o: ['and', '&&', '&', 'AND'], a: 0 },
            { t: 'choice', q: '¿Qué imprime?', code: 'x = 3\nif x > 5:\n    print("A")\nelse:\n    print("B")', o: ['B', 'A', 'AB', 'Error'], a: 0 },
            { t: 'input', q: 'Comprueba si dos valores son iguales', code: 'if clave ___ "1234":', a: ['=='] },
          ],
        },
        {
          id: 'l3', titulo: 'Bucles',
          teoria: `\`for\` recorre secuencias; \`range(n)\` genera 0, 1, …, n-1:
\`\`\`
for i in range(3):
    print(i)        # 0 1 2

for fruta in ["pera", "uva"]:
    print(fruta)
\`\`\`
\`while\` repite mientras se cumpla la condición:
\`\`\`
n = 3
while n > 0:
    n -= 1
\`\`\``,
          ejercicios: [
            { t: 'input', q: 'Recorre la lista', code: 'for nota ___ notas:\n    print(nota)', a: ['in'] },
            { t: 'choice', q: '¿Qué números genera range(1, 4)?', o: ['1, 2, 3', '1, 2, 3, 4', '0, 1, 2, 3', '4'], a: 0 },
            { t: 'input', q: 'Repite 10 veces', code: 'for i in ___(10):', a: ['range'] },
            { t: 'choice', q: '¿Cómo se sale de un bucle?', o: ['break', 'exit', 'stop', 'return loop'], a: 0 },
            { t: 'order', q: 'Imprime los números del 0 al 4', o: ['for', 'i', 'in', 'range(5):', 'print(i)'] },
          ],
        },
      ],
    },
    {
      titulo: 'Estructuras y funciones',
      lecciones: [
        {
          id: 'l4', titulo: 'Listas y diccionarios',
          teoria: `**Lista**: colección ordenada, se puede modificar.
\`\`\`
notas = [7, 5, 9]
notas.append(8)
len(notas)      # 4
notas[0]        # 7
notas[-1]       # 8 (el último)
\`\`\`
**Diccionario**: pares clave → valor.
\`\`\`
alumno = {"nombre": "Leo", "curso": 2}
alumno["nombre"]      # "Leo"
alumno["email"] = "leo@mail.com"
\`\`\``,
          ejercicios: [
            { t: 'input', q: 'Añade un elemento a la lista', code: 'frutas.___("kiwi")', a: ['append'] },
            { t: 'input', q: 'Longitud de la lista', code: 'total = ___(frutas)', a: ['len'] },
            { t: 'choice', q: '¿Qué devuelve nums[-1]?', code: 'nums = [4, 8, 15]', o: ['15', '4', 'Error', '-1'], a: 0 },
            { t: 'choice', q: '¿Cómo lees el valor de "edad"?', code: 'p = {"nombre": "Eva", "edad": 30}', o: ['p["edad"]', 'p.edad()', 'p(edad)', 'p->edad'], a: 0 },
            { t: 'pairs', q: 'Une estructura y sintaxis', p: [['Lista', '[1, 2, 3]'], ['Diccionario', '{"a": 1}'], ['Tupla', '(1, 2)'], ['Conjunto', '{1, 2}']] },
            { t: 'choice', q: '¿Qué devuelve?', code: '[n * 2 for n in [1, 2, 3]]', o: ['[2, 4, 6]', '[1, 2, 3, 1, 2, 3]', '12', 'Error'], a: 0, e: 'Es una "list comprehension": crea una lista transformando otra.' },
          ],
        },
        {
          id: 'l5', titulo: 'Funciones',
          teoria: `Se definen con \`def\`:
\`\`\`
def sumar(a, b):
    return a + b

def saludar(nombre="alumno"):
    print(f"Hola, {nombre}")

sumar(2, 3)     # 5
saludar()       # Hola, alumno
\`\`\`
Los parámetros pueden tener **valores por defecto**.`,
          ejercicios: [
            { t: 'input', q: 'Define la función', code: '___ cuadrado(n):\n    return n * n', a: ['def'] },
            { t: 'input', q: 'Devuelve el resultado', code: 'def doble(n):\n    ___ n * 2', a: ['return'] },
            { t: 'choice', q: '¿Qué imprime?', code: 'def f(x=10):\n    return x + 1\nprint(f())', o: ['11', '1', 'Error', 'None'], a: 0 },
            { t: 'choice', q: '¿Qué devuelve una función sin return?', o: ['None', 'null', 'undefined', '0'], a: 0 },
            { t: 'order', q: 'Define una función que salude', o: ['def', 'saludar(nombre):', 'print(f"Hola {nombre}")'] },
          ],
        },
      ],
    },
  ],
};
