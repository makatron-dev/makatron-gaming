import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  adminListUsers,
  adminStats,
  adminFreezeUser,
  adminUnfreezeUser,
  adminCreditUser,
  adminDebitUser,
  getToken,
  getMyProfile,
} from './api'
import useLivePrices from './useLivePrices'
import AppLayout from './AppLayout'

const MONO = "'JetBrains Mono', ui-monospace, monospace"

const TABLE_COLS = '50px minmax(180px, 2fr) 90px 80px 110px 130px 320px'

const ALWAYS_SHOW_ASSETS = ['USDT', 'BTC', 'ETH', 'BNB', 'SOL', 'XRP']

export default function AdminPage({ theme, setTheme }) {
  const navigate = useNavigate()
  const { prices } = useLivePrices()

  const [checkingAccess, setCheckingAccess] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [creditModal, setCreditModal] = useState(null)
  const [debitModal, setDebitModal] = useState(null)
  const [portfolioModal, setPortfolioModal] = useState(null)
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

    async function bootstrap() {
      try {
        const me = await getMyProfile()
        if (!me.is_admin) {
          setIsAdmin(false)
          setCheckingAccess(false)
          setLoading(false)
          return
        }
        setIsAdmin(true)

        const [usersData, statsData] = await Promise.all([
          adminListUsers(),
          adminStats(),
        ])
        setUsers(usersData)
        setStats(statsData)
      } catch (err) {
        setError(err.message || 'Failed to load admin data')
      } finally {
        setCheckingAccess(false)
        setLoading(false)
      }
    }
    bootstrap()
  }, [navigate])

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function refresh() {
    try {
      const [usersData, statsData] = await Promise.all([
        adminListUsers(),
        adminStats(),
      ])
      setUsers(usersData)
      setStats(statsData)
    } catch (err) {
      showToast(err.message || 'Refresh failed', 'error')
    }
  }

  async function handleFreezeToggle(user) {
    try {
      if (user.is_active) {
        await adminFreezeUser(user.id)
        showToast(`Froze ${user.email}`, 'success')
      } else {
        await adminUnfreezeUser(user.id)
        showToast(`Unfroze ${user.email}`, 'success')
      }
      refresh()
    } catch (err) {
      showToast(err.message || 'Action failed', 'error')
    }
  }

  function priceFor(asset) {
    if (asset === 'USDT') return 1
    const found = prices.find((p) => p.symbol === asset)
    return found ? found.price : 0
  }

  function userTotalUsd(user) {
    if (!user.balances) return 0
    return user.balances.reduce((sum, b) => {
      const qty = parseFloat(b.available) || 0
      const locked = parseFloat(b.locked) || 0
      return sum + (qty + locked) * priceFor(b.asset)
    }, 0)
  }

  const platformAum = users.reduce((sum, u) => sum + userTotalUsd(u), 0)

  if (!checkingAccess && !isAdmin) {
    navigate('/dashboard', { replace: true })
    return null
  }

  if (checkingAccess || loading) {
    return (
      <AppLayout activePage="Admin" theme={theme} setTheme={setTheme}>
        <div className="mk-progress-bar" />
        <div style={{ paddingTop: '8px' }}>
          <div className="mk-skeleton" style={{ width: '200px', height: '32px', marginBottom: '12px' }} />
          <div className="mk-skeleton" style={{ width: '320px', height: '16px', marginBottom: '32px' }} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{
                padding: '20px',
                backgroundColor: 'var(--mk-bg-secondary)',
                border: '1px solid var(--mk-border)',
                borderRadius: '14px',
              }}>
                <div className="mk-skeleton" style={{ width: '80px', height: '12px', marginBottom: '12px' }} />
                <div className="mk-skeleton" style={{ width: '60px', height: '28px' }} />
              </div>
            ))}
          </div>

          <div className="mk-skeleton" style={{ width: '100%', height: '60px', marginBottom: '16px', borderRadius: '14px' }} />
          <div className="mk-skeleton" style={{ width: '100%', height: '400px', borderRadius: '14px' }} />
        </div>
      </AppLayout>
    )
  }

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalFrozen = users.filter((u) => !u.is_active).length
  const totalAdmins = users.filter((u) => u.is_admin).length

  return (
    <AppLayout activePage="Admin" theme={theme} setTheme={setTheme}>
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '12px 20px',
          backgroundColor: toast.type === 'error'
            ? 'var(--mk-danger)'
            : 'var(--mk-success)',
          color: '#ffffff',
          fontSize: '13.5px',
          fontWeight: 600,
          borderRadius: '10px',
          boxShadow: 'var(--mk-shadow-lg)',
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ paddingTop: '8px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: isMobile ? '22px' : '26px',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: 'var(--mk-text-primary)',
          }}>
            Admin Panel
          </h1>
          <p style={{
            marginTop: '6px',
            fontSize: '14px',
            color: 'var(--mk-text-secondary)',
          }}>
            Manage users, balances, and platform activity
          </p>
        </div>

        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '12px 16px',
            backgroundColor: 'var(--mk-danger-bg)',
            border: '1px solid var(--mk-danger)',
            borderRadius: '10px',
            color: 'var(--mk-danger-text)',
            fontSize: '13.5px',
          }}>
            {error}
          </div>
        )}

        {/* STATS GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(auto-fit, minmax(160px, 1fr))'
            : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <StatCard label="Total Users" value={users.length} icon="👥" accent="rgba(240,185,11,0.12)" accentColor="#f0b90b" />
          <StatCard label="Admin Accounts" value={totalAdmins} icon="👑" accent="rgba(155,89,182,0.12)" accentColor="#9b59b6" />
          <StatCard label="Active Accounts" value={users.length - totalFrozen} icon="✓" accent="var(--mk-success-bg)" accentColor="var(--mk-success)" />
          <StatCard label="Frozen Accounts" value={totalFrozen} icon="⊘" accent="var(--mk-danger-bg)" accentColor="var(--mk-danger)" />
          <StatCard
            label="Platform AUM"
            value={`$${platformAum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon="💎"
            accent="rgba(96,165,250,0.12)"
            accentColor="#60a5fa"
            compact
          />
        </div>

        {/* SEARCH BAR */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '18px',
          flexWrap: 'wrap',
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '420px' }}>
            <input
              type="text"
              placeholder="Search users by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mk-input"
              style={{ paddingLeft: '38px' }}
            />
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--mk-text-tertiary)',
              fontSize: '14px',
              pointerEvents: 'none',
            }}>
              ⌕
            </span>
          </div>

          <div style={{
            fontSize: '13px',
            color: 'var(--mk-text-secondary)',
            fontWeight: 500,
          }}>
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
          </div>
        </div>

        {/* USERS TABLE */}
        <div style={{
          backgroundColor: 'var(--mk-bg-secondary)',
          border: '1px solid var(--mk-border)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: '1000px' }}>
              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: TABLE_COLS,
                gap: '12px',
                padding: '14px 20px',
                backgroundColor: 'var(--mk-bg-tertiary)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--mk-text-secondary)',
              }}>
                <div>ID</div>
                <div>Email</div>
                <div>Status</div>
                <div>Role</div>
                <div>Joined</div>
                <div style={{ textAlign: 'right' }}>Total (USD)</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
              </div>

              {/* Body */}
              {filteredUsers.length === 0 ? (
                <div style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  fontSize: '13.5px',
                  color: 'var(--mk-text-tertiary)',
                }}>
                  No users match your search.
                </div>
              ) : (
                filteredUsers.map((u, idx) => {
                  const joined = u.created_at
                    ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—'

                  return (
                    <div
                      key={u.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: TABLE_COLS,
                        gap: '12px',
                        padding: '16px 20px',
                        borderTop: idx === 0 ? 'none' : '1px solid var(--mk-border)',
                        alignItems: 'center',
                        fontSize: '13px',
                        color: 'var(--mk-text-primary)',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--mk-bg-tertiary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ color: 'var(--mk-text-secondary)', fontFamily: MONO }}>
                        #{u.id}
                      </div>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--mk-text-primary)' }}>
                        {u.email}
                      </div>
                      <div>
                        <span style={{
                          padding: '3px 9px',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: 600,
                          letterSpacing: '0.02em',
                          color: u.is_active ? 'var(--mk-success-text)' : 'var(--mk-danger-text)',
                          backgroundColor: u.is_active ? 'var(--mk-success-bg)' : 'var(--mk-danger-bg)',
                        }}>
                          {u.is_active ? 'Active' : 'Frozen'}
                        </span>
                      </div>
                      <div>
                        {u.is_admin ? (
                          <span style={{
                            padding: '3px 9px',
                            borderRadius: '5px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--mk-accent-text)',
                            backgroundColor: 'rgba(240,185,11,0.15)',
                          }}>
                            Admin
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--mk-text-secondary)' }}>User</span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--mk-text-secondary)' }}>
                        {joined}
                      </div>
                      <div style={{
                        textAlign: 'right',
                        fontFamily: MONO,
                        fontSize: '13px',
                        color: 'var(--mk-text-primary)',
                        fontWeight: 600,
                      }}>
                        ${userTotalUsd(u).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                        <button
                          onClick={() => setPortfolioModal(u)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            color: 'var(--mk-text-on-accent)',
                            backgroundColor: 'var(--mk-accent)',
                            border: '1px solid var(--mk-accent)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => setCreditModal(u)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            color: 'var(--mk-accent-text)',
                            backgroundColor: 'var(--mk-bg-tertiary)',
                            border: '1px solid var(--mk-border)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Credit
                        </button>
                        <button
                          onClick={() => setDebitModal(u)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            color: 'var(--mk-danger-text)',
                            backgroundColor: 'var(--mk-bg-tertiary)',
                            border: '1px solid var(--mk-border)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Debit
                        </button>
                        <button
                          onClick={() => handleFreezeToggle(u)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            color: u.is_active ? 'var(--mk-danger-text)' : 'var(--mk-success-text)',
                            backgroundColor: 'var(--mk-bg-tertiary)',
                            border: '1px solid var(--mk-border)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {u.is_active ? 'Freeze' : 'Unfreeze'}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* PLATFORM STATS */}
        {stats && (
          <div style={{
            marginTop: '28px',
            padding: '20px 24px',
            backgroundColor: 'var(--mk-bg-secondary)',
            border: '1px solid var(--mk-border)',
            borderRadius: '14px',
          }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.16em',
              color: 'var(--mk-text-secondary)',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}>
              Platform Totals
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '20px',
            }}>
              {stats.total_balances &&
                Object.entries(stats.total_balances).map(([asset, total]) => (
                  <div key={asset}>
                    <p style={{ fontSize: '11px', color: 'var(--mk-text-secondary)', letterSpacing: '0.06em' }}>
                      {asset} HELD
                    </p>
                    <p style={{ fontSize: '16px', fontWeight: 600, fontFamily: MONO, marginTop: '4px', color: 'var(--mk-text-primary)' }}>
                      {parseFloat(total).toFixed(4)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {portfolioModal && (
        <PortfolioModal
          user={portfolioModal}
          prices={prices}
          priceFor={priceFor}
          userTotalUsd={userTotalUsd}
          onClose={() => setPortfolioModal(null)}
        />
      )}

      {creditModal && (
        <CreditModal
          user={creditModal}
          onClose={() => setCreditModal(null)}
          onSuccess={(msg) => {
            showToast(msg, 'success')
            setCreditModal(null)
            refresh()
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {debitModal && (
        <DebitModal
          user={debitModal}
          onClose={() => setDebitModal(null)}
          onSuccess={(msg) => {
            showToast(msg, 'success')
            setDebitModal(null)
            refresh()
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
    </AppLayout>
  )
}

// ============================================
// STAT CARD
// ============================================
function StatCard({ label, value, icon, accent, accentColor, compact }) {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'var(--mk-bg-secondary)',
      border: '1px solid var(--mk-border)',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      minWidth: 0,
    }}>
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '10px',
        backgroundColor: accent,
        color: accentColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--mk-text-secondary)',
          marginBottom: '4px',
        }}>
          {label}
        </p>
        <p style={{
          fontSize: compact ? '16px' : '22px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--mk-text-primary)',
          lineHeight: 1.15,
          fontFamily: MONO,
          wordBreak: 'break-all',
          overflowWrap: 'anywhere',
        }}>
          {value}
        </p>
      </div>
    </div>
  )
}

// ============================================
// PORTFOLIO MODAL
// ============================================
function PortfolioModal({ user, priceFor, userTotalUsd, onClose }) {
  const map = new Map()
  ;(user.balances || []).forEach((b) => {
    map.set(b.asset, {
      asset: b.asset,
      available: parseFloat(b.available) || 0,
      locked: parseFloat(b.locked) || 0,
    })
  })
  ALWAYS_SHOW_ASSETS.forEach((a) => {
    if (!map.has(a)) {
      map.set(a, { asset: a, available: 0, locked: 0 })
    }
  })

  const rows = Array.from(map.values())
    .map((b) => ({
      ...b,
      quantity: b.available + b.locked,
      price: priceFor(b.asset),
      value: (b.available + b.locked) * priceFor(b.asset),
    }))
    .sort((a, b) => {
      if (b.value !== a.value) return b.value - a.value
      return a.asset.localeCompare(b.asset)
    })

  const totalValue = userTotalUsd(user)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--mk-overlay)',
        backdropFilter: 'blur(4px)',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--mk-bg-secondary)',
          border: '1px solid var(--mk-border)',
          borderRadius: '16px',
          padding: '28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--mk-text-primary)',
              marginBottom: '4px',
            }}>
              Portfolio
            </h3>
            <p style={{
              fontSize: '13px',
              color: 'var(--mk-text-secondary)',
            }}>
              {user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--mk-bg-tertiary)',
              border: '1px solid var(--mk-border)',
              color: 'var(--mk-text-primary)',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          border: '1px solid var(--mk-border)',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 1fr 1.2fr',
            gap: '12px',
            padding: '12px 18px',
            backgroundColor: 'var(--mk-bg-tertiary)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--mk-text-secondary)',
          }}>
            <div>Asset</div>
            <div style={{ textAlign: 'right' }}>Available</div>
            <div style={{ textAlign: 'right' }}>Locked</div>
            <div style={{ textAlign: 'right' }}>Value (USD)</div>
          </div>

          {rows.map((b, idx) => (
            <div
              key={b.asset}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 1fr 1.2fr',
                gap: '12px',
                padding: '14px 18px',
                borderTop: idx === 0 ? 'none' : '1px solid var(--mk-border)',
                alignItems: 'center',
                fontSize: '13px',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--mk-text-primary)' }}>
                {b.asset}
              </div>
              <div style={{ textAlign: 'right', fontFamily: MONO, color: 'var(--mk-text-primary)' }}>
                {b.available.toFixed(8)}
              </div>
              <div style={{ textAlign: 'right', fontFamily: MONO, color: b.locked > 0 ? 'var(--mk-accent-text)' : 'var(--mk-text-tertiary)' }}>
                {b.locked.toFixed(8)}
              </div>
              <div style={{
                textAlign: 'right',
                fontFamily: MONO,
                color: b.value > 0 ? 'var(--mk-text-primary)' : 'var(--mk-text-tertiary)',
                fontWeight: b.value > 0 ? 600 : 400,
              }}>
                ${b.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 20px',
          backgroundColor: 'var(--mk-bg-tertiary)',
          border: '1px solid var(--mk-border)',
          borderRadius: '12px',
        }}>
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--mk-text-secondary)',
          }}>
            Total Portfolio Value
          </span>
          <span style={{
            fontSize: '22px',
            fontWeight: 700,
            fontFamily: MONO,
            color: 'var(--mk-text-primary)',
          }}>
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// CREDIT MODAL
// ============================================
function CreditModal({ user, onClose, onSuccess, onError }) {
  const [asset, setAsset] = useState('USDT')
  const [amount, setAmount] = useState('100')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await adminCreditUser(user.id, asset, amount)
      onSuccess(res.message || `Credited ${amount} ${asset}`)
    } catch (err) {
      onError(err.message || 'Credit failed')
      setSubmitting(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--mk-overlay)',
        backdropFilter: 'blur(4px)',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--mk-bg-secondary)',
          border: '1px solid var(--mk-border)',
          borderRadius: '16px',
          padding: '28px',
        }}
      >
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--mk-text-primary)',
          marginBottom: '4px',
        }}>
          Credit User Balance
        </h3>
        <p style={{
          fontSize: '13px',
          color: 'var(--mk-text-secondary)',
          marginBottom: '24px',
        }}>
          Add funds to {user.email}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label className="mk-label">Asset</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="mk-input"
              style={{ cursor: 'pointer' }}
            >
              <option value="BTC">BTC — Bitcoin</option>
              <option value="ETH">ETH — Ethereum</option>
              <option value="USDT">USDT — Tether</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="mk-label">Amount</label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mk-input"
              placeholder="100"
              style={{ fontFamily: MONO }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="mk-btn-secondary"
              style={{ fontSize: '13.5px' }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="mk-btn-primary"
              style={{ fontSize: '13.5px' }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="mk-spinner" />
                  <span>Crediting...</span>
                </>
              ) : (
                'Credit Balance'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================
// DEBIT MODAL
// ============================================
function DebitModal({ user, onClose, onSuccess, onError }) {
  const [asset, setAsset] = useState('USDT')
  const [amount, setAmount] = useState('100')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await adminDebitUser(user.id, asset, amount)
      onSuccess(res.message || `Debited ${amount} ${asset}`)
    } catch (err) {
      onError(err.message || 'Debit failed')
      setSubmitting(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--mk-overlay)',
        backdropFilter: 'blur(4px)',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--mk-bg-secondary)',
          border: '1px solid var(--mk-border)',
          borderRadius: '16px',
          padding: '28px',
        }}
      >
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--mk-text-primary)',
          marginBottom: '4px',
        }}>
          Debit User Balance
        </h3>
        <p style={{
          fontSize: '13px',
          color: 'var(--mk-text-secondary)',
          marginBottom: '24px',
        }}>
          Remove funds from {user.email}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label className="mk-label">Asset</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="mk-input"
              style={{ cursor: 'pointer' }}
            >
              <option value="BTC">BTC — Bitcoin</option>
              <option value="ETH">ETH — Ethereum</option>
              <option value="USDT">USDT — Tether</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="mk-label">Amount</label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mk-input"
              placeholder="100"
              style={{ fontFamily: MONO }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="mk-btn-secondary"
              style={{ fontSize: '13.5px' }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="mk-btn-primary"
              style={{
                fontSize: '13.5px',
                backgroundColor: 'var(--mk-danger)',
                color: 'var(--mk-text-on-danger)',
              }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="mk-spinner" />
                  <span>Debiting...</span>
                </>
              ) : (
                'Debit Balance'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}