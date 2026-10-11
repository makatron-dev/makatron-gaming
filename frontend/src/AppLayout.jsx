import { useState, useEffect } from 'react'
import LiveTicker from './LiveTicker'
import { getMyProfile, getToken } from './api'

export default function AppLayout({ activePage, children, theme, setTheme }) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!getToken()) return
    getMyProfile()
      .then((me) => setIsAdmin(!!me.is_admin))
      .catch(() => setIsAdmin(false))
  }, [])

  function handleLogout() {
    localStorage.removeItem('mk_token')
    window.location.href = '/login'
  }

  function toggleTheme() {
    if (setTheme) {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Wallet', path: '/wallet' },
    { name: 'Trade', path: '/trade' },
    { name: 'Contest', path: '/contest' },
  ]

  if (isAdmin) {
    navItems.push({ name: 'Admin', path: '/admin' })
  }

  const isWidePage = activePage === 'Trade'

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: '100vh', backgroundColor: 'var(--mk-bg-primary)' }}
    >
      <header
        className="w-full flex-shrink-0 sticky top-0 z-50"
        style={{
          borderBottom: '1px solid var(--mk-border)',
          backgroundColor: 'var(--mk-bg-primary)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{ maxWidth: '1440px', padding: '8px 48px', gap: '24px' }}
        >
          <a href="/dashboard" className="flex items-center gap-4 flex-shrink-0">
            <img
              src="/logo-mark.png"
              alt="MAKATRON TRADING"
              style={{ height: '52px', width: 'auto', borderRadius: '12px' }}
            />
            <span
              className="font-bold hidden lg:inline"
              style={{
                fontSize: '18px',
                letterSpacing: '0.16em',
                color: 'var(--mk-text-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              MAKATRON <span style={{ color: 'var(--mk-accent)' }}>TRADING</span>
            </span>
          </a>

          <nav
            className="hidden md:flex items-center"
            style={{
              padding: '4px',
              backgroundColor: 'var(--mk-bg-secondary)',
              border: '1px solid var(--mk-border)',
              borderRadius: '12px',
              gap: '2px',
            }}
          >
            {navItems.map((item) => {
              const isActive = activePage === item.name
              return (
                <a
                  key={item.path}
                  href={item.path}
                  style={{
                    padding: '9px 20px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    color: isActive ? '#000' : 'var(--mk-text-secondary)',
                    backgroundColor: isActive ? 'var(--mk-accent)' : 'transparent',
                    borderRadius: '8px',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </a>
              )
            })}
          </nav>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--mk-bg-secondary)',
                border: '1px solid var(--mk-border)',
                color: 'var(--mk-text-primary)',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--mk-border-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--mk-border)')}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
              onClick={handleLogout}
              className="mk-btn-secondary"
              style={{
                width: 'auto',
                padding: '9px 20px',
                fontSize: '13px',
                letterSpacing: '0.02em',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main
        className="flex-1"
        style={{
          maxWidth: isWidePage ? '100%' : '1440px',
          width: '100%',
          margin: '0 auto',
          padding: isWidePage ? '16px 24px 24px' : '32px 48px 48px',
        }}
      >
        {children}
      </main>

      <LiveTicker />
    </div>
  )
}