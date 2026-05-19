import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'

export default function Login() {
  const [privateKey, setPrivateKey] = useState('')
  const [step, setStep] = useState('input') // input | signing | done
  const [error, setError] = useState('')
  const [address, setAddress] = useState('')
  const navigate = useNavigate()

  const API = import.meta.env.VITE_API_URL || ''

  async function handleLogin() {
    setError('')
    if (!privateKey.trim()) return setError('Private key tidak boleh kosong.')

    // Validate and create wallet locally
    let wallet
    try {
      wallet = new ethers.Wallet(
        privateKey.startsWith('0x') ? privateKey : '0x' + privateKey
      )
    } catch {
      return setError('Format private key tidak valid. Pastikan 64 karakter hex.')
    }

    setAddress(wallet.address)
    setStep('signing')

    try {
      // 1. Request nonce dari server
      const nonceRes = await fetch(`${API}/api/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet.address }),
      })
      const { message } = await nonceRes.json()
      if (!message) throw new Error('Gagal mendapat nonce dari server.')

      // 2. Sign message LOCALLY — private key tidak pernah dikirim ke server
      const signature = await wallet.signMessage(message)

      // 3. Kirim signature + address untuk verifikasi
      const verifyRes = await fetch(`${API}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet.address, signature }),
      })
      const data = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(data.error || 'Verifikasi gagal.')

      // 4. Simpan token, redirect ke dashboard
      localStorage.setItem('mining_token', data.token)
      localStorage.setItem('mining_address', data.address)
      setStep('done')
      setTimeout(() => navigate('/dashboard'), 800)

    } catch (err) {
      setError(err.message)
      setStep('input')
    }
  }

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg-dark)' }}>

      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-md px-4 fade-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill="none"
                stroke="rgba(0,229,255,0.8)" strokeWidth="1.5" />
              <polygon points="16,8 24,13 24,19 16,24 8,19 8,13" fill="none"
                stroke="rgba(0,255,136,0.6)" strokeWidth="1" />
              <circle cx="16" cy="16" r="3" fill="rgba(0,229,255,0.9)" />
            </svg>
            <span className="text-xl font-bold tracking-widest uppercase"
              style={{ color: 'var(--accent)', fontFamily: 'Space Mono' }}>
              MINING<span style={{ color: 'var(--accent2)' }}>HUB</span>
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Connect wallet menggunakan private key
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 border-glow"
          style={{ background: 'var(--bg-card)' }}>

          {step === 'done' ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-4">✓</div>
              <p style={{ color: 'var(--accent2)' }} className="font-bold text-lg text-glow-green">
                Login berhasil!
              </p>
              <p style={{ color: 'var(--muted)' }} className="text-sm mt-1">
                Mengarahkan ke dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* Security note */}
              <div className="rounded-xl p-3 mb-6 flex gap-3"
                style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)' }}>
                <span className="text-base mt-0.5">🔒</span>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(0,255,136,0.8)' }}>
                  <strong>Aman:</strong> Private key hanya digunakan secara lokal di browser untuk menandatangani pesan. Tidak pernah dikirim ke server.
                </p>
              </div>

              {/* Input */}
              <div className="mb-6">
                <label className="block text-xs font-bold tracking-widest uppercase mb-2"
                  style={{ color: 'var(--muted)', fontFamily: 'Space Mono' }}>
                  Private Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={privateKey}
                    onChange={e => setPrivateKey(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="0x... atau 64 karakter hex"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      background: 'var(--bg-dark)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontFamily: 'Space Mono',
                      letterSpacing: '0.05em',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl px-4 py-3 mb-4 text-sm"
                  style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', color: '#ff6b6b' }}>
                  ⚠ {error}
                </div>
              )}

              {/* Signing state */}
              {step === 'signing' && (
                <div className="rounded-xl px-4 py-3 mb-4 text-sm"
                  style={{ background: 'var(--accent-dim)', border: '1px solid var(--border)', color: 'var(--accent)' }}>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full animate-pulse"
                      style={{ background: 'var(--accent)' }} />
                    Menandatangani pesan untuk {shortAddr}...
                  </div>
                </div>
              )}

              {/* Button */}
              <button
                onClick={handleLogin}
                disabled={step === 'signing'}
                className="w-full py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(0,255,136,0.1))',
                  border: '1px solid var(--accent)',
                  color: 'var(--accent)',
                  fontFamily: 'Space Mono',
                }}
                onMouseEnter={e => {
                  e.target.style.background = 'rgba(0,229,255,0.2)'
                  e.target.style.boxShadow = '0 0 20px rgba(0,229,255,0.3)'
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(0,255,136,0.1))'
                  e.target.style.boxShadow = 'none'
                }}
              >
                {step === 'signing' ? '⏳ Memproses...' : '⚡ Connect Wallet'}
              </button>

              <p className="text-center text-xs mt-4" style={{ color: 'var(--muted)' }}>
                Gunakan wallet khusus mining, bukan wallet utama Anda.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: 'rgba(90,122,144,0.5)', fontFamily: 'Space Mono' }}>
          MINING DASHBOARD v1.0 — ETH/BSC
        </p>
      </div>
    </div>
  )
}
