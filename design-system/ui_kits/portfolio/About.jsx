const PF = PhotoFrame, SL = SectionLabel, TL = TagList, Btn = Button;
const IMG3 = "../../assets/img/";

function About() {
  return (
    <main style={{ padding: "var(--page-y) var(--page-x)", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,0.68fr)", gap: "var(--gutter)", alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-7)" }}>
        <SL>Perfil</SL>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--type-h1)", lineHeight: "var(--lh-display)", letterSpacing: "var(--ls-display)", textTransform: "uppercase" }}>
          Daniel<br />Cubas
        </h1>
        <span style={{ width: "var(--accent-bar-w)", height: "2px", background: "var(--accent)" }} />
        <p style={{ margin: 0, fontSize: "var(--type-body)", fontWeight: 300, lineHeight: "var(--lh-body)", color: "var(--text-muted)", maxWidth: "var(--max-measure)", textWrap: "pretty" }}>
          Diseñador y fotógrafo con sensibilidad cinematográfica. Trabajo en identidad visual, dirección de arte y contenido para marcas. Me interesa lo que pasa antes de la foto: la conversación, el encuadre que se descarta, la decisión de no usar color.
        </p>
        <TL items={["Fotografía", "Diseño gráfico", "Identidad visual", "Contenido para redes", "Dirección de arte"]} />
        <div style={{ display: "flex", gap: "var(--sp-4)", marginTop: "var(--sp-4)" }}>
          <Btn variant="solid">Escribirme</Btn>
          <Btn variant="outline">@DanyCub</Btn>
        </div>
      </div>
      <PF src={IMG3 + "p-portrait-sunset.jpeg"} ratio="4 / 5" veil="none" />
    </main>
  );
}
window.DCAbout = About;
