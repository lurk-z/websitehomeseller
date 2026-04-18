import { useEffect, useState } from 'react'
import { pushAnalyticsEvent } from '../lib/analytics'

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

const projectMemberships = [
  {
    id: 'sukhumvit-lounge-refresh',
    name: 'Sukhumvit Lounge Refresh',
    lead: 'Amina S.',
    status: 'Member review in progress',
    nextReview: 'April 22, 2026',
    summary:
      'Main lounge seating update with lighting coordination and final supplier approval.',
    members: [
      { name: 'Korn P.', role: 'Styling Lead' },
      { name: 'Mira L.', role: 'Procurement' },
      { name: 'Tarn N.', role: 'Visual QA' },
    ],
  },
  {
    id: 'riverside-show-unit',
    name: 'Riverside Show Unit',
    lead: 'Nicha T.',
    status: 'Selections locked',
    nextReview: 'April 25, 2026',
    summary:
      'Show unit staging, final decor pass, and handoff preparation for launch photography.',
    members: [
      { name: 'Beam C.', role: 'Furniture Coordination' },
      { name: 'Pim R.', role: 'Color Review' },
      { name: 'Lena V.', role: 'Staging Support' },
    ],
  },
  {
    id: 'nordic-family-suite',
    name: 'Nordic Family Suite',
    lead: 'Krit W.',
    status: 'Access list being updated',
    nextReview: 'April 28, 2026',
    summary:
      'Bedroom and shared lounge concept with updated membership access for sourcing and approvals.',
    members: [
      { name: 'Ploy J.', role: 'Layout Review' },
      { name: 'Mint A.', role: 'Textile Selection' },
      { name: 'Jo K.', role: 'Client Liaison' },
    ],
  },
]

function ServicesPage() {
  const [openProjectId, setOpenProjectId] = useState(null)

  useEffect(() => {
    pushAnalyticsEvent('team_workers_funnel_step', {
      section_id: 'team-workers',
      funnel_name: 'team_workers',
      funnel_step: 'list_view',
    })
  }, [])

  const handleProjectToggle = (project) => {
    setOpenProjectId((current) => {
      const nextProjectId = current === project.id ? null : project.id
      const panelState = nextProjectId === project.id ? 'open' : 'closed'
      const funnelStep = nextProjectId === project.id ? 'project_details_open' : 'project_details_close'

      pushAnalyticsEvent('project_member_panel_toggle', {
        section_id: 'team-workers',
        project_id: project.id,
        project_name: project.name,
        panel_state: panelState,
        funnel_name: 'team_workers',
        funnel_step: funnelStep,
      })

      pushAnalyticsEvent('team_workers_funnel_step', {
        section_id: 'team-workers',
        project_id: project.id,
        project_name: project.name,
        funnel_name: 'team_workers',
        funnel_step: funnelStep,
      })

      return nextProjectId
    })
  }

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

      <section
        className="page-section services-project-members team-workers-section"
        data-funnel="team_workers"
        data-funnel-step="list_view"
        id="team-workers"
      >
        <div className="container services-project-members-grid">
          <div className="services-project-members-intro">
            <span className="eyebrow">Project Members</span>
            <h2 className="section-title">Show only the project name until it is opened</h2>
            <p className="section-copy">
              Each row stays minimal by default. Click a project name to reveal
              the member list, lead, review date, and the current working note.
            </p>
          </div>

          <div className="project-member-list" role="list">
            {projectMemberships.map((project) => {
              const isOpen = openProjectId === project.id

              return (
                <article
                  className={isOpen ? 'project-member-item project-member-item-open' : 'project-member-item'}
                  key={project.id}
                  role="listitem"
                >
                  <button
                    aria-controls={`project-members-${project.id}`}
                    aria-expanded={isOpen}
                    className="project-member-trigger"
                    data-funnel="team_workers"
                    data-funnel-step={isOpen ? 'project_details_close' : 'project_details_open'}
                    data-project-id={project.id}
                    onClick={() => handleProjectToggle(project)}
                    type="button"
                  >
                    <span className="project-member-title">{project.name}</span>
                    <span className={isOpen ? 'project-member-toggle project-member-toggle-open' : 'project-member-toggle'}>
                      <span></span>
                      <span></span>
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="project-member-panel" id={`project-members-${project.id}`}>
                      <div className="project-member-meta-grid">
                        <div className="project-member-meta-item">
                          <span>Project Lead</span>
                          <strong>{project.lead}</strong>
                        </div>
                        <div className="project-member-meta-item">
                          <span>Status</span>
                          <strong>{project.status}</strong>
                        </div>
                        <div className="project-member-meta-item">
                          <span>Next Review</span>
                          <strong>{project.nextReview}</strong>
                        </div>
                      </div>

                      <p className="project-member-summary">{project.summary}</p>

                      <div className="project-member-people-grid">
                        {project.members.map((member) => (
                          <div className="project-member-person" key={`${project.id}-${member.name}`}>
                            <strong>{member.name}</strong>
                            <span>{member.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
              )
            })}
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
