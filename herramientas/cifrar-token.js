/* Cifra el token de GitHub con la contraseña del panel y lo guarda en admin/acceso.json.
   Así se entra al panel /admin/ sólo con usuario y contraseña, desde cualquier dispositivo.

   Uso (desde la carpeta del proyecto):   node herramientas/cifrar-token.js
   Pide el token y la contraseña sin mostrarlos en pantalla (o los toma de las variables
   de entorno TOKEN_GITHUB y CLAVE_PANEL), comprueba los dos y escribe
   el archivo. Después hay que subir admin/acceso.json al repositorio (commit + push).
   Repetirlo cuando el token caduque o se cambie la contraseña. */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { webcrypto: crypto } = require('crypto');

const RAIZ = path.join(__dirname, '..');
const ADMIN_JS = path.join(RAIZ, 'admin', 'admin.js');
const SALIDA = path.join(RAIZ, 'admin', 'acceso.json');

// Lee CUENTA y CONFIG directamente de admin/admin.js para que nunca se desincronicen.
function leerConstante(nombre) {
  const fuente = fs.readFileSync(ADMIN_JS, 'utf8');
  const m = fuente.match(new RegExp('const ' + nombre + ' = (\\{[\\s\\S]*?\\});'));
  if (!m) throw new Error('No encuentro ' + nombre + ' en admin/admin.js');
  return Function('"use strict"; return (' + m[1] + ');')();
}

// Una sola interfaz para todas las preguntas; lo que se escribe no se muestra.
let rl = null;
function preguntarOculto(texto) {
  if (!rl) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (rl.mostrarSiguiente) { process.stdout.write(s); rl.mostrarSiguiente = false; } };
  }
  rl.mostrarSiguiente = true;
  return new Promise((resolve) => {
    rl.question(texto, (respuesta) => {
      process.stdout.write('\n');
      resolve(respuesta.trim());
    });
  });
}

const b64 = (bytes) => Buffer.from(bytes).toString('base64');

async function main() {
  const CUENTA = leerConstante('CUENTA');
  const CONFIG = leerConstante('CONFIG');

  const token = process.env.TOKEN_GITHUB || await preguntarOculto('Token de GitHub (no se verá al pegarlo): ');
  if (!token) throw new Error('No se escribió ningún token.');

  // Se prueba la escritura creando un blob suelto (no toca ninguna rama).
  const r = await fetch('https://api.github.com/repos/' + CONFIG.owner + '/' + CONFIG.repo + '/git/blobs', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'panel', encoding: 'utf-8' }),
  });
  if (r.status === 401) throw new Error('GitHub no reconoce ese token.');
  if (r.status === 403 || r.status === 404) {
    throw new Error('El token no puede escribir en el repositorio. Dale el permiso Contents: Read and write.');
  }
  if (!r.ok) throw new Error('GitHub respondió ' + r.status + '.');
  console.log('Token válido, con permiso de escritura sobre ' + CONFIG.repo + '.');

  const clave = process.env.CLAVE_PANEL || await preguntarOculto('Contraseña del panel (usuario ' + CUENTA.usuario + '): ');
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(clave), 'PBKDF2', false, ['deriveBits']);
  const bits = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: Buffer.from(CUENTA.sal, 'base64'), iterations: CUENTA.iteraciones },
    base, 256));
  const huella = b64(new Uint8Array(await crypto.subtle.digest('SHA-256', bits)));
  if (huella !== CUENTA.verificador) throw new Error('Esa no es la contraseña del panel.');

  const llave = await crypto.subtle.importKey('raw', bits, 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const datos = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, llave, new TextEncoder().encode(token)));

  fs.writeFileSync(SALIDA, JSON.stringify({ iv: b64(iv), datos: b64(datos) }, null, 2) + '\n');
  console.log('Listo: ' + path.relative(RAIZ, SALIDA) + ' actualizado. Súbelo al repositorio (commit + push).');
  if (rl) rl.close();
}

main().catch((e) => { console.error('Error: ' + e.message); process.exit(1); });
