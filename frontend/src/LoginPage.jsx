import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from './api'
import SocialButtons from './SocialButtons'
import LiveTicker from './LiveTicker'

// ============================================
// MAIN COMPONENT
// ============================================
export default function LoginPage({ theme, setTheme }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div
      className="flex flex-col"
      style={{
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--mk-bg-primary)',
      }}
    >
      {loading && <div className="mk-progress-bar" />}

      {/* TOP NAVIGATION */}
      <header
        className="w-full flex-shrink-0"
        style={{ borderBottom: '1px solid var(--mk-border)' }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{ maxWidth: '1440px', padding: '10px 48px' }}
        >
          <div className="flex items-center gap-4">
            <img
              src="/logo.jpeg"
              alt="MAKATRON TRADING"
              style={{ height: '56px', width: 'auto', borderRadius: '10px' }}
            />
            <span
              className="font-bold"
              style={{
                fontSize: '16px',
                letterSpacing: '0.14em',
                color: 'var(--mk-text-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              MAKATRON <span style={{ color: 'var(--mk-accent)' }}>TRADING</span>
            </span>
          </div>

          <div className="flex items-center gap-10">
            <nav
              className="hidden md:flex items-center gap-9"
              style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.02em' }}
            >
              <a href="/markets" style={{ color: 'var(--mk-text-secondary)' }}>Markets</a>
              <a href="/pricing" style={{ color: 'var(--mk-text-secondary)' }}>Fees</a>
              <a href="/about" style={{ color: 'var(--mk-text-secondary)' }}>About</a>
              <a href="/support" style={{ color: 'var(--mk-text-secondary)' }}>Support</a>
            </nav>
            <a
              href="/register"
              className="mk-btn-primary"
              style={{ width: 'auto', padding: '9px 20px', fontSize: '13px', letterSpacing: '0.02em' }}
            >
              Open Account
            </a>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="flex-1 flex" style={{ overflow: 'hidden' }}>
        {/* LEFT — SCROLLABLE MARKETING */}
        <div
          className="hidden lg:block relative"
          style={{
            width: '55%',
            borderRight: '1px solid var(--mk-border)',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              left: '-10%',
              width: '70%',
              height: '60%',
              background: 'radial-gradient(circle, rgba(240,185,11,0.18) 0%, transparent 65%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <div
            className="relative z-10"
            style={{
              padding: '56px 80px 96px 80px',
              maxWidth: '720px',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <img
              src="/logo.jpeg"
              alt="MAKATRON TRADING"
              style={{
                height: '88px',
                width: 'auto',
                borderRadius: '16px',
                marginBottom: '36px',
                filter: 'drop-shadow(0 12px 40px rgba(240,185,11,0.18))',
              }}
            />

            <h1
              style={{
                fontSize: '45px',
                lineHeight: 1.08,
                fontWeight: 700,
                letterSpacing: '-0.035em',
                color: 'var(--mk-text-primary)',
              }}
            >
              Where capital
              <br />
              meets{' '}
              <span className="mk-gradient-text">conviction</span>.
            </h1>

            <p
              style={{
                marginTop: '22px',
                fontSize: '16px',
                lineHeight: 1.65,
                letterSpacing: '-0.005em',
                color: 'var(--mk-text-secondary)',
                maxWidth: '560px',
              }}
            >
              Institutional execution, retail accessibility. Deep liquidity across
              digital assets — settled in seconds, secured around the clock.
            </p>

            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
              <a
                href="/register"
                className="mk-btn-primary"
                style={{ width: 'auto', padding: '13px 26px', fontSize: '14.5px' }}
              >
                Open Account
              </a>
              <a
                href="/markets"
                className="mk-btn-secondary"
                style={{ width: 'auto', padding: '13px 26px', fontSize: '14.5px' }}
              >
                View Markets
              </a>
            </div>

            <div
              style={{
                marginTop: '44px',
                paddingTop: '28px',
                borderTop: '1px solid var(--mk-border)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '28px',
              }}
            >
              <StatItem value="$4.2B+" label="24h Volume" />
              <StatItem value="180+" label="Digital Assets" />
              <StatItem value="3.4M" label="Global Users" />
            </div>

            <div style={{ marginTop: '52px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
              <FeatureRow
                icon="⚡"
                accent="rgba(14,203,129,0.12)"
                accentBorder="rgba(14,203,129,0.25)"
                accentColor="#0ecb81"
                title="Engineered for speed"
                description="A matching engine purpose-built for scale — sub-40ms round trip across every major market."
              />
              <FeatureRow
                icon="🔒"
                accent="rgba(240,185,11,0.12)"
                accentBorder="rgba(240,185,11,0.25)"
                accentColor="#f0b90b"
                title="Custody you can trust"
                description="95% of client assets held offline in audited cold storage, with insurance and segregated accounts."
              />
              <FeatureRow
                icon="🌍"
                accent="rgba(59,130,246,0.12)"
                accentBorder="rgba(59,130,246,0.25)"
                accentColor="#3b82f6"
                title="Support, always on"
                description="Twenty-four hour human response. Ten languages. Resolution in minutes, not days."
              />
              <FeatureRow
                icon="📊"
                accent="rgba(155,89,182,0.12)"
                accentBorder="rgba(155,89,182,0.25)"
                accentColor="#9b59b6"
                title="Data that drives decisions"
                description="Real-time order books, deep historical data, and institutional-grade charting — all free, forever."
              />
              <FeatureRow
                icon="🌐"
                accent="rgba(52,211,153,0.12)"
                accentBorder="rgba(52,211,153,0.25)"
                accentColor="#34d399"
                title="Global liquidity, one platform"
                description="Aggregated depth from institutional market makers across every major venue."
              />
              <FeatureRow
                icon="💼"
                accent="rgba(96,165,250,0.12)"
                accentBorder="rgba(96,165,250,0.25)"
                accentColor="#60a5fa"
                title="Built for every strategy"
                description="Spot, margin, and derivatives — with APIs, webhooks, and algorithms for advanced traders."
              />
            </div>
            {/* HOW IT WORKS SECTION */}
            <div
              style={{
                marginTop: '64px',
                paddingTop: '40px',
                borderTop: '1px solid var(--mk-border)',
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  color: 'var(--mk-text-tertiary)',
                  marginBottom: '24px',
                }}
              >
                GET STARTED IN THREE STEPS
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <StepRow
                  number="01"
                  title="Create your account"
                  description="Sign up in under two minutes — email only, no paperwork."
                />
                <StepRow
                  number="02"
                  title="Fund your wallet"
                  description="Deposit crypto instantly to your unique address. Zero fees, any amount."
                />
                <StepRow
                  number="03"
                  title="Start trading"
                  description="Access 180+ markets with institutional tools from day one."
                />
              </div>
            </div>

            {/* TESTIMONIALS */}
            <div
              style={{
                marginTop: '64px',
                paddingTop: '40px',
                borderTop: '1px solid var(--mk-border)',
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  color: 'var(--mk-text-tertiary)',
                  marginBottom: '28px',
                }}
              >
                FROM THE COMMUNITY
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <TestimonialCard
                  quote={`I've traded on six different platforms. MAKATRON TRADING is the first one where I don't have to choose between professional tools and a clean interface. It just works.`}
                  name="Fred Hosey"
                  location="USA"
                />
                <TestimonialCard
                  quote={`The execution speed is unreal. Orders fill before I can even blink. I've moved my entire portfolio over and haven't looked back.`}
                  name="Tracy Velora"
                  location="South Africa"
                />
                <TestimonialCard
                  quote={`What sold me was the custody model. Cold storage, insurance, segregated accounts — MAKATRON TRADING feels like a real financial institution, not a crypto startup.`}
                  name="Kamala Houston"
                  location="China"
                />
                <TestimonialCard
                  quote={`I run an algorithmic strategy and the API is rock solid. Latency is consistent, documentation is clear, and support answers in minutes.`}
                  name="Sandra Hamilton"
                  location="Canada"
                />
                <TestimonialCard
                  quote={`Zero-fee deposits, transparent pricing, and no surprises. I've been in crypto for eight years — MAKATRON TRADING is the cleanest platform I've used.`}
                  name="Somma Werner"
                  location="Germany"
                />
              </div>
            </div>

            {/* TRUST BADGES */}
            <div
              style={{
                marginTop: '48px',
                paddingTop: '28px',
                borderTop: '1px solid var(--mk-border)',
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  color: 'var(--mk-text-tertiary)',
                  marginBottom: '16px',
                }}
              >
                TRUSTED BY PROFESSIONAL TRADERS WORLDWIDE
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px 24px',
                  fontSize: '12.5px',
                  color: 'var(--mk-text-tertiary)',
                }}
              >
                <span>· Registered in Nigeria</span>
                <span>· ISO 27001 Certified</span>
                <span>· SOC 2 Type II Compliant</span>
                <span>· Fully Insured Custody</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — FIXED LOGIN FORM */}
        <div
          className="flex-1 flex items-center justify-center relative"
          style={{ padding: '32px' }}
        >
          <div
            className="w-full"
            style={{
              maxWidth: '430px',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
            }}
          >
            <div className="lg:hidden text-center" style={{ marginBottom: '28px' }}>
              <img
                src="/logo.jpeg"
                alt="MAKATRON TRADING"
                style={{ width: 'px', height: 'auto', margin: '0 auto', borderRadius: '12px' }}
              />
            </div>

            <h2
              style={{
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
              }}
            >
              Welcome back
            </h2>
            <p
              style={{
                marginTop: '8px',
                fontSize: '14px',
                lineHeight: 1.55,
                color: 'var(--mk-text-secondary)',
              }}
            >
              Sign in to your MAKATRON TRADING account
            </p>

            <form className="space-y-5" style={{ marginTop: '32px' }} onSubmit={handleSubmit}>
              <div>
                <label className="mk-label">Email</label>
                <input
                  type="email"
                  className="mk-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                  <label className="mk-label" style={{ margin: 0 }}>Password</label>
                  <a href="#" className="mk-link" style={{ fontSize: '12.5px' }}>Forgot password?</a>
                </div>
                <input
                  type="password"
                  className="mk-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div
                className="flex items-center gap-2"
                style={{ fontSize: '13.5px', color: 'var(--mk-text-secondary)' }}
              >
                <input type="checkbox" style={{ accentColor: 'var(--mk-accent)' }} />
                <span>Keep me signed in</span>
              </div>

              {error && (
                <div
                  className="text-sm p-3 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(246,70,93,0.15)',
                    color: 'var(--mk-danger)',
                    border: '1px solid rgba(246,70,93,0.3)',
                    fontSize: '13.5px',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="mk-btn-primary"
                disabled={loading}
                style={{ position: 'relative' }}
              >
                {loading ? (
                  <>
                    <span className="mk-spinner" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div style={{ marginTop: '20px' }}>
              <SocialButtons />
            </div>

            <p
              className="text-center"
              style={{
                marginTop: '28px',
                fontSize: '13.5px',
                color: 'var(--mk-text-secondary)',
              }}
            >
              Don't have an account?{' '}
              <a href="/register" className="mk-link">Create one</a>
            </p>

            <p
              className="text-center"
              style={{
                marginTop: '24px',
                fontSize: '11.5px',
                color: 'var(--mk-text-tertiary)',
                lineHeight: 1.6,
              }}
            >
              By signing in, you agree to our{' '}
              <a href="/terms" style={{ color: 'var(--mk-text-secondary)', textDecoration: 'underline' }}>Terms</a>
              {' '}and{' '}
              <a href="/privacy" style={{ color: 'var(--mk-text-secondary)', textDecoration: 'underline' }}>Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM — LIVE TICKER (PINNED, SCROLLING) */}
      <LiveTicker />
    </div>
  )
}

// ============================================
// FEATURE ROW
// ============================================
function FeatureRow({ icon, accent, accentBorder, accentColor, title, description }) {
  return (
    <div className="flex items-start" style={{ gap: '18px' }}>
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: accent,
          border: `1px solid ${accentBorder}`,
          color: accentColor,
          fontSize: '19px',
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: '14.5px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--mk-text-primary)',
          }}
        >
          {title}
        </p>
        <p
          style={{
            marginTop: '4px',
            fontSize: '13.5px',
            lineHeight: 1.6,
            letterSpacing: '-0.005em',
            color: 'var(--mk-text-secondary)',
          }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}

// ============================================
// STAT ITEM
// ============================================
function StatItem({ value, label }) {
  return (
    <div>
      <p
        style={{
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--mk-text-primary)',
        }}
      >
        {value}
      </p>
      <p
        style={{
          marginTop: '4px',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--mk-text-tertiary)',
        }}
      >
        {label}
      </p>
    </div>
  )
}

// ============================================
// STEP ROW
// ============================================
function StepRow({ number, title, description }) {
  return (
    <div className="flex items-start" style={{ gap: '18px' }}>
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--mk-accent)',
          minWidth: '36px',
          letterSpacing: '0.02em',
          paddingTop: '2px',
        }}
      >
        {number}
      </div>
      <div>
        <p
          style={{
            fontSize: '14.5px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--mk-text-primary)',
          }}
        >
          {title}
        </p>
        <p
          style={{
            marginTop: '3px',
            fontSize: '13.5px',
            lineHeight: 1.6,
            color: 'var(--mk-text-secondary)',
          }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}

// ============================================
// TESTIMONIAL CARD
// ============================================
function TestimonialCard({ quote, name, location }) {
  const parts = quote.split('TRADING')
  return (
    <div
      style={{
        padding: '24px 26px',
        backgroundColor: 'var(--mk-bg-secondary)',
        border: '1px solid var(--mk-border)',
        borderRadius: '14px',
        transition: 'border-color 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--mk-border-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--mk-border)')}
    >
      <p
        style={{
          fontSize: '15px',
          lineHeight: 1.65,
          letterSpacing: '-0.005em',
          color: 'var(--mk-text-primary)',
          fontStyle: 'italic',
        }}
      >
        "
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span style={{ color: 'var(--mk-accent)', fontStyle: 'normal', fontWeight: 700 }}>
                TRADING
              </span>
            )}
          </span>
        ))}
        "
      </p>
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(240,185,11,0.12)',
            border: '1px solid rgba(240,185,11,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--mk-accent)',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          {name.split(' ')[name.split(' ').length - 1].charAt(0)}
        </div>
        <div>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--mk-text-primary)',
            }}
          >
            {name}
          </p>
          <p
            style={{
              fontSize: '11.5px',
              color: 'var(--mk-text-tertiary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            {location}
          </p>
        </div>
      </div>
    </div>
  )
}