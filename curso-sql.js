export default {
  id: 'sql', nombre: 'SQL', badge: 'SQL', color: '#00758f', categoria: 'Lenguajes',
  descripcion: 'Consulta y modifica bases de datos: SELECT, filtros, JOIN, agrupaciones y tablas.',
  unidades: [
    {
      titulo: 'Consultas',
      lecciones: [
        {
          id: 'l1', titulo: 'SELECT',
          teoria: `Una base de datos relacional guarda datos en **tablas** (filas y columnas). Con **SQL** les preguntas cosas.
\`\`\`
SELECT nombre, email FROM alumnos;
SELECT * FROM alumnos;   -- todas las columnas
\`\`\`
- \`SELECT\` indica qué columnas.
- \`FROM\` indica de qué tabla.
- Las sentencias terminan en \`;\`
- Por convenio, las palabras clave van en MAYÚSCULAS.`,
          ejercicios: [
            { t: 'input', q: 'Selecciona todas las columnas', code: 'SELECT ___ FROM productos;', a: ['*'] },
            { t: 'input', q: 'Indica la tabla', code: 'SELECT nombre ___ clientes;', a: ['FROM', 'from'] },
            { t: 'order', q: 'Obtén el título de todos los libros', o: ['SELECT', 'titulo', 'FROM', 'libros;'] },
            { t: 'choice', q: 'En una tabla, cada fila es…', o: ['Un registro', 'Un campo', 'Una tabla', 'Una consulta'], a: 0 },
            { t: 'input', q: 'Quita los valores repetidos', code: 'SELECT ___ ciudad FROM clientes;', a: ['DISTINCT', 'distinct'] },
            { t: 'choice', q: '¿Cómo se escribe un comentario de una línea en SQL?', o: ['-- comentario', '// comentario', '# comentario solo', '<!-- comentario -->'], a: 0 },
          ],
        },
        {
          id: 'l2', titulo: 'Filtrar y ordenar',
          teoria: `\`WHERE\` filtra filas:
\`\`\`
SELECT * FROM productos WHERE precio > 20;
SELECT * FROM alumnos WHERE curso = 2 AND nota >= 5;
SELECT * FROM clientes WHERE nombre LIKE 'A%';
\`\`\`
- \`LIKE 'A%'\`: empieza por A (\`%\` = cualquier texto).
- \`IN (1, 2)\`, \`BETWEEN 10 AND 20\`, \`IS NULL\`.

\`ORDER BY\` ordena (\`ASC\` o \`DESC\`) y \`LIMIT\` limita el número de filas:
\`\`\`
SELECT * FROM productos ORDER BY precio DESC LIMIT 5;
\`\`\``,
          ejercicios: [
            { t: 'input', q: 'Filtra los productos baratos', code: 'SELECT * FROM productos ___ precio < 10;', a: ['WHERE', 'where'] },
            { t: 'input', q: 'Ordena de mayor a menor', code: 'SELECT * FROM notas ORDER BY nota ___;', a: ['DESC', 'desc'] },
            { t: 'choice', q: "¿Qué nombres encuentra LIKE '%ez'?", o: ['Los que terminan en "ez"', 'Los que empiezan por "ez"', 'Solo "ez"', 'Los que no tienen "ez"'], a: 0 },
            { t: 'choice', q: '¿Cómo buscas filas sin email?', o: ['WHERE email IS NULL', 'WHERE email = NULL', "WHERE email = ''", 'WHERE NOT email'], a: 0, e: 'Con NULL nunca se usa =, siempre IS NULL / IS NOT NULL.' },
            { t: 'order', q: 'Los 3 productos más caros', o: ['SELECT * FROM productos', 'ORDER BY precio DESC', 'LIMIT 3;'] },
            { t: 'pairs', q: 'Une operador y uso', p: [['BETWEEN', 'Rango de valores'], ['IN', 'Lista de valores'], ['LIKE', 'Patrón de texto'], ['AND', 'Ambas condiciones']] },
          ],
        },
        {
          id: 'l3', titulo: 'Funciones y GROUP BY',
          teoria: `Las **funciones de agregado** resumen muchas filas en un valor:
\`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`.
\`\`\`
SELECT COUNT(*) FROM alumnos;
SELECT AVG(nota) FROM notas;
\`\`\`
\`GROUP BY\` agrupa y calcula por grupo. \`HAVING\` filtra grupos:
\`\`\`
SELECT curso, AVG(nota) AS media
FROM notas
GROUP BY curso
HAVING AVG(nota) > 6;
\`\`\`
\`AS\` pone un alias al resultado.`,
          ejercicios: [
            { t: 'input', q: 'Cuenta las filas', code: 'SELECT ___(*) FROM pedidos;', a: ['COUNT', 'count'] },
            { t: 'choice', q: '¿Qué función calcula la media?', o: ['AVG', 'MEAN', 'MEDIA', 'SUM'], a: 0 },
            { t: 'input', q: 'Agrupa por ciudad', code: 'SELECT ciudad, COUNT(*) FROM clientes ___ ciudad;', a: ['GROUP BY', 'group by'] },
            { t: 'choice', q: '¿Qué diferencia hay entre WHERE y HAVING?', o: ['WHERE filtra filas; HAVING filtra grupos', 'Son iguales', 'HAVING va antes de FROM', 'WHERE solo sirve con números'], a: 0 },
            { t: 'input', q: 'Pon un alias a la columna', code: 'SELECT SUM(total) ___ ventas FROM pedidos;', a: ['AS', 'as'] },
            { t: 'pairs', q: 'Une función y resultado', p: [['SUM', 'Suma'], ['MAX', 'Máximo'], ['MIN', 'Mínimo'], ['COUNT', 'Número de filas']] },
          ],
        },
      ],
    },
    {
      titulo: 'Relaciones y cambios',
      lecciones: [
        {
          id: 'l4', titulo: 'JOIN',
          teoria: `Las tablas se relacionan con **claves**:
- **Clave primaria (PK)**: identifica cada fila (\`id\`).
- **Clave foránea (FK)**: apunta a la PK de otra tabla.

\`JOIN\` combina tablas relacionadas:
\`\`\`
SELECT p.id, c.nombre
FROM pedidos p
INNER JOIN clientes c ON p.cliente_id = c.id;
\`\`\`
- \`INNER JOIN\`: solo filas con pareja en ambas tablas.
- \`LEFT JOIN\`: todas las de la izquierda, aunque no tengan pareja (salen NULL).`,
          ejercicios: [
            { t: 'input', q: 'Condición de unión', code: 'SELECT * FROM pedidos p JOIN clientes c ___ p.cliente_id = c.id;', a: ['ON', 'on'] },
            { t: 'choice', q: '¿Qué JOIN mantiene todos los clientes aunque no tengan pedidos?', code: 'SELECT ... FROM clientes c ??? pedidos p ON ...', o: ['LEFT JOIN', 'INNER JOIN', 'CROSS JOIN', 'SELF JOIN'], a: 0 },
            { t: 'choice', q: 'Una clave foránea…', o: ['Apunta a la clave primaria de otra tabla', 'Identifica cada fila de su tabla', 'Es siempre un texto', 'No puede repetirse'], a: 0 },
            { t: 'pairs', q: 'Une concepto', p: [['PRIMARY KEY', 'Identificador único'], ['FOREIGN KEY', 'Referencia a otra tabla'], ['INNER JOIN', 'Solo coincidencias'], ['LEFT JOIN', 'Todo lo de la izquierda']] },
            { t: 'order', q: 'Une alumnos con su curso', o: ['SELECT a.nombre, c.nombre', 'FROM alumnos a', 'JOIN cursos c', 'ON a.curso_id = c.id;'] },
          ],
        },
        {
          id: 'l5', titulo: 'Insertar, actualizar y borrar',
          teoria: `\`\`\`
INSERT INTO alumnos (nombre, curso) VALUES ('Ana', 2);

UPDATE alumnos SET curso = 2 WHERE id = 7;

DELETE FROM alumnos WHERE id = 7;
\`\`\`
⚠️ Un \`UPDATE\` o \`DELETE\` **sin WHERE** afecta a **todas** las filas.

Crear una tabla:
\`\`\`
CREATE TABLE alumnos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  curso INT
);
\`\`\``,
          ejercicios: [
            { t: 'input', q: 'Inserta un registro', code: "___ INTO libros (titulo) VALUES ('Dune');", a: ['INSERT', 'insert'] },
            { t: 'input', q: 'Cambia un valor', code: "UPDATE libros ___ precio = 12 WHERE id = 3;", a: ['SET', 'set'] },
            { t: 'choice', q: '¿Qué hace DELETE FROM alumnos; (sin WHERE)?', o: ['Borra todas las filas', 'Da error siempre', 'Borra la primera fila', 'Borra la tabla y su estructura'], a: 0 },
            { t: 'choice', q: 'Para texto de longitud variable se usa…', o: ['VARCHAR', 'INT', 'BOOLEAN', 'DATE'], a: 0 },
            { t: 'order', q: 'Borra el alumno con id 5', o: ['DELETE', 'FROM alumnos', 'WHERE', 'id = 5;'] },
            { t: 'pairs', q: 'Une sentencia y acción (CRUD)', p: [['INSERT', 'Create'], ['SELECT', 'Read'], ['UPDATE', 'Update'], ['DELETE', 'Delete']] },
          ],
        },
      ],
    },
  ],
};
