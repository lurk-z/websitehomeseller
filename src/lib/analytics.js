export function pushAnalyticsEvent(eventName, payload = {}) {
  if (typeof window === 'undefined') {
    return
  }

  const event = {
    event: eventName,
    page_path: window.location.pathname,
    page_title: document.title,
    timestamp: new Date().toISOString(),
    ...payload,
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(event)

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload)
  }

  window.dispatchEvent(
    new CustomEvent('analytics:event', {
      detail: event,
    }),
  )
}
