Cabecera fija del portafolio. Un solo filete inferior, sin sombra, sin fondo translúcido.

```jsx
<SiteHeader
  items={[{id:"work",label:"Proyectos"},{id:"about",label:"Perfil"},{id:"contact",label:"Contacto"}]}
  active="work"
  onNavigate={setScreen}
/>
```
