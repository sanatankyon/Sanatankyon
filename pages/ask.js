import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

const TOPICS = [
  ['vedas', 'Vedas'],
  ['upanishads', 'Upanishads'],
  ['bhagavad-gita', 'Bhagavad Gita'],
  ['puranas', 'Puranas'],
  ['dharma-ethics', 'Dharma & Ethics'],
  ['yoga-meditation', 'Yoga & Meditation'],
  ['science-sanatan', 'Science & Sanatan Dharma'],
  ['general', 'General'],
]

export default function Ask() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [topic, setTopic] = useState('general')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login')
      } else {
        setCheckingAuth(false)
      }
    })
  }, [router])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user?.id

    const { data, error: insertError } = await supabase
      .from('questions')
      .insert({ title, body, topic, user_id: userId })
      .select()
      .single()

    setLoading(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    router.push(`/question/${data.id}`)
  }

  if (checkingAuth) return null

  return (
    <div className="wrap" style={{ paddingTop: 48 }}>
      <div className="form-card">
        <h2>Ask a question</h2>
        <form onSubmit={handleSubmit}>
          <label>Your question, in one line</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />

          <label>Add detail (optional)</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} />

          <label>Topic</label>
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            {TOPICS.map(([slug, name]) => (
              <option key={slug} value={slug}>{name}</option>
            ))}
          </select>

          {error && <p className="error-msg">{error}</p>}

          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Posting…' : 'Post question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
