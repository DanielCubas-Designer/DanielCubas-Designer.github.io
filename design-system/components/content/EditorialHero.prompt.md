Portada del sitio. Una por página, siempre la primera sección bajo la cabecera.

```jsx
<EditorialHero
  eyebrow="Daniel Cubas"
  title={<>Diseño<br/>Fotografía<br/><span style={{color:"var(--accent)"}}>Dirección visual</span></>}
  lead="Conceptos visuales con identidad, intención y narrativa."
  media="/assets/img/p-guitar.jpeg"
/>
```

En el titular se permite colorear **una sola línea** en amarillo. El `<br/>` es intencional:
los saltos de línea del titular se componen a mano, no se dejan al navegador.
