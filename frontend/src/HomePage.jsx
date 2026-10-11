import { useState, useEffect } from 'react'
import {
  StatsBand,
  AppPreview,
  TrustLogos,
  MobileApp,
  FAQ,
  GainersBand,
  Partners,
  Community,
  Newsletter,
  Awards,
} from './HomeExtras'
import LiveTicker from './LiveTicker'
import useLivePrices from './useLivePrices'
import PublicNav from './PublicNav'

// ============================================
// FLOATING CRYPTO BACKGROUND
// ============================================
function CryptoBackground() {
  // 24 floating symbols with varied position, size, speed, and delay
  const symbols = [
    { char: '₿', left: '5%', size: 28, duration: 45, delay: 0, opacity: 0.04 },
    { char: 'Ξ', left: '12%', size: 22, duration: 62, delay: 8, opacity: 0.05 },
    { char: '₮', left: '18%', size: 18, duration: 55, delay: 20, opacity: 0.03 },
    { char: '◎', left: '24%', size: 34, duration: 78, delay: 4, opacity: 0.04 },
    { char: '₿', left: '31%', size: 20, duration: 48, delay: 30, opacity: 0.06 },
    { char: '◈', left: '38%', size: 26, duration: 68, delay: 12, opacity: 0.04 },
    { char: 'Ξ', left: '45%', size: 32, duration: 82, delay: 22, opacity: 0.03 },
    { char: '₿', left: '52%', size: 24, duration: 52, delay: 6, opacity: 0.05 },
    { char: '✕', left: '58%', size: 20, duration: 60, delay: 18, opacity: 0.04 },
    { char: '₮', left: '64%', size: 30, duration: 72, delay: 2, opacity: 0.03 },
    { char: 'Ξ', left: '71%', size: 22, duration: 46, delay: 26, opacity: 0.05 },
    { char: '◈', left: '78%', size: 26, duration: 64, delay: 14, opacity: 0.04 },
    { char: '₿', left: '85%', size: 34, duration: 88, delay: 10, opacity: 0.03 },
    { char: '◎', left: '92%', size: 20, duration: 50, delay: 24, opacity: 0.05 },
    { char: '₮', left: '8%', size: 16, duration: 42, delay: 34, opacity: 0.03 },
    { char: 'Ξ', left: '28%', size: 18, duration: 58, delay: 40, opacity: 0.04 },
    { char: '₿', left: '48%', size: 24, duration: 76, delay: 32, opacity: 0.03 },
    { char: '◈', left: '68%', size: 20, duration: 56, delay: 44, opacity: 0.04 },
    { char: '₮', left: '88%', size: 26, duration: 70, delay: 36, opacity: 0.03 },
    { char: '✕', left: '15%', size: 22, duration: 66, delay: 50, opacity: 0.03 },
    { char: '◎', left: '42%', size: 18, duration: 54, delay: 48, opacity: 0.04 },
    { char: 'Ξ', left: '62%', size: 24, duration: 74, delay: 42, opacity: 0.03 },
    { char: '₿', left: '82%', size: 20, duration: 52, delay: 55, opacity: 0.04 },
    { char: '◈', left: '96%', size: 22, duration: 68, delay: 46, opacity: 0.03 },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      {symbols.map((s, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: s.left,
            fontSize: `${s.size}px`,
            color: '#f0b90b',
            opacity: s.opacity,
            fontWeight: 700,
            animation: `cryptoFloat ${s.duration}s linear ${s.delay}s infinite`,
            userSelect: 'none',
          }}
        >
          {s.char}
        </span>
      ))}
      {/* Inject keyframes once */}
      <style>{`
        @keyframes cryptoFloat {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.08;
          }
          90% {
            opacity: 0.08;
          }
          100% {
            transform: translateY(-120vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// ============================================
// SPARKLINE
// ============================================
function Sparkline({ positive, width = 70, height = 24 }) {
  const points = positive
    ? '0,30 15,25 30,28 45,18 60,22 75,12 90,15 105,5'
    : '0,10 15,15 30,12 45,22 60,18 75,28 90,25 105,32'
  const color = positive ? '#0ecb81' : '#f6465d'
  return (
    <svg width={width} height={height} viewBox="0 0 105 35">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ============================================
// MINI HERO CHART (small decorative candlestick)
// ============================================
function HeroChart() {
  const candles = [
    [0, 120, 130, 100, 110], [12, 110, 125, 95, 120], [24, 120, 130, 110, 115],
    [36, 115, 122, 105, 108], [48, 108, 118, 100, 100], [60, 100, 112, 92, 108],
    [72, 108, 115, 100, 95], [84, 95, 105, 88, 90], [96, 90, 100, 82, 95],
    [108, 95, 102, 85, 88], [120, 88, 95, 78, 82], [132, 82, 92, 72, 78],
    [144, 78, 88, 68, 74], [156, 74, 82, 62, 68], [168, 68, 76, 58, 62],
    [180, 62, 72, 55, 68], [192, 68, 76, 60, 64], [204, 64, 72, 58, 60],
  ]
  return (
    <svg viewBox="0 0 220 160" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      {candles.map(([x, o, h, l, c], i) => {
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
  )
}

// ============================================
// MAIN HOME PAGE
// ============================================
export default function HomePage({ theme, setTheme }) {
  const { prices } = useLivePrices()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const ethPrice = prices.find((p) => p.symbol === 'ETH')?.price || 3484.18
  const ethChange = prices.find((p) => p.symbol === 'ETH')?.change || 1.16
  const featuredPairs = ['BTC', 'ETH', 'SOL', 'XRP', 'BNB']

  return (
    <div className="flex flex-col" style={{ backgroundColor: 'var(--mk-bg-primary)', position: 'relative' }}>
      <CryptoBackground />

      {/* ============ NAVIGATION ============ */}
      <PublicNav theme={theme} setTheme={setTheme} />

      {/* ============ HERO ============ */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '90px 48px 110px',
          zIndex: 1,
        }}
      >
        {/* Ambient glows */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-15%',
            width: '70%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(240,185,11,0.12) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            right: '-15%',
            width: '70%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(14,203,129,0.10) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <div
          className="mx-auto"
          style={{
            maxWidth: '1280px',
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
            gap: '72px',
            alignItems: 'center',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* LEFT — text */}
          <div>
            {/* Pill badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '7px 15px',
                borderRadius: '999px',
                backgroundColor: 'var(--mk-bg-secondary)',
                border: '1px solid var(--mk-border)',
                marginBottom: '28px',
              }}
            >
              <span className="mk-live-dot" />
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  color: 'var(--mk-text-secondary)',
                }}
              >
                $4.2B+ MONTHLY VOLUME · 3.4M TRADERS
              </span>
            </div>

            {/* Headline — controlled size */}
            <h1
              style={{
                fontSize: 'clamp(38px, 4.5vw, 56px)',
                lineHeight: 1.08,
                fontWeight: 700,
                letterSpacing: '-0.035em',
                color: 'var(--mk-text-primary)',
                maxWidth: '620px',
              }}
            >
              Trade the world's markets on one{' '}
              <span className="mk-gradient-text">platform</span>.
            </h1>

            {/* Subhead */}
            <p
              style={{
                marginTop: '24px',
                fontSize: '17px',
                lineHeight: 1.7,
                letterSpacing: '-0.005em',
                color: 'var(--mk-text-secondary)',
                maxWidth: '560px',
              }}
            >
              Institutional execution meets retail accessibility. Open an account in
              minutes, deposit in seconds, and start trading 180+ digital assets with the
              tools professional desks use every day.
            </p>

            {/* CTAs */}
            <div
              style={{
                marginTop: '36px',
                display: 'flex',
                gap: '14px',
                flexWrap: 'wrap',
              }}
            >
              <a
                href="/register"
                className="mk-btn-primary"
                style={{ width: 'auto', padding: '15px 30px', fontSize: '14.5px' }}
              >
                Open Account — It's Free
              </a>
              <a
                href="#markets"
                className="mk-btn-secondary"
                style={{ width: 'auto', padding: '15px 30px', fontSize: '14.5px' }}
              >
                Explore Markets
              </a>
            </div>

            {/* Trust strip */}
            <div
              style={{
                marginTop: '56px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
                maxWidth: '560px',
              }}
            >
              <TrustItem value="180+" label="Markets" />
              <TrustItem value="Zero" label="Deposit Fees" />
              <TrustItem value="24/7" label="Human Support" />
            </div>
          </div>

          {/* RIGHT — floating price card */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                inset: '-30px',
                background: 'radial-gradient(circle, rgba(240,185,11,0.15) 0%, transparent 60%)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'relative',
                padding: '26px',
                backgroundColor: 'rgba(17,19,24,0.85)',
                border: '1px solid var(--mk-border)',
                borderRadius: '18px',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
                animation: 'floatCard 6s ease-in-out infinite',
              }}
            >
              <style>{`
                @keyframes floatCard {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
              `}</style>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '18px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: 'var(--mk-text-tertiary)',
                    textTransform: 'uppercase',
                  }}
                >
                  ETH / USDT · 15m
                </span>
                <span className="mk-live-dot" />
              </div>

              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: 'var(--mk-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                ${ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: ethChange >= 0 ? '#0ecb81' : '#f6465d',
                  marginTop: '6px',
                }}
              >
                {ethChange >= 0 ? '+' : ''}
                {ethChange.toFixed(2)}% today
              </div>

              <div style={{ marginTop: '22px', height: '150px' }}>
                <HeroChart />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--mk-border)',
                }}
              >
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--mk-text-tertiary)', letterSpacing: '0.06em' }}>24H HIGH</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace', marginTop: '2px', color: 'var(--mk-text-primary)' }}>${(ethPrice * 1.03).toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--mk-text-tertiary)', letterSpacing: '0.06em' }}>24H LOW</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace', marginTop: '2px', color: 'var(--mk-text-primary)' }}>${(ethPrice * 0.97).toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--mk-text-tertiary)', letterSpacing: '0.06em' }}>VOLUME</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace', marginTop: '2px', color: 'var(--mk-text-primary)' }}>$482M</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============ STATS BAND ============ */}
<StatsBand />

{/* ============ APP PREVIEW ============ */}
<AppPreview />

{/* ============ TRUST LOGOS ============ */}
<TrustLogos />
      {/* ============ LIVE MARKETS ============ */}
<section
  id="markets"
  style={{
    padding: '60px 48px 80px',
    borderTop: '1px solid var(--mk-border)',
    borderBottom: '1px solid var(--mk-border)',
    position: 'relative',
    zIndex: 1,
  }}
>
  <div className="mx-auto" style={{ maxWidth: '1440px' }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div>
        <h2
          style={{
            fontSize: '26px',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: 'var(--mk-text-primary)',
          }}
        >
          Live Markets
        </h2>
        <p
          style={{
            marginTop: '6px',
            fontSize: '14px',
            color: 'var(--mk-text-secondary)',
          }}
        >
          Real prices from global exchanges, updating every second
        </p>
      </div>
      <a
        href="/register"
        style={{
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: 'var(--mk-accent)',
        }}
      >
        Trade all markets →
      </a>
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px',
      }}
    >
      {featuredPairs.map((sym) => {
        const p = prices.find((x) => x.symbol === sym)
        if (!p) return null
        const positive = p.change >= 0
        return (
          <div
            key={sym}
            style={{
              padding: '20px',
              backgroundColor: 'var(--mk-bg-secondary)',
              border: '1px solid var(--mk-border)',
              borderRadius: '14px',
              transition: 'border-color 0.2s ease, transform 0.15s ease',
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
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--mk-text-primary)',
                }}
              >
                {sym}/USDT
              </span>
              <Sparkline positive={positive} />
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                fontFamily: 'monospace',
                color: 'var(--mk-text-primary)',
              }}
            >
              ${p.price.toLocaleString('en-US', {
                minimumFractionDigits: p.price < 10 ? 4 : 2,
                maximumFractionDigits: p.price < 10 ? 4 : 2,
              })}
            </div>
            <div
              style={{
                marginTop: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: positive ? '#0ecb81' : '#f6465d',
              }}
            >
              {positive ? '+' : ''}
              {p.change.toFixed(2)}%
            </div>
          </div>
        )
      })}
    </div>
  </div>
</section>

{/* ============ FEATURES ============ */}
<section id="features" style={{ padding: '100px 48px', position: 'relative', zIndex: 1 }}>
  <div className="mx-auto" style={{ maxWidth: '1440px' }}>
    <div style={{ textAlign: 'center', marginBottom: '64px', maxWidth: '720px', margin: '0 auto 64px' }}>
      <p
        style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.16em',
          color: 'var(--mk-accent)',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}
      >
        EVERYTHING YOU NEED
      </p>
      <h2
        style={{
          fontSize: 'clamp(30px, 3.5vw, 42px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: 'var(--mk-text-primary)',
        }}
      >
        A trading desk in your browser.
      </h2>
      <p
        style={{
          marginTop: '18px',
          fontSize: '16px',
          lineHeight: 1.65,
          color: 'var(--mk-text-secondary)',
        }}
      >
        Professional-grade tools, without the professional-grade complexity. Built for
        traders at every stage.
      </p>
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: '20px',
      }}
    >
      <FeatureCard
        icon="⚡"
        accent="rgba(14,203,129,0.12)"
        accentBorder="rgba(14,203,129,0.25)"
        accentColor="#0ecb81"
        title="Blazing speed"
        description="Sub-40ms matching latency. Never miss a fill because your platform was slow."
      />
      <FeatureCard
        icon="🔒"
        accent="rgba(240,185,11,0.12)"
        accentBorder="rgba(240,185,11,0.25)"
        accentColor="#f0b90b"
        title="Cold storage custody"
        description="95% of client assets held offline. Insurance, segregation, and independent audits."
      />
      <FeatureCard
        icon="📊"
        accent="rgba(155,89,182,0.12)"
        accentBorder="rgba(155,89,182,0.25)"
        accentColor="#9b59b6"
        title="Pro charts, free forever"
        description="Real-time candles, volume, crosshairs, and 200+ indicators. No premium tier."
      />
      <FeatureCard
        icon="🌐"
        accent="rgba(59,130,246,0.12)"
        accentBorder="rgba(59,130,246,0.25)"
        accentColor="#3b82f6"
        title="Deep global liquidity"
        description="Aggregated order books from the world's top market makers. Trade size, not noise."
      />
      <FeatureCard
        icon="💬"
        accent="rgba(52,211,153,0.12)"
        accentBorder="rgba(52,211,153,0.25)"
        accentColor="#34d399"
        title="Real human support"
        description="Twenty-four hours, ten languages, resolution in minutes. Never a bot."
      />
      <FeatureCard
        icon="🛡️"
        accent="rgba(96,165,250,0.12)"
        accentBorder="rgba(96,165,250,0.25)"
        accentColor="#60a5fa"
        title="Built to protect you"
        description="2FA, biometrics, address whitelists, and SOC 2 Type II compliance by default."
      />
    </div>
  </div>
</section>
{/* ============ MOBILE APP ============ */}
<MobileApp />

{/* ============ GAINERS ============ */}
<GainersBand />

{/* ============ PARTNERS ============ */}
<Partners />

{/* ============ HOW IT WORKS ============ */}
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
  <div className="mx-auto" style={{ maxWidth: '1280px' }}>
    <div style={{ textAlign: 'center', marginBottom: '72px' }}>
      <p
        style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.16em',
          color: 'var(--mk-accent)',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}
      >
        GET STARTED
      </p>
      <h2
        style={{
          fontSize: 'clamp(30px, 3.5vw, 42px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: 'var(--mk-text-primary)',
        }}
      >
        Your first trade in under 5 minutes.
      </h2>
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '32px',
      }}
    >
      <StepCard
        number="01"
        title="Create your account"
        description="Email and password. That's all we need to get you started. No paperwork."
      />
      <StepCard
        number="02"
        title="Fund your wallet"
        description="Deposit any supported cryptocurrency. Your unique address is ready instantly."
      />
      <StepCard
        number="03"
        title="Start trading"
        description="Pick a market, set your order, and trade. Institutional tools from your first trade."
      />
    </div>

    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      <a
        href="/register"
        className="mk-btn-primary"
        style={{ width: 'auto', padding: '15px 32px', fontSize: '14.5px', display: 'inline-flex' }}
      >
        Open Account — It's Free
      </a>
    </div>
  </div>
</section>
{/* ============ WHY MAKATRON ============ */}
<section id="about" style={{ padding: '100px 48px', position: 'relative', zIndex: 1 }}>
  <div className="mx-auto" style={{ maxWidth: '1280px' }}>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '72px',
        alignItems: 'center',
      }}
    >
      <div>
        <p
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.16em',
            color: 'var(--mk-accent)',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          WHY MAKATRON TRADING
        </p>
        <h2
          style={{
            fontSize: 'clamp(28px, 3.2vw, 38px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--mk-text-primary)',
            maxWidth: '500px',
          }}
        >
          We built the exchange we always wanted to use.
        </h2>
        <p
          style={{
            marginTop: '24px',
            fontSize: '15.5px',
            lineHeight: 1.75,
            color: 'var(--mk-text-secondary)',
            maxWidth: '520px',
          }}
        >
          Most platforms force a tradeoff — speed for reliability, or depth for
          simplicity. We refused. MAKATRON TRADING delivers institutional execution,
          professional tools, and consumer-grade usability in one place.
        </p>

        <ul style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <CheckItem text="Zero deposit fees, transparent trading costs" />
          <CheckItem text="Regulated, segregated custody with insurance" />
          <CheckItem text="APIs, webhooks, and algorithms for advanced traders" />
          <CheckItem text="Available in 100+ countries, in ten languages" />
        </ul>

        <div style={{ marginTop: '36px' }}>
          <a
            href="/register"
            className="mk-btn-primary"
            style={{ width: 'auto', padding: '14px 28px', fontSize: '14.5px', display: 'inline-flex' }}
          >
            Open Your Account
          </a>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <SecurityCard icon="🛡️" title="SOC 2 Type II" description="Independently audited controls" />
        <SecurityCard icon="🔐" title="ISO 27001" description="Information security certified" />
        <SecurityCard icon="❄️" title="Cold Storage" description="95% of funds offline" />
        <SecurityCard icon="⚖️" title="Segregated" description="Client funds separated" />
        <SecurityCard icon="📜" title="Fully Insured" description="Custody insurance policy" />
        <SecurityCard icon="👁️" title="24/7 Monitoring" description="Real-time threat detection" />
      </div>
    </div>
  </div>
</section>
{/* ============ COMMUNITY ============ */}
<Community />

{/* ============ FAQ ============ */}
<FAQ />

{/* ============ AWARDS ============ */}
<Awards />

{/* ============ TESTIMONIALS ============ */}
<section
  style={{
    padding: '100px 48px',
    borderTop: '1px solid var(--mk-border)',
    position: 'relative',
    zIndex: 1,
  }}
>
  <div className="mx-auto" style={{ maxWidth: '1440px' }}>
    <div style={{ textAlign: 'center', marginBottom: '56px' }}>
      <p
        style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.16em',
          color: 'var(--mk-accent)',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}
      >
        TRUSTED BY TRADERS
      </p>
      <h2
        style={{
          fontSize: 'clamp(28px, 3.5vw, 42px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: 'var(--mk-text-primary)',
        }}
      >
        Real stories. Real traders.
      </h2>
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
      }}
    >
      <TestimonialCard
        quote="I moved my entire fund from a legacy exchange after their outage cost me a position. MAKATRON TRADING hasn't dropped a single tick in four months."
        name="Fred Hosey"
        location="USA"
      />
      <TestimonialCard
        quote="The order book depth is genuine. I can push $200k through without slippage that would've wrecked me elsewhere. That's what matters."
        name="Tracy Velora"
        location="South Africa"
      />
      <TestimonialCard
        quote="Their compliance team walked me through segregated custody for our treasury. That's the level of care you don't get from crypto startups."
        name=" Zhang Wei"
        location="China"
      />
      <TestimonialCard
        quote="I've integrated with six exchange APIs. MAKATRON TRADING was the only one with documentation that made sense and latency we could trust."
        name="Sandra Hamilton"
        location="Canada"
      />
      <TestimonialCard
        quote="Eight years in crypto. The first platform where I don't feel like I'm gambling on the infrastructure itself. It just works."
        name="Somma Werner"
        location="Germany"
      />
    </div>
  </div>
</section>
{/* ============ NEWSLETTER ============ */}
<Newsletter />
{/* ============ FINAL CTA ============ */}
      <section
        style={{
          position: 'relative',
          padding: '120px 48px',
          borderTop: '1px solid var(--mk-border)',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            height: '70%',
            background: 'radial-gradient(circle, rgba(240,185,11,0.15) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <div
          className="mx-auto text-center"
          style={{ position: 'relative', maxWidth: '680px', zIndex: 1 }}
        >
          <h2
            style={{
              fontSize: 'clamp(30px, 4vw, 46px)',
              fontWeight: 700,
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              color: 'var(--mk-text-primary)',
            }}
          >
            Your next trade starts here.
          </h2>
          <p
            style={{
              marginTop: '20px',
              fontSize: '16.5px',
              lineHeight: 1.65,
              color: 'var(--mk-text-secondary)',
            }}
          >
            Open your account in under two minutes. No paperwork. No minimum deposit.
            Instant access to 180+ markets with tools used by professional desks.
          </p>

          <div
            style={{
              marginTop: '36px',
              display: 'flex',
              gap: '14px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="/register"
              className="mk-btn-primary"
              style={{ width: 'auto', padding: '15px 32px', fontSize: '14.5px' }}
            >
              Open Account — It's Free
            </a>
            <a
              href="/login"
              className="mk-btn-secondary"
              style={{ width: 'auto', padding: '15px 32px', fontSize: '14.5px' }}
            >
              Sign In
            </a>
          </div>

          <p
            style={{
              marginTop: '22px',
              fontSize: '12.5px',
              color: 'var(--mk-text-tertiary)',
            }}
          >
            No credit card required · Cancel anytime · 24/7 support
          </p>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer
        id="support"
        style={{
          padding: '64px 48px 32px',
          borderTop: '1px solid var(--mk-border)',
          backgroundColor: 'var(--mk-bg-secondary)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div className="mx-auto" style={{ maxWidth: '1440px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '48px',
              marginBottom: '56px',
            }}
          >
            <div>
              <div className="flex items-center gap-3" style={{ marginBottom: '20px' }}>
                <img
                  src="/logo.jpeg"
                  alt="MAKATRON TRADING"
                  style={{ height: '40px', width: 'auto', borderRadius: '8px' }}
                />
                <span
                  className="font-bold"
                  style={{
                    fontSize: '13px',
                    letterSpacing: '0.12em',
                    color: 'var(--mk-text-primary)',
                  }}
                >
                  MAKATRON <span style={{ color: 'var(--mk-accent)' }}>TRADING</span>
                </span>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  lineHeight: 1.7,
                  color: 'var(--mk-text-secondary)',
                  maxWidth: '280px',
                }}
              >
                Institutional execution, retail accessibility. The crypto exchange built
                for traders who demand more.
              </p>
            </div>

            <FooterColumn
              title="Product"
              links={[
                { label: 'Markets', href: '#markets' },
                { label: 'Trade', href: '/trade' },
                { label: 'Wallet', href: '/wallet' },
                { label: 'Fees', href: '/#fees' },
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { label: 'About', href: '#about' },
                { label: 'Careers', href: '/#careers' },
                { label: 'Press', href: '/#press' },
                { label: 'Blog', href: '/#blog' },
              ]}
            />
            <FooterColumn
              title="Support"
              links={[
                { label: 'Help Center', href: '/support' },
                { label: 'Contact Us', href: '/support' },
                { label: 'Status', href: '/#status' },
                { label: 'System Status', href: '/#status' },
              ]}
            />
            <FooterColumn
              title="Legal"
              links={[
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Risk Disclosure', href: '/#risk' },
                { label: 'Cookie Policy', href: '/#cookies' },
              ]}
            />
          </div>

          <div
            style={{
              paddingTop: '28px',
              borderTop: '1px solid var(--mk-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <p style={{ fontSize: '12.5px', color: 'var(--mk-text-tertiary)' }}>
              © 2026 MAKATRON TRADING. All rights reserved. Registered in Nigeria.
            </p>
            <p
              style={{
                fontSize: '11.5px',
                color: 'var(--mk-text-tertiary)',
                maxWidth: '520px',
                lineHeight: 1.6,
              }}
            >
              Digital assets are volatile and may result in the loss of your capital.
              Only invest what you can afford to lose.
            </p>
          </div>
        </div>
      </footer>

      {/* ============ LIVE TICKER ============ */}
      <LiveTicker />
    </div>
  )
}

// ============================================
// TRUST ITEM
// ============================================
function TrustItem({ value, label }) {
  return (
    <div>
      <p
        style={{
          fontSize: '24px',
          fontWeight: 700,
          letterSpacing: '-0.025em',
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
// FEATURE CARD
// ============================================
function FeatureCard({ icon, accent, accentBorder, accentColor, title, description }) {
  return (
    <div
      style={{
        padding: '28px',
        backgroundColor: 'var(--mk-bg-secondary)',
        border: '1px solid var(--mk-border)',
        borderRadius: '16px',
        transition: 'border-color 0.2s ease, transform 0.15s ease',
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
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: accent,
          border: `1px solid ${accentBorder}`,
          color: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          marginBottom: '20px',
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: '17px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: 'var(--mk-text-primary)',
          marginBottom: '10px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '14px',
          lineHeight: 1.65,
          color: 'var(--mk-text-secondary)',
        }}
      >
        {description}
      </p>
    </div>
  )
}

// ============================================
// STEP CARD
// ============================================
function StepCard({ number, title, description }) {
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: '42px',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--mk-accent)',
          opacity: 0.35,
          marginBottom: '16px',
        }}
      >
        {number}
      </div>
      <h3
        style={{
          fontSize: '19px',
          fontWeight: 600,
          letterSpacing: '-0.015em',
          color: 'var(--mk-text-primary)',
          marginBottom: '10px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '14.5px',
          lineHeight: 1.7,
          color: 'var(--mk-text-secondary)',
        }}
      >
        {description}
      </p>
    </div>
  )
}

// ============================================
// SECURITY CARD
// ============================================
function SecurityCard({ icon, title, description }) {
  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: 'var(--mk-bg-secondary)',
        border: '1px solid var(--mk-border)',
        borderRadius: '14px',
        transition: 'border-color 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--mk-border-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--mk-border)')}
    >
      <div style={{ fontSize: '24px', marginBottom: '14px' }}>{icon}</div>
      <p
        style={{
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: 'var(--mk-text-primary)',
          marginBottom: '4px',
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: '12.5px',
          lineHeight: 1.55,
          color: 'var(--mk-text-tertiary)',
        }}
      >
        {description}
      </p>
    </div>
  )
}

// ============================================
// CHECK ITEM
// ============================================
function CheckItem({ text }) {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        fontSize: '14.5px',
        color: 'var(--mk-text-secondary)',
        lineHeight: 1.6,
      }}
    >
      <span
        style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          backgroundColor: 'rgba(14,203,129,0.15)',
          color: '#0ecb81',
          fontSize: '12px',
          fontWeight: 700,
          marginTop: '2px',
        }}
      >
        ✓
      </span>
      <span>{text}</span>
    </li>
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
        padding: '26px',
        backgroundColor: 'var(--mk-bg-secondary)',
        border: '1px solid var(--mk-border)',
        borderRadius: '16px',
        transition: 'border-color 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--mk-border-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--mk-border)')}
    >
      <p
        style={{
          fontSize: '14.5px',
          lineHeight: 1.7,
          color: 'var(--mk-text-primary)',
          fontStyle: 'italic',
          flex: 1,
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
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(240,185,11,0.12)',
            border: '1px solid rgba(240,185,11,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--mk-accent)',
            fontSize: '14px',
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

// ============================================
// FOOTER COLUMN
// ============================================
function FooterColumn({ title, links }) {
  return (
    <div>
      <p
        style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.16em',
          color: 'var(--mk-text-tertiary)',
          textTransform: 'uppercase',
          marginBottom: '18px',
        }}
      >
        {title}
      </p>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              style={{
                fontSize: '13.5px',
                color: 'var(--mk-text-secondary)',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--mk-accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--mk-text-secondary)')}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}