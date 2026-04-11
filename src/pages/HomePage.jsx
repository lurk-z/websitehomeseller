import { Link } from 'react-router-dom'

const features = [
  'Well Organized room plans',
  'Clean and modern collections',
  'Easy to customize layouts',
  'Free font based presentation',
]

const stats = [
  { value: '149K', label: 'Elegant Living' },
  { value: '21M', label: 'Decor for Modern Homes' },
]

const notes = [
  'Premium home decor online',
  'Elevate your home aesthetic',
  'Collections for adaptable living',
]

function HomePage() {
  return (
    <>
      <section className="page-section hero-section home-stage">
        <div className="container home-stage-grid">
          <aside className="home-feature-panel">
            <span className="eyebrow">Website Template</span>
            <ul className="home-feature-list">
              {features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <p className="home-panel-copy">
              Styled for elegant interiors, warm product stories, and modern
              furniture collections.
            </p>
          </aside>

          <div className="home-copy-column">
            <p className="home-overline">
              Embrace the art of elegant living with a curated collection of
              furniture, decor, and room accents.
            </p>
            <h1 className="home-title">
              <span className="accent-text">Furnis</span> Accessories
              <br />
              for a <em>Trendy</em> <span className="accent-text">Home</span>
            </h1>
            <p className="home-description">
              Build a living space with warm tones, clean silhouettes, and
              handcrafted details that feel refined from the first glance to the
              final arrangement.
            </p>

            <div className="button-row">
              <Link className="primary-button" to="/product">
                Start Your Trial
              </Link>
              <Link className="secondary-link" to="/services">
                View Collection
              </Link>
            </div>

            <div className="home-note-list">
              {notes.map((note) => (
                <span className="home-note-chip" key={note}>
                  {note}
                </span>
              ))}
            </div>
          </div>

          <div className="home-visual-column">
            <div className="home-main-image">
              <img
                src="/images/hero-sofa.jpg"
                alt="Modern living room with a yellow sofa"
              />
            </div>

            <article className="home-overlay-card">
              <img
                src="/images/lounge-room.jpg"
                alt="Living room arrangement with soft seating"
              />
              <div>
                <strong>Premium Home Decor</strong>
                <span>
                  Discover an exclusive collection of home decor items for
                  elegant living.
                </span>
              </div>
            </article>

            <div className="home-stat-rail">
              {stats.map((stat) => (
                <div className="home-stat-box" key={stat.value}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section home-ribbon">
        <div className="container home-ribbon-grid">
          <div className="home-ribbon-intro">
            <span className="eyebrow">Exclusive Style</span>
            <h2 className="section-title">
              Modern homes with a brighter editorial balance
            </h2>
          </div>
          <p className="section-copy">
            A flexible direction built from sculptural seating, soft lighting,
            and focal colors that give the room a clear center of gravity.
          </p>
        </div>
      </section>

      <section className="page-section home-editorial">
        <div className="container home-editorial-grid">
          <article className="home-editorial-feature">
            <img
              src="/images/editorial-living.jpg"
              alt="Curated living room with layered decor"
            />
            <div className="editorial-copy">
              <span className="eyebrow">Editorial Pick</span>
              <strong>Modern Homes Elegant Touch</strong>
              <p>
                Use bold seating as the anchor, then pull the rest of the room
                toward softer tones and lighter accessories.
              </p>
            </div>
          </article>

          <div className="home-editorial-stack">
            <article className="home-mini-article">
              <img
                src="/images/armchair.jpg"
                alt="Yellow accent chair in a modern room"
              />
              <div className="editorial-copy">
                <strong>Handpicked Decor</strong>
                <p>Accent seating for corners, lounges, and refined social rooms.</p>
              </div>
            </article>

            <article className="home-text-board">
              <span className="eyebrow">What This Theme Does</span>
              <ul className="home-board-list">
                <li>Creates a warm visual anchor without making the room heavy</li>
                <li>Balances statement furniture with quieter supporting pieces</li>
                <li>Keeps modern styling comfortable and easy to personalize</li>
              </ul>
            </article>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
