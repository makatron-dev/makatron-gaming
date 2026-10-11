import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  adminListUsers,
  adminStats,
  adminFreezeUser,
  adminUnfreezeUser,
  adminCreditUser,
  getToken,
  getMyProfile,
} from './api'
import AppLayout from './AppLayout'

// ============================================
// MAIN ADMIN PAGE
// ============================================
export default function AdminPage() {
  const navigate = useNavigate()

  const [checkingAccess, setCheckingAccess] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [creditModal, setCreditModal] = useState(null)

  // -------- LOAD EVERYTHING --------
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

  // -------- ACCESS DENIED — silently redirect --------
  if (!checkingAccess && !isAdmin) {
    navigate('/dashboard', { replace: true })
    return null
  }

  // -------- LOADING --------
  if (checkingAccess || loading) {
    return (
      <AppLayout activePage="Admin">
        <div className="mk-progress-bar" />
        <div style={{ paddingTop: '8px' }}>
          <div className="mk-skeleton" style={{ width: '200px', height: '32px', marginBottom: '12px' }} />
          <div className="mk-skeleton" style={{ width: '320px', height: '16px', marginBottom: '32px' }} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}>
            {[1, 2, 3, 4].map((i) => (
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

  // -------- FILTERED USERS --------
  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalFrozen = users.filter((u) => !u.is_active).length
  const totalAdmins = users.filter((u) => u.is_admin).length

  return (
    <AppLayout activePage="Admin">
      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '12px 20px',
          backgroundColor: toast.type === 'error'
            ? 'rgba(246,70,93,0.95)'
            : 'rgba(14,203,129,0.95)',
          color: '#fff',
          fontSize: '13.5px',
          fontWeight: 600,
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ paddingTop: '8px' }}>
        {/* HEADING */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '26px',
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

        {/* ERROR */}
        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '12px 16px',
            backgroundColor: 'rgba(246,70,93,0.12)',
            border: '1px solid rgba(246,70,93,0.3)',
            borderRadius: '10px',
            color: 'var(--mk-danger)',
            fontSize: '13.5px',
          }}>
            {error}
          </div>
        )}

        {/* STATS GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <StatCard label="Total Users" value={users.length} icon="👥" accent="rgba(240,185,11,0.12)" accentColor="#f0b90b" />
          <StatCard label="Admin Accounts" value={totalAdmins} icon="👑" accent="rgba(155,89,182,0.12)" accentColor="#9b59b6" />
          <StatCard label="Active Accounts" value={users.length - totalFrozen} icon="✓" accent="rgba(14,203,129,0.12)" accentColor="#0ecb81" />
          <StatCard label="Frozen Accounts" value={totalFrozen} icon="⊘" accent="rgba(246,70,93,0.12)" accentColor="#f6465d" />
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
          <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '420px' }}>
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
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 2fr 90px 100px 90px 1fr 1fr 1fr 140px',
            gap: '12px',
            padding: '14px 20px',
            backgroundColor: 'var(--mk-bg-tertiary)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--mk-text-tertiary)',
          }}>
            <div>ID</div>
            <div>Email</div>
            <div>Status</div>
            <div>Role</div>
            <div>Joined</div>
            <div style={{ textAlign: 'right' }}>BTC</div>
            <div style={{ textAlign: 'right' }}>ETH</div>
            <div style={{ textAlign: 'right' }}>USDT</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {/* Table body */}
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
              const balanceFor = (asset) => {
                const b = u.balances.find((x) => x.asset === asset)
                return b ? parseFloat(b.available).toFixed(4) : '0.0000'
              }
              const joined = u.created_at
                ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—'

              return (
                <div
                  key={u.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 2fr 90px 100px 90px 1fr 1fr 1fr 140px',
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
                  <div style={{ color: 'var(--mk-text-tertiary)', fontFamily: 'monospace' }}>
                    #{u.id}
                  </div>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.email}
                  </div>
                  <div>
                    <span style={{
                      padding: '3px 9px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      color: u.is_active ? '#0ecb81' : '#f6465d',
                      backgroundColor: u.is_active ? 'rgba(14,203,129,0.12)' : 'rgba(246,70,93,0.12)',
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
                        color: '#f0b90b',
                        backgroundColor: 'rgba(240,185,11,0.12)',
                      }}>
                        Admin
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--mk-text-tertiary)' }}>User</span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--mk-text-tertiary)' }}>
                    {joined}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--mk-text-secondary)' }}>
                    {balanceFor('BTC')}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--mk-text-secondary)' }}>
                    {balanceFor('ETH')}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--mk-text-secondary)' }}>
                    {balanceFor('USDT')}
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setCreditModal(u)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        color: 'var(--mk-accent)',
                        backgroundColor: 'var(--mk-bg-tertiary)',
                        border: '1px solid var(--mk-border)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      Credit
                    </button>
                    <button
                      onClick={() => handleFreezeToggle(u)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        color: u.is_active ? 'var(--mk-danger)' : '#0ecb81',
                        backgroundColor: 'var(--mk-bg-tertiary)',
                        border: '1px solid var(--mk-border)',
                        borderRadius: '6px',
                        cursor: 'pointer',
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
              color: 'var(--mk-text-tertiary)',
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
                    <p style={{ fontSize: '11px', color: 'var(--mk-text-tertiary)', letterSpacing: '0.06em' }}>
                      {asset} HELD
                    </p>
                    <p style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'monospace', marginTop: '4px' }}>
                      {parseFloat(total).toFixed(4)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* CREDIT MODAL */}
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
    </AppLayout>
  )
}

// ============================================
// STAT CARD
// ============================================
function StatCard({ label, value, icon, accent, accentColor }) {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'var(--mk-bg-secondary)',
      border: '1px solid var(--mk-border)',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
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
      <div>
        <p style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--mk-text-tertiary)',
          marginBottom: '4px',
        }}>
          {label}
        </p>
        <p style={{
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--mk-text-primary)',
          lineHeight: 1.1,
        }}>
          {value}
        </p>
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
        backgroundColor: 'rgba(0,0,0,0.75)',
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