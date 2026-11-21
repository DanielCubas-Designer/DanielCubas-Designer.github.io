/* Panel de administración del portafolio (ruta /admin/).
   Permite añadir y editar proyectos y el perfil sin tocar archivos: cada vez que
   se guarda, el panel hace un commit en el repositorio de GitHub y GitHub Pages
   vuelve a publicar el sitio en uno o dos minutos.

   Seguridad: el sitio es estático. De la contraseña se deriva (PBKDF2, un millón de
   iteraciones) una clave que sirve para dos cosas: comprobar la contraseña (sólo se
   publica el SHA-256 de esa clave) y descifrar el token de GitHub guardado en
   admin/acceso.json, que es lo que realmente permite escribir en el repositorio.
   El archivo cifrado se genera con herramientas/cifrar-token.js. */

const CONFIG = {
  owner: 'DanielCubas-Designer',
  repo: 'DanielCubas-Designer.github.io',
  branch: 'main',
};

// Debe coincidir con herramientas/cifrar-token.js.
const CUENTA = {
  usuario: 'dannycubas',
  sal: 'tdm4tiBqib+zwHnaOzVYOA==',
  iteraciones: 1000000,
  verificador: 'lc0jW/pzLkopiZgIcHeR5JsY7SfUpNcU1WciIqzy9Hg=',
};

const ETIQUETAS = { fotografia: 'Fotografía', diseno: 'Diseño', cortometrajes: 'Cortometrajes' };
const CATEGORIA = { fotografia: 'Fotografía', diseno: 'Diseño', cortometrajes: 'Cortometraje' };
const LADO_MAX = 2400;      // borde largo de las fotos, como pide el README
const CALIDAD_JPG = 0.82;

const raiz = document.getElementById('admin');
let repo = null;
let DATOS = null;
let ed = null;              // proyecto o perfil en edición
let ocupado = false;

/* ---------- utilidades ---------- */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const enc = new TextEncoder();
const aB64 = (bytes) => btoa(String.fromCharCode.apply(null, bytes));
const deB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const dos = (n) => String(n).padStart(2, '0');
const sello = () => Date.now().toString(36);

/* ---------- contraseña y token cifrado ---------- */

// Devuelve la llave AES derivada de la contraseña, o null si las credenciales no son válidas.
async function abrirCuenta(usuario, clave) {
  if (String(usuario).trim().toLowerCase() !== CUENTA.usuario) return null;
  const base = await crypto.subtle.importKey('raw', enc.encode(clave), 'PBKDF2', false, ['deriveBits']);
  const bits = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: deB64(CUENTA.sal), iterations: CUENTA.iteraciones }, base, 256));
  const huella = new Uint8Array(await crypto.subtle.digest('SHA-256', bits));
  const esperado = deB64(CUENTA.verificador);
  let dif = huella.length ^ esperado.length;
  for (let i = 0; i < huella.length; i++) dif |= huella[i] ^ esperado[i];
  if (dif !== 0) return null;
  return crypto.subtle.importKey('raw', bits, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function descifrar(llave, { iv, datos }) {
  const plano = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(iv) }, llave, deB64(datos));
  return new TextDecoder().decode(plano);
}

// Token publicado con el sitio (admin/acceso.json), cifrado con la contraseña.
async function tokenDelSitio(llave) {
  try {
    const r = await fetch('acceso.json', { cache: 'no-cache' });
    if (!r.ok) return null;
    return await descifrar(llave, await r.json());
  } catch (e) {
    return null;
  }
}

// Contenido de admin/acceso.json: el token cifrado con la llave de la contraseña.
async function cifrarToken(token, llave) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const datos = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, llave, enc.encode(token)));
  return JSON.stringify({ iv: aB64(iv), datos: aB64(datos) }, null, 2) + '\n';
}

/* ---------- archivos .md (mismo formato que lee app.js) ---------- */

function parsearMd(txt) {
  const m = txt.match(/^\s*---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { campos: [], cuerpo: txt.trim() };
  const campos = [];
  m[1].split(/\r?\n/).forEach((linea) => {
    const i = linea.indexOf(':');
    if (i < 1) return;
    let valor = linea.slice(i + 1).trim();
    if (/^".*"$/.test(valor) || /^'.*'$/.test(valor)) valor = valor.slice(1, -1);
    campos.push([linea.slice(0, i).trim(), valor]);
  });
  return { campos, cuerpo: m[2].trim() };
}

const obtener = (campos, k) => (campos.find((c) => c[0] === k) || [])[1] || '';
function fijar(campos, k, v) {
  const c = campos.find((x) => x[0] === k);
  if (c) c[1] = v; else campos.push([k, v]);
}

function serializarMd(campos, cuerpo) {
  const lineas = campos.map(([k, v]) => {
    v = String(v ?? '').replace(/[\r\n]+/g, ' ').trim();
    if (/^[@#'"]/.test(v)) v = '"' + v + '"';
    return v ? k + ': ' + v : k + ':';
  });
  const texto = String(cuerpo || '').replace(/\r\n/g, '\n').trim();
  return '---\n' + lineas.join('\n') + '\n---\n\n' + texto + '\n';
}

const listaComas = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);

/* ---------- imágenes ---------- */

// Reduce la foto a 2400 px de borde largo y la guarda como JPG.
async function prepararImagen(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    try { await img.decode(); } catch (e) {
      throw new Error('No se pudo leer «' + file.name + '». Usa fotos JPG o PNG.');
    }
    const escala = Math.min(1, LADO_MAX / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * escala);
    const h = Math.round(img.naturalHeight * escala);
    const lienzo = document.createElement('canvas');
    lienzo.width = w;
    lienzo.height = h;
    const ctx = lienzo.getContext('2d');
    ctx.fillStyle = '#0a0a0a';   // fondo del sitio, por si el PNG tiene transparencias
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise((res) => lienzo.toBlob(res, 'image/jpeg', CALIDAD_JPG));
    if (!blob) throw new Error('No se pudo procesar «' + file.name + '».');
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ---------- estado y avisos ---------- */

let temporizadorAviso = null;
function avisar(texto, tipo) {
  let el = document.getElementById('estado');
  if (!el) {
    el = document.createElement('div');
    el.id = 'estado';
    el.className = 'estado';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  clearTimeout(temporizadorAviso);
  el.textContent = texto;
  el.className = 'estado estado--' + (tipo || 'info');
  el.hidden = false;
  if (tipo === 'ok' || tipo === 'error') {
    temporizadorAviso = setTimeout(() => { el.hidden = true; }, tipo === 'error' ? 9000 : 6000);
  }
}
const callar = () => { const el = document.getElementById('estado'); if (el) el.hidden = true; };

function bloquear(si) {
  ocupado = si;
  raiz.querySelectorAll('button, input, textarea, select').forEach((x) => {
    if (si) { x.dataset.antes = x.disabled ? '1' : ''; x.disabled = true; }
    else { x.disabled = x.dataset.antes === '1'; delete x.dataset.antes; }
  });
}

/* ---------- carga de datos desde el repositorio ---------- */

async function cargarDatos() {
  const archivos = new Set(await repo.archivos());
  const manifiesto = JSON.parse(await repo.leerTexto('contenido/proyectos.json'));
  const secciones = {};
  for (const sec of Object.keys(manifiesto)) {
    const proyectos = await Promise.all(manifiesto[sec].map(async (slug) => {
      const carpeta = 'contenido/proyectos/' + sec + '/' + slug + '/';
      const md = archivos.has(carpeta + 'proyecto.md')
        ? parsearMd(await repo.leerTexto(carpeta + 'proyecto.md'))
        : { campos: [], cuerpo: '' };
      return { seccion: sec, slug, carpeta, md };
    }));
    proyectos.sort((a, b) =>
      (parseInt(obtener(a.md.campos, 'orden'), 10) || 999) - (parseInt(obtener(b.md.campos, 'orden'), 10) || 999));
    secciones[sec] = proyectos;
  }
  const perfil = parsearMd(await repo.leerTexto('contenido/perfil.md'));
  DATOS = { archivos, manifiesto, secciones, perfil };
}

const enCarpeta = (carpeta) => new Set([...DATOS.archivos]
  .filter((p) => p.startsWith(carpeta)).map((p) => p.slice(carpeta.length)));

/* ---------- pantalla: acceso ---------- */

function vistaAcceso(mensaje) {
  repo = null;
  DATOS = null;
  ed = null;
  raiz.innerHTML = `
  <main class="acceso">
    <form class="acceso__caja" id="f-acceso" autocomplete="on">
      <div class="seccion-rotulo"><span class="rotulo">Administración</span></div>
      <h1 class="titular titular--h1">Daniel<br>Cubas</h1>
      <span class="barra"></span>
      <label class="campo"><span class="campo__k">Usuario</span>
        <input name="usuario" autocomplete="username" autocapitalize="none" spellcheck="false" required></label>
      <label class="campo"><span class="campo__k">Contraseña</span>
        <input name="clave" type="password" autocomplete="current-password" required></label>
      <p class="aviso" role="alert">${esc(mensaje || '')}</p>
      <div class="acciones">
        <button class="boton boton--solido" type="submit">Entrar</button>
        <a class="boton boton--fantasma" href="../">← Volver al sitio</a>
      </div>
    </form>
  </main>`;
  const f = raiz.querySelector('#f-acceso');
  f.usuario.focus();
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const aviso = f.querySelector('.aviso');
    const boton = f.querySelector('button');
    boton.disabled = true;
    aviso.textContent = 'Comprobando…';
    let llave = null;
    try {
      llave = await abrirCuenta(f.usuario.value, f.clave.value);
      if (!llave) {
        aviso.textContent = 'Usuario o contraseña incorrectos.';
        boton.disabled = false;
        f.clave.select();
        return;
      }
      aviso.textContent = 'Conectando con GitHub…';
      const token = await tokenDelSitio(llave);
      if (!token) return vistaConectar(llave, 'El sitio todavía no tiene guardado su acceso a GitHub.');
      try {
        await entrar(token);
      } catch (err) {
        if (err.status === 401) return vistaConectar(llave, 'El acceso a GitHub guardado en el sitio caducó o fue borrado.');
        if (err.status === 403 || err.status === 404) {
          return vistaConectar(llave, 'El acceso a GitHub guardado en el sitio no tiene permiso para guardar cambios.');
        }
        throw err;
      }
    } catch (err) {
      aviso.textContent = err.message;
      boton.disabled = false;
    }
  });
}

async function entrar(token) {
  repo = new window.RepoGitHub(Object.assign({ token }, CONFIG));
  await repo.verificar();
  await cargarDatos();
  vistaProyectos();
}

/* ---------- pantalla: conectar el sitio con GitHub ---------- */

// Se muestra cuando el token guardado en el sitio falta, caducó o no puede escribir.
// El token que se pega aquí se cifra con la contraseña y se guarda en admin/acceso.json,
// así sirve desde cualquier dispositivo y no hay que volver a pegarlo.
function vistaConectar(llave, mensaje) {
  const repoUrl = 'https://github.com/' + CONFIG.owner + '/' + CONFIG.repo;
  raiz.innerHTML = `
  <main class="acceso">
    <form class="acceso__caja acceso__caja--ancha" id="f-token">
      <div class="seccion-rotulo"><span class="rotulo">Conectar con GitHub</span></div>
      <p class="texto">${esc(mensaje)} Para guardar cambios, el panel necesita un
        <strong>token de GitHub</strong>. Se pega una sola vez: queda guardado en el sitio,
        cifrado con la contraseña del panel.</p>
      <ol class="pasos">
        <li>Con la sesión de GitHub de la cuenta <strong>${esc(CONFIG.owner)}</strong>, abre
          <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">crear token</a>.</li>
        <li>Ponle un nombre (por ejemplo «Panel portafolio») y en <em>Expiration</em> elige <em>No expiration</em>.</li>
        <li>En <em>Repository access</em> elige <em>Only select repositories</em> →
          <a href="${esc(repoUrl)}" target="_blank" rel="noopener">${esc(CONFIG.repo)}</a>.</li>
        <li>En <em>Permissions</em>, añade <em>Contents</em> y cámbialo a <strong>Read and write</strong>.</li>
        <li>Pulsa <em>Generate token</em>, copia el código (empieza por <code>github_pat_</code>) y pégalo aquí.</li>
      </ol>
      <label class="campo"><span class="campo__k">Token</span>
        <input name="token" type="password" autocomplete="off" spellcheck="false" required></label>
      <p class="aviso" role="alert"></p>
      <div class="acciones">
        <button class="boton boton--solido" type="submit">Conectar</button>
        <button class="boton boton--fantasma" type="button" data-volver>Cancelar</button>
      </div>
    </form>
  </main>`;
  const f = raiz.querySelector('#f-token');
  f.token.focus();
  f.querySelector('[data-volver]').addEventListener('click', () => vistaAcceso());
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const aviso = f.querySelector('.aviso');
    const boton = f.querySelector('button[type=submit]');
    const token = f.token.value.trim();
    boton.disabled = true;
    aviso.textContent = 'Comprobando el token…';
    try {
      repo = new window.RepoGitHub(Object.assign({ token }, CONFIG));
      await repo.verificar();
      aviso.textContent = 'Guardando el acceso en el sitio…';
      await repo.commit('Panel: renueva el acceso a GitHub',
        [{ path: 'admin/acceso.json', texto: await cifrarToken(token, llave) }]);
      await cargarDatos();
      vistaProyectos();
      avisar('Conectado. Desde ahora basta con usuario y contraseña en cualquier dispositivo.', 'ok');
    } catch (err) {
      repo = null;
      aviso.textContent = err.status === 401 ? 'GitHub no reconoce ese token. Revisa que esté completo.'
        : err.status === 404 ? 'El token no tiene acceso al repositorio ' + CONFIG.repo + '.'
          : err.message;
      boton.disabled = false;
    }
  });
}

/* ---------- marco del panel ---------- */

function marco(activa, contenido) {
  raiz.innerHTML = `
  <header class="cabecera">
    <span class="marca">
      <span class="marca__nombre">Daniel Cubas</span>
      <span class="marca__loc">ADMIN</span>
    </span>
    <nav class="nav">
      <button type="button" data-ir="proyectos"${activa === 'proyectos' ? ' aria-current="page"' : ''}>Proyectos</button>
      <button type="button" data-ir="perfil"${activa === 'perfil' ? ' aria-current="page"' : ''}>Perfil</button>
      <a href="../" target="_blank" rel="noopener">Ver sitio ↗</a>
      <button type="button" data-salir>Salir</button>
    </nav>
  </header>
  <main class="panel">${contenido}</main>
  <footer class="panel__pie">
    <span>Los cambios aparecen en el sitio uno o dos minutos después de guardar.</span>
  </footer>`;
  raiz.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => {
    if (ocupado) return;
    if (b.dataset.ir === 'perfil') vistaPerfil(); else vistaProyectos();
  }));
  raiz.querySelector('[data-salir]').addEventListener('click', () => { if (!ocupado) vistaAcceso(); });
  window.scrollTo(0, 0);
}

/* ---------- pantalla: lista de proyectos ---------- */

function vistaProyectos() {
  ed = null;
  const bloques = Object.keys(DATOS.secciones).map((sec) => {
    const filas = DATOS.secciones[sec].map((p) => {
      const c = p.md.campos;
      const publicado = !/^(false|no|0)$/i.test(obtener(c, 'publicado').trim());
      const meta = [obtener(c, 'anio'), obtener(c, 'cliente')].filter(Boolean).join(' · ');
      return `
      <li class="fila">
        <img class="fila__mini" src="${esc(repo.urlCruda(p.carpeta + (obtener(c, 'portada') || 'portada.jpg')))}" alt="" loading="lazy">
        <div class="fila__info">
          <strong>${esc(obtener(c, 'titulo') || p.slug)}</strong>
          <span>${esc(meta)}</span>
        </div>
        <span class="etiqueta${publicado ? '' : ' etiqueta--oculto'}">${publicado ? 'Publicado' : 'Oculto'}</span>
        <button class="boton" type="button" data-editar="${esc(sec)}|${esc(p.slug)}">Editar</button>
      </li>`;
    }).join('');
    return `
    <section class="bloque">
      <div class="bloque__cabeza">
        <div class="seccion-rotulo"><span class="rotulo">${esc(ETIQUETAS[sec] || sec)}</span></div>
        <button class="boton boton--solido" type="button" data-nuevo="${esc(sec)}">+ Nuevo proyecto</button>
      </div>
      ${filas ? `<ul class="filas">${filas}</ul>` : '<p class="texto">Todavía no hay proyectos en esta sección.</p>'}
    </section>`;
  }).join('');

  marco('proyectos', `
    <div class="panel__titulo">
      <h1 class="titular titular--h1">Proyectos</h1>
      <span class="barra"></span>
    </div>
    ${bloques}`);

  raiz.querySelectorAll('[data-nuevo]').forEach((b) =>
    b.addEventListener('click', () => vistaEditorProyecto(b.dataset.nuevo, null)));
  raiz.querySelectorAll('[data-editar]').forEach((b) => b.addEventListener('click', () => {
    const [sec, slug] = b.dataset.editar.split('|');
    vistaEditorProyecto(sec, DATOS.secciones[sec].find((p) => p.slug === slug));
  }));
}

/* ---------- pantalla: editar / crear proyecto ---------- */

function vistaEditorProyecto(sec, p) {
  const nuevo = !p;
  const c = nuevo ? [] : p.md.campos;
  const ordenes = DATOS.secciones[sec].map((x) => parseInt(obtener(x.md.campos, 'orden'), 10) || 0);
  const portada = nuevo ? '' : (obtener(c, 'portada') || 'portada.jpg');

  ed = {
    tipo: 'proyecto',
    nuevo,
    seccion: sec,
    proyecto: p,
    portadaOriginal: portada,
    galeriaOriginal: nuevo ? [] : listaComas(obtener(c, 'galeria')),
    portada: nuevo ? null : { tipo: 'existente', nombre: portada, url: repo.urlCruda(p.carpeta + portada) },
    galeria: nuevo ? [] : listaComas(obtener(c, 'galeria')).map((n) =>
      ({ tipo: 'existente', nombre: n, url: repo.urlCruda(p.carpeta + n) })),
  };

  const valor = (k, def) => esc(nuevo ? (def ?? '') : obtener(c, k));
  const publicado = nuevo || !/^(false|no|0)$/i.test(obtener(c, 'publicado').trim());

  marco('proyectos', `
    <form class="editor" id="f-proyecto" novalidate>
      <div class="panel__titulo">
        <button type="button" class="boton boton--fantasma" data-volver>← Proyectos</button>
        <h1 class="titular titular--h1">${nuevo ? 'Nuevo proyecto' : esc(obtener(c, 'titulo') || p.slug)}</h1>
        <span class="barra"></span>
        <span class="rotulo">${esc(ETIQUETAS[sec] || sec)}</span>
      </div>

      <div class="rejilla">
        <label class="campo campo--ancho"><span class="campo__k">Título *</span>
          <input name="titulo" value="${valor('titulo')}" required></label>
        <label class="campo"><span class="campo__k">Año</span>
          <input name="anio" inputmode="numeric" value="${valor('anio', new Date().getFullYear())}"></label>
        <label class="campo"><span class="campo__k">Categoría</span>
          <input name="categoria" value="${valor('categoria', CATEGORIA[sec] || '')}"></label>
        <label class="campo"><span class="campo__k">Cliente</span>
          <input name="cliente" value="${valor('cliente')}"></label>
        <label class="campo"><span class="campo__k">Orden</span>
          <input name="orden" type="number" min="1" value="${valor('orden', Math.max(0, ...ordenes) + 1)}">
          <small>El número más bajo aparece primero.</small></label>
        <label class="campo campo--ancho"><span class="campo__k">Descripción</span>
          <textarea name="cuerpo" rows="4">${esc(nuevo ? '' : p.md.cuerpo)}</textarea>
          <small>Dos o tres frases. Se muestran grandes, en cursiva, junto a los datos.</small></label>
        <label class="campo campo--ancho"><span class="campo__k">Vídeo (enlace de Google Drive)</span>
          <input name="video" type="url" placeholder="https://drive.google.com/file/d/…/view" value="${valor('video')}">
          <small>Opcional. El archivo debe estar compartido como «Cualquiera con el enlace».</small></label>
        <label class="casilla campo--ancho">
          <input type="checkbox" name="publicado"${publicado ? ' checked' : ''}>
          <span>Publicado (si lo desmarcas, el proyecto se oculta del sitio sin borrarse)</span></label>
      </div>

      <section class="bloque">
        <div class="seccion-rotulo"><span class="rotulo">Portada *</span></div>
        <p class="nota">La imagen de la retícula del inicio. Mejor vertical.</p>
        <div class="imagenes" data-zona="portada"></div>
        <label class="boton boton--archivo">${nuevo ? 'Elegir portada' : 'Reemplazar portada'}
          <input type="file" accept="image/*" data-subir="portada" hidden></label>
      </section>

      <section class="bloque">
        <div class="seccion-rotulo"><span class="rotulo">Galería</span></div>
        <p class="nota">Las fotos de la ficha, en este orden. Usa ← → para reordenar.</p>
        <div class="imagenes" data-zona="galeria"></div>
        <label class="boton boton--archivo">+ Añadir fotos
          <input type="file" accept="image/*" multiple data-subir="galeria" hidden></label>
      </section>

      <div class="acciones acciones--pie">
        <button class="boton boton--solido" type="submit">${nuevo ? 'Crear proyecto' : 'Guardar cambios'}</button>
        <button class="boton boton--fantasma" type="button" data-volver>Cancelar</button>
        ${nuevo ? '' : '<button class="boton boton--peligro" type="button" data-borrar>Borrar proyecto</button>'}
      </div>
    </form>`);

  const f = raiz.querySelector('#f-proyecto');
  enlazarImagenes(f);
  pintarImagenes();
  f.querySelectorAll('[data-volver]').forEach((b) => b.addEventListener('click', () => { if (!ocupado) vistaProyectos(); }));
  f.addEventListener('submit', (e) => { e.preventDefault(); guardarProyecto(f); });
  const borrar = f.querySelector('[data-borrar]');
  if (borrar) borrar.addEventListener('click', () => {
    if (!borrar.dataset.seguro) {
      borrar.dataset.seguro = '1';
      borrar.textContent = '¿Seguro? Pulsa otra vez para borrarlo';
      setTimeout(() => { delete borrar.dataset.seguro; borrar.textContent = 'Borrar proyecto'; }, 5000);
      return;
    }
    borrarProyecto();
  });
  if (nuevo) f.titulo.focus();
}

/* ---------- imágenes del editor (proyecto y perfil) ---------- */

function pintarImagenes() {
  raiz.querySelectorAll('[data-zona]').forEach((zona) => {
    const clave = zona.dataset.zona;
    const enGaleria = clave === 'galeria';
    const items = enGaleria ? ed.galeria : (ed[clave] ? [ed[clave]] : []);
    if (!items.length) {
      zona.innerHTML = `<p class="vacio">${enGaleria ? 'Sin fotos en la galería.' : 'Sin imagen.'}</p>`;
      return;
    }
    zona.innerHTML = items.map((it, i) => `
      <figure class="miniatura${it.procesando ? ' miniatura--procesando' : ''}">
        <img src="${esc(it.url)}" alt="">
        <figcaption>${it.procesando ? 'Preparando…' : esc(it.tipo === 'nuevo' ? 'Nueva' : it.nombre)}</figcaption>
        ${enGaleria ? `
        <div class="miniatura__acciones">
          <button type="button" data-mover="${i}|-1" aria-label="Mover antes"${i === 0 ? ' disabled' : ''}>←</button>
          <button type="button" data-mover="${i}|1" aria-label="Mover después"${i === items.length - 1 ? ' disabled' : ''}>→</button>
          <button type="button" data-quitar="${i}" aria-label="Quitar">✕</button>
        </div>` : ''}
      </figure>`).join('');
  });
}

function enlazarImagenes(f) {
  f.addEventListener('click', (e) => {
    if (ocupado) return;
    const mover = e.target.closest('[data-mover]');
    const quitar = e.target.closest('[data-quitar]');
    if (mover) {
      const [i, d] = mover.dataset.mover.split('|').map(Number);
      const j = i + d;
      if (j < 0 || j >= ed.galeria.length) return;
      [ed.galeria[i], ed.galeria[j]] = [ed.galeria[j], ed.galeria[i]];
      pintarImagenes();
    } else if (quitar) {
      const [it] = ed.galeria.splice(Number(quitar.dataset.quitar), 1);
      if (it && it.tipo === 'nuevo') URL.revokeObjectURL(it.url);
      pintarImagenes();
    }
  });
  f.querySelectorAll('[data-subir]').forEach((input) => input.addEventListener('change', async () => {
    const destino = input.dataset.subir;
    const archivos = Array.from(input.files || []);
    input.value = '';
    for (const file of archivos) {
      const it = { tipo: 'nuevo', url: URL.createObjectURL(file), procesando: true };
      if (destino === 'galeria') ed.galeria.push(it); else ed[destino] = it;
      pintarImagenes();
      try {
        it.bytes = await prepararImagen(file);
        it.procesando = false;
      } catch (err) {
        URL.revokeObjectURL(it.url);
        if (destino === 'galeria') ed.galeria = ed.galeria.filter((x) => x !== it);
        else if (ed[destino] === it) ed[destino] = null;
        avisar(err.message, 'error');
      }
      pintarImagenes();
    }
  }));
}

function imagenesPendientes() {
  const todas = [...(ed.galeria || []), ed.portada, ed.retrato, ed.fondo].filter(Boolean);
  return todas.some((x) => x.procesando);
}

/* ---------- guardar / borrar proyecto ---------- */

function nuevoSlug(sec, titulo) {
  const existentes = DATOS.manifiesto[sec] || [];
  const todos = new Set(Object.values(DATOS.manifiesto).flat().map((s) => s.toLowerCase()));
  const base = titulo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'proyecto';
  let n = Math.max(0, ...existentes.map((s) => parseInt(s, 10) || 0)) + 1;
  let slug;
  do {
    slug = dos(n++) + '-' + base;
  } while (todos.has(slug) || [...DATOS.archivos].some((p) => p.startsWith('contenido/proyectos/' + sec + '/' + slug + '/')));
  return slug;
}

async function guardarProyecto(f) {
  if (ocupado) return;
  const titulo = f.titulo.value.trim();
  if (!titulo) { avisar('Falta el título.', 'error'); f.titulo.focus(); return; }
  if (!ed.portada) { avisar('Falta la portada.', 'error'); return; }
  if (imagenesPendientes()) { avisar('Espera a que terminen de prepararse las imágenes.', 'error'); return; }

  const sec = ed.seccion;
  const slug = ed.nuevo ? nuevoSlug(sec, titulo) : ed.proyecto.slug;
  const carpeta = 'contenido/proyectos/' + sec + '/' + slug + '/';
  const presentes = enCarpeta(carpeta);
  const cambios = [];

  // Galería: las fotos nuevas toman el siguiente número libre (07.jpg, 08.jpg…).
  let n = Math.max(0, ...[...presentes].map((x) => parseInt(x, 10) || 0));
  const galeria = ed.galeria.map((it) => {
    if (it.tipo === 'existente') return it.nombre;
    let nombre;
    do { nombre = dos(++n) + '.jpg'; } while (presentes.has(nombre));
    cambios.push({ path: carpeta + nombre, bytes: it.bytes });
    return nombre;
  });

  // Portada: si se reemplaza, se usa un nombre nuevo para que nadie vea la vieja en caché.
  let portada = ed.portada.nombre;
  if (ed.portada.tipo === 'nuevo') {
    portada = ed.nuevo && !presentes.has('portada.jpg') ? 'portada.jpg' : 'portada-' + sello() + '.jpg';
    cambios.push({ path: carpeta + portada, bytes: ed.portada.bytes });
  }

  // Archivos que dejan de usarse.
  const enUso = new Set([...galeria, portada]);
  [...ed.galeriaOriginal, ed.portadaOriginal].forEach((nombre) => {
    if (nombre && !enUso.has(nombre) && presentes.has(nombre)) {
      enUso.add(nombre); // evita borrarlo dos veces
      cambios.push({ path: carpeta + nombre, borrar: true });
    }
  });

  const campos = ed.nuevo ? [] : ed.proyecto.md.campos.map((x) => x.slice());
  fijar(campos, 'titulo', titulo);
  fijar(campos, 'anio', f.anio.value.trim());
  fijar(campos, 'categoria', f.categoria.value.trim());
  fijar(campos, 'cliente', f.cliente.value.trim());
  fijar(campos, 'portada', portada);
  fijar(campos, 'galeria', galeria.join(', '));
  const video = f.video.value.trim();
  if (video || campos.some((x) => x[0] === 'video')) fijar(campos, 'video', video);
  fijar(campos, 'orden', String(parseInt(f.orden.value, 10) || 999));
  fijar(campos, 'publicado', f.publicado.checked ? 'true' : 'false');
  cambios.push({ path: carpeta + 'proyecto.md', texto: serializarMd(campos, f.cuerpo.value) });

  if (ed.nuevo) {
    const m = JSON.parse(JSON.stringify(DATOS.manifiesto));
    (m[sec] = m[sec] || []).push(slug);
    cambios.push({ path: 'contenido/proyectos.json', texto: JSON.stringify(m, null, 2) + '\n' });
  }

  await ejecutar(
    (ed.nuevo ? 'Panel: añade proyecto «' : 'Panel: actualiza proyecto «') + titulo + '»',
    cambios,
    ed.nuevo ? 'Proyecto creado.' : 'Cambios guardados.',
    vistaProyectos);
}

async function borrarProyecto() {
  const p = ed.proyecto;
  const cambios = [...DATOS.archivos].filter((x) => x.startsWith(p.carpeta)).map((x) => ({ path: x, borrar: true }));
  const m = JSON.parse(JSON.stringify(DATOS.manifiesto));
  m[p.seccion] = m[p.seccion].filter((s) => s !== p.slug);
  cambios.push({ path: 'contenido/proyectos.json', texto: JSON.stringify(m, null, 2) + '\n' });
  const titulo = obtener(p.md.campos, 'titulo') || p.slug;
  await ejecutar('Panel: borra proyecto «' + titulo + '»', cambios, 'Proyecto borrado.', vistaProyectos);
}

async function ejecutar(mensaje, cambios, exito, despues) {
  bloquear(true);
  try {
    await repo.commit(mensaje, cambios, (t) => avisar(t, 'info'));
    avisar('Actualizando el panel…', 'info');
    await cargarDatos();
    bloquear(false);
    despues();
    avisar(exito + ' El sitio se actualiza en uno o dos minutos.', 'ok');
  } catch (err) {
    bloquear(false);
    if (err.status === 401 || err.status === 403) {
      vistaAcceso('El acceso a GitHub ya no es válido. Entra de nuevo para renovarlo.');
    }
    avisar('No se pudo guardar. ' + err.message, 'error');
  }
}

/* ---------- pantalla: perfil ---------- */

function vistaPerfil() {
  const c = DATOS.perfil.campos;
  const retrato = obtener(c, 'retrato');
  const fondo = obtener(c, 'portada');
  ed = {
    tipo: 'perfil',
    retrato: retrato ? { tipo: 'existente', nombre: retrato.split('/').pop(), url: repo.urlCruda(retrato) } : null,
    fondo: fondo ? { tipo: 'existente', nombre: fondo.split('/').pop(), url: repo.urlCruda(fondo) } : null,
  };
  const campo = (k, etiqueta, extra) => `
    <label class="campo${extra && extra.ancho ? ' campo--ancho' : ''}"><span class="campo__k">${etiqueta}</span>
      <input name="${k}" value="${esc(obtener(c, k))}">
      ${extra && extra.ayuda ? `<small>${extra.ayuda}</small>` : ''}</label>`;

  marco('perfil', `
    <form class="editor" id="f-perfil" novalidate>
      <div class="panel__titulo">
        <h1 class="titular titular--h1">Perfil</h1>
        <span class="barra"></span>
      </div>
      <div class="rejilla">
        ${campo('nombre', 'Nombre')}
        ${campo('ubicacion', 'Ubicación')}
        ${campo('titular_1', 'Titular · línea 1')}
        ${campo('titular_2', 'Titular · línea 2')}
        ${campo('titular_3', 'Titular · línea 3 (en color)')}
        ${campo('instagram', 'Instagram', { ayuda: 'Con @, por ejemplo @dany_cub' })}
        ${campo('telefono', 'Teléfono', { ayuda: 'También se usa para el botón de WhatsApp.' })}
        ${campo('lead', 'Frase destacada', { ancho: true })}
        ${campo('disciplinas', 'Disciplinas', { ancho: true, ayuda: 'Separadas por comas.' })}
        <label class="campo campo--ancho"><span class="campo__k">Texto de presentación</span>
          <textarea name="cuerpo" rows="5">${esc(DATOS.perfil.cuerpo)}</textarea></label>
      </div>

      <div class="rejilla">
        <section class="bloque">
          <div class="seccion-rotulo"><span class="rotulo">Retrato</span></div>
          <p class="nota">La foto de la página Perfil.</p>
          <div class="imagenes" data-zona="retrato"></div>
          <label class="boton boton--archivo">Reemplazar retrato
            <input type="file" accept="image/*" data-subir="retrato" hidden></label>
        </section>
        <section class="bloque">
          <div class="seccion-rotulo"><span class="rotulo">Foto del inicio</span></div>
          <p class="nota">La foto grande junto al titular.</p>
          <div class="imagenes" data-zona="fondo"></div>
          <label class="boton boton--archivo">Reemplazar foto
            <input type="file" accept="image/*" data-subir="fondo" hidden></label>
        </section>
      </div>

      <div class="acciones acciones--pie">
        <button class="boton boton--solido" type="submit">Guardar perfil</button>
      </div>
    </form>`);

  const f = raiz.querySelector('#f-perfil');
  enlazarImagenes(f);
  pintarImagenes();
  f.addEventListener('submit', (e) => { e.preventDefault(); guardarPerfil(f); });
}

async function guardarPerfil(f) {
  if (ocupado) return;
  if (imagenesPendientes()) { avisar('Espera a que terminen de prepararse las imágenes.', 'error'); return; }
  const campos = DATOS.perfil.campos.map((x) => x.slice());
  ['nombre', 'ubicacion', 'titular_1', 'titular_2', 'titular_3', 'lead', 'instagram', 'telefono', 'disciplinas']
    .forEach((k) => fijar(campos, k, f[k].value.trim()));
  const cambios = [];

  // Las fotos nuevas van a assets/panel-*.jpg. Sólo se borran las que creó el panel,
  // nunca los archivos originales (portada-inicio.jpg también es la imagen para redes).
  [['retrato', 'retrato'], ['fondo', 'portada']].forEach(([clave, campo]) => {
    const it = ed[clave];
    if (!it || it.tipo !== 'nuevo') return;
    const anterior = obtener(campos, campo);
    const nombre = 'assets/panel-' + campo + '-' + sello() + '.jpg';
    cambios.push({ path: nombre, bytes: it.bytes });
    fijar(campos, campo, nombre);
    if (/^assets\/panel-/.test(anterior) && DATOS.archivos.has(anterior)) cambios.push({ path: anterior, borrar: true });
  });

  cambios.push({ path: 'contenido/perfil.md', texto: serializarMd(campos, f.cuerpo.value) });
  await ejecutar('Panel: actualiza el perfil', cambios, 'Perfil guardado.', vistaPerfil);
}

/* ---------- arranque ---------- */

window.addEventListener('beforeunload', (e) => {
  if (ocupado) { e.preventDefault(); e.returnValue = ''; }
});

if (!window.crypto || !crypto.subtle) {
  raiz.innerHTML = '<p class="texto" style="padding:60px 24px">El panel necesita abrirse desde https:// (o localhost).</p>';
} else {
  vistaAcceso();
}
