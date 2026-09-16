import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function Header() {
  const [session, setSession] = useState(null)
  const [showTranslate, setShowTranslate] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="brand">
          <span className="mark">सनातन क्यों</span>
          <span className="sub">SanatanKyon.in</span>
        </Link>
        <nav className="nav-links">
          <Link href="/">Home</Link
    
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-outline"
              onClick={() => setShowTranslate(!showTranslate)}
              type="button"
            >
              Translate
            </button>
            <div
              style={{
                display: showTranslate ? 'block' : 'none',
                position: 'absolute',
                top: '110%',
                right: 0,
                background: '#2E181C',
                padding: 8,
                borderRadius: 4,
                zIndex: 50,
                width: 220,
              }}
            >
              <div id="google_translate_element" />
              <p style={{ fontSize: 11, color: '#C9B8A6', margin: '6px 0 0 0' }}>
                Translations are automated by Google Translate and may not be fully accurate.
              </p>
            </div>
          </div>
          {session ? (
            <>
              <Link href="/ask" className="btn">Ask a question</Link>
              <button onClick={signOut} className="btn btn-outline">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/register" className="btn">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
