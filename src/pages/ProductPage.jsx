const categories = [
  { title: 'Sofas & Lounge Seating', meta: '28 curated pieces' },
  { title: 'Accent Chairs', meta: '16 sculptural forms' },
  { title: 'Lighting Objects', meta: '11 warm modern accents' },
  { title: 'Decor Collections', meta: '34 room-ready sets' },
]

const filters = [
  'Living Room',
  'Accent Seating',
  'Lighting',
  'Textiles',
  'Decor Sets',
]

function ProductPage() {
  return (
    <>
      <section className="page-section product-stage">
        <div className="container product-stage-grid">
          <aside className="product-filter-panel">
            <span className="eyebrow">Product</span>
            <h1 className="page-title">
              Collections arranged by mood and furniture role
            </h1>
            <p className="page-description">
              Browse product directions that pair modern silhouettes with warm,
              comfortable finishes and a cleaner room hierarchy.
            </p>

            <div className="product-filter-list">
              {filters.map((filter) => (
                <span className="product-filter-chip" key={filter}>
                  {filter}
                </span>
              ))}
            </div>
          </aside>

          <article className="product-feature-card">
            <div className="product-feature-copy">
              <span className="eyebrow">Featured Collection</span>
              <strong>Sunny accents for softer interiors</strong>
              <p>
                This month focuses on warm upholstery, pale wood, and compact
                lighting details that keep the room bright without feeling sharp.
              </p>
              <div className="button-row">
                <a className="primary-button" href="#catalog">
                  Open Catalog
                </a>
                <a className="secondary-link" href="#seasonal">
                  Seasonal Edit
                </a>
              </div>
            </div>

            <img
              src="/images/product-gallery.jpg"
              alt="Modern product gallery living room scene"
            />
          </article>
        </div>
      </section>

      <section className="page-section product-mosaic" id="seasonal">
        <div className="container product-mosaic-grid">
          <article className="product-image-card product-image-card-large">
            <img
              src="/images/orange-accent-room.jpg"
              alt="Orange accent chair and warm decor composition"
            />
            <div className="product-image-copy">
              <strong>Accent-led rooms</strong>
              <p>Let one expressive piece set the rhythm for the entire space.</p>
            </div>
          </article>

          <article className="product-note-panel">
            <span className="eyebrow">Collection Notes</span>
            <h2 className="section-title">Build around one strong visual anchor</h2>
            <p className="section-copy">
              Start with a confident seat, a low-contrast backdrop, and a small
              group of objects that repeat the same warmth without crowding it.
            </p>
          </article>

          <article className="product-image-card">
            <img
              src="/images/white-sofa-room.jpg"
              alt="White sofa room with calm modern styling"
            />
            <div className="product-image-copy">
              <strong>Quiet supporting pieces</strong>
              <p>Use softer tones to hold the room together after the hero item.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="page-section product-catalog" id="catalog">
        <div className="container">
          <div className="section-heading-block compact-heading">
            <span className="eyebrow">Catalog</span>
            <h2 className="section-title">Browse by category</h2>
          </div>

          <div className="product-catalog-grid">
            {categories.map((category) => (
              <article className="catalog-card" key={category.title}>
                <span className="catalog-badge">Collection</span>
                <strong>{category.title}</strong>
                <p>{category.meta}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default ProductPage
