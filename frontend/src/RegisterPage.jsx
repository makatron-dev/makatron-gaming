import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { register, login } from './api'
import SocialButtons from './SocialButtons'
import LiveTicker from './LiveTicker'
import PublicNav from './PublicNav'

export default function RegisterPage({ theme, setTheme }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
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

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!agreed) {
      setError('You must agree to the Terms of Service')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await register(email, password)
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
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

      <PublicNav theme={theme} setTheme={setTheme} />

      <div className="flex-1 flex" style={{ overflow: 'hidden' }}>
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
              Open your account.
              <br />
              Trade in <span className="mk-gradient-text">minutes</span>.
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
              Join three million traders across 180+ digital asset markets.
              No hidden fees. No paperwork. Just access — granted in under two minutes.
            </p>

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
              <StatItem value="Under 2 min" label="Signup Time" />
              <StatItem value="Zero" label="Deposit Fees" />
              <StatItem value="180+" label="Tradeable Assets" />
            </div>

            <div style={{ marginTop: '52px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
              <FeatureRow
                icon="🛡️"
                accent="rgba(240,185,11,0.12)"
                accentBorder="rgba(240,185,11,0.25)"
                accentColor="#f0b90b"
                title="Freeze-proof custody"
                description="Your account is protected by 2FA, biometric login, and segregated cold storage from day one."
              />
              <FeatureRow
                icon="🎯"
                accent="rgba(14,203,129,0.12)"
                accentBorder="rgba(14,203,129,0.25)"
                accentColor="#0ecb81"
                title="Trade from the first deposit"
                description="No minimum balance. Fund with $10 or $10M — every feature unlocked from your very first trade."
              />
              <FeatureRow
                icon="💬"
                accent="rgba(59,130,246,0.12)"
                accentBorder="rgba(59,130,246,0.25)"
                accentColor="#3b82f6"
                title="Human support, always"
                description="Real people in every timezone. Live chat from signup to settlement."
              />
              <FeatureRow
                icon="📈"
                accent="rgba(155,89,182,0.12)"
                accentBorder="rgba(155,89,182,0.25)"
                accentColor="#9b59b6"
                title="Data that drives decisions"
                description="Real-time order books, deep historical data, and institutional-grade charting — free forever."
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
                OPEN YOUR ACCOUNT IN THREE STEPS
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <StepRow
                  number="01"
                  title="Register your email"
                  description="Fill the form on the right — takes less than 30 seconds."
                />
                <StepRow
                  number="02"
                  title="Verify and deposit"
                  description="Fund with any supported asset. Your wallet address is generated instantly."
                />
                <StepRow
                  number="03"
                  title="Trade your first market"
                  description="Unlock spot, margin, and derivatives from the moment your balance clears."
                />
              </div>
            </div>

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
                JOIN THE COMMUNITY
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <TestimonialCard
                  quote="I signed up in 90 seconds and was trading within 5 minutes. Onboarding on MAKATRON TRADING is frictionless compared to every other platform I've tried."
                  name="Fred Hosey"
                  location="USA"
                />
                <TestimonialCard
                  quote='The verification process was instant. No waiting, no "review in 24-48 hours". I was in and trading on MAKATRON TRADING the same afternoon.'
                  name="Tracy Velora"
                  location="South Africa"
                />
                <TestimonialCard
                  quote="I opened my account from London and had a funded wallet within ten minutes. MAKATRON TRADING is what onboarding should have always been."
                  name="Kamala Houston"
                  location="China"
                />
                <TestimonialCard
                  quote="The signup flow is clean, the docs are clear, and I was able to plug in my trading bot the same day. MAKATRON TRADING made the migration trivial."
                  name="Sandra Hamilton"
                  location="Canada"
                />
                <TestimonialCard
                  quote="I run a fund and I've onboarded on dozens of exchanges. MAKATRON TRADING is in the top three for speed and quality of the setup process."
                  name="Somma Werner"
                  location="Germany"
                />
              </div>
            </div>

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
                BUILT ON TRUST
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
                style={{ width: '180px', height: 'auto', margin: '0 auto', borderRadius: '12px' }}
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
              Create your account
            </h2>
            <p
              style={{
                marginTop: '8px',
                fontSize: '14px',
                lineHeight: 1.55,
                color: 'var(--mk-text-secondary)',
              }}
            >
              Open a MAKATRON TRADING account in under two minutes
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
                <label className="mk-label">Password</label>
                <input
                  type="password"
                  className="mk-input"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mk-label">Confirm Password</label>
                <input
                  type="password"
                  className="mk-input"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div
                className="flex items-start gap-2"
                style={{ fontSize: '13px', color: 'var(--mk-text-secondary)', lineHeight: 1.55 }}
              >
                <input
                  type="checkbox"
                  style={{ accentColor: 'var(--mk-accent)', marginTop: '3px' }}
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>
                  I agree to the{' '}
                  <a href="/terms" className="mk-link" style={{ fontSize: '13px' }}>
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="mk-link" style={{ fontSize: '13px' }}>
                    Privacy Policy
                  </a>
                </span>
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
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  minHeight: '48px',
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '18px',
                        height: '18px',
                        border: '2.5px solid rgba(0,0,0,0.25)',
                        borderTopColor: '#000',
                        borderRadius: '50%',
                        animation: 'mk-spin 0.7s linear infinite',
                      }}
                    />
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Create Account'
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
              Already have an account?{' '}
              <a href="/login" className="mk-link">Sign in</a>
            </p>
          </div>
        </div>
      </div>

      <LiveTicker />
    </div>
  )
}

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