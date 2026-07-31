const IMG = "../../assets/img/";

function Home({ proyectos, onOpen }) {
  return (
    <main>
      <EditorialHero
        eyebrow="Daniel Cubas"
        title={<>Diseño<br />Fotografía<br /><span style={{ color: "var(--accent)" }}>Dirección visual</span></>}
        lead="Conceptos visuales con identidad, intención y narrativa."
        body="Diseñador y fotógrafo con sensibilidad cinematográfica. Desarrollo identidad visual, dirección de arte y contenido para marcas que quieren verse como lo que son."
        tags={["Fotografía", "Diseño gráfico", "Identidad visual", "Dirección de arte"]}
        media={IMG + "p-guitar.jpeg"}
        actions={<><Button variant="outline" onClick={() => onOpen(proyectos[0])}>Ver proyectos</Button><Button variant="ghost">Contacto</Button></>}
      />

      <section style={{ padding: "0 var(--page-x) var(--page-y)" }}>
        <div style={{ marginBottom: "var(--sp-9)" }}>
          <SectionLabel>Proyectos seleccionados</SectionLabel>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--gutter) var(--sp-7)" }}>
          {proyectos.map((p, i) => (
            <ProjectCard key={p.slug} index={i + 1} title={p.titulo} year={p.anio} category={p.categoria}
              cover={IMG + p.portada} ratio={i % 3 === 0 ? "3 / 4" : "4 / 5"} onOpen={() => onOpen(p)} />
          ))}
        </div>
      </section>
    </main>
  );
}
window.DCHome = Home;
