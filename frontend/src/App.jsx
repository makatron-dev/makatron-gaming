import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HomePage from './HomePage'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import DashboardPage from './DashboardPage'
import WalletPage from './WalletPage'
import TradePage from './TradePage'
import AdminPage from './AdminPage'
import './index.css'

function ContestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-2xl">
      Contest — Coming Soon
    </div>
  )
}

function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ gap: '20px' }}
    >
      <h1 style={{ fontSize: '48px', fontWeight: 700 }}>404</h1>
      <p style={{ fontSize: '16px', opacity: 0.7 }}>
        Page not found: {window.location.pathname}
      </p>
      <a
        href="/"
        className="mk-btn-primary"
        style={{ width: 'auto', padding: '12px 24px' }}
      >
        Go to Home
      </a>
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mk_theme') || 'dark'
  })

  useEffect(() => {
    document.body.className = `theme-${theme}`
    localStorage.setItem('mk_theme', theme)
  }, [theme])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage theme={theme} setTheme={setTheme} />} />
        <Route path="/login" element={<LoginPage theme={theme} setTheme={setTheme} />} />
        <Route path="/register" element={<RegisterPage theme={theme} setTheme={setTheme} />} />
        <Route path="/dashboard" element={<DashboardPage theme={theme} setTheme={setTheme} />} />
        <Route path="/wallet" element={<WalletPage theme={theme} setTheme={setTheme} />} />
        <Route path="/trade" element={<TradePage theme={theme} setTheme={setTheme} />} />
        <Route path="/contest" element={<ContestPage theme={theme} setTheme={setTheme} />} />
        <Route path="/admin" element={<AdminPage theme={theme} setTheme={setTheme} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App