const services = [
  {
    title: 'Room Styling',
    text: 'Focused layout direction for living rooms, reading corners, and refined lounge zones.',
    bullets: ['Layout hierarchy', 'Furniture scale', 'Anchor-piece selection'],
  },
  {
    title: 'Material Pairing',
    text: 'Coordinated palettes for wood, upholstery, metal accents, and lighting surfaces.',
    bullets: ['Surface balance', 'Tone matching', 'Accent finish direction'],
  },
  {
    title: 'Decor Sourcing',
    text: 'Selection guidance for statement furniture, quiet supporting pieces, and finish accents.',
    bullets: ['Hero products', 'Supporting decor', 'Styling notes'],
  },
]

const process = [
  'Define the mood and the function of the room',
  'Build the anchor pieces and furniture hierarchy',
  'Layer materials, accent color, and lighting',
  'Refine the final composition for comfort and clarity',
]

function ServicesPage() {
  return (
    <>
      <section className="page-section services-stage">
        <div className="container services-stage-grid">
          <div className="services-image-panel">
            <img
              src="/images/services-room.jpg"
              alt="Refined living room with layered seating and decor"
            />
          </div>

          <div className="services-intro-panel">
            <span className="eyebrow">Services</span>
            <h1 className="page-title">
              Interior services built around how a room should feel
            </h1>
            <p className="page-description">
              We shape practical styling systems that can scale from a single
              room refresh to a whole-home direction. Every step is designed to
              make the room easier to read and easier to live in.
            </p>
            <div className="services-intro-strip">
              <span>Room styling</span>
              <span>Material pairing</span>
              <span>Decor sourcing</span>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section services-board">
        <div className="container services-board-layout">
          <aside className="services-side-panel">
            <span className="eyebrow">Studio Scope</span>
            <h2 className="section-title">A focused service set</h2>
            <p className="section-copy">
              Each service is structured to control visual noise, sharpen the
              room hierarchy, and keep the final space adaptable.
            </p>
          </aside>

          <div className="services-card-stack">
            {services.map((service, index) => (
              <article className="service-row-card" key={service.title}>
                <span className="service-number">0{index + 1}</span>
                <div className="service-row-copy">
                  <strong>{service.title}</strong>
                  <p>{service.text}</p>
                  <ul className="service-bullet-list">
                    {service.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section services-process">
        <div className="container services-process-grid">
          <div className="section-heading-block compact-heading">
            <span className="eyebrow">Process</span>
            <h2 className="section-title">How each project moves forward</h2>
          </div>

          <ol className="services-process-list">
            {process.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}

export default ServicesPage
