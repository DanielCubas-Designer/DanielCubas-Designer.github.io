/* Motor del sitio. Lee /contenido y dibuja las tres pantallas.
   No hay compilación ni dependencias: el navegador hace todo el trabajo.
   Para añadir un proyecto no se toca este archivo — ver README.md. */

const BASE = 'contenido/';
const root = document.getElementById('app');

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

/* ---------- carga de contenido ---------- */

let PERFIL = null;
let PROYECTOS = [];

async function cargar() {
  const perfilTxt = await fetch(BASE + 'perfil.md').then((r) => r.text());
  const perfil = leerMd(perfilTxt);
  PERFIL = Object.assign({}, perfil.datos, { texto: perfil.cuerpo });

  const slugs = await fetch(BASE + 'proyectos.json').then((r) => r.json());

  const cargados = await Promise.all(slugs.map(async (slug) => {
    const carpeta = BASE + 'proyectos/' + slug + '/';
    try {
      const { datos, cuerpo } = leerMd(await fetch(carpeta + 'proyecto.md').then((r) => r.text()));
      if (!esVerdad(datos.publicado)) return null;
      return {
        slug,
        carpeta,
        titulo: datos.titulo || slug,
        anio: datos.anio || '',
        categoria: datos.categoria || '',
        cliente: datos.cliente || '',
        portada: carpeta + (datos.portada || 'portada.jpg'),
        galeria: lista(datos.galeria).map((g) => carpeta + g),
        orden: parseInt(datos.orden, 10) || 999,
        texto: cuerpo,
      };
    } catch (e) {
      console.warn('No se pudo leer el proyecto', slug, e);
      return null;
    }
  }));

  PROYECTOS = cargados.filter(Boolean).sort((a, b) => a.orden - b.orden);
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
      <div class="portada__foto"><img src="${esc(PERFIL.portada)}" alt=""></div>
    </section>

    <section class="proyectos" id="proyectos">
      <div class="proyectos__cabeza seccion-rotulo"><span class="rotulo">Proyectos seleccionados</span></div>
      <div class="reticula">${PROYECTOS.map(tarjeta).join('')}</div>
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
      <img src="${esc(p.portada)}" alt="">
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

    ${p.galeria.length ? `<section class="galeria">${p.galeria.map((g) =>
      `<figure><img src="${esc(g)}" alt="" loading="lazy"></figure>`).join('')}</section>` : ''}
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
    <div class="perfil__foto"><img src="${esc(PERFIL.retrato)}" alt="${esc(PERFIL.nombre)}"></div>
  </main>
  ${pie()}`;
}

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
