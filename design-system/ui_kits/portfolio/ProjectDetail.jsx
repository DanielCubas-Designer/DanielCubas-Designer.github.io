const IMG2 = "../../assets/img/";

function Meta({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--type-label)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-display)", fontSize: "19px", letterSpacing: "1px" }}>{value}</span>
    </div>
  );
}

function ProjectDetail({ proyecto, onBack }) {
  const p = proyecto;
  return (
    <main>
      <div style={{ position: "relative", height: "62vh", minHeight: "380px", overflow: "hidden" }}>
        <img src={IMG2 + p.portada} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.06) saturate(0.96)" }} />
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(10,10,10,0.2) 0%,rgba(10,10,10,0.1) 50%,rgba(10,10,10,0.95) 100%)" }} />
        <div style={{ position: "absolute", left: "var(--page-x)", right: "var(--page-x)", bottom: "var(--sp-9)", display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--type-h1)", lineHeight: "var(--lh-display)", letterSpacing: "var(--ls-display)", textTransform: "uppercase" }}>{p.titulo}</h1>
          <span style={{ width: "var(--accent-bar-w)", height: "2px", background: "var(--accent)" }} />
        </div>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "minmax(0,0.4fr) minmax(0,1fr)", gap: "var(--gutter)", padding: "var(--page-y) var(--page-x)", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-7)" }}>
          <Meta label="Año" value={p.anio} />
          <Meta label="Categoría" value={p.categoria} />
          <Meta label="Cliente" value={p.cliente} />
          <Button variant="ghost" onClick={onBack}>← Todos los proyectos</Button>
        </div>
        <p style={{ margin: 0, fontSize: "var(--type-lead)", fontFamily: "var(--font-display)", fontWeight: 300, fontStyle: "italic", lineHeight: "var(--lh-lead)", maxWidth: "760px" }}>{p.texto}</p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--sp-7)", padding: "0 var(--page-x) var(--page-y)" }}>
        {p.galeria.map((g, i) => (
          <PhotoFrame key={g} src={IMG2 + g} ratio={i === 0 ? "3 / 4" : "4 / 5"} veil="none" />
        ))}
      </section>
    </main>
  );
}
window.DCProjectDetail = ProjectDetail;
