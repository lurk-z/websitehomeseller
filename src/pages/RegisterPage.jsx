import { useEffect, useMemo, useState } from 'react'
import { pushAnalyticsEvent } from '../lib/analytics'

const benefits = [
  'Use a real email for submission tracking and analytics QA',
  'Create a password you can reveal briefly with the eye control',
  'Keep the account setup flow realistic for funnel measurement',
]

const notes = [
  'Preview account setup',
  'Analytics-ready form events',
  'Warm modern theme retained',
]

const initialForm = {
  fullName: '',
  email: '',
  password: '',
}

function PasswordToggleIcon({ visible }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 12C4.4 7.8 7.7 5.7 12 5.7C16.3 5.7 19.6 7.8 22 12C19.6 16.2 16.3 18.3 12 18.3C7.7 18.3 4.4 16.2 2 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      {visible ? null : (
        <path
          d="M4 4L20 20"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      )}
    </svg>
  )
}

function RegisterPage() {
  const [formData, setFormData] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [hasStarted, setHasStarted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitState, setSubmitState] = useState({
    status: 'idle',
    message: '',
    submissionId: '',
  })

  useEffect(() => {
    pushAnalyticsEvent('form_view', {
      form_id: 'register-form',
      form_name: 'Register Form',
    })
  }, [])

  const isFormComplete = useMemo(() => {
    return formData.fullName && formData.email && formData.password
  }, [formData])

  const validateForm = () => {
    const errors = {}

    if (!formData.fullName.trim()) {
      errors.fullName = 'Please enter your full name.'
    }

    if (!formData.email.trim()) {
      errors.email = 'Please enter your email.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.'
    }

    if (!formData.password) {
      errors.password = 'Please enter your password.'
    } else if (formData.password.length < 8) {
      errors.password = 'Please use at least 8 characters.'
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
      form_id: 'register-form',
      form_name: 'Register Form',
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
        form_id: 'register-form',
        form_name: 'Register Form',
        error_fields: Object.keys(errors),
      })

      return
    }

    setIsSubmitting(true)
    setSubmitState({ status: 'idle', message: '', submissionId: '' })

    pushAnalyticsEvent('form_submit', {
      form_id: 'register-form',
      form_name: 'Register Form',
      is_form_complete: isFormComplete,
    })

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'website-register-form',
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        const apiErrors = data.fieldErrors || {}
        setFieldErrors((current) => ({
          ...current,
          ...apiErrors,
        }))

        const errorMessage = data.message || 'Registration failed.'
        setSubmitState({
          status: 'error',
          message: errorMessage,
          submissionId: data.submissionId || '',
        })

        pushAnalyticsEvent('form_submit_error', {
          form_id: 'register-form',
          form_name: 'Register Form',
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
      setShowPassword(false)

      pushAnalyticsEvent('form_submit_success', {
        form_id: 'register-form',
        form_name: 'Register Form',
        submission_id: data.submissionId,
      })
    } catch (error) {
      const errorMessage = 'Network error. Please try again.'
      setSubmitState({
        status: 'error',
        message: errorMessage,
        submissionId: '',
      })

      pushAnalyticsEvent('form_submit_error', {
        form_id: 'register-form',
        form_name: 'Register Form',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        error_type: 'network_error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-section register-stage">
      <div className="container register-stage-grid">
        <div className="register-copy-panel">
          <span className="eyebrow">Register</span>
          <h1 className="page-title">Create a preview account for room collections</h1>
          <p className="page-description">
            Set up a realistic account flow for web analytics testing without
            breaking the warm editorial theme of the site.
          </p>

          <div className="register-note-stack">
            {notes.map((note) => (
              <span className="register-note-chip" key={note}>
                {note}
              </span>
            ))}
          </div>

          <div className="register-check-list">
            {benefits.map((benefit, index) => (
              <article className="register-check-item" key={benefit}>
                <span className="register-check-icon">0{index + 1}</span>
                <p>{benefit}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="register-visual-panel">
          <div className="register-image-band">
            <img
              src="/images/about-seating.jpg"
              alt="Warm lounge seating with soft daylight"
            />
          </div>

          <form
            className="register-form-card"
            data-form-name="Register Form"
            id="register-form"
            name="register-form"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="form-card-heading">
              <span className="eyebrow">Account Access</span>
              <strong>Set up your login details</strong>
              <p className="form-card-caption">
                The password field now includes a right-aligned eye button so it
                can be revealed or hidden in place.
              </p>
            </div>

            <label>
              <span>Full Name</span>
              <input
                aria-invalid={Boolean(fieldErrors.fullName)}
                autoComplete="name"
                name="fullName"
                onChange={handleChange}
                onFocus={handleFocus}
                placeholder="Your full name"
                type="text"
                value={formData.fullName}
              />
              {fieldErrors.fullName ? (
                <small className="contact-field-error">{fieldErrors.fullName}</small>
              ) : null}
            </label>

            <label>
              <span>Email</span>
              <input
                aria-invalid={Boolean(fieldErrors.email)}
                autoComplete="email"
                name="email"
                onChange={handleChange}
                onFocus={handleFocus}
                placeholder="name@email.com"
                type="email"
                value={formData.email}
              />
              {fieldErrors.email ? (
                <small className="contact-field-error">{fieldErrors.email}</small>
              ) : null}
            </label>

            <label>
              <span>Password</span>
              <div className="password-input-shell">
                <input
                  aria-invalid={Boolean(fieldErrors.password)}
                  autoComplete="new-password"
                  name="password"
                  onChange={handleChange}
                  onFocus={handleFocus}
                  placeholder="Create a password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                />
                <button
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  <PasswordToggleIcon visible={showPassword} />
                </button>
              </div>
              {fieldErrors.password ? (
                <small className="contact-field-error">{fieldErrors.password}</small>
              ) : null}
            </label>

            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>

            <div className="register-submit-status" aria-live="polite">
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
  )
}

export default RegisterPage
