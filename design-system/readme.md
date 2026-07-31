# Danny Cubas Design System

Sistema de diseño para el portafolio web de **Daniel Cubas** — diseñador, fotógrafo y
director visual. Deriva de la tercera propuesta del flyer editorial 1920×1080
(`flyer-daniel-cubas.dc.html` en el proyecto "Tres propuestas editoriales personalizables"):
titular condensado a la izquierda, fotografía vertical a la derecha, franja inferior de
trabajo. El sitio traduce ese cartel a una página que respira y se adapta a móvil.

## Fuentes

- Flyer editorial, propuesta 03 (origen de toda la retícula y la escala tipográfica).
- Brand book propio de Daniel Cubas: de ahí sale el amarillo `#F2B336` y el isotipo.
- CV y fotografías entregadas por el cliente (`assets/img/`).

No hubo acceso a un código fuente ni a un archivo de Figma: el sistema se construyó
a partir del flyer, que sí es código y por tanto fuente fiable.

---

## FUNDAMENTOS VISUALES

**Color.** El sistema es monocromo por decisión, no por falta de recursos. Negro
`#0a0a0a` de fondo, hueso `#f0efeb` de texto — nunca blanco puro, porque el blanco puro
compite con las altas luces de la fotografía. El amarillo `#F2B336` es el único color y
tiene exactamente tres usos permitidos: la barra de 88×2px bajo los titulares, los puntos
separadores entre disciplinas, y una sola línea del titular de portada. Nunca como fondo
de bloque, nunca en dos elementos de la misma pantalla salvo esos tres.

**Tipografía.** Dos familias, sin excepción. **Oswald** condensada para todo lo que se lee
de un vistazo: titulares en versalitas con interletraje negativo (-2px) e interlínea muy
cerrada (0.86), rótulos a 13px con tracking de 3px, el nombre de la marca a 17px con
tracking de 7px. **Inter light (300)** para el texto que se lee de verdad: 17px, interlínea
1.75, al 60% de opacidad. El subtítulo es el híbrido: Oswald light en itálica, a 28px — es
la voz de autor del sistema.

**Espacio.** Márgenes laterales generosos (`--page-x`, hasta 150px) y un canal amplio entre
columnas (`--gutter`, hasta 96px). El error que corregimos en el flyer fue justamente ese:
el texto pegado a la foto. En móvil los valores bajan con `clamp()` sin romper la
proporción.

**Fondos.** Siempre negro plano. Nada de degradados de fondo, nada de texturas, nada de
patrones. La única transparencia del sistema son las veladuras sobre fotografía, y existen
por una razón funcional: que el texto blanco siga siendo legible encima de la imagen.

**Bordes y esquinas.** Radio 0 en todo. Los filetes son de 1px al 22% de opacidad; la barra
de acento es de 2px. No hay sombras — ni exteriores ni interiores. Una tarjeta no es una
caja: es una fotografía con texto debajo.

**Animación.** Discreta. `--ease-out` (0.22, 0.61, 0.36, 1) y tres duraciones: 160ms para
cambios de color, 320ms para transiciones normales, 620ms para el zoom lento de una
fotografía en hover. Nada rebota, nada gira, nada aparece deslizándose desde un lado.

**Estados.** El hover de una tarjeta de proyecto es el único momento con color: la imagen
recupera su saturación (en reposo lleva 15% de desaturación), escala a 1.03 y el título
vira a amarillo. En navegación y botones el hover es solo un cambio de opacidad o de color
de texto. No hay estado "pressed" con desplazamiento.

**Fotografía.** Es el material principal, no una ilustración del texto. Tratamiento cálido,
contraste ligeramente subido (1.06), saturación ligeramente bajada (0.96) — se parece a
negativo escaneado, no a fotografía de banco. Recortes verticales (4/5, 3/4) para retrato y
retícula; horizontales (3/2, 16/9) solo para cabeceras a sangre. Nunca ilustración vectorial,
nunca iconos decorativos, nunca imágenes generadas.

---

## FUNDAMENTOS DE CONTENIDO

Primera persona, sin grandilocuencia. Frases cortas, en indicativo. El sistema evita el
lenguaje de agencia ("soluciones integrales", "potenciamos tu marca") y prefiere describir
un método concreto: *"Caminar sin plan durante una hora antes del atardecer y fotografiar
lo que aparezca."*

- Los titulares van en versalitas y sin punto final: **DIRECCIÓN VISUAL**.
- Los rótulos son sustantivos, no verbos: "Proyectos seleccionados", no "Ver mi trabajo".
- Los subtítulos admiten una sola oración, con punto final.
- Las disciplinas se escriben siempre en el mismo orden y separadas por punto medio:
  Fotografía · Diseño gráfico · Identidad visual · Contenido para redes · Dirección de arte.
- Sin emoji. Sin signos de exclamación. Sin mayúsculas de énfasis dentro de una frase.
- Los números de proyecto van a dos dígitos: 01, 02, 03.

---

## ICONOGRAFÍA

**El sistema no usa iconos.** Es una decisión, no una omisión: la jerarquía se resuelve con
tipografía, filetes y espacio. Los únicos signos gráficos permitidos son el punto medio
amarillo (·) entre disciplinas y la flecha de texto (←) para volver. Si en algún momento
hiciera falta un juego de iconos, use Lucide con grosor 1 y tamaño 20px, en color
`--text-muted` — pero primero pregúntese si el icono está haciendo algún trabajo.

El **isotipo** de Daniel Cubas está en `assets/img/mark-isotipo-clean.png` (versión
recortada sobre transparencia) y se usa aislado sobre negro, nunca en la misma línea que
el nombre escrito.

---

## Índice

| Archivo | Qué contiene |
|---|---|
| `styles.css` | Punto de entrada. Solo `@import`. Es el archivo que enlaza el sitio. |
| `tokens/` | `fonts`, `colors`, `typography`, `spacing`, `motion` — todas las variables CSS. |
| `components/core/` | `Button`, `Tag` + `TagList`, `SectionLabel` + `Rule`. |
| `components/navigation/` | `SiteHeader`, `SiteFooter`. |
| `components/content/` | `PhotoFrame`, `ProjectCard`, `EditorialHero`. |
| `ui_kits/portfolio/` | El sitio completo y navegable: home, ficha de proyecto, perfil. |
| `guidelines/contenido-editable.md` | **Cómo el cliente publica sin tocar código.** |
| `assets/img/` | Fotografías, isotipo y láminas del brand book. |

## Adiciones intencionales

- `TagList` y `Rule` no existían como piezas separadas en el flyer; se extrajeron porque el
  patrón se repite en las tres propuestas y en las tres pantallas del sitio.
