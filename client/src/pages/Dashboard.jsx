import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

function StatCard({ label, value, unit, sub, color = 'cyan', delay = '' }) {
  const c = color === 'green' ? 'var(--accent2)' : 'var(--accent)'
  return (
    <div className={`rounded-2xl p-5 border-glow fade-up-${delay}`}
      style={{ background: 'var(--bg-card)' }}>
      <p className="text-xs font-bold tracking-widest uppercase mb-2"
        style={{ color: 'var(--muted)', fontFamily: 'Space Mono' }}>{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold font-mono" style={{ color: c }}>
          {value ?? '—'}
        </span>
        {unit && <span className="text-sm mb-0.5" style={{ color: 'var(--muted)' }}>{unit}</span>}
      </div>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{sub}</p>}
    </div>
  )
}

function HashrateBar({ label, value, max }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--muted)', fontFamily: 'Space Mono' }}>
        <span>{label}</span>
        <span style={{ color: 'var(--accent)' }}>{value} MH/s</span>
      </div>
      <div className="rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(0,229,255,0.08)' }}>
        <div className="h-full rounded-full fill-bar"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent2))' }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const token = localStorage.getItem('mining_token')
  const address = localStorage.getItem('mining_address') || ''
  const API = import.meta.env.VITE_API_URL || ''

  const fetchData = useCallback(async () => {
    if (!token) return navigate('/login')
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [statsRes, histRes] = await Promise.all([
        fetch(`${API}/api/mining/stats`, { headers }),
        fetch(`${API}/api/mining/history`, { headers }),
      ])
      if (statsRes.status === 401 || statsRes.status === 403) {
        localStorage.clear(); return navigate('/login')
      }
      setStats(await statsRes.json())
      setHistory(await histRes.json())
    } catch {
      setError('Gagal memuat data. Cek koneksi internet Anda.')
    } finally {
      setLoading(false)
    }
  }, [token, navigate, API])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [fetchData])

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
  const maxHashrate = stats ? Math.max(...stats.workers.map(w => w.hashrate), stats.hashrate.current) * 1.2 : 100

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-dark)' }}>
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 rounded-full animate-spin mb-4"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        <p style={{ color: 'var(--muted)', fontFamily: 'Space Mono', fontSize: 12 }}>LOADING DATA...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-dark)' }}>
      <div className="text-center p-8">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={fetchData} className="px-6 py-2 rounded-xl text-sm"
          style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}>Coba Lagi</button>
      </div>
    </div>
  )

  const pendingUSD = stats ? (stats.earnings.pending * stats.earnings.usdRate).toFixed(2) : 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-dark)' }}>
      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,229,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.025) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

      {/* Header */}
      <header className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(8,12,16,0.9)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill="none"
              stroke="rgba(0,229,255,0.8)" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="3" fill="rgba(0,229,255,0.9)" />
          </svg>
          <span className="font-bold tracking-widest text-sm uppercase"
            style={{ color: 'var(--accent)', fontFamily: 'Space Mono' }}>
            MINING<span style={{ color: 'var(--accent2)' }}>HUB</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full pulse-green" style={{ background: 'var(--accent2)' }} />
            <span style={{ color: 'var(--muted)', fontFamily: 'Space Mono', fontSize: 10 }}>LIVE</span>
          </div>

          {/* Wallet chip */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--border)' }}>
            <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{shortAddr}</span>
          </div>

          <button onClick={logout}
            className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            style={{ border: '1px solid rgba(255,80,80,0.3)', color: 'rgba(255,80,80,0.7)', fontFamily: 'Space Mono' }}
            onMouseEnter={e => e.target.style.borderColor = 'rgba(255,80,80,0.6)'}
            onMouseLeave={e => e.target.style.borderColor = 'rgba(255,80,80,0.3)'}>
            Logout
          </button>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8 fade-up">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">Mining Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Pool: {stats?.pool.name} · Diperbarui otomatis setiap 30 detik</p>
        </div>

        {/* Main stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Hashrate" value={stats?.hashrate.current.toFixed(1)} unit="MH/s"
            sub={`Avg 24h: ${stats?.hashrate.average24h.toFixed(1)} MH/s`} delay="1" />
          <StatCard label="Pending Reward" value={stats?.earnings.pending.toFixed(5)} unit="ETH"
            sub={`≈ $${pendingUSD} USD`} color="green" delay="2" />
          <StatCard label="Pool Luck" value={`${stats?.pool.luck}%`}
            sub={`Block time: ${stats?.pool.blockTime}`} delay="3" />
          <StatCard label="Valid Shares" value={stats?.shares.valid.toLocaleString()}
            sub={`Stale: ${stats?.shares.stale} | Invalid: ${stats?.shares.invalid}`} color="green" delay="4" />
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Workers */}
          <div className="rounded-2xl p-5 border-glow fade-up-2" style={{ background: 'var(--bg-card)' }}>
            <h2 className="text-xs font-bold tracking-widest uppercase mb-5"
              style={{ color: 'var(--muted)', fontFamily: 'Space Mono' }}>Workers</h2>

            <div className="mb-5">
              {stats?.workers.map(w => w.status === 'online' && (
                <HashrateBar key={w.name} label={w.name} value={w.hashrate.toFixed(1)} max={maxHashrate} />
              ))}
            </div>

            <div className="space-y-2">
              {stats?.workers.map(w => (
                <div key={w.name} className="flex items-center justify-between py-2 px-3 rounded-xl"
                  style={{ background: 'var(--bg-dark)' }}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${w.status === 'online' ? 'pulse-green' : ''}`}
                      style={{ background: w.status === 'online' ? 'var(--accent2)' : '#ff4444' }} />
                    <span className="text-sm font-mono" style={{ color: 'var(--text)' }}>{w.name}</span>
                  </div>
                  <span className="text-xs font-mono"
                    style={{ color: w.status === 'online' ? 'var(--accent)' : '#ff4444' }}>
                    {w.status === 'online' ? `${w.hashrate.toFixed(1)} MH/s` : 'OFFLINE'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* History chart */}
          <div className="rounded-2xl p-5 border-glow fade-up-3" style={{ background: 'var(--bg-card)' }}>
            <h2 className="text-xs font-bold tracking-widest uppercase mb-5"
              style={{ color: 'var(--muted)', fontFamily: 'Space Mono' }}>Earnings 7 Hari Terakhir</h2>

            <div className="space-y-2">
              {history.map((h, i) => {
                const maxE = Math.max(...history.map(x => x.earnings))
                const pct = (h.earnings / maxE) * 100
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs w-20 shrink-0" style={{ color: 'var(--muted)', fontFamily: 'Space Mono' }}>
                      {new Date(h.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(0,229,255,0.06)' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, rgba(0,229,255,0.4), rgba(0,255,136,0.6))' }} />
                    </div>
                    <span className="text-xs w-24 text-right shrink-0 font-mono" style={{ color: 'var(--accent2)' }}>
                      {h.earnings.toFixed(5)} ETH
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Total */}
            <div className="mt-5 pt-4 flex justify-between items-center"
              style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-xs font-bold uppercase tracking-widest"
                style={{ color: 'var(--muted)', fontFamily: 'Space Mono' }}>Total Earned</span>
              <span className="text-lg font-bold font-mono text-glow-green"
                style={{ color: 'var(--accent2)' }}>
                {stats?.earnings.total.toFixed(5)} ETH
              </span>
            </div>
          </div>
        </div>

        {/* Pool info bar */}
        <div className="mt-4 rounded-2xl px-5 py-4 fade-up-4 flex flex-wrap gap-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {[
            { label: 'Pool', value: stats?.pool.name },
            { label: 'Last Block', value: `#${stats?.pool.lastBlock?.toLocaleString()}` },
            { label: 'Block Time', value: stats?.pool.blockTime },
            { label: 'Network', value: 'ETH / BSC' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs mb-0.5" style={{ color: 'var(--muted)', fontFamily: 'Space Mono' }}>{item.label}</p>
              <p className="text-sm font-bold font-mono" style={{ color: 'var(--text)' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
