export default function PublicNav({ theme, setTheme }) {
  function toggleTheme() {
    if (setTheme) {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }

  return (
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
        style={{ maxWidth: '1440px', padding: '12px 48px', gap: '24px' }}
      >
        <a href="/" className="flex items-center gap-5 flex-shrink-0">
          <img
            src="/logo-mark.png"
            alt="MAKATRON TRADING"
            style={{ height: '65px', width: 'auto', borderRadius: '14px' }}
          />
          <span
            className="font-bold hidden lg:inline"
            style={{
              fontSize: '23px',
              letterSpacing: '0.16em',
              color: 'var(--mk-text-primary)',
              whiteSpace: 'nowrap',
            }}
          >
            MAKATRON <span style={{ color: 'var(--mk-accent)' }}>TRADING</span>
          </span>
        </a>

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

          <a
            href="/login"
            className="mk-btn-secondary"
            style={{
              width: 'auto',
              padding: '11px 24px',
              fontSize: '16px',
              letterSpacing: '0.02em',
            }}
          >
            Sign In
          </a>
          <a
            href="/register"
            className="mk-btn-primary"
            style={{
              width: 'auto',
              padding: '11px 24px',
              fontSize: '16px',
              letterSpacing: '0.02em',
            }}
          >
            Open Account
          </a>
        </div>
      </div>
    </header>
  )
}