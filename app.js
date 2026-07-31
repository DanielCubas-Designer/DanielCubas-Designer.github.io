/* Motor del sitio. Lee /contenido y dibuja las tres pantallas.
   No hay compilación ni dependencias: el navegador hace todo el trabajo.
   Para añadir un proyecto no se toca este archivo — ver README.md. */

const BASE = 'contenido/';
const root = document.getElementById('app');

// Versión de caché. Subir este número al cambiar cualquier contenido obliga
// al navegador a pedir los archivos de nuevo y evita que muestre versiones viejas.
const V = '6';
const conV = (u) => u + (u.includes('?') ? '&c=' : '?c=') + V;

// Convierte un enlace de Google Drive (o su ID) en la URL de su reproductor embebido.
function videoDrive(url) {
  if (!url) return '';
  if (String(url).includes('/drive/folders/')) return '';
  const m = String(url).match(/(?:file\/d\/|id=)([A-Za-z0-9_-]+)/);
  const id = m ? m[1] : String(url).trim();
  if (!id) return '';
  return 'https://drive.google.com/file/d/' + id + '/preview';
}

/* ---------- utilidades ---------- */

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Lee el bloque --- ... --- del inicio de un .md y devuelve {datos, cuerpo}
function leerMd(txt) {
  const m = txt.match(/^\s*---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { datos: {}, cuerpo: txt.trim() };
  const datos = {};
  m[1].split(/\r?\n/).forEach((linea) => {
    const i = linea.indexOf(':');
    if (i < 1) return;
    const clave = linea.slice(0, i).trim();
    let valor = linea.slice(i + 1).trim();
    if (/^".*"$/.test(valor) || /^'.*'$/.test(valor)) valor = valor.slice(1, -1);
    datos[clave] = valor;
  });
  return { datos, cuerpo: m[2].trim() };
}

const lista = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);
const esVerdad = (v) => v === undefined || /^(true|sí|si|yes|1)$/i.test(String(v).trim());

// Secciones del sitio. Las claves son las carpetas dentro de contenido/proyectos/.
const ETIQUETAS = { fotografia: 'Fotografía', diseno: 'Diseño', cortometrajes: 'Cortometrajes' };

/* ---------- carga de contenido ---------- */

let PERFIL = null;
let PROYECTOS = [];
let SECCIONES = {};

async function cargar() {
  const perfilTxt = await fetch(conV(BASE + 'perfil.md')).then((r) => r.text());
  const perfil = leerMd(perfilTxt);
  PERFIL = Object.assign({}, perfil.datos, { texto: perfil.cuerpo });

  const secciones = await fetch(conV(BASE + 'proyectos.json')).then((r) => r.json());
  const grupos = {};
  const todos = [];

  for (const seccion of Object.keys(secciones)) {
    const cargados = await Promise.all(secciones[seccion].map(async (slug) => {
      const carpeta = BASE + 'proyectos/' + seccion + '/' + slug + '/';
      try {
        const { datos, cuerpo } = leerMd(await fetch(conV(carpeta + 'proyecto.md')).then((r) => r.text()));
        if (!esVerdad(datos.publicado)) return null;
        return {
          slug,
          seccion,
          carpeta,
          titulo: datos.titulo || slug,
          anio: datos.anio || '',
          categoria: datos.categoria || '',
          cliente: datos.cliente || '',
          portada: conV(carpeta + (datos.portada || 'portada.jpg')),
          galeria: lista(datos.galeria).map((g) => conV(carpeta + g)),
          video: videoDrive(datos.video),
          orden: parseInt(datos.orden, 10) || 999,
          texto: cuerpo,
        };
      } catch (e) {
        console.warn('No se pudo leer el proyecto', seccion, slug, e);
        return null;
      }
    }));
    const listaSec = cargados.filter(Boolean).sort((a, b) => a.orden - b.orden);
    grupos[seccion] = listaSec;
    todos.push(...listaSec);
  }

  SECCIONES = grupos;
  PROYECTOS = todos;
}

/* ---------- piezas ---------- */

function cabecera(activa) {
  const items = [['inicio', 'Proyectos'], ['perfil', 'Perfil']];
  return `
  <header class="cabecera">
    <a class="marca" href="#/inicio">
      <span class="marca__nombre">${esc(PERFIL.nombre)}</span>
      <span class="marca__loc">${esc(PERFIL.ubicacion || '')}</span>
    </a>
    <nav class="nav">
      ${items.map(([id, txt]) =>
        `<a href="#/${id}"${activa === id ? ' aria-current="page"' : ''}>${txt}</a>`).join('')}
      <a href="#contacto">Contacto</a>
    </nav>
  </header>`;
}

function pie() {
  return `
  <footer class="pie" id="contacto">
    <p class="pie__nota">Disponible para proyectos, colaboraciones y desarrollo de marca.</p>
    <div class="pie__contacto">
      <a href="https://www.instagram.com/${esc((PERFIL.instagram || '').replace('@', ''))}" target="_blank" rel="noopener">${esc(PERFIL.instagram)}</a>
      <a href="tel:${esc((PERFIL.telefono || '').replace(/\s/g, ''))}">${esc(PERFIL.telefono)}</a>
    </div>
  </footer>`;
}

function disciplinas() {
  const d = lista(PERFIL.disciplinas);
  return `<div class="disciplinas">${d.map((x, i) =>
    `<span>${esc(x)}</span>${i < d.length - 1 ? '<i>·</i>' : ''}`).join('')}</div>`;
}

function tarjeta(p, i) {
  return `
  <a class="tarjeta" href="#/proyecto/${esc(p.slug)}">
    <div class="tarjeta__marco">
      <img src="${esc(p.portada)}" alt="${esc(p.titulo)}" loading="lazy">
      <span class="tarjeta__num">${('0' + (i + 1)).slice(-2)}</span>
    </div>
    <div class="tarjeta__pie">
      <h3 class="tarjeta__titulo">${esc(p.titulo)}</h3>
      <span class="tarjeta__anio">${esc(p.anio)}</span>
    </div>
    <p class="tarjeta__cat">${esc(p.categoria)}</p>
  </a>`;
}

/* ---------- pantallas ---------- */

function reticulaSeccion(seccion, etiqueta) {
  const ps = SECCIONES[seccion] || [];
  if (!ps.length) return '';
  return `
      <div class="proyectos__cabeza seccion-rotulo"><span class="rotulo">${esc(etiqueta)}</span></div>
      <div class="reticula">${ps.map(tarjeta).join('')}</div>`;
}

function pantallaInicio() {
  return `
  ${cabecera('inicio')}
  <main>
    <section class="portada">
      <div class="portada__texto">
        <div class="seccion-rotulo"><span class="rotulo">${esc(PERFIL.nombre)}</span></div>
        <h1 class="titular">${esc(PERFIL.titular_1)}<br>${esc(PERFIL.titular_2)}<br><em>${esc(PERFIL.titular_3)}</em></h1>
        <span class="barra"></span>
        <p class="lead">${esc(PERFIL.lead)}</p>
        <p class="texto">${esc(PERFIL.texto)}</p>
        ${disciplinas()}
        <div class="portada__acciones">
          <a class="boton boton--solido" href="#proyectos">Ver proyectos</a>
          <a class="boton boton--fantasma" href="#contacto">Contacto</a>
        </div>
      </div>
      <div class="portada__foto"><img src="${esc(conV(PERFIL.portada))}" alt=""></div>
    </section>

    <section class="proyectos" id="proyectos">
      ${Object.keys(SECCIONES).filter((s) => (SECCIONES[s] || []).length)
        .map((s) => reticulaSeccion(s, ETIQUETAS[s] || s)).join('')}
    </section>
  </main>
  ${pie()}`;
}

function pantallaProyecto(slug) {
  const p = PROYECTOS.find((x) => x.slug === slug);
  if (!p) return pantallaInicio();
  return `
  ${cabecera('inicio')}
  <main>
    <div class="ficha__hero">
      <img src="${esc(p.portada)}" alt="" data-imagen>
      <div class="ficha__titulo">
        <h1 class="titular titular--h1">${esc(p.titulo)}</h1>
        <span class="barra"></span>
      </div>
    </div>

    <section class="ficha__cuerpo">
      <div class="ficha__meta">
        <div class="dato"><span class="dato__k">Año</span><span class="dato__v">${esc(p.anio)}</span></div>
        <div class="dato"><span class="dato__k">Categoría</span><span class="dato__v">${esc(p.categoria)}</span></div>
        <div class="dato"><span class="dato__k">Cliente</span><span class="dato__v">${esc(p.cliente)}</span></div>
        <a class="boton boton--fantasma" href="#/inicio">← Todos los proyectos</a>
      </div>
      <p class="lead">${esc(p.texto)}</p>
    </section>

    ${p.video ? `
    <section class="ficha__video">
      <div class="ratio">
        <iframe src="${esc(p.video)}" title="${esc(p.titulo)}" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>
      </div>
    </section>` : ''}

    ${p.galeria.length ? `<section class="galeria">${p.galeria.map((g) =>
      `<figure><img src="${esc(g)}" alt="" loading="lazy" data-imagen></figure>`).join('')}</section>` : ''}
  </main>
  ${pie()}`;
}

function pantallaPerfil(activa) {
  return `
  ${cabecera(activa)}
  <main class="perfil">
    <div class="perfil__texto">
      <div class="seccion-rotulo"><span class="rotulo">Perfil</span></div>
      <h1 class="titular titular--h1">Daniel<br>Cubas</h1>
      <span class="barra"></span>
      <p class="texto">${esc(PERFIL.texto)}</p>
      ${disciplinas()}
      <div class="portada__acciones">
        <a class="boton boton--solido" href="https://wa.me/52${esc((PERFIL.telefono || '').replace(/\s/g, ''))}?text=Hola%20Daniel%2C%20vi%20tu%20portafolio%20y%20me%20gustar%C3%ADa%20platicar%20contigo." target="_blank" rel="noopener">Escríbeme</a>
        <a class="boton" href="https://www.instagram.com/${esc((PERFIL.instagram || '').replace('@', ''))}" target="_blank" rel="noopener">${esc(PERFIL.instagram)}</a>
      </div>
    </div>
    <div class="perfil__foto"><img src="${esc(conV(PERFIL.retrato))}" alt="${esc(PERFIL.nombre)}"></div>
  </main>
  ${pie()}`;
}

/* ---------- visor de imágenes en pantalla completa ---------- */

let visor = null;
let visorLista = [];
let visorIndice = 0;

function abrirVisor(lista, indice) {
  visorLista = lista;
  visorIndice = indice;
  visor = document.createElement('div');
  visor.className = 'visor';
  visor.innerHTML = `
  <button class="visor__cerrar" aria-label="Cerrar" type="button">✕</button>
  <button class="visor__nav visor__nav--prev" aria-label="Anterior" type="button">‹</button>
  <div class="visor__caja"><img class="visor__img" src="" alt=""></div>
  <button class="visor__nav visor__nav--next" aria-label="Siguiente" type="button">›</button>
  <span class="visor__cuenta"></span>`;
  document.body.appendChild(visor);
  document.body.classList.add('sin-scroll');
  pintarVisor();
  requestAnimationFrame(() => visor.classList.add('visor--activo'));
  visor.querySelector('.visor__cerrar').addEventListener('click', cerrarVisor);
  visor.querySelector('.visor__nav--prev').addEventListener('click', () => moverVisor(-1));
  visor.querySelector('.visor__nav--next').addEventListener('click', () => moverVisor(1));
}

function pintarVisor() {
  visor.querySelector('.visor__img').src = visorLista[visorIndice];
  const cuenta = visor.querySelector('.visor__cuenta');
  cuenta.textContent = visorLista.length > 1 ? (visorIndice + 1) + ' / ' + visorLista.length : '';
  const muchos = visorLista.length > 1;
  visor.querySelector('.visor__nav--prev').style.display = muchos ? '' : 'none';
  visor.querySelector('.visor__nav--next').style.display = muchos ? '' : 'none';
}

function moverVisor(delta) {
  visorIndice = (visorIndice + delta + visorLista.length) % visorLista.length;
  pintarVisor();
}

function cerrarVisor() {
  if (!visor) return;
  const el = visor;
  visor = null;
  el.classList.remove('visor--activo');
  setTimeout(() => el.remove(), 240);
  document.body.classList.remove('sin-scroll');
}

document.addEventListener('click', (e) => {
  const img = e.target.closest('[data-imagen]');
  if (!img) return;
  const imgs = Array.from(document.querySelectorAll('[data-imagen]')).map((x) => x.getAttribute('src'));
  const indice = imgs.indexOf(img.getAttribute('src'));
  abrirVisor(imgs, indice < 0 ? 0 : indice);
});

document.addEventListener('keydown', (e) => {
  if (!visor) return;
  if (e.key === 'Escape') cerrarVisor();
  else if (e.key === 'ArrowLeft') moverVisor(-1);
  else if (e.key === 'ArrowRight') moverVisor(1);
});

/* ---------- enrutado ---------- */

// Desplaza a un ancla interna (#proyectos, #contacto) sin repintar la pantalla.
function irAAncla(id) {
  const destino = document.getElementById(id);
  if (!destino) return false;
  const y = destino.getBoundingClientRect().top + window.scrollY - 90; // altura de la cabecera fija
  window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
  return true;
}

function dibujar() {
  const hash = location.hash || '#/inicio';

  // Los hash que no empiezan por "#/" son anclas dentro de la pantalla actual.
  if (hash.length > 1 && !hash.startsWith('#/')) {
    if (irAAncla(hash.slice(1))) return;
  }

  const ruta = hash.replace(/^#\//, '');
  const [seccion, arg] = ruta.split('/');

  if (seccion === 'proyecto' && arg) root.innerHTML = pantallaProyecto(arg);
  else if (seccion === 'perfil') root.innerHTML = pantallaPerfil('perfil');
  else root.innerHTML = pantallaInicio();

  document.title = 'Daniel Cubas — ' +
    (seccion === 'proyecto' && arg ? (PROYECTOS.find((x) => x.slug === arg) || {}).titulo || 'Proyecto'
      : seccion === 'perfil' ? 'Perfil' : 'Portafolio');
  window.scrollTo(0, 0);
}

cargar()
  .then(() => {
    dibujar();
    window.addEventListener('hashchange', dibujar);
  })
  .catch((e) => {
    root.innerHTML = '<p style="padding:60px 24px;color:#f0efeb;font-family:sans-serif">' +
      'No se pudo cargar el contenido. Si abrió el archivo con doble clic, el navegador bloquea la lectura de carpetas: ' +
      'suba el sitio a GitHub Pages o levante un servidor local con <code>npx serve .</code>.<br><br>' + esc(e.message) + '</p>';
  });
