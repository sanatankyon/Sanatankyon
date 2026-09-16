import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Register() {
  const [method, setMethod] = useState('email')
  const [username, setUsername] = useState('')
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

    let signUpEmail = email
    const cleanPhone = phone.replace(/\D/g, '')

    if (method === 'phone') {
      if (!cleanPhone) {
        setError('Please enter a valid phone number.')
        setLoading(false)
        return
      }
      signUpEmail = `${cleanPhone}@phone.sanatankyon.in`
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: signUpEmail,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username,
          phone: method === 'phone' ? cleanPhone : null,
        })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    router.push('/')
  }

  return (
    <div className="wrap" style={{ paddingTop: 48 }}>
      <div className="form-card">
        <h2>Register</h2>
        <p style={{ color: '#C9B8A6', fontSize: 14 }}>
          Registration is required before you can ask or answer a question.
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
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
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />

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
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

          {error && <p className="error-msg">{error}</p>}

          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>
        <p className="hint">Already registered? <a href="/login">Log in</a></p>
      </div>
    </div>
  )
}
