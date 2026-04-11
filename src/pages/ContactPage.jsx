const contactItems = [
  { label: 'Email', value: 'hello@ration-home.com' },
  { label: 'Phone', value: '+66 2 123 4567' },
  { label: 'Studio', value: 'Bangkok Interior District' },
]

const notes = [
  'Response within 1 business day',
  'Room styling and product sourcing',
  'Available for residential concepts',
]

function ContactPage() {
  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <>
      <section className="page-section contact-stage">
        <div className="container contact-stage-grid">
          <div className="contact-copy-panel">
            <span className="eyebrow">Contact</span>
            <h1 className="page-title">Start a conversation about your next space</h1>
            <p className="page-description">
              Get in touch for collection questions, room direction, or a
              tailored interior concept. We keep the process direct and
              practical from the first message onward.
            </p>

            <div className="contact-direct-list">
              {contactItems.map((item) => (
                <div className="contact-direct-item" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="contact-note-stack">
              {notes.map((note) => (
                <span className="contact-note-chip" key={note}>
                  {note}
                </span>
              ))}
            </div>
          </div>

          <div className="contact-visual-panel">
            <div className="contact-image-card">
              <img
                src="/images/contact-lounge.jpg"
                alt="Soft lounge seating in a welcoming interior"
              />
            </div>

            <form className="contact-form-card" onSubmit={handleSubmit}>
              <label>
                <span>Name</span>
                <input placeholder="Your name" type="text" />
              </label>
              <label>
                <span>Email</span>
                <input placeholder="name@email.com" type="email" />
              </label>
              <label>
                <span>Project Type</span>
                <input
                  placeholder="Living room, styling, sourcing"
                  type="text"
                />
              </label>
              <label>
                <span>Message</span>
                <textarea
                  placeholder="Tell us about the room and what you need."
                  rows="5"
                ></textarea>
              </label>
              <button className="primary-button" type="submit">
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="page-section contact-followup">
        <div className="container contact-followup-grid">
          <article className="contact-followup-card">
            <span className="eyebrow">Studio Rhythm</span>
            <strong>Consultation, layout review, and sourcing direction</strong>
            <p>
              Share the room, the function you need, and the mood you want. We
              will shape the rest from there.
            </p>
          </article>

          <article className="contact-followup-card">
            <span className="eyebrow">Availability</span>
            <strong>Residential interiors and decor-led refreshes</strong>
            <p>
              Best suited for living spaces, lounge areas, and modern rooms that
              need a clearer visual center.
            </p>
          </article>
        </div>
      </section>
    </>
  )
}

export default ContactPage
