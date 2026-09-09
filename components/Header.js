import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function Header() {
  const [session, setSession] = useState(null)

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
          <Link href="/">Home</Link>
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
