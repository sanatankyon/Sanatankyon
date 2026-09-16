import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [method, setMethod] = useState('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    let loginEmail = email
    if (method === 'phone') {
      const cleanPhone = phone.replace(/\D/g, '')
      loginEmail = `${cleanPhone}@phone.sanatankyon.in`
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    })

    setLoading(false)
    if (signInError) {
      setError(signInError.message)
      return
    }
    router.push('/')
  }

  return (
    <div className="wrap" style={{ paddingTop: 48 }}>
      <div className="form-card">
        <h2>Log in</h2>

        <div style={{ display: 'flex', gap: 10, marginTop: 6, marginBottom: 10 }}>
          <button
            type="button"
            className={method === 'email' ? 'btn' : 'btn btn-outline'}
            onClick={() => setMethod('email')}
          >
            Email
          </button>
          <button
            type="button"
            className={method === 'phone' ? 'btn' : 'btn btn-outline'}
            onClick={() => setMethod('phone')}
          >
            Mobile Number
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {method === 'email' ? (
            <>
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </>
          ) : (
            <>
              <label>Mobile number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                required
              />
            </>
          )}

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <p className="error-msg">{error}</p>}

          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </div>
        </form>
        <p className="hint">New here? <a href="/register">Create an account</a></p>
      </div>
    </div>
  )
}
