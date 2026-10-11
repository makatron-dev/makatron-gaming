import { useState, useEffect } from 'react'

// ============================================
// LIVE PRICES HOOK — Real prices from Bybit
// ============================================

const BYBIT_BASE = 'https://api.bytick.com'

const WANTED_PAIRS = [
  { bybit: 'BTCUSDT', symbol: 'BTC', name: 'Bitcoin' },
  { bybit: 'ETHUSDT', symbol: 'ETH', name: 'Ethereum' },
  { bybit: 'SOLUSDT', symbol: 'SOL', name: 'Solana' },
  { bybit: 'XRPUSDT', symbol: 'XRP', name: 'Ripple' },
  { bybit: 'BNBUSDT', symbol: 'BNB', name: 'BNB' },
  { bybit: 'DOGEUSDT', symbol: 'DOGE', name: 'Dogecoin' },
  { bybit: 'ADAUSDT', symbol: 'ADA', name: 'Cardano' },
  { bybit: 'MATICUSDT', symbol: 'MATIC', name: 'Polygon' },
  { bybit: 'DOTUSDT', symbol: 'DOT', name: 'Polkadot' },
  { bybit: 'LINKUSDT', symbol: 'LINK', name: 'Chainlink' },
  { bybit: 'AVAXUSDT', symbol: 'AVAX', name: 'Avalanche' },
  { bybit: 'TRXUSDT', symbol: 'TRX', name: 'TRON' },
  { bybit: 'LTCUSDT', symbol: 'LTC', name: 'Litecoin' },
  { bybit: 'ATOMUSDT', symbol: 'ATOM', name: 'Cosmos' },
  { bybit: 'UNIUSDT', symbol: 'UNI', name: 'Uniswap' },
  { bybit: null, symbol: 'USDT', name: 'Tether', fixedPrice: 1.0 },
]

const CACHE_MS = 20_000
let cache = { prices: null, fetchedAt: 0 }

async function fetchAllPrices() {
  const url = `${BYBIT_BASE}/v5/market/tickers?category=spot`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch prices')
  const data = await res.json()
  if (data.retCode !== 0) throw new Error(data.retMsg || 'Bybit error')

  const tickers = data.result?.list || []
  const bySymbol = {}
  tickers.forEach((t) => {
    bySymbol[t.symbol] = t
  })

  const prices = WANTED_PAIRS.map(({ bybit, symbol, name, fixedPrice }) => {
    if (fixedPrice !== undefined) {
      return { symbol, name, price: fixedPrice, change: 0 }
    }
    const t = bySymbol[bybit]
    if (!t) {
      return { symbol, name, price: 0, change: 0 }
    }
    return {
      symbol,
      name,
      price: parseFloat(t.lastPrice),
      change: parseFloat(t.price24hPcnt) * 100,
    }
  }).filter((p) => p.price > 0)

  return prices
}

export default function useLivePrices() {
  const [prices, setPrices] = useState(cache.prices || [])
  const [loading, setLoading] = useState(!cache.prices)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const now = Date.now()
        if (cache.prices && now - cache.fetchedAt < CACHE_MS) {
          if (mounted) {
            setPrices(cache.prices)
            setLoading(false)
          }
          return
        }

        const fresh = await fetchAllPrices()
        cache = { prices: fresh, fetchedAt: now }

        if (mounted) {
          setPrices(fresh)
          setError(null)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load prices')
          setLoading(false)
        }
      }
    }

    load()
    const interval = setInterval(load, CACHE_MS)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return { prices, loading, error }
}