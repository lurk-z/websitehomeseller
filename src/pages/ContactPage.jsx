import { useEffect, useMemo, useState } from 'react'
import { pushAnalyticsEvent } from '../lib/analytics'

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

const initialForm = {
  name: '',
  email: '',
  projectType: '',
  message: '',
}

function ContactPage() {
  const [formData, setFormData] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [hasStarted, setHasStarted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState({
    status: 'idle',
    message: '',
    submissionId: '',
  })

  useEffect(() => {
    pushAnalyticsEvent('form_view', {
      form_id: 'contact-form',
      form_name: 'Contact Form',
    })
  }, [])

  const isFormComplete = useMemo(() => {
    return formData.name && formData.email && formData.projectType && formData.message
  }, [formData])

  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Please enter your name.'
    }

    if (!formData.email.trim()) {
      errors.email = 'Please enter your email.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.'
    }

    if (!formData.projectType.trim()) {
      errors.projectType = 'Please enter the project type.'
    }

    if (!formData.message.trim()) {
      errors.message = 'Please enter your message.'
    } else if (formData.message.trim().length < 20) {
      errors.message = 'Please provide a bit more detail for testing analytics.'
    }

    return errors
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    setFieldErrors((current) => ({
      ...current,
      [name]: '',
    }))
  }

  const handleFocus = () => {
    if (hasStarted) {
      return
    }

    setHasStarted(true)
    pushAnalyticsEvent('form_start', {
      form_id: 'contact-form',
      form_name: 'Contact Form',
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const errors = validateForm()
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      setSubmitState({
        status: 'error',
        message: 'Please fix the highlighted fields before submitting.',
        submissionId: '',
      })

      pushAnalyticsEvent('form_submit_error', {
        form_id: 'contact-form',
        form_name: 'Contact Form',
        error_fields: Object.keys(errors),
      })

      return
    }

    setIsSubmitting(true)
    setSubmitState({ status: 'idle', message: '', submissionId: '' })

    pushAnalyticsEvent('form_submit', {
      form_id: 'contact-form',
      form_name: 'Contact Form',
      project_type: formData.projectType,
      is_form_complete: isFormComplete,
    })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'website-contact-form',
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        const apiErrors = data.fieldErrors || {}
        setFieldErrors((current) => ({
          ...current,
          ...apiErrors,
        }))

        const errorMessage = data.message || 'Submission failed.'
        setSubmitState({
          status: 'error',
          message: errorMessage,
          submissionId: data.submissionId || '',
        })

        pushAnalyticsEvent('form_submit_error', {
          form_id: 'contact-form',
          form_name: 'Contact Form',
          error_message: errorMessage,
          error_fields: Object.keys(apiErrors),
        })

        return
      }

      setSubmitState({
        status: 'success',
        message: data.message,
        submissionId: data.submissionId,
      })
      setFormData(initialForm)
      setFieldErrors({})
      setHasStarted(false)

      pushAnalyticsEvent('form_submit_success', {
        form_id: 'contact-form',
        form_name: 'Contact Form',
        submission_id: data.submissionId,
        project_type: formData.projectType,
      })
    } catch (error) {
      const errorMessage = 'Network error. Please try again.'
      setSubmitState({
        status: 'error',
        message: errorMessage,
        submissionId: '',
      })

      pushAnalyticsEvent('form_submit_error', {
        form_id: 'contact-form',
        form_name: 'Contact Form',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        error_type: 'network_error',
      })
    } finally {
      setIsSubmitting(false)
    }
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

            <form className="contact-form-card" id="contact-form" name="contact-form" data-form-name="Contact Form" noValidate onSubmit={handleSubmit}>
              <label>
                <span>Name</span>
                <input
                  aria-invalid={Boolean(fieldErrors.name)}
                  name="name"
                  onChange={handleChange}
                  onFocus={handleFocus}
                  placeholder="Your name"
                  type="text"
                  value={formData.name}
                />
                {fieldErrors.name ? <small className="contact-field-error">{fieldErrors.name}</small> : null}
              </label>
              <label>
                <span>Email</span>
                <input
                  aria-invalid={Boolean(fieldErrors.email)}
                  name="email"
                  onChange={handleChange}
                  onFocus={handleFocus}
                  placeholder="name@email.com"
                  type="email"
                  value={formData.email}
                />
                {fieldErrors.email ? <small className="contact-field-error">{fieldErrors.email}</small> : null}
              </label>
              <label>
                <span>Project Type</span>
                <input
                  aria-invalid={Boolean(fieldErrors.projectType)}
                  name="projectType"
                  onChange={handleChange}
                  onFocus={handleFocus}
                  placeholder="Living room, styling, sourcing"
                  type="text"
                  value={formData.projectType}
                />
                {fieldErrors.projectType ? <small className="contact-field-error">{fieldErrors.projectType}</small> : null}
              </label>
              <label>
                <span>Message</span>
                <textarea
                  aria-invalid={Boolean(fieldErrors.message)}
                  name="message"
                  onChange={handleChange}
                  onFocus={handleFocus}
                  placeholder="Tell us about the room and what you need."
                  rows="5"
                  value={formData.message}
                ></textarea>
                {fieldErrors.message ? <small className="contact-field-error">{fieldErrors.message}</small> : null}
              </label>
              <button className="primary-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Sending...' : 'Send Inquiry'}
              </button>
              <div className="contact-submit-status" aria-live="polite">
                {submitState.message ? (
                  <p
                    className={
                      submitState.status === 'success'
                        ? 'contact-feedback contact-feedback-success'
                        : 'contact-feedback contact-feedback-error'
                    }
                  >
                    {submitState.message}
                    {submitState.submissionId ? ` Submission ID: ${submitState.submissionId}` : ''}
                  </p>
                ) : null}
              </div>
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


