# Portafolio de Daniel Cubas

Sitio estático. No hay compilación, ni dependencias, ni servidor: son archivos que el
navegador lee directamente. Se publica gratis con GitHub Pages.

```
index.html          la página
estilos.css         todo el diseño
app.js              el motor: lee /contenido y dibuja las pantallas
assets/             retrato, portada e isotipo
contenido/          lo editable: perfil y proyectos
design-system/      documentación del sistema de diseño (no se publica como sitio)
```

---

## Cómo añadir un proyecto

El sitio separa los proyectos en dos secciones: **Fotografía** y **Diseño**. Cada una
es una carpeta dentro de `contenido/proyectos/`:

```
contenido/proyectos/fotografia/01-Crimson-Cobalt/
contenido/proyectos/diseno/01-identidad-visual/
```

**1.** Crear una carpeta dentro de la sección correspondiente (`fotografia/` o `diseno/`).
El nombre lleva número al inicio, todo en minúsculas y con guiones:

```
contenido/proyectos/diseno/07-bodas-de-invierno/
```

**2.** Meter las fotos en esa carpeta:

- `portada.jpg` — la imagen que se ve en la retícula del inicio. Vertical.
- `01.jpg`, `02.jpg`, `03.jpg` … — las de la galería, en el orden en que se quieren ver.

**3.** Crear dentro un archivo `proyecto.md` con este contenido:

```markdown
---
titulo: Bodas de invierno
anio: 2026
categoria: Fotografía
cliente: Personal
portada: portada.jpg
galeria: 01.jpg, 02.jpg, 03.jpg
orden: 7
publicado: true
---

Dos o tres frases sobre el proyecto. Se muestran grandes, en cursiva, al lado de los datos.
Sin títulos ni listas: prosa corta.
```

**4.** Añadir el nombre de la carpeta a `contenido/proyectos.json`, dentro de su sección:

```json
{
  "fotografia": ["01-Crimson-Cobalt", "...", "07-bodas-de-invierno"],
  "diseno": ["01-identidad-visual", "..."]
}
```

Este último paso es el único que se olvida. Si el proyecto no aparece en el sitio,
casi siempre falta aquí.

### Vídeo de proyecto (cortometraje)

Si el proyecto es un cortometraje, añadir un campo `video:` al `proyecto.md` con el
enlace de Google Drive del archivo (compartido como *Cualquiera con el enlace*).
Se incrusta el reproductor de Drive en la ficha:

```yaml
video: https://drive.google.com/file/d/1AbCdEfGh/view?usp=sharing
```

También funciona pasando sólo el ID del archivo. Sin este campo, la ficha no muestra vídeo.

---

## Otras tareas frecuentes

| Quiero… | Dónde |
|---|---|
| Cambiar mi descripción, teléfono o Instagram | `contenido/perfil.md` |
| Cambiar mi retrato | reemplazar `assets/retrato.jpg` |
| Cambiar la foto grande del inicio | reemplazar `assets/portada-inicio.jpg` |
| Ocultar un proyecto sin borrarlo | poner `publicado: false` en su `proyecto.md` |
| Reordenar los proyectos | cambiar el número de `orden:` en cada `proyecto.md` |
| Borrar un proyecto | borrar la carpeta y su línea en `proyectos.json` |

## Formato de las fotos

JPG, borde largo de 2400px, calidad 80. Nada de PNG para fotografía: pesa cinco veces más
y se ve igual. Si una foto pesa más de 600 KB, conviene comprimirla antes de subirla.

---

## Publicar en GitHub Pages

1. En GitHub: **Settings → Pages**.
2. *Source*: `Deploy from a branch`.
3. *Branch*: la rama donde está este contenido, carpeta **`/ (root)`**.
4. Guardar. En un par de minutos el sitio está en línea.

Cada vez que se suba un cambio a esa rama, el sitio se actualiza solo.

El archivo `.nojekyll` de la raíz es necesario: le dice a GitHub que publique los archivos
tal cual, sin procesarlos. No borrarlo.

### Ver el sitio antes de publicar

Desde esta carpeta:

```
npx serve .
```

Abrir `index.html` con doble clic **no funciona**: el navegador bloquea la lectura de las
carpetas de contenido por seguridad.

---

## Diseño

El sitio sigue el **Danny Cubas Design System**, documentado en `design-system/`
(`readme.md`, `tokens/`, `components/`, `guidelines/`). Todos los valores visuales del sitio
—color, tipografía, espacio— viven como variables al inicio de `estilos.css`.
Cambiar una variable cambia el sitio entero; cambiar un valor suelto rompe el sistema.

`design-system/` es sólo documentación: no interviene en el funcionamiento de la página.
