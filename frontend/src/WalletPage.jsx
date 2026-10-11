import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyWallets, getToken } from './api'
import AppLayout from './AppLayout'

const MONO = "'JetBrains Mono', ui-monospace, monospace"

const CHAIN_META = {
  BTC: { icon: '₿', name: 'Bitcoin', network: 'Bitcoin Mainnet', color: '#f7931a' },
  ETH: { icon: 'Ξ', name: 'Ethereum', network: 'Ethereum (ERC-20)', color: '#627eea' },
  BNB: { icon: 'B', name: 'BNB Smart Chain', network: 'BNB (BEP-20)', color: '#f0b90b' },
  MATIC: { icon: 'M', name: 'Polygon', network: 'Polygon Mainnet', color: '#8247e5' },
  USDT_TRC20: { icon: '₮', name: 'Tether USD', network: 'TRON (TRC-20)', color: '#26a17b' },
}

export default function WalletPage({ theme, setTheme }) {
  const navigate = useNavigate()
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedChain, setCopiedChain] = useState(null)
  const [activeTab, setActiveTab] = useState('deposit')
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
        const data = await getMyWallets()
        setWallets(data)
      } catch (err) {
        setError(err.message || 'Failed to load wallets')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  async function copyAddress(chain, address) {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedChain(chain)
      setTimeout(() => setCopiedChain(null), 2000)
    } catch (err) {
      // ignore
    }
  }

  return (
    <AppLayout activePage="Wallet" theme={theme} setTheme={setTheme}>
      {loading && <div className="mk-progress-bar" />}

      <div style={{ paddingTop: '8px' }}>
        {/* HEADING */}
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              fontSize: isMobile ? '22px' : '26px',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--mk-text-primary)',
            }}
          >
            Wallet
          </h1>
          <p
            style={{
              marginTop: '6px',
              fontSize: '14px',
              color: 'var(--mk-text-secondary)',
            }}
          >
            Deposit or withdraw crypto from your MAKATRON TRADING account
          </p>
        </div>

        {/* TABS */}
        <div
          style={{
            display: 'inline-flex',
            padding: '4px',
            backgroundColor: 'var(--mk-bg-secondary)',
            border: '1px solid var(--mk-border)',
            borderRadius: '10px',
            marginBottom: '24px',
          }}
        >
          <TabButton
            label="Deposit"
            active={activeTab === 'deposit'}
            onClick={() => setActiveTab('deposit')}
          />
          <TabButton
            label="Withdraw"
            active={activeTab === 'withdraw'}
            onClick={() => setActiveTab('withdraw')}
          />
        </div>

        {/* INFO BANNER */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: 'rgba(240,185,11,0.08)',
            border: '1px solid rgba(240,185,11,0.2)',
            borderRadius: '10px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>⚠️</span>
          <p
            style={{
              fontSize: '13px',
              lineHeight: 1.65,
              color: 'var(--mk-text-secondary)',
            }}
          >
            <strong style={{ color: 'var(--mk-text-primary)' }}>Send only the matching asset.</strong>{' '}
            Each address below is unique to your account. Sending an incorrect asset or
            using the wrong network may result in permanent loss of funds.
          </p>
        </div>

        {/* ERROR */}
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

        {/* LOADING SKELETON */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  padding: '24px',
                  backgroundColor: 'var(--mk-bg-secondary)',
                  border: '1px solid var(--mk-border)',
                  borderRadius: '14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <div className="mk-skeleton" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
                  <div>
                    <div className="mk-skeleton" style={{ width: '100px', height: '14px', marginBottom: '6px' }} />
                    <div className="mk-skeleton" style={{ width: '140px', height: '12px' }} />
                  </div>
                </div>
                <div className="mk-skeleton" style={{ width: '100%', height: '20px' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {wallets.map((w) => {
              const meta = CHAIN_META[w.chain] || {
                icon: '●',
                name: w.chain,
                network: w.chain,
                color: '#9ca3af',
              }
              const isCopied = copiedChain === w.chain

              return (
                <div
                  key={w.chain}
                  style={{
                    padding: isMobile ? '18px 16px' : '24px',
                    backgroundColor: 'var(--mk-bg-secondary)',
                    border: '1px solid var(--mk-border)',
                    borderRadius: '14px',
                    transition: 'border-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--mk-border-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--mk-border)')}
                >
                  {/* CHAIN HEADER */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '18px',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: `${meta.color}15`,
                          border: `1px solid ${meta.color}40`,
                          color: meta.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {meta.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: '14.5px',
                            fontWeight: 600,
                            letterSpacing: '-0.01em',
                            color: 'var(--mk-text-primary)',
                          }}
                        >
                          {meta.name}
                        </p>
                        <p
                          style={{
                            fontSize: '12px',
                            color: 'var(--mk-text-secondary)',
                            marginTop: '2px',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {meta.network}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => copyAddress(w.chain, w.address)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        color: isCopied ? 'var(--mk-success-text)' : 'var(--mk-accent-text)',
                        backgroundColor: isCopied ? 'var(--mk-success-bg)' : 'var(--mk-bg-tertiary)',
                        border: isCopied ? '1px solid var(--mk-success)' : '1px solid var(--mk-border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: '110px',
                      }}
                    >
                      {isCopied ? '✓ Copied' : 'Copy Address'}
                    </button>
                  </div>

                  {/* ADDRESS */}
                  <div
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'var(--mk-bg-primary)',
                      border: '1px solid var(--mk-border)',
                      borderRadius: '10px',
                      fontFamily: MONO,
                      fontSize: '13px',
                      color: 'var(--mk-text-secondary)',
                      wordBreak: 'break-all',
                      lineHeight: 1.55,
                    }}
                  >
                    {w.address}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* FOOTER HELP */}
        <div
          style={{
            marginTop: '32px',
            padding: '20px',
            backgroundColor: 'var(--mk-bg-secondary)',
            border: '1px solid var(--mk-border)',
            borderRadius: '14px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: 'var(--mk-text-secondary)',
              lineHeight: 1.65,
            }}
          >
            Need help with deposits?{' '}
            <a href="/support" style={{ color: 'var(--mk-accent-text)', fontWeight: 500 }}>
              Contact support
            </a>{' '}
            or check our{' '}
            <a href="/support" style={{ color: 'var(--mk-accent-text)', fontWeight: 500 }}>
              deposit guide
            </a>.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 20px',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.01em',
        color: active ? 'var(--mk-text-primary)' : 'var(--mk-text-secondary)',
        backgroundColor: active ? 'var(--mk-bg-tertiary)' : 'transparent',
        border: 'none',
        borderRadius: '7px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  )
}