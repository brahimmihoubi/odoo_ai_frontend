import { useState } from 'react'
import { login } from '../../api/auth'

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // ✅ call backend (JWT)
      const token = await login(username, password)

      // ✅ store token ONLY
      localStorage.setItem('token', token)

      // optional: store username (not sensitive)
      localStorage.setItem('odoo_user', username)

      // ✅ continue app flow
      if (onLoginSuccess) {
        onLoginSuccess()
      } else {
        window.location.href = '/dashboard'
      }

    } catch (err) {
      console.error(err)
      setError('Invalid credentials or server error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--bg)',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className="card" style={{ width: '400px', padding: '32px' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1
            className="page-title"
            style={{ fontSize: '24px', marginBottom: '8px' }}
          >
            Sign In to OdooAI
          </h1>
          <p className="page-subtitle">
            Connect to your real Odoo 18 Database
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {/* USERNAME */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '6px'
              }}
            >
              Username / Email
            </label>
            <input
              type="text"
              className="chat-input"
              style={{ width: '100%' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '6px'
              }}
            >
              Password
            </label>
            <input
              type="password"
              className="chat-input"
              style={{ width: '100%' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* ERROR */}
          {error && (
            <div
              style={{
                color: 'var(--red)',
                fontSize: '13px',
                textAlign: 'center'
              }}
            >
              {error}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: '8px',
              justifyContent: 'center'
            }}
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}