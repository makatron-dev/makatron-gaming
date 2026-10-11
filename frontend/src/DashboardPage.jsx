import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyBalances, getToken } from './api'
import useLivePrices from './useLivePrices'
import AppLayout from './AppLayout'

const MONO = "'JetBrains Mono', ui-monospace, monospace"

function AnimatedNumber({ value, decimals = 2, prefix = '$' }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) {
      setDisplay(0)
      return
    }
    const duration = 900
    const start = performance.now()
    const from = display
    const to = value

    function animate(now) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = from + (to - from) * eased
      setDisplay(current)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <>
      {prefix}
      {display.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </>
  )
}

export default function DashboardPage({ theme, setTheme }) {
  const navigate = useNavigate()
  const { prices } = useLivePrices()

  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function checkSize() {
      setIsMobile(window.innerWidth < 900)
    }
    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  useEffect(() => {
    if (!getToken()) {
      navigate('/login')
      return
    }

    async function load() {
      try {
        const data = await getMyBalances()
        setBalances(data)
      } catch (err) {
        setError(err.message || 'Failed to load balances')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  function priceFor(asset) {
    if (asset === 'USDT') return 1
    const found = prices.find((p) => p.symbol === asset)
    return found ? found.price : 0
  }

  function changeFor(asset) {
    const found = prices.find((p) => p.symbol === asset)
    return found ? found.change : 0
  }

  const totalValue = balances.reduce((sum, b) => {
    const price = priceFor(b.asset)
    const qty = parseFloat(b.available) || 0
    return sum + qty * price
  }, 0)

  const avgChange = balances.length
    ? balances.reduce((sum, b) => {
        const price = priceFor(b.asset)
        const qty = parseFloat(b.available) || 0
        const value = qty * price
        return sum + value * changeFor(b.asset)
      }, 0) / (totalValue || 1)
    : 0

  const isPositive = avgChange >= 0

  return (
    <AppLayout activePage="Dashboard" theme={theme} setTheme={setTheme}>
      {loading && <div className="mk-progress-bar" />}

      <div style={{ paddingTop: '8px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              fontSize: isMobile ? '22px' : '26px',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--mk-text-primary)',
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              marginTop: '6px',
              fontSize: '14px',
              color: 'var(--mk-text-secondary)',
            }}
          >
            Here's how your portfolio is doing today
          </p>
        </div>

        {error && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 16px',
              backgroundColor: 'var(--mk-danger-bg)',
              border: '1px solid var(--mk-danger)',
              borderRadius: '10px',
              color: 'var(--mk-danger-text)',
              fontSize: '13.5px',
            }}
          >
            {error}
          </div>
        )}

        {/* PORTFOLIO VALUE CARD */}
        <div
          style={{
            padding: isMobile ? '24px 20px' : '32px',
            backgroundColor: 'var(--mk-bg-secondary)',
            border: '1px solid var(--mk-border)',
            borderRadius: '16px',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '50%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(240,185,11,0.08) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.16em',
                color: 'var(--mk-text-secondary)',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}
            >
              Total Portfolio Value
            </p>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '8px', paddingBottom: '8px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '26px',
                    height: '26px',
                    border: '3px solid var(--mk-accent-glow)',
                    borderTopColor: 'var(--mk-accent)',
                    borderRadius: '50%',
                    animation: 'mk-spin 0.7s linear infinite',
                  }}
                />
                <span
                  style={{
                    fontSize: '14px',
                    color: 'var(--mk-text-secondary)',
                    letterSpacing: '0.01em',
                  }}
                >
                  Loading portfolio...
                </span>
              </div>
            ) : (
              <div
                style={{
                  fontSize: isMobile ? '36px' : '48px',
                  fontWeight: 700,
                  letterSpacing: '-0.035em',
                  color: 'var(--mk-text-primary)',
                  lineHeight: 1.05,
                  fontFamily: MONO,
                  wordBreak: 'break-all',
                }}
              >
                <AnimatedNumber value={totalValue} decimals={2} prefix="$" />
              </div>
            )}

            <div
              style={{
                marginTop: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontFamily: MONO,
                  color: isPositive ? 'var(--mk-success-text)' : 'var(--mk-danger-text)',
                  backgroundColor: isPositive ? 'var(--mk-success-bg)' : 'var(--mk-danger-bg)',
                }}
              >
                {isPositive ? '▲' : '▼'} {Math.abs(avgChange).toFixed(2)}%
              </span>
              <span
                style={{
                  fontSize: '13px',
                  color: 'var(--mk-text-tertiary)',
                }}
              >
                24h change
              </span>
            </div>
          </div>
        </div>

        {/* ASSETS GRID */}
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: 'var(--mk-text-primary)',
              marginBottom: '14px',
            }}
          >
            Your Assets
          </h2>

          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--mk-bg-secondary)',
                    border: '1px solid var(--mk-border)',
                    borderRadius: '14px',
                  }}
                >
                  <div
                    className="mk-skeleton"
                    style={{ width: '50px', height: '14px', marginBottom: '12px' }}
                  />
                  <div
                    className="mk-skeleton"
                    style={{ width: '120px', height: '24px', marginBottom: '8px' }}
                  />
                  <div className="mk-skeleton" style={{ width: '80px', height: '14px' }} />
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              {balances.map((b) => {
                const price = priceFor(b.asset)
                const qty = parseFloat(b.available) || 0
                const usdValue = qty * price
                const change = changeFor(b.asset)
                const positive = change >= 0

                return (
                  <div
                    key={b.asset}
                    style={{
                      padding: '20px',
                      backgroundColor: 'var(--mk-bg-secondary)',
                      border: '1px solid var(--mk-border)',
                      borderRadius: '14px',
                      transition: 'border-color 0.2s ease',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = 'var(--mk-border-hover)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = 'var(--mk-border)')
                    }
                  >
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: '14px' }}
                    >
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          color: 'var(--mk-text-primary)',
                        }}
                      >
                        {b.asset}
                      </span>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 600,
                          fontFamily: MONO,
                          color: positive ? 'var(--mk-success-text)' : 'var(--mk-danger-text)',
                        }}
                      >
                        {positive ? '+' : ''}
                        {change.toFixed(2)}%
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        color: 'var(--mk-text-primary)',
                        fontFamily: MONO,
                      }}
                    >
                      {qty.toFixed(4)}
                    </div>

                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '13px',
                        color: 'var(--mk-text-secondary)',
                        fontFamily: MONO,
                      }}
                    >
                      ≈ ${usdValue.toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: 'var(--mk-text-primary)',
              marginBottom: '14px',
            }}
          >
            Quick Actions
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            <ActionCard
              href="/wallet"
              icon="⬇"
              title="Deposit Crypto"
              description="Get your unique deposit address"
              accent="var(--mk-success-bg)"
              accentBorder="var(--mk-success)"
              accentColor="var(--mk-success-text)"
            />
            <ActionCard
              href="/trade"
              icon="⚡"
              title="Start Trading"
              description="Buy and sell across 180+ markets"
              accent="rgba(240,185,11,0.12)"
              accentBorder="rgba(240,185,11,0.25)"
              accentColor="var(--mk-accent-text)"
            />
            <ActionCard
              href="/wallet"
              icon="⬆"
              title="Withdraw"
              description="Send crypto to an external wallet"
              accent="rgba(59,130,246,0.12)"
              accentBorder="rgba(59,130,246,0.25)"
              accentColor="#3b82f6"
            />
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: 'var(--mk-text-primary)',
              marginBottom: '14px',
            }}
          >
            Recent Activity
          </h2>

          <div
            style={{
              padding: '48px 24px',
              backgroundColor: 'var(--mk-bg-secondary)',
              border: '1px solid var(--mk-border)',
              borderRadius: '14px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                margin: '0 auto 16px',
                borderRadius: '50%',
                backgroundColor: 'var(--mk-bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                color: 'var(--mk-text-tertiary)',
              }}
            >
              ◷
            </div>
            <p
              style={{
                fontSize: '14.5px',
                fontWeight: 600,
                color: 'var(--mk-text-primary)',
                marginBottom: '6px',
              }}
            >
              No activity yet
            </p>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--mk-text-secondary)',
                maxWidth: '340px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              Your deposits, trades, and withdrawals will show up here once you start using
              your account.
            </p>

            <div style={{ marginTop: '20px' }}>
              <a
                href="/wallet"
                className="mk-btn-primary"
                style={{
                  width: 'auto',
                  padding: '10px 22px',
                  fontSize: '13.5px',
                  display: 'inline-flex',
                }}
              >
                Make your first deposit
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function ActionCard({ href, icon, title, description, accent, accentBorder, accentColor }) {
  return (
    <a
      href={href}
      style={{
        padding: '20px',
        backgroundColor: 'var(--mk-bg-secondary)',
        border: '1px solid var(--mk-border)',
        borderRadius: '14px',
        transition: 'border-color 0.2s ease, transform 0.15s ease',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--mk-border-hover)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--mk-border)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: accent,
          border: `1px solid ${accentBorder}`,
          color: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--mk-text-primary)',
            marginBottom: '3px',
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: '12.5px',
            color: 'var(--mk-text-secondary)',
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>
      </div>
    </a>
  )
}