const values = [
  {
    title: 'Curated Selection',
    text: 'Each room direction is built from a small, intentional set of decor pieces instead of visual noise.',
  },
  {
    title: 'Balanced Materials',
    text: 'Warm woods, soft fabrics, and clean surfaces create rooms that feel calm and contemporary.',
  },
  {
    title: 'Room-First Design',
    text: 'We shape collections around how people live in a space, not around short-lived visual trends.',
  },
]

const milestones = [
  {
    title: 'Mood First',
    text: 'Every room begins with a feeling target before we choose furniture or finishes.',
  },
  {
    title: 'Shape and Balance',
    text: 'We define the visual hierarchy so the largest pieces carry the room naturally.',
  },
  {
    title: 'Quiet Refinement',
    text: 'Details are reduced until the room feels complete without looking crowded.',
  },
]

function AboutPage() {
  return (
    <>
      <section className="page-section about-stage">
        <div className="container about-stage-grid">
          <div className="about-lead-card">
            <span className="eyebrow">About Us</span>
            <h1 className="page-title">A calm visual system for modern homes</h1>
            <p className="page-description">
              Our studio builds interior directions that feel grounded,
              comfortable, and visually precise. The goal is not to make rooms
              louder. It is to make them clearer.
            </p>

            <blockquote className="about-quote">
              "Elegant rooms should feel resolved, not over-decorated."
            </blockquote>

            <div className="about-metric-row">
              <div className="about-metric-box">
                <strong>12+</strong>
                <span>years of styling direction</span>
              </div>
              <div className="about-metric-box">
                <strong>320</strong>
                <span>curated room concepts</span>
              </div>
            </div>
          </div>

          <div className="about-visual-stack">
            <div className="about-primary-image">
              <img
                src="/images/about-seating.jpg"
                alt="Warm seating arrangement in a bright room"
              />
            </div>
            <div className="about-secondary-image">
              <img
                src="/images/accent-lamp.jpg"
                alt="Accent lamp and stool in a warm room"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="page-section about-values">
        <div className="container about-values-layout">
          <div className="section-heading-block">
            <span className="eyebrow">Design Principles</span>
            <h2 className="section-title">
              Rooms become easier to read when every piece has a role
            </h2>
            <p className="section-copy">
              We build collections around proportion, material balance, and the
              way a person actually moves through a room.
            </p>
          </div>

          <div className="about-value-grid">
            {values.map((value, index) => (
              <article className="about-value-card" key={value.title}>
                <span className="info-index">0{index + 1}</span>
                <strong>{value.title}</strong>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section about-timeline">
        <div className="container about-timeline-grid">
          <div className="about-story-panel">
            <span className="eyebrow">Our Story</span>
            <h2 className="section-title">Designed for rooms that need clarity</h2>
            <p className="section-copy">
              Ration started with a simple goal: make elegant living spaces feel
              achievable without overwhelming the room. We build each concept
              from proportion, contrast, and comfort so that every choice has a
              reason to be there.
            </p>
          </div>

          <div className="about-timeline-list">
            {milestones.map((value, index) => (
              <article className="about-step-card" key={value.title}>
                <span className="info-index">0{index + 1}</span>
                <strong>{value.title}</strong>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default AboutPage
