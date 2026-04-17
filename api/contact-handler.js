const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeBody(body) {
  if (!body) {
    return {}
  }

  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }

  return body
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function buildContactResponse({ method, body }) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  }

  if (method !== 'POST') {
    return {
      headers: {
        ...headers,
        Allow: 'POST',
      },
      status: 405,
      body: {
        ok: false,
        message: 'Method not allowed.',
      },
    }
  }

  const normalizedBody = normalizeBody(body)
  const submission = {
    name: clean(normalizedBody.name),
    email: clean(normalizedBody.email).toLowerCase(),
    projectType: clean(normalizedBody.projectType),
    message: clean(normalizedBody.message),
    source: clean(normalizedBody.source) || 'website-contact-form',
  }

  const fieldErrors = {}

  if (!submission.name) {
    fieldErrors.name = 'Please enter your name.'
  }

  if (!submission.email) {
    fieldErrors.email = 'Please enter your email.'
  } else if (!EMAIL_REGEX.test(submission.email)) {
    fieldErrors.email = 'Please enter a valid email address.'
  }

  if (!submission.projectType) {
    fieldErrors.projectType = 'Please enter the project type.'
  }

  if (!submission.message) {
    fieldErrors.message = 'Please enter your message.'
  } else if (submission.message.length < 20) {
    fieldErrors.message = 'Please provide at least 20 characters.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      headers,
      status: 400,
      body: {
        ok: false,
        message: 'Please fix the highlighted fields before submitting.',
        fieldErrors,
      },
    }
  }

  const submissionId = `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

  return {
    headers,
    status: 200,
    body: {
      ok: true,
      message: 'Thanks. Your inquiry was submitted successfully.',
      submissionId,
    },
    logEntry: {
      type: 'contact_submission',
      submissionId,
      receivedAt: new Date().toISOString(),
      ...submission,
    },
  }
}
