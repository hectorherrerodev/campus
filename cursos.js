// Registro de cursos incluidos. Para añadir uno nuevo: crea el archivo y añádelo aquí.
import html from './curso-html.js';
import css from './curso-css.js';
import javascript from './curso-javascript.js';
import sql from './curso-sql.js';
import python from './curso-python.js';
import php from './curso-php.js';
import { git, github, vscode, node } from './curso-herramientas.js';
import { react, vue, angular } from './curso-frameworks.js';

export const CURSOS = [html, css, javascript, sql, python, php, git, github, vscode, node, react, vue, angular];
export const CATEGORIAS = ['Lenguajes', 'Herramientas', 'Frameworks', 'Mis cursos'];
