import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { pushAnalyticsEvent } from '../lib/analytics'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/services', label: 'Services' },
  { to: '/product', label: 'Product' },
  { to: '/contact', label: 'Contact' },
]

const pageTitles = {
  '/': 'Ration | Home',
  '/about': 'Ration | About Us',
  '/services': 'Ration | Services',
  '/product': 'Ration | Product',
  '/contact': 'Ration | Contact',
}

function SiteLayout() {
  const location = useLocation()

  useEffect(() => {
    const title = pageTitles[location.pathname] || 'Ration'
    document.title = title

    pushAnalyticsEvent('page_view', {
      page_name: title,
      page_path: location.pathname,
    })
  }, [location.pathname])

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-utility">
          <div className="container utility-bar">
            <span className="utility-pill">Interior Direction 2026</span>
            <p className="utility-copy">
              Warm modern layouts for furniture, decor, and living spaces that
              feel bright without losing comfort.
            </p>
          </div>
        </div>

        <div className="container header-bar">
          <NavLink className="brand-mark" to="/">
            <span className="brand-icon" aria-hidden="true">
              *
            </span>
            <span className="brand-copy">
              <strong>Ration</strong>
              <span>Curated home living</span>
            </span>
          </NavLink>

          <nav className="header-nav" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link-active' : 'nav-link'
                }
                end={item.to === '/'}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <span className="language-chip">English</span>
            <NavLink className="outline-button" to="/contact">
              Register
            </NavLink>
          </div>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand-block">
            <p className="footer-kicker">Ration</p>
            <h2 className="footer-title">Modern rooms need a calmer rhythm.</h2>
            <p className="footer-copy">
              Elegant home decor collections designed for rooms that feel warm,
              calm, and current.
            </p>
          </div>

          <div className="footer-links">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  isActive ? 'footer-link footer-link-active' : 'footer-link'
                }
                end={item.to === '/'}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="footer-meta">
            <span>149K elegant living spaces</span>
            <span>21M decor ideas curated</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default SiteLayout
