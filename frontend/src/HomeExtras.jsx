import { useState, useEffect, useRef } from 'react'

// ============================================
// ANIMATED COUNTER HOOK
// ============================================
function useCountUp(target, duration = 1800) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true
            const start = performance.now()
            function animate(now) {
              const progress = Math.min((now - start) / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              setValue(target * eased)
              if (progress < 1) requestAnimationFrame(animate)
            }
            requestAnimationFrame(animate)
          }
        })
      },
      { threshold: 0.3 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return { value, ref }
}

function StatCounter({ value, suffix, prefix, label, decimals = 0 }) {
  const numeric = parseFloat(value.toString().replace(/[^0-9.]/g, ''))
  const { value: animated, ref } = useCountUp(numeric, 1800)
  const formatted = animated.toFixed(decimals)
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, color: 'var(--mk-text-primary)' }}>
        {prefix}
        {formatted}
        {suffix}
      </p>
      <p style={{ marginTop: '10px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mk-text-tertiary)' }}>
        {label}
      </p>
    </div>
  )
}

// ============================================
// 1. STATS BAND
// ============================================
export function StatsBand() {
  return (
    <section
      style={{
        padding: '100px 48px',
        borderTop: '1px solid var(--mk-border)',
        borderBottom: '1px solid var(--mk-border)',
        backgroundColor: 'var(--mk-bg-secondary)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: '1280px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '56px',
        }}
      >
        <StatCounter value="4.2" prefix="$" suffix="B+" decimals={1} label="Monthly Volume" />
        <StatCounter value="3.4" suffix="M+" decimals={1} label="Active Traders" />
        <StatCounter value="180" suffix="+" label="Tradeable Markets" />
        <StatCounter value="99.99" suffix="%" decimals={2} label="Uptime SLA" />
      </div>
    </section>
  )
}
// ============================================
// 2. APP PREVIEW
// ============================================
export function AppPreview() {
  return (
    <section style={{ padding: '120px 48px', position: 'relative', zIndex: 1 }}>
      <div className="mx-auto" style={{ maxWidth: '1280px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--mk-accent)', textTransform: 'uppercase', marginBottom: '16px' }}>
            SEE IT IN ACTION
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--mk-text-primary)', maxWidth: '720px', margin: '0 auto' }}>
            The full trading desk, in your browser.
          </h2>
          <p style={{ marginTop: '18px', fontSize: '16px', lineHeight: 1.65, color: 'var(--mk-text-secondary)', maxWidth: '620px', margin: '18px auto 0' }}>
            Real-time candles, deep order books, professional charting — no downloads, no setup, no premium tier.
          </p>
        </div>

        <div
          style={{
            position: 'relative',
            padding: '12px',
            backgroundColor: 'var(--mk-bg-secondary)',
            border: '1px solid var(--mk-border)',
            borderRadius: '20px',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px 14px',
              borderBottom: '1px solid var(--mk-border)',
              marginBottom: '12px',
            }}
          >
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f57' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#28c840' }} />
            <div style={{ marginLeft: '16px', fontSize: '11px', color: 'var(--mk-text-tertiary)', fontFamily: 'monospace' }}>
              makatron-trading.com/trade
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '14px', padding: '8px' }}>
            {/* Order book */}
            <div style={{ padding: '14px', backgroundColor: 'var(--mk-bg-primary)', border: '1px solid var(--mk-border)', borderRadius: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.14em', color: 'var(--mk-text-tertiary)', marginBottom: '14px' }}>
                ORDER BOOK
              </div>
              {[3498.35, 3497.28, 3496.26, 3495.38, 3494.23].map((p, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10.5px', fontFamily: 'monospace', marginBottom: '5px' }}>
                  <span style={{ color: '#f6465d' }}>{p.toFixed(2)}</span>
                  <span style={{ textAlign: 'right', color: 'var(--mk-text-tertiary)' }}>{(Math.random() * 3 + 0.1).toFixed(4)}</span>
                </div>
              ))}
              <div style={{ padding: '8px 0', margin: '8px 0', borderTop: '1px solid var(--mk-border)', borderBottom: '1px solid var(--mk-border)', fontSize: '13px', fontFamily: 'monospace', fontWeight: 700, color: '#0ecb81', textAlign: 'center' }}>
                3481.77
              </div>
              {[3486.74, 3485.99, 3484.61, 3483.59, 3482.77].map((p, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10.5px', fontFamily: 'monospace', marginBottom: '5px' }}>
                  <span style={{ color: '#0ecb81' }}>{p.toFixed(2)}</span>
                  <span style={{ textAlign: 'right', color: 'var(--mk-text-tertiary)' }}>{(Math.random() * 3 + 0.1).toFixed(4)}</span>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={{ padding: '14px', backgroundColor: 'var(--mk-bg-primary)', border: '1px solid var(--mk-border)', borderRadius: '12px', minHeight: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--mk-text-secondary)' }}>ETH/USDT</span>
                <span style={{ fontSize: '11px', color: '#0ecb81', fontWeight: 600 }}>+1.92%</span>
              </div>
              <div style={{ fontSize: '20px', fontFamily: 'monospace', fontWeight: 700, marginBottom: '14px' }}>$3,484.18</div>
              <svg viewBox="0 0 400 180" preserveAspectRatio="none" style={{ width: '100%', height: '180px' }}>
                {Array.from({ length: 40 }).map((_, i) => {
                  const x = i * 10
                  const base = 90 + Math.sin(i / 3) * 30 + (i % 3) * 5
                  const o = base + (Math.random() - 0.5) * 20
                  const c = base + (Math.random() - 0.5) * 20
                  const h = Math.max(o, c) - 6
                  const l = Math.min(o, c) + 6
                  const up = c < o
                  const color = up ? '#0ecb81' : '#f6465d'
                  return (
                    <g key={i}>
                      <line x1={x + 4} y1={h} x2={x + 4} y2={l} stroke={color} strokeWidth="1" />
                      <rect x={x} y={Math.min(o, c)} width="8" height={Math.abs(o - c) || 2} fill={color} />
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Buy/sell panel */}
            <div style={{ padding: '14px', backgroundColor: 'var(--mk-bg-primary)', border: '1px solid var(--mk-border)', borderRadius: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', padding: '4px', backgroundColor: 'var(--mk-bg-secondary)', borderRadius: '8px', marginBottom: '14px' }}>
                <div style={{ padding: '6px', fontSize: '11px', fontWeight: 700, textAlign: 'center', color: '#0ecb81', backgroundColor: 'rgba(14,203,129,0.15)', borderRadius: '6px' }}>BUY</div>
                <div style={{ padding: '6px', fontSize: '11px', fontWeight: 700, textAlign: 'center', color: 'var(--mk-text-secondary)' }}>SELL</div>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--mk-text-tertiary)', marginBottom: '6px', letterSpacing: '0.08em' }}>PRICE</div>
              <div style={{ padding: '8px 10px', backgroundColor: 'var(--mk-bg-secondary)', border: '1px solid var(--mk-border)', borderRadius: '6px', fontSize: '11.5px', fontFamily: 'monospace', marginBottom: '10px' }}>
                3,484.18
              </div>
              <div style={{ fontSize: '10px', color: 'var(--mk-text-tertiary)', marginBottom: '6px', letterSpacing: '0.08em' }}>AMOUNT</div>
              <div style={{ padding: '8px 10px', backgroundColor: 'var(--mk-bg-secondary)', border: '1px solid var(--mk-border)', borderRadius: '6px', fontSize: '11.5px', fontFamily: 'monospace', marginBottom: '14px', color: 'var(--mk-text-tertiary)' }}>
                0.00
              </div>
              <div style={{ padding: '10px', backgroundColor: '#0ecb81', color: '#000', fontWeight: 700, fontSize: '11.5px', textAlign: 'center', borderRadius: '8px', letterSpacing: '0.04em' }}>
                Buy ETH
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <a href="/trade" className="mk-btn-primary" style={{ width: 'auto', padding: '14px 30px', fontSize: '14px', display: 'inline-flex' }}>
            Try the Live Interface →
          </a>
        </div>
      </div>
    </section>
  )
}
// ============================================
// 3. TRUST LOGOS
// ============================================
export function TrustLogos() {
  const logos = [
    { name: 'CertiK', descriptor: 'Security Audit' },
    { name: 'Fireblocks', descriptor: 'Custody' },
    { name: 'Chainalysis', descriptor: 'Compliance' },
    { name: 'SlowMist', descriptor: 'Audit' },
    { name: 'Coincover', descriptor: 'Insurance' },
    { name: 'Halborn', descriptor: 'Security' },
  ]

  return (
    <section
      style={{
        padding: '56px 48px',
        borderTop: '1px solid var(--mk-border)',
        borderBottom: '1px solid var(--mk-border)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div className="mx-auto" style={{ maxWidth: '1280px' }}>
        <p
          style={{
            textAlign: 'center',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.16em',
            color: 'var(--mk-text-tertiary)',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}
        >
          Secured, audited, and trusted by the industry's best
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '28px',
            alignItems: 'center',
          }}
        >
          {logos.map((logo) => (
            <div
              key={logo.name}
              style={{
                textAlign: 'center',
                padding: '14px',
                opacity: 0.55,
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.55)}
            >
              <p
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--mk-text-primary)',
                  marginBottom: '4px',
                }}
              >
                {logo.name}
              </p>
              <p
                style={{
                  fontSize: '10.5px',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  color: 'var(--mk-text-tertiary)',
                  textTransform: 'uppercase',
                }}
              >
                {logo.descriptor}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// 4. MOBILE APP
// ============================================
export function MobileApp() {
  return (
    <section
      style={{
        padding: '120px 48px',
        borderTop: '1px solid var(--mk-border)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: '1280px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '80px',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              inset: '-20px',
              background: 'radial-gradient(circle, rgba(240,185,11,0.15) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: '280px',
              height: '560px',
              borderRadius: '42px',
              backgroundColor: 'var(--mk-bg-secondary)',
              border: '3px solid var(--mk-border)',
              padding: '12px',
              boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90px',
                height: '22px',
                backgroundColor: '#000',
                borderRadius: '0 0 14px 14px',
                zIndex: 2,
              }}
            />
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '30px',
                backgroundColor: 'var(--mk-bg-primary)',
                overflow: 'hidden',
                padding: '40px 16px 16px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/logo.jpeg" alt="" style={{ height: '22px', width: '22px', borderRadius: '5px' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em' }}>MAKATRON</span>
                </div>
                <span className="mk-live-dot" />
              </div>

              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #f0b90b 0%, #d4a209 100%)',
                  color: '#000',
                  marginBottom: '14px',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', opacity: 0.7 }}>PORTFOLIO</div>
                <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginTop: '4px' }}>$12,847.30</div>
                <div style={{ fontSize: '11px', fontWeight: 600, marginTop: '2px', opacity: 0.85 }}>▲ +$324.81 today</div>
              </div>

              {[
                { sym: 'BTC', price: '$67,432.18', change: '+2.34', up: true },
                { sym: 'ETH', price: '$3,484.18', change: '+1.92', up: true },
                { sym: 'SOL', price: '$178.45', change: '-0.92', up: false },
              ].map((a) => (
                <div
                  key={a.sym}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--mk-border)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700 }}>{a.sym}</div>
                    <div style={{ fontSize: '9.5px', color: 'var(--mk-text-tertiary)' }}>{a.price}</div>
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: a.up ? '#0ecb81' : '#f6465d' }}>
                    {a.change}%
                  </div>
                </div>
              ))}

              <div
                style={{
                  marginTop: 'auto',
                  padding: '10px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#0ecb81',
                  color: '#000',
                  borderRadius: '8px',
                }}
              >
                Trade Now
              </div>
            </div>
          </div>
        </div>

        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--mk-accent)', textTransform: 'uppercase', marginBottom: '20px' }}>
            MAKATRON ON THE GO
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 3.2vw, 38px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--mk-text-primary)', maxWidth: '520px' }}>
            Your portfolio, in your pocket.
          </h2>
          <p style={{ marginTop: '24px', fontSize: '15.5px', lineHeight: 1.75, color: 'var(--mk-text-secondary)', maxWidth: '500px' }}>
            Trade, deposit, and monitor your positions from anywhere. Real-time alerts, biometric login, and the same institutional-grade engine — built for your phone.
          </p>

          <ul style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <MobileFeature text="Real-time push notifications for price moves" />
            <MobileFeature text="Face ID and fingerprint login" />
            <MobileFeature text="Deposit and withdraw in seconds" />
          </ul>

          <div style={{ marginTop: '36px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <StoreButton icon="🍎" line1="Download on the" line2="App Store" />
            <StoreButton icon="▶" line1="Get it on" line2="Google Play" />
          </div>
        </div>
      </div>
    </section>
  )
}

function MobileFeature({ text }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14.5px', color: 'var(--mk-text-secondary)' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'rgba(14,203,129,0.15)',
          color: '#0ecb81',
          fontSize: '11px',
          fontWeight: 700,
        }}
      >
        ✓
      </span>
      {text}
    </li>
  )
}

function StoreButton({ icon, line1, line2 }) {
  return (
    <a
      href="#"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 18px',
        backgroundColor: 'var(--mk-bg-secondary)',
        border: '1px solid var(--mk-border)',
        borderRadius: '12px',
        color: 'var(--mk-text-primary)',
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--mk-accent)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--mk-border)')}
    >
      <span style={{ fontSize: '22px' }}>{icon}</span>
      <div>
        <p style={{ fontSize: '9.5px', color: 'var(--mk-text-tertiary)', letterSpacing: '0.04em' }}>{line1}</p>
        <p style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em' }}>{line2}</p>
      </div>
    </a>
  )
}
// ============================================
// 5. FAQ ACCORDION
// ============================================
export function FAQ() {
  const faqs = [
    { q: 'How do I open an account on MAKATRON TRADING?', a: 'Click "Open Account" anywhere on this page, enter your email and a secure password, and you are in. The whole process takes under two minutes — no paperwork, no waiting for manual review.' },
    { q: 'What are your trading fees?', a: 'Maker orders cost 0.10% and taker orders cost 0.15% — some of the lowest in the industry. Deposits are always free. We publish the full fee schedule on our Fees page so you never pay a surprise.' },
    { q: 'How do you keep my funds safe?', a: '95% of client assets are held offline in geographically distributed cold storage. Each account is segregated, insured, and monitored 24/7. We are audited by CertiK and compliant with SOC 2 Type II.' },
    { q: 'Which countries do you support?', a: 'MAKATRON TRADING serves traders in over 100 countries. Full availability depends on local regulation — you will see the exact list during signup.' },
    { q: 'How long do deposits take?', a: 'Crypto deposits arrive after the required network confirmations — usually 1-3 minutes for BTC, seconds for ETH and TRC-20 USDT. Your unique deposit address is generated automatically when you register.' },
    { q: 'Can I withdraw at any time?', a: 'Yes. Withdrawals are processed 24/7 without any manual approval for standard amounts. Large withdrawals may require additional verification, but the process is automated and fast.' },
    { q: 'Do you offer APIs for algorithmic trading?', a: 'Yes. We provide REST and WebSocket APIs with full documentation, plus webhooks for order and balance events. Many of our users run fully automated strategies.' },
    { q: 'What if I need help?', a: 'Real humans are available 24/7 in ten languages. Reach out via live chat, email, or our Telegram channel. Average response time is under two minutes.' },
  ]

  const [open, setOpen] = useState(0)

  return (
    <section
      id="faq"
      style={{
        padding: '120px 48px',
        borderTop: '1px solid var(--mk-border)',
        borderBottom: '1px solid var(--mk-border)',
        backgroundColor: 'var(--mk-bg-secondary)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div className="mx-auto" style={{ maxWidth: '920px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--mk-accent)', textTransform: 'uppercase', marginBottom: '16px' }}>
            FREQUENTLY ASKED
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--mk-text-primary)' }}>
            Questions, answered.
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((item, i) => {
            const isOpen = open === i
            return (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--mk-bg-primary)',
                  border: `1px solid ${isOpen ? 'rgba(240,185,11,0.3)' : 'var(--mk-border)'}`,
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width: '100%',
                    padding: '22px 26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--mk-text-primary)',
                    fontSize: '15.5px',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span>{item.q}</span>
                  <span
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: isOpen ? 'rgba(240,185,11,0.15)' : 'var(--mk-bg-tertiary)',
                      color: isOpen ? 'var(--mk-accent)' : 'var(--mk-text-tertiary)',
                      fontSize: '16px',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 26px 24px',
                      fontSize: '14.5px',
                      lineHeight: 1.75,
                      color: 'var(--mk-text-secondary)',
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============================================
// 6. GAINERS BAND
// ============================================
export function GainersBand() {
  const [gainers, setGainers] = useState([
    { sym: 'SOL', change: 8.24 },
    { sym: 'AVAX', change: 6.12 },
    { sym: 'MATIC', change: 4.87 },
    { sym: 'DOT', change: 3.94 },
    { sym: 'LINK', change: 3.21 },
    { sym: 'ADA', change: 2.78 },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setGainers((prev) =>
        prev
          .map((g) => ({ ...g, change: g.change + (Math.random() - 0.5) * 0.15 }))
          .sort((a, b) => b.change - a.change)
      )
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      style={{
        padding: '40px 48px',
        borderTop: '1px solid var(--mk-border)',
        borderBottom: '1px solid var(--mk-border)',
        backgroundColor: 'var(--mk-bg-secondary)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div className="mx-auto" style={{ maxWidth: '1440px', display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <span className="mk-live-dot" />
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--mk-accent)', textTransform: 'uppercase' }}>
            24H TOP GAINERS
          </span>
        </div>
        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
          {gainers.map((g) => (
            <div key={g.sym} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--mk-text-primary)' }}>{g.sym}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: g.change >= 0 ? '#0ecb81' : '#f6465d', fontFamily: 'monospace' }}>
                {g.change >= 0 ? '+' : ''}{g.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// 7. PARTNERS
// ============================================
export function Partners() {
  const partners = [
    { name: 'Fireblocks', role: 'Custody' },
    { name: 'MoonPay', role: 'Fiat On-Ramp' },
    { name: 'Chainlink', role: 'Oracles' },
    { name: 'Pyth Network', role: 'Market Data' },
    { name: 'Circle', role: 'USDC Rails' },
    { name: 'Sardine', role: 'Fraud Prevention' },
  ]

  return (
    <section style={{ padding: '80px 48px', borderTop: '1px solid var(--mk-border)', position: 'relative', zIndex: 1 }}>
      <div className="mx-auto" style={{ maxWidth: '1280px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--mk-text-primary)' }}>
            Powered by the infrastructure behind modern finance.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '32px', alignItems: 'center' }}>
          {partners.map((p) => (
            <div
              key={p.name}
              style={{ textAlign: 'center', opacity: 0.55, transition: 'opacity 0.2s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.55)}
            >
              <p style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--mk-text-primary)', marginBottom: '4px' }}>{p.name}</p>
              <p style={{ fontSize: '10.5px', letterSpacing: '0.08em', color: 'var(--mk-text-tertiary)', textTransform: 'uppercase' }}>{p.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
// ============================================
// 8. COMMUNITY
// ============================================
export function Community() {
  const channels = [
    { name: 'Telegram', handle: '@makatrontrading', members: '185K', icon: '✈️', color: '#2AABEE', href: '#' },
    { name: 'Twitter / X', handle: '@makatron', members: '92K', icon: '𝕏', color: '#ffffff', href: '#' },
    { name: 'Discord', handle: 'MAKATRON Trading', members: '48K', icon: '💬', color: '#5865F2', href: '#' },
    { name: 'YouTube', handle: 'MAKATRON Trading', members: '61K', icon: '▶', color: '#FF0000', href: '#' },
  ]

  return (
    <section
      style={{
        padding: '100px 48px',
        borderTop: '1px solid var(--mk-border)',
        backgroundColor: 'var(--mk-bg-secondary)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div className="mx-auto" style={{ maxWidth: '1280px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--mk-accent)', textTransform: 'uppercase', marginBottom: '16px' }}>
            JOIN THE COMMUNITY
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--mk-text-primary)' }}>
            Over 380,000 traders in our channels.
          </h2>
          <p style={{ marginTop: '18px', fontSize: '16px', lineHeight: 1.65, color: 'var(--mk-text-secondary)', maxWidth: '620px', margin: '18px auto 0' }}>
            Live market commentary, product announcements, and direct access to our team.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {channels.map((c) => (
            <a
              key={c.name}
              href={c.href}
              style={{
                padding: '24px',
                backgroundColor: 'var(--mk-bg-primary)',
                border: '1px solid var(--mk-border)',
                borderRadius: '16px',
                transition: 'border-color 0.2s ease, transform 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--mk-border-hover)'
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--mk-border)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: `${c.color}20`,
                  border: `1px solid ${c.color}40`,
                  color: c.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  marginBottom: '18px',
                }}
              >
                {c.icon}
              </div>
              <p style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--mk-text-primary)', marginBottom: '4px' }}>{c.name}</p>
              <p style={{ fontSize: '12.5px', color: 'var(--mk-text-tertiary)', marginBottom: '16px' }}>{c.handle}</p>
              <p style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--mk-text-primary)', marginTop: 'auto' }}>{c.members}</p>
              <p style={{ fontSize: '10.5px', letterSpacing: '0.1em', color: 'var(--mk-text-tertiary)', textTransform: 'uppercase', marginTop: '4px' }}>Members</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// 9. NEWSLETTER
// ============================================
export function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setEmail('')
    }, 3000)
  }

  return (
    <section style={{ padding: '80px 48px', borderTop: '1px solid var(--mk-border)', position: 'relative', zIndex: 1 }}>
      <div
        className="mx-auto"
        style={{
          maxWidth: '760px',
          padding: '48px 40px',
          backgroundColor: 'var(--mk-bg-secondary)',
          border: '1px solid var(--mk-border)',
          borderRadius: '20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '70%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(240,185,11,0.10) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--mk-accent)', textTransform: 'uppercase', marginBottom: '16px' }}>
            WEEKLY MARKET BRIEF
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, color: 'var(--mk-text-primary)' }}>
            Insights that move markets — every Monday.
          </h2>
          <p style={{ marginTop: '14px', fontSize: '15px', lineHeight: 1.65, color: 'var(--mk-text-secondary)', maxWidth: '520px', margin: '14px auto 0' }}>
            Curated research, on-chain data, and what our analysts are watching. No spam, unsubscribe anytime.
          </p>
          <form onSubmit={handleSubmit} style={{ marginTop: '28px', display: 'flex', gap: '10px', maxWidth: '480px', margin: '28px auto 0', flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mk-input"
              style={{ flex: 1, minWidth: '200px' }}
              required
            />
            <button type="submit" className="mk-btn-primary" style={{ width: 'auto', padding: '14px 26px', fontSize: '14px' }}>
              {submitted ? '✓ Subscribed' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

// ============================================
// 10. AWARDS
// ============================================
export function Awards() {
  const awards = [
    { title: 'Best Crypto Exchange 2026', issuer: 'FinTech Awards' },
    { title: 'Most Innovative Trading Platform', issuer: 'Blockchain Summit' },
    { title: 'Top 10 African Fintech', issuer: 'Africa Tech Summit' },
    { title: 'Best UX in Trading', issuer: 'Design Awards 2026' },
  ]

  return (
    <section
      style={{
        padding: '80px 48px',
        borderTop: '1px solid var(--mk-border)',
        borderBottom: '1px solid var(--mk-border)',
        backgroundColor: 'var(--mk-bg-secondary)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div className="mx-auto" style={{ maxWidth: '1280px' }}>
        <p style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--mk-text-tertiary)', textTransform: 'uppercase', marginBottom: '40px' }}>
          RECOGNITIONS
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {awards.map((a) => (
            <div
              key={a.title}
              style={{
                padding: '24px',
                backgroundColor: 'var(--mk-bg-primary)',
                border: '1px solid var(--mk-border)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                transition: 'border-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--mk-border-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--mk-border)')}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(240,185,11,0.12)',
                  border: '1px solid rgba(240,185,11,0.25)',
                  color: 'var(--mk-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                ★
              </div>
              <div>
                <p style={{ fontSize: '14.5px', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--mk-text-primary)', marginBottom: '4px' }}>{a.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--mk-text-tertiary)', letterSpacing: '0.04em' }}>{a.issuer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}