import { useState, useEffect } from 'react'
import LiveTicker from './LiveTicker'
import { getMyProfile, getToken } from './api'

export default function AppLayout({ activePage, children, theme, setTheme }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (!getToken()) return
    getMyProfile()
      .then((me) => setIsAdmin(!!me.is_admin))
      .catch(() => setIsAdmin(false))
  }, [])

  // Track screen size to swap between desktop nav and hamburger
  useEffect(() => {
    function checkSize() {
      setIsMobile(window.innerWidth < 900)
    }
    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  // Close the mobile menu if the screen grows
  useEffect(() => {
    if (!isMobile) setMenuOpen(false)
  }, [isMobile])

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
      {/* TOP NAVIGATION */}
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
          style={{
            width: '100%',
            padding: isMobile ? '10px 16px' : '8px 48px',
            gap: isMobile ? '12px' : '24px',
          }}
        >
          {/* Logo + Brand */}
          <a href="/dashboard" className="flex items-center gap-3 flex-shrink-0">
            <img
              src="/logo-mark.png"
              alt="MAKATRON TRADING"
              style={{
                height: isMobile ? '38px' : '52px',
                width: 'auto',
                borderRadius: '12px',
              }}
            />
            <span
              className="font-bold hidden md:inline"
              style={{
                fontSize: isMobile ? '14px' : '18px',
                letterSpacing: '0.16em',
                color: 'var(--mk-text-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              MAKATRON <span style={{ color: 'var(--mk-accent)' }}>TRADING</span>
            </span>
          </a>

          {/* Desktop nav (hidden on mobile) */}
          {!isMobile && (
            <nav
              className="flex items-center"
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
          )}

          {/* Right side — theme toggle + logout (desktop) OR theme toggle + hamburger (mobile) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                width: isMobile ? '38px' : '40px',
                height: isMobile ? '38px' : '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--mk-bg-secondary)',
                border: '1px solid var(--mk-border)',
                color: 'var(--mk-text-primary)',
                fontSize: isMobile ? '16px' : '18px',
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

            {!isMobile && (
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
            )}

            {isMobile && (
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--mk-bg-secondary)',
                  border: '1px solid var(--mk-border)',
                  color: 'var(--mk-text-primary)',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {menuOpen ? '✕' : '☰'}
              </button>
            )}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isMobile && menuOpen && (
          <div
            style={{
              borderTop: '1px solid var(--mk-border)',
              backgroundColor: 'var(--mk-bg-secondary)',
              padding: '10px 16px 14px 16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {navItems.map((item) => {
                const isActive = activePage === item.name
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      color: isActive ? '#000' : 'var(--mk-text-primary)',
                      backgroundColor: isActive ? 'var(--mk-accent)' : 'var(--mk-bg-tertiary)',
                      border: '1px solid var(--mk-border)',
                      borderRadius: '10px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {item.name}
                  </a>
                )
              })}
              <button
                onClick={handleLogout}
                style={{
                  marginTop: '4px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  color: 'var(--mk-danger)',
                  backgroundColor: 'var(--mk-bg-tertiary)',
                  border: '1px solid var(--mk-border)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN */}
      <main
        className="flex-1"
        style={{
          width: '100%',
          maxWidth: isWidePage ? '100%' : (isMobile ? '100%' : '1440px'),
          margin: '0 auto',
          padding: isMobile
            ? '16px'
            : (isWidePage ? '16px 24px 24px' : '32px 48px 48px'),
        }}
      >
        {children}
      </main>

      <LiveTicker />
    </div>
  )
}