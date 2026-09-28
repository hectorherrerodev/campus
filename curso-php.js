export default {
  id: 'php', nombre: 'PHP', badge: 'PHP', color: '#777bb4', categoria: 'Lenguajes',
  descripcion: 'El lenguaje de servidor de DWES: variables, arrays, formularios y conexión a MySQL con PDO.',
  unidades: [
    {
      titulo: 'PHP en el servidor',
      lecciones: [
        {
          id: 'l1', titulo: 'Sintaxis básica',
          teoria: `PHP se ejecuta en el **servidor** y genera HTML. El código va entre \`<?php\` y \`?>\`:
\`\`\`
<?php
$nombre = "Ana";
$edad = 20;
echo "Hola, $nombre";   // las comillas dobles interpolan
echo 'Hola, ' . $nombre; // el punto concatena
?>
\`\`\`
- Las variables empiezan por \`$\`.
- Cada sentencia termina en \`;\`.`,
          ejercicios: [
            { t: 'choice', q: '¿Con qué empiezan las variables en PHP?', o: ['$', '@', '#', 'var'], a: 0 },
            { t: 'input', q: 'Muestra texto', code: '<?php ___ "Hola"; ?>', a: ['echo', 'print'] },
            { t: 'choice', q: '¿Qué operador concatena textos en PHP?', o: ['.', '+', '&', ','], a: 0 },
            { t: 'choice', q: '¿Dónde se ejecuta PHP?', o: ['En el servidor', 'En el navegador', 'En la base de datos', 'En el móvil del usuario'], a: 0 },
            { t: 'choice', q: '¿Qué imprime?', code: "$n = 'Leo';\necho 'Hola $n';", o: ['Hola $n', 'Hola Leo', 'Error', 'Nada'], a: 0, e: 'Las comillas simples no interpolan variables.' },
            { t: 'input', q: 'Etiqueta de apertura', code: '___\necho "Hola";', a: ['<?php'] },
          ],
        },
        {
          id: 'l2', titulo: 'Arrays y formularios',
          teoria: `Arrays indexados y asociativos:
\`\`\`
$frutas = ["pera", "uva"];
$alumno = ["nombre" => "Leo", "curso" => 2];
echo $alumno["nombre"];
foreach ($frutas as $f) { echo $f; }
\`\`\`
Los datos de un formulario llegan en \`$_GET\` o \`$_POST\`:
\`\`\`
$email = $_POST["email"] ?? "";
echo htmlspecialchars($email); // evita XSS al mostrarlo
\`\`\``,
          ejercicios: [
            { t: 'input', q: 'Recorre el array', code: 'foreach ($notas ___ $nota) {\n  echo $nota;\n}', a: ['as'] },
            { t: 'input', q: 'Array asociativo', code: '$p = ["precio" ___ 10];', a: ['=>'] },
            { t: 'choice', q: 'Un formulario con method="post" envía los datos a…', o: ['$_POST', '$_GET', '$_FORM', '$_REQUEST_ONLY'], a: 0 },
            { t: 'choice', q: '¿Para qué sirve htmlspecialchars()?', o: ['Evitar que se inyecte HTML/JS (XSS)', 'Dar formato de moneda', 'Cifrar contraseñas', 'Conectar a MySQL'], a: 0 },
            { t: 'input', q: 'Número de elementos de un array', code: '$total = ___($frutas);', a: ['count'] },
            { t: 'choice', q: '¿Qué hace el operador ?? en $_POST["x"] ?? ""?', o: ['Usa "" si no existe $_POST["x"]', 'Compara estrictamente', 'Concatena', 'Lanza un error'], a: 0 },
          ],
        },
        {
          id: 'l3', titulo: 'PDO y MySQL',
          teoria: `**PDO** conecta PHP con bases de datos. Usa siempre **consultas preparadas** para evitar inyección SQL:
\`\`\`
$pdo = new PDO("mysql:host=localhost;dbname=tienda", $user, $pass);
$st = $pdo->prepare("SELECT * FROM productos WHERE id = ?");
$st->execute([$id]);
$producto = $st->fetch(PDO::FETCH_ASSOC);
\`\`\`
Para contraseñas: \`password_hash()\` al guardar y \`password_verify()\` al comprobar.`,
          ejercicios: [
            { t: 'choice', q: '¿Por qué usar consultas preparadas?', o: ['Evitan la inyección SQL', 'Son obligatorias en MySQL', 'Hacen la consulta más corta', 'Guardan la conexión'], a: 0 },
            { t: 'input', q: 'Prepara la consulta', code: '$st = $pdo->___("SELECT * FROM users WHERE email = ?");', a: ['prepare'] },
            { t: 'input', q: 'Ejecuta con el valor', code: '$st->___([$email]);', a: ['execute'] },
            { t: 'choice', q: '¿Cómo guardas una contraseña?', o: ['password_hash($pass, PASSWORD_DEFAULT)', 'md5($pass)', 'En texto plano', 'base64_encode($pass)'], a: 0 },
            { t: 'order', q: 'Ordena los pasos', o: ['new PDO(...)', '$pdo->prepare(...)', '$st->execute([...])', '$st->fetch()'] },
          ],
        },
      ],
    },
  ],
};
