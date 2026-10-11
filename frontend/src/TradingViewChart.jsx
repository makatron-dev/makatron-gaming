import { useEffect, useRef } from 'react'

function mapToTradingViewSymbol(pair) {
  const base = pair.split('/')[0]
  const quote = pair.split('/')[1] || 'USDT'
  return `BINANCE:${base}${quote}`
}

export default function TradingViewChart({ pair = 'ETH/USDT', height = 480, theme = 'dark' }) {
  const containerRef = useRef(null)
  const containerId = 'tv_chart_container'

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''
    const uniqueId = `${containerId}_${Date.now()}`

    const innerDiv = document.createElement('div')
    innerDiv.id = uniqueId
    innerDiv.style.width = '100%'
    innerDiv.style.height = '100%'
    containerRef.current.appendChild(innerDiv)

    const isDark = theme === 'dark'

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      // eslint-disable-next-line no-undef
      if (typeof TradingView !== 'undefined') {
        // eslint-disable-next-line no-new, no-undef
        new TradingView.widget({
          container_id: uniqueId,
          autosize: true,
          symbol: mapToTradingViewSymbol(pair),
          interval: '1',
          timezone: 'Etc/UTC',
          theme: isDark ? 'dark' : 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: isDark ? '#0a0b0d' : '#f7f8fa',
          enable_publishing: false,
          hide_side_toolbar: false,
          hide_top_toolbar: false,
          allow_symbol_change: true,
          withdateranges: true,
          details: false,
          save_image: false,
          studies: [],
          overrides: {
            'mainSeriesProperties.candleStyle.upColor': '#0ecb81',
            'mainSeriesProperties.candleStyle.downColor': '#f6465d',
            'mainSeriesProperties.candleStyle.borderUpColor': '#0ecb81',
            'mainSeriesProperties.candleStyle.borderDownColor': '#f6465d',
            'mainSeriesProperties.candleStyle.wickUpColor': '#0ecb81',
            'mainSeriesProperties.candleStyle.wickDownColor': '#f6465d',
            'paneProperties.background': isDark ? '#0a0b0d' : '#ffffff',
            'paneProperties.backgroundType': 'solid',
            'paneProperties.vertGridProperties.color': isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)',
            'paneProperties.horzGridProperties.color': isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)',
            'scalesProperties.textColor': isDark ? '#9ca3af' : '#4b5563',
            'scalesProperties.lineColor': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
          },
        })
      }
    }
    document.head.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [pair, theme])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: theme === 'dark' ? '#0a0b0d' : '#ffffff',
      }}
    />
  )
}