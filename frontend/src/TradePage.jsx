import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getMyBalances,
  getToken,
  placeOrder,
  getMyOrders,
  cancelMyOrder,
  getMyTrades,
  closePosition,
  getMyPositions,
} from './api'
import useLivePrices from './useLivePrices'
import TradingViewChart from './TradingViewChart'
import AppLayout from './AppLayout'

const COIN_META = {
  BTC: { icon: '₿', color: '#f7931a' },
  ETH: { icon: 'Ξ', color: '#627eea' },
  BNB: { icon: 'B', color: '#f0b90b' },
  SOL: { icon: 'S', color: '#14f195' },
  XRP: { icon: 'X', color: '#23292f' },
  USDT: { icon: '₮', color: '#26a17b' },
}

const POPULAR_PAIRS = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT']
const TRADE_FEE = 0.001
const ALWAYS_SHOW_ASSETS = ['USDT', 'BTC', 'ETH', 'BNB', 'SOL', 'XRP']

const BYBIT_SYMBOL_MAP = {
  'BTC/USDT': 'BTCUSDT',
  'ETH/USDT': 'ETHUSDT',
  'BNB/USDT': 'BNBUSDT',
  'SOL/USDT': 'SOLUSDT',
  'XRP/USDT': 'XRPUSDT',
}

async function fetchOrderBook(pair) {
  const bybitSymbol = BYBIT_SYMBOL_MAP[pair]
  if (!bybitSymbol) return null

  try {
    const url = `https://api.bytick.com/v5/market/orderbook?category=spot&symbol=${bybitSymbol}&limit=25`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (data.retCode !== 0) return null

    const bids = (data.result?.b || []).map(([price, size]) => ({
      price: parseFloat(price),
      amount: parseFloat(size),
      total: parseFloat(price) * parseFloat(size),
    }))
    const asks = (data.result?.a || []).map(([price, size]) => ({
      price: parseFloat(price),
      amount: parseFloat(size),
      total: parseFloat(price) * parseFloat(size),
    }))

    const topBids = bids.slice(0, 10)
    const topAsks = asks.slice(0, 10).reverse()

    return { asks: topAsks, bids: topBids }
  } catch {
    return null
  }
}

const MONO = "'JetBrains Mono', ui-monospace, monospace"

export default function TradePage({ theme, setTheme }) {
  const navigate = useNavigate()
  const { prices } = useLivePrices()

  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPair, setSelectedPair] = useState('ETH/USDT')
  const [side, setSide] = useState('buy')
  const [orderType, setOrderType] = useState('limit')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [sliderValue, setSliderValue] = useState(0)
  const [toast, setToast] = useState(null)
  const [bottomTab, setBottomTab] = useState('balances')
  const [chartFullScreen, setChartFullScreen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  const [openOrders, setOpenOrders] = useState([])
  const [allOrders, setAllOrders] = useState([])
  const [tradeHistory, setTradeHistory] = useState([])
  const [positions, setPositions] = useState([])
  const [orderBook, setOrderBook] = useState({ asks: [], bids: [] })

  const baseAsset = selectedPair.split('/')[0]
  const quoteAsset = selectedPair.split('/')[1]

  useEffect(() => {
    function checkSize() {
      const w = window.innerWidth
      setIsMobile(w < 700)
      setIsTablet(w >= 700 && w < 1200)
    }
    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  function getLivePrice(symbol) {
    const found = prices.find((p) => p.symbol === symbol)
    return found ? found.price : 0
  }

  const livePrice = getLivePrice(baseAsset)
  const currentPrice = livePrice
  const currentChange = (() => {
    const found = prices.find((p) => p.symbol === baseAsset)
    return found ? found.change : 0
  })()
  const isPositive = currentChange >= 0

  function balanceFor(asset) {
    const b = balances.find((x) => x.asset === asset)
    return b ? parseFloat(b.available) : 0
  }

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const refreshBalances = useCallback(async () => {
    try {
      const data = await getMyBalances()
      setBalances(data)
    } catch (err) {
      showToast(err.message || 'Failed to load balances', 'error')
    }
  }, [])

  const refreshOrders = useCallback(async () => {
    try {
      const [pending, all] = await Promise.all([
        getMyOrders('pending'),
        getMyOrders(),
      ])
      setOpenOrders(pending)
      setAllOrders(all)
    } catch (err) {
      console.error('Failed to load orders:', err)
    }
  }, [])

  const refreshTrades = useCallback(async () => {
    try {
      const data = await getMyTrades()
      setTradeHistory(data)
    } catch (err) {
      console.error('Failed to load trades:', err)
    }
  }, [])

  const refreshPositions = useCallback(async () => {
    try {
      const data = await getMyPositions()
      setPositions(data)
    } catch (err) {
      console.error('Failed to load positions:', err)
    }
  }, [])

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshBalances(),
      refreshOrders(),
      refreshTrades(),
      refreshPositions(),
    ])
  }, [refreshBalances, refreshOrders, refreshTrades, refreshPositions])

  useEffect(() => {
    if (!getToken()) {
      navigate('/login')
      return
    }
    async function load() {
      setLoading(true)
      await refreshAll()
      setLoading(false)
    }
    load()
  }, [navigate, refreshAll])

  useEffect(() => {
    let mounted = true
    async function loadBook() {
      const book = await fetchOrderBook(selectedPair)
      if (mounted && book) {
        setOrderBook(book)
      }
    }
    loadBook()
    const interval = setInterval(loadBook, 2000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [selectedPair])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && chartFullScreen) setChartFullScreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [chartFullScreen])

  function handlePercent(percent) {
    setSliderValue(percent * 100)
    const available = side === 'buy' ? balanceFor(quoteAsset) : balanceFor(baseAsset)
    if (side === 'buy') {
      if (livePrice > 0) setAmount(((available * percent) / livePrice).toFixed(6))
    } else {
      setAmount((available * percent).toFixed(6))
    }
  }

  function handleSlider(e) {
    const v = parseFloat(e.target.value)
    setSliderValue(v)
    const available = side === 'buy' ? balanceFor(quoteAsset) : balanceFor(baseAsset)
    if (side === 'buy') {
      if (livePrice > 0) setAmount(((available * (v / 100)) / livePrice).toFixed(6))
    } else {
      setAmount(((available * v) / 100).toFixed(6))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return

    if (!amount || parseFloat(amount) <= 0) {
      showToast('Enter an amount', 'error')
      return
    }
    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      showToast('Enter a limit price', 'error')
      return
    }
    if (!livePrice || livePrice <= 0) {
      showToast('Waiting for live price...', 'error')
      return
    }

    const qty = parseFloat(amount)
    const fillPrice = orderType === 'limit' ? parseFloat(price) : livePrice

    setSubmitting(true)
    try {
      const result = await placeOrder({
        symbol: selectedPair,
        side,
        orderType,
        quantity: qty,
        price: orderType === 'limit' ? fillPrice : undefined,
        currentMarketPrice: livePrice,
      })

      showToast(
        result.status === 'filled'
          ? `Market order filled at $${fillPrice.toFixed(2)}`
          : `Limit order placed at $${fillPrice.toFixed(2)}`,
        'success'
      )

      setAmount('')
      setSliderValue(0)
      if (orderType === 'limit') setPrice('')

      await refreshAll()
      setBottomTab(orderType === 'market' ? 'balances' : 'openOrders')
    } catch (err) {
      showToast(err.message || 'Order failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancel(orderId) {
    try {
      await cancelMyOrder(orderId)
      showToast('Order cancelled', 'success')
      await refreshAll()
    } catch (err) {
      showToast(err.message || 'Failed to cancel', 'error')
    }
  }

  async function handleClosePosition(asset) {
    const markPrice = getLivePrice(asset)
    if (!markPrice || markPrice <= 0) {
      showToast('Live price not available', 'error')
      return
    }

    const pos = positions.find((p) => p.asset === asset)
    if (!pos) return
    const qty = parseFloat(pos.quantity)
    if (qty <= 0) return

    const confirmed = window.confirm(
      `Close your entire ${asset} position (${qty.toFixed(6)}) at market price $${markPrice.toFixed(2)}?`
    )
    if (!confirmed) return

    try {
      const result = await closePosition(asset, markPrice)
      showToast(
        `Closed ${asset} · Realized P&L: $${parseFloat(result.realized_pnl).toFixed(2)}`,
        'success'
      )
      await refreshAll()
      setBottomTab('tradeHistory')
    } catch (err) {
      showToast(err.message || 'Failed to close position', 'error')
    }
  }

  const estimate = amount && currentPrice ? (parseFloat(amount) * currentPrice).toFixed(2) : '0.00'
  const fee = amount && currentPrice ? (parseFloat(amount) * currentPrice * TRADE_FEE).toFixed(4) : '0.0000'
  const spread =
    orderBook.asks.length > 0 && orderBook.bids.length > 0
      ? (orderBook.asks[orderBook.asks.length - 1].price - orderBook.bids[0].price).toFixed(4)
      : '0.0000'

  const balancesView = (() => {
    const map = new Map()
    balances.forEach((b) => {
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
    return Array.from(map.values()).map((b) => ({
      ...b,
      quantity: b.available + b.locked,
    })).sort((a, b) => {
      if (a.asset === 'USDT') return -1
      if (b.asset === 'USDT') return 1
      return a.asset.localeCompare(b.asset)
    })
  })()

  // ============================
  // ORDER BOOK CARD (reused in all layouts)
  // ============================
  const orderBookCard = (
    <div style={{ backgroundColor: 'var(--mk-bg-secondary)', border: '1px solid var(--mk-border)', borderRadius: '14px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--mk-border)' }}>
        <span style={{ fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--mk-text-secondary)', textTransform: 'uppercase' }}>
          Order Book
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--mk-text-secondary)', textTransform: 'uppercase' }}>
        <div>Price</div>
        <div style={{ textAlign: 'right' }}>Amount</div>
        <div style={{ textAlign: 'right' }}>Total</div>
      </div>
      <div style={{ padding: '0 6px' }}>
        {orderBook.asks.map((ask, i) => (
          <OrderBookRow key={`a-${i}`} {...ask} side="ask" />
        ))}
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--mk-border)', borderBottom: '1px solid var(--mk-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(240,185,11,0.04)' }}>
        <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: MONO, color: isPositive ? 'var(--mk-success-text)' : 'var(--mk-danger-text)' }}>
          {currentPrice.toFixed(2)}
        </span>
        <span style={{ fontSize: '11.5px', color: 'var(--mk-text-secondary)' }}>Spread {spread}</span>
      </div>
      <div style={{ padding: '0 6px' }}>
        {orderBook.bids.map((bid, i) => (
          <OrderBookRow key={`b-${i}`} {...bid} side="bid" />
        ))}
      </div>
    </div>
  )

  // ============================
  // CHART CARD (reused)
  // ============================
  const chartCard = (
    <div style={{ backgroundColor: 'var(--mk-bg-secondary)', border: '1px solid var(--mk-border)', borderRadius: '14px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--mk-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--mk-text-secondary)', textTransform: 'uppercase' }}>Chart</span>
          <span style={{ fontSize: '12px', color: 'var(--mk-text-tertiary)' }}>Powered by TradingView</span>
        </div>
        <button
          onClick={() => setChartFullScreen(true)}
          style={{
            padding: '7px 16px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--mk-accent-text)',
            backgroundColor: 'rgba(240,185,11,0.12)',
            border: '1px solid rgba(240,185,11,0.25)',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          ⛶ Full Screen
        </button>
      </div>
      <div style={{ padding: '8px 4px 4px 4px' }}>
        <TradingViewChart pair={selectedPair} height={isMobile ? 340 : 520} theme={theme} />
      </div>
    </div>
  )

  // ============================
  // BUY/SELL PANEL CARD (reused)
  // ============================
  const orderFormCard = (
    <div style={{ backgroundColor: 'var(--mk-bg-secondary)', border: '1px solid var(--mk-border)', borderRadius: '14px', padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', padding: '5px', backgroundColor: 'var(--mk-bg-primary)', border: '1px solid var(--mk-border)', borderRadius: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setSide('buy')}
          style={{
            padding: '10px',
            fontSize: '13px',
            fontWeight: 700,
            color: side === 'buy' ? 'var(--mk-success-text)' : 'var(--mk-text-secondary)',
            backgroundColor: side === 'buy' ? 'var(--mk-success-bg)' : 'transparent',
            border: 'none',
            borderRadius: '7px',
            cursor: 'pointer',
          }}
        >
          BUY
        </button>
        <button
          onClick={() => setSide('sell')}
          style={{
            padding: '10px',
            fontSize: '13px',
            fontWeight: 700,
            color: side === 'sell' ? 'var(--mk-danger-text)' : 'var(--mk-text-secondary)',
            backgroundColor: side === 'sell' ? 'var(--mk-danger-bg)' : 'transparent',
            border: 'none',
            borderRadius: '7px',
            cursor: 'pointer',
          }}
        >
          SELL
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--mk-text-secondary)', marginBottom: '16px' }}>
        <span>Available</span>
        <span style={{ fontFamily: MONO, color: 'var(--mk-text-primary)' }}>
          {side === 'buy'
            ? `${balanceFor(quoteAsset).toFixed(2)} ${quoteAsset}`
            : `${balanceFor(baseAsset).toFixed(4)} ${baseAsset}`}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '18px' }}>
        {['limit', 'market'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setOrderType(t)}
            style={{
              padding: '5px 0',
              fontSize: '13px',
              fontWeight: 600,
              color: orderType === t ? 'var(--mk-accent-text)' : 'var(--mk-text-tertiary)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: orderType === t ? '2px solid var(--mk-accent)' : '2px solid transparent',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {orderType === 'limit' && (
          <div style={{ marginBottom: '14px' }}>
            <label className="mk-label" style={{ fontSize: '12.5px' }}>Price ({quoteAsset})</label>
            <input
              type="number"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mk-input"
              placeholder={currentPrice.toFixed(2)}
              style={{ fontFamily: MONO, fontSize: '14px', padding: '11px 14px' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label className="mk-label" style={{ fontSize: '12.5px' }}>Amount ({baseAsset})</label>
          <input
            type="number"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mk-input"
            placeholder="0.00"
            style={{ fontFamily: MONO, fontSize: '14px', padding: '11px 14px' }}
          />
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleSlider}
          style={{ width: '100%', marginBottom: '14px', accentColor: side === 'buy' ? 'var(--mk-success)' : 'var(--mk-danger)', cursor: 'pointer' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '18px' }}>
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePercent(p / 100)}
              style={{
                padding: '7px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--mk-text-secondary)',
                backgroundColor: 'var(--mk-bg-tertiary)',
                border: '1px solid var(--mk-border)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {p}%
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--mk-text-secondary)', marginBottom: '8px' }}>
          <span>Total</span>
          <span style={{ fontFamily: MONO, color: 'var(--mk-text-primary)' }}>{estimate} {quoteAsset}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--mk-text-secondary)', marginBottom: '20px' }}>
          <span>Fee (0.10%)</span>
          <span style={{ fontFamily: MONO }}>{fee} {quoteAsset}</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '14.5px',
            fontWeight: 700,
            color: '#fff',
            backgroundColor: side === 'buy' ? 'var(--mk-success)' : 'var(--mk-danger)',
            border: 'none',
            borderRadius: '10px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Placing...' : `${side === 'buy' ? 'Buy' : 'Sell'} ${baseAsset}`}
        </button>
      </form>
    </div>
  )

  return (
    <AppLayout activePage="Trade" theme={theme} setTheme={setTheme}>
      {loading && <div className="mk-progress-bar" />}

      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            backgroundColor:
              toast.type === 'error' ? 'var(--mk-danger)' : 'var(--mk-success)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: '10px',
            boxShadow: 'var(--mk-shadow-lg)',
          }}
        >
          {toast.message}
        </div>
      )}

      <div style={{ paddingTop: '8px' }}>
        {/* PAIR SELECTOR */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          {POPULAR_PAIRS.map((pair) => {
            const base = pair.split('/')[0]
            const meta = COIN_META[base] || { icon: '●', color: '#9ca3af' }
            const isActive = selectedPair === pair
            return (
              <button
                key={pair}
                onClick={() => setSelectedPair(pair)}
                style={{
                  padding: '9px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isActive ? 'var(--mk-text-on-accent)' : 'var(--mk-text-secondary)',
                  backgroundColor: isActive ? 'var(--mk-accent)' : 'var(--mk-bg-secondary)',
                  border: isActive ? '1px solid var(--mk-accent)' : '1px solid var(--mk-border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? 'rgba(0,0,0,0.15)' : `${meta.color}25`,
                    color: isActive ? 'var(--mk-text-on-accent)' : meta.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {meta.icon}
                </span>
                {pair}
              </button>
            )
          })}
        </div>

        {/* HEADER STRIP */}
        <div
          style={{
            padding: '16px 22px',
            backgroundColor: 'var(--mk-bg-secondary)',
            border: '1px solid var(--mk-border)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mk-text-primary)' }}>{selectedPair}</span>
            <span style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, fontFamily: MONO, color: isPositive ? 'var(--mk-success-text)' : 'var(--mk-danger-text)' }}>
              ${currentPrice.toFixed(2)}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: MONO, color: isPositive ? 'var(--mk-success-text)' : 'var(--mk-danger-text)' }}>
              {isPositive ? '+' : ''}{currentChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* MAIN LAYOUT — different per breakpoint */}
        {isMobile ? (
          // MOBILE: single column — chart, order form, order book
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
            {chartCard}
            {orderFormCard}
            {orderBookCard}
          </div>
        ) : isTablet ? (
          // TABLET: chart on top; order book + form side by side below
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
            {chartCard}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'flex-start' }}>
              {orderBookCard}
              {orderFormCard}
            </div>
          </div>
        ) : (
          // DESKTOP: three columns — order book, chart, form
          <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr) 350px', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
            {orderBookCard}
            {chartCard}
            {orderFormCard}
          </div>
        )}

        {/* BOTTOM TABS */}
        <div style={{ backgroundColor: 'var(--mk-bg-secondary)', border: '1px solid var(--mk-border)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: isMobile ? '14px' : '28px', padding: isMobile ? '14px 16px' : '18px 24px', borderBottom: '1px solid var(--mk-border)', flexWrap: 'wrap', overflowX: 'auto' }}>
            {[
              { id: 'balances', label: 'Balances', count: balancesView.length },
              { id: 'openOrders', label: 'Open Orders', count: openOrders.length },
              { id: 'orderHistory', label: 'Order History', count: allOrders.length },
              { id: 'tradeHistory', label: 'Trade History', count: tradeHistory.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setBottomTab(tab.id)}
                style={{
                  padding: '6px 0',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: 600,
                  color: bottomTab === tab.id ? 'var(--mk-accent-text)' : 'var(--mk-text-tertiary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: bottomTab === tab.id ? '2px solid var(--mk-accent)' : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
                <span
                  style={{
                    padding: '2px 8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    borderRadius: '10px',
                    color: bottomTab === tab.id ? 'var(--mk-text-on-accent)' : 'var(--mk-text-secondary)',
                    backgroundColor: bottomTab === tab.id ? 'var(--mk-accent)' : 'var(--mk-bg-tertiary)',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: isMobile ? '700px' : 'auto' }}>
              {bottomTab === 'balances' ? (
                balancesView.length === 0 ? (
                  <EmptyState icon="💼" title="No balances" description="Your asset holdings will appear here." />
                ) : (
                  <BalancesTable
                    balances={balancesView}
                    getLivePrice={getLivePrice}
                    onClose={handleClosePosition}
                    positions={positions}
                  />
                )
              ) : bottomTab === 'openOrders' ? (
                openOrders.length === 0 ? (
                  <EmptyState icon="📋" title="No open orders" description="Pending limit orders will appear here." />
                ) : (
                  <OrdersTable orders={openOrders} onCancel={handleCancel} showCancel />
                )
              ) : bottomTab === 'orderHistory' ? (
                allOrders.length === 0 ? (
                  <EmptyState icon="📜" title="No order history" description="Every order you place — filled, cancelled, or pending — will appear here." />
                ) : (
                  <OrdersTable orders={allOrders} onCancel={handleCancel} showCancel={false} />
                )
              ) : tradeHistory.length === 0 ? (
                <EmptyState icon="📊" title="No trades yet" description="Your executed buy and sell orders will appear here." />
              ) : (
                <TradesTable trades={tradeHistory} />
              )}
            </div>
          </div>
        </div>
      </div>

      {chartFullScreen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'var(--mk-bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--mk-text-primary)' }}>{selectedPair}</span>
              <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: MONO, color: isPositive ? 'var(--mk-success-text)' : 'var(--mk-danger-text)' }}>
                ${currentPrice.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => setChartFullScreen(false)}
              style={{
                padding: '9px 20px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--mk-text-primary)',
                backgroundColor: 'var(--mk-bg-secondary)',
                border: '1px solid var(--mk-border)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              ✕ Close (Esc)
            </button>
          </div>
          <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden' }}>
            <TradingViewChart pair={selectedPair} height="100%" theme={theme} />
          </div>
        </div>
      )}
    </AppLayout>
  )
}

// ============================================
// ORDER BOOK ROW
// ============================================
function OrderBookRow({ price, amount, total, side }) {
  const color = side === 'ask' ? 'var(--mk-danger-text)' : 'var(--mk-success-text)'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', padding: '4px 10px', fontSize: '12.5px', fontFamily: MONO }}>
      <span style={{ color }}>{price.toFixed(2)}</span>
      <span style={{ textAlign: 'right', color: 'var(--mk-text-secondary)' }}>{amount.toFixed(4)}</span>
      <span style={{ textAlign: 'right', color: 'var(--mk-text-tertiary)' }}>{total.toFixed(2)}</span>
    </div>
  )
}

// ============================================
// EMPTY STATE
// ============================================
function EmptyState({ icon, title, description }) {
  return (
    <div style={{ padding: '72px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.4 }}>{icon}</div>
      <p style={{ fontSize: '15.5px', fontWeight: 600, color: 'var(--mk-text-primary)', marginBottom: '8px' }}>{title}</p>
      <p style={{ fontSize: '13.5px', color: 'var(--mk-text-secondary)', maxWidth: '380px', margin: '0 auto', lineHeight: 1.6 }}>
        {description}
      </p>
    </div>
  )
}

// ============================================
// BALANCES TABLE
// ============================================
function BalancesTable({ balances, getLivePrice, onClose, positions }) {
  const cols = '1fr 1.2fr 1.2fr 1.2fr 1.4fr 120px'

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: cols,
          gap: '14px',
          padding: '14px 24px',
          fontSize: '11.5px',
          fontWeight: 600,
          color: 'var(--mk-text-secondary)',
          textTransform: 'uppercase',
          borderBottom: '1px solid var(--mk-border)',
        }}
      >
        <div>Asset</div>
        <div>Quantity</div>
        <div>Available</div>
        <div>In Order</div>
        <div style={{ textAlign: 'right' }}>Value (USD)</div>
        <div style={{ textAlign: 'right' }}>Action</div>
      </div>

      {balances.map((b) => {
        const price = b.asset === 'USDT' ? 1 : getLivePrice(b.asset)
        const value = b.quantity * price
        const hasPosition = positions.some(
          (p) => p.asset === b.asset && parseFloat(p.quantity) > 0
        )

        return (
          <div
            key={b.asset}
            style={{
              display: 'grid',
              gridTemplateColumns: cols,
              gap: '14px',
              padding: '18px 24px',
              fontSize: '14px',
              fontFamily: MONO,
              borderBottom: '1px solid var(--mk-border)',
              alignItems: 'center',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--mk-text-primary)', fontFamily: 'Inter, sans-serif' }}>{b.asset}</div>
            <div style={{ color: 'var(--mk-text-primary)' }}>{b.quantity.toFixed(8)}</div>
            <div style={{ color: 'var(--mk-text-secondary)' }}>{b.available.toFixed(8)}</div>
            <div style={{ color: b.locked > 0 ? 'var(--mk-accent-text)' : 'var(--mk-text-tertiary)' }}>
              {b.locked.toFixed(8)}
            </div>
            <div style={{ textAlign: 'right', color: 'var(--mk-text-primary)' }}>
              ${value.toFixed(2)}
            </div>
            <div style={{ textAlign: 'right' }}>
              {hasPosition && b.asset !== 'USDT' ? (
                <button
                  onClick={() => onClose(b.asset)}
                  style={{
                    padding: '8px 18px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    fontFamily: 'Inter, sans-serif',
                    color: 'var(--mk-text-on-danger)',
                    backgroundColor: 'var(--mk-danger)',
                    border: 'none',
                    borderRadius: '7px',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              ) : (
                <span style={{ color: 'var(--mk-text-tertiary)', fontSize: '12px' }}>—</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// ORDERS TABLE
// ============================================
function OrdersTable({ orders, onCancel, showCancel = false }) {
  const cols = showCancel
    ? '110px 1.4fr 0.8fr 0.9fr 1.1fr 1.1fr 1.1fr 1fr 100px'
    : '110px 1.4fr 0.8fr 0.9fr 1.1fr 1.1fr 1.1fr 1fr'

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: cols,
          gap: '14px',
          padding: '14px 24px',
          fontSize: '11.5px',
          fontWeight: 600,
          color: 'var(--mk-text-secondary)',
          textTransform: 'uppercase',
          borderBottom: '1px solid var(--mk-border)',
        }}
      >
        <div>Time</div>
        <div>Pair</div>
        <div>Side</div>
        <div>Type</div>
        <div>Price</div>
        <div>Amount</div>
        <div>Filled</div>
        <div>Status</div>
        {showCancel && <div style={{ textAlign: 'right' }}>Action</div>}
      </div>

      {orders.map((o) => {
        const time = new Date(o.created_at).toLocaleTimeString('en-US', { hour12: false })
        const statusColor =
          o.status === 'filled'
            ? 'var(--mk-success-text)'
            : o.status === 'cancelled'
            ? 'var(--mk-text-tertiary)'
            : 'var(--mk-accent-text)'

        return (
          <div
            key={o.id}
            style={{
              display: 'grid',
              gridTemplateColumns: cols,
              gap: '14px',
              padding: '16px 24px',
              fontSize: '13.5px',
              fontFamily: MONO,
              borderBottom: '1px solid var(--mk-border)',
              alignItems: 'center',
            }}
          >
            <div style={{ color: 'var(--mk-text-secondary)' }}>{time}</div>
            <div style={{ fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'var(--mk-text-primary)' }}>{o.symbol}</div>
            <div style={{ color: o.side === 'buy' ? 'var(--mk-success-text)' : 'var(--mk-danger-text)', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
              {o.side}
            </div>
            <div style={{ color: 'var(--mk-text-secondary)', textTransform: 'capitalize', fontFamily: 'Inter, sans-serif' }}>{o.order_type}</div>
            <div style={{ color: 'var(--mk-text-primary)' }}>{o.price ? parseFloat(o.price).toFixed(2) : 'Market'}</div>
            <div style={{ color: 'var(--mk-text-primary)' }}>{parseFloat(o.quantity).toFixed(6)}</div>
            <div style={{ color: 'var(--mk-text-secondary)' }}>{parseFloat(o.filled_quantity || 0).toFixed(6)}</div>
            <div style={{ color: statusColor, fontWeight: 600, textTransform: 'capitalize', fontSize: '12.5px', fontFamily: 'Inter, sans-serif' }}>
              {o.status}
            </div>
            {showCancel && (
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => onCancel(o.id)}
                  style={{
                    padding: '7px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                    color: 'var(--mk-danger-text)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--mk-danger)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// TRADES TABLE
// ============================================
function TradesTable({ trades }) {
  const cols = '110px 1.4fr 1fr 1.2fr 1.2fr 1.2fr 1.4fr'

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: cols,
          gap: '14px',
          padding: '14px 24px',
          fontSize: '11.5px',
          fontWeight: 600,
          color: 'var(--mk-text-secondary)',
          textTransform: 'uppercase',
          borderBottom: '1px solid var(--mk-border)',
        }}
      >
        <div>Time</div>
        <div>Pair</div>
        <div>Side</div>
        <div>Price</div>
        <div>Amount</div>
        <div style={{ textAlign: 'right' }}>Value</div>
        <div style={{ textAlign: 'right' }}>Realized P&amp;L</div>
      </div>

      {trades.map((t) => {
        const time = new Date(t.executed_at).toLocaleTimeString('en-US', { hour12: false })
        const pnl = parseFloat(t.realized_pnl || 0)
        const pnlPositive = pnl >= 0
        const isSell = t.side === 'sell'

        return (
          <div
            key={t.id}
            style={{
              display: 'grid',
              gridTemplateColumns: cols,
              gap: '14px',
              padding: '16px 24px',
              fontSize: '13.5px',
              fontFamily: MONO,
              borderBottom: '1px solid var(--mk-border)',
              alignItems: 'center',
            }}
          >
            <div style={{ color: 'var(--mk-text-secondary)' }}>{time}</div>
            <div style={{ fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'var(--mk-text-primary)' }}>{t.symbol}</div>
            <div style={{ color: t.side === 'buy' ? 'var(--mk-success-text)' : 'var(--mk-danger-text)', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
              {t.side}
            </div>
            <div style={{ color: 'var(--mk-text-primary)' }}>{parseFloat(t.price).toFixed(2)}</div>
            <div style={{ color: 'var(--mk-text-primary)' }}>{parseFloat(t.quantity).toFixed(6)}</div>
            <div style={{ textAlign: 'right', color: 'var(--mk-text-primary)' }}>{parseFloat(t.total_value).toFixed(2)}</div>
            <div
              style={{
                textAlign: 'right',
                color: isSell ? (pnlPositive ? 'var(--mk-success-text)' : 'var(--mk-danger-text)') : 'var(--mk-text-tertiary)',
                fontWeight: isSell ? 700 : 400,
              }}
            >
              {isSell ? `${pnlPositive ? '+' : ''}$${pnl.toFixed(2)}` : '—'}
            </div>
          </div>
        )
      })}
    </div>
  )
}