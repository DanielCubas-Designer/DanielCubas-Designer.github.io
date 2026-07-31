# Contenido editable sin tocar código (opción C)

El sitio lee una carpeta por proyecto dentro del repositorio. El cliente —o un
agente como opencode actuando por él— solo crea carpetas y archivos de texto.

## Estructura

```
/contenido
  /proyectos
    /01-nombre-del-proyecto
      proyecto.md
      portada.jpg
      01.jpg
      02.jpg
      03.jpg
    /02-otro-proyecto
      proyecto.md
      ...
  perfil.md
```

## proyecto.md

```markdown
---
titulo: Serie nocturna
anio: 2025
categoria: Fotografía
cliente: Personal
portada: portada.jpg
orden: 1
publicado: true
---

Dos o tres párrafos sobre la intención del proyecto. Se muestran en la ficha,
debajo del título. Sin encabezados ni listas: prosa corta, en primera persona.
```

## Reglas

- El nombre de la carpeta con prefijo numérico define el orden por defecto.
- Toda imagen `.jpg` de la carpeta que no sea la portada entra a la galería,
  en orden alfabético. Por eso conviene nombrarlas `01.jpg`, `02.jpg`, …
- `publicado: false` esconde el proyecto sin borrarlo.
- Formato recomendado: JPG, borde largo de 2400px, calidad 80. Nada de PNG
  para fotografía.
- Para quitar un proyecto: borrar la carpeta. Nada más se rompe.

## Nota sobre imágenes

El sistema espera fotografía real, no ilustración ni gráficos generados.
Ver la sección FOTOGRAFÍA del readme para el tratamiento cromático.
