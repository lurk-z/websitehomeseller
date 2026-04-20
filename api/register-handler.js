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

export function buildRegisterResponse({ method, body }) {
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
    fullName: clean(normalizedBody.fullName),
    email: clean(normalizedBody.email).toLowerCase(),
    password: typeof normalizedBody.password === 'string' ? normalizedBody.password : '',
    source: clean(normalizedBody.source) || 'website-register-form',
  }

  const fieldErrors = {}

  if (!submission.fullName) {
    fieldErrors.fullName = 'Please enter your full name.'
  }

  if (!submission.email) {
    fieldErrors.email = 'Please enter your email.'
  } else if (!EMAIL_REGEX.test(submission.email)) {
    fieldErrors.email = 'Please enter a valid email address.'
  }

  if (!submission.password) {
    fieldErrors.password = 'Please enter your password.'
  } else if (submission.password.length < 8) {
    fieldErrors.password = 'Please use at least 8 characters.'
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

  const submissionId = `reg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

  return {
    headers,
    status: 200,
    body: {
      ok: true,
      message: 'Your account request was submitted successfully.',
      submissionId,
    },
    logEntry: {
      type: 'register_submission',
      submissionId,
      receivedAt: new Date().toISOString(),
      fullName: submission.fullName,
      email: submission.email,
      passwordLength: submission.password.length,
      source: submission.source,
    },
  }
}
