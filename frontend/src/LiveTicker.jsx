import useLivePrices from './useLivePrices'

// ============================================
// SPARKLINE
// ============================================
function Sparkline({ positive }) {
  const points = positive
    ? '0,30 15,25 30,28 45,18 60,22 75,12 90,15 105,5'
    : '0,10 15,15 30,12 45,22 60,18 75,28 90,25 105,32'
  const color = positive ? '#0ecb81' : '#f6465d'
  return (
    <svg width="70" height="22" viewBox="0 0 105 35">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ============================================
// LIVE TICKER — horizontally scrolling marquee
// ============================================
export default function LiveTicker() {
  const { prices, loading, error } = useLivePrices()

  // While loading, show 5 skeleton items
  if (loading) {
    return (
      <div
        className="w-full flex-shrink-0 overflow-hidden"
        style={{
          borderTop: '1px solid var(--mk-border)',
          backgroundColor: 'var(--mk-bg-secondary)',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className="flex-shrink-0 flex items-center"
          style={{
            padding: '0 20px',
            backgroundColor: 'var(--mk-bg-secondary)',
            borderRight: '1px solid var(--mk-border)',
            height: '100%',
          }}
        >
          <span className="mk-live-dot" style={{ marginRight: '8px' }} />
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 600,
              letterSpacing: '0.16em',
              color: 'var(--mk-text-tertiary)',
              whiteSpace: 'nowrap',
            }}
          >
            LOADING MARKETS
          </span>
        </div>
        <div style={{ flex: 1, padding: '0 24px' }}>
          <span style={{ color: 'var(--mk-text-tertiary)', fontSize: '13px' }}>
            Fetching live prices...
          </span>
        </div>
      </div>
    )
  }

  // If API failed, show a soft error
  if (error || prices.length === 0) {
    return (
      <div
        className="w-full flex-shrink-0 overflow-hidden"
        style={{
          borderTop: '1px solid var(--mk-border)',
          backgroundColor: 'var(--mk-bg-secondary)',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className="flex-shrink-0 flex items-center"
          style={{
            padding: '0 20px',
            backgroundColor: 'var(--mk-bg-secondary)',
            borderRight: '1px solid var(--mk-border)',
            height: '100%',
          }}
        >
          <span className="mk-live-dot" style={{ marginRight: '8px' }} />
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 600,
              letterSpacing: '0.16em',
              color: 'var(--mk-text-tertiary)',
              whiteSpace: 'nowrap',
            }}
          >
            LIVE MARKETS
          </span>
        </div>
        <div style={{ flex: 1, padding: '0 24px' }}>
          <span style={{ color: 'var(--mk-text-tertiary)', fontSize: '13px' }}>
            Prices temporarily unavailable
          </span>
        </div>
      </div>
    )
  }

  // Duplicate the list so the marquee loops seamlessly
  const looped = [...prices, ...prices]

  return (
    <div
      className="w-full flex-shrink-0 overflow-hidden"
      style={{
        borderTop: '1px solid var(--mk-border)',
        backgroundColor: 'var(--mk-bg-secondary)',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* LEFT LABEL */}
      <div
        className="flex-shrink-0 flex items-center"
        style={{
          padding: '0 20px',
          backgroundColor: 'var(--mk-bg-secondary)',
          borderRight: '1px solid var(--mk-border)',
          height: '100%',
          zIndex: 2,
          position: 'relative',
        }}
      >
        <span className="mk-live-dot" style={{ marginRight: '8px' }} />
        <span
          style={{
            fontSize: '10.5px',
            fontWeight: 600,
            letterSpacing: '0.16em',
            color: 'var(--mk-text-tertiary)',
            whiteSpace: 'nowrap',
          }}
        >
          LIVE MARKETS
        </span>
      </div>

      {/* MARQUEE */}
      <div className="mk-marquee-wrapper">
        <div className="mk-marquee">
          {looped.map((p, i) => (
            <div
              key={`${p.symbol}-${i}`}
              className="flex items-center flex-shrink-0"
              style={{ gap: '10px', padding: '0 24px' }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  color: 'var(--mk-text-primary)',
                }}
              >
                {p.symbol}
              </span>
              <span
                className="font-mono"
                style={{ fontSize: '13px', color: 'var(--mk-text-secondary)' }}
              >
                ${formatPrice(p.price)}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: p.change >= 0 ? '#0ecb81' : '#f6465d',
                }}
              >
                {p.change >= 0 ? '+' : ''}
                {p.change.toFixed(2)}%
              </span>
              <Sparkline positive={p.change >= 0} />
              <span
                style={{
                  color: 'var(--mk-border)',
                  fontSize: '16px',
                  marginLeft: '14px',
                }}
              >
                |
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// PRICE FORMATTER — nice looking, varies with size
// ============================================
function formatPrice(price) {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (price >= 1) {
    return price.toFixed(2)
  }
  if (price >= 0.01) {
    return price.toFixed(4)
  }
  return price.toFixed(6)
}