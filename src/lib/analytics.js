function getTrackerCallbacks() {
  if (typeof window === 'undefined') {
    return []
  }

  const callbacks = new Map()
  const trackerSources = [window.websiteAnalytics, window.analytics, window.va]

  trackerSources.forEach((source) => {
    if (source && typeof source.track === 'function') {
      callbacks.set(source.track, source.track.bind(source))
    }
  })

  if (typeof window.track === 'function') {
    callbacks.set(window.track, window.track.bind(window))
  }

  return Array.from(callbacks.values())
}

export function pushAnalyticsEvent(eventName, payload = {}) {
  if (typeof window === 'undefined') {
    return
  }

  const trackingPayload = {
    event_name: eventName,
    page_path: window.location.pathname,
    page_title: document.title,
    timestamp: new Date().toISOString(),
    ...payload,
  }

  const event = {
    event: eventName,
    ...trackingPayload,
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(event)

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, trackingPayload)
  }

  getTrackerCallbacks().forEach((track) => {
    try {
      track(eventName, trackingPayload)
    } catch (error) {
      console.error('Analytics tracker callback failed.', error)
    }
  })

  window.dispatchEvent(
    new CustomEvent('analytics:event', {
      detail: event,
    }),
  )
}
