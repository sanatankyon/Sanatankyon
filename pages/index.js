import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import PanchangWidget from '../components/PanchangWidget'

const TOPICS = [
  { slug: 'vedas', name_en: 'Vedas', name_hi: 'वेद' },
  { slug: 'upanishads', name_en: 'Upanishads', name_hi: 'उपनिषद्' },
  { slug: 'bhagavad-gita', name_en: 'Bhagavad Gita', name_hi: 'भगवद्गीता' },
  { slug: 'puranas', name_en: 'Puranas', name_hi: 'पुराण' },
  { slug: 'dharma-ethics', name_en: 'Dharma & Ethics', name_hi: 'धर्म' },
  { slug: 'yoga-meditation', name_en: 'Yoga & Meditation', name_hi: 'योग' },
  { slug: 'science-sanatan', name_en: 'Science & Sanatan Dharma', name_hi: 'विज्ञान' },
  { slug: 'general', name_en: 'General', name_hi: 'सामान्य' },
]

export default function Home() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTopic, setActiveTopic] = useState(null)
  const [topicDescription, setTopicDescription] = useState('')

  useEffect(() => {
    fetchQuestions(activeTopic)
    fetchTopicDescription(activeTopic)
  }, [activeTopic])

  async function fetchQuestions(topic) {
    setLoading(true)
    let query = supabase
      .from('questions')
      .select('id, title, body, topic, created_at, profiles(username)')
      .order('created_at', { ascending: false })
      .limit(30)
    if (topic) query = query.eq('topic', topic)
    const { data, error } = await query
    if (!error) setQuestions(data || [])
    setLoading(false)
  }

  async function fetchTopicDescription(topic) {
    if (!topic) {
      setTopicDescription('')
      return
    }
    const { data } = await supabase
      .from('topics')
      .select('description')
      .eq('slug', topic)
      .single()
    setTopicDescription(data?.description || '')
  }

  return (
    <div className="home-saffron">
      <section className="hero">
        <div className="wrap">
          <svg className="hero-arch" viewBox="0 0 64 40" fill="none">
            <path d="M2 38 V20 C2 8 12 2 32 2 C52 2 62 8 62 20 V38" stroke="#000000" strokeWidth="3" />
          </svg>
          <h1>Ask. Understand. Sanatan Dharma, explained.</h1>
          <p>
            A gathering place for questions on the Vedas, Upanishads and the Gita —
            answered by scholars, and grounded wherever possible in a reasoned,
            scientific approach.
          </p>
        </div>
      </section>

      <div className="wrap layout">
        <main>
          <h2 style={{ fontSize: 18 }}>
            {activeTopic ? `Questions on ${activeTopic}` : 'Recent questions'}
          </h2>

          {topicDescription && (
            <div className="q-card" style={{ marginBottom: 24 }}>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{topicDescription}</p>
            </div>
          )}

          {loading && <p className="empty-state" style={{ color: '#2A1F00' }}>Loading questions…</p>}
          {!loading && questions.length === 0 && (
            <p className="empty-state" style={{ color: '#2A1F00' }}>
              No questions here yet. Be the first to ask one.
            </p>
          )}

          {questions.map((q) => (
            <Link href={`/question/${q.id}`} key={q.id} style={{ display: 'block' }}>
              <div className="q-card">
                <h3>{q.title}</h3>
                {q.body && <p>{q.body.slice(0, 160)}{q.body.length > 160 ? '…' : ''}</p>}
                <div className="q-meta">
                  <span className="topic-tag">{q.topic}</span>
                  <span>asked by {q.profiles?.username || 'a visitor'}</span>
                </div>
              </div>
            </Link>
          ))}
        </main>

        <aside>
          <div className="side-block">
            <h3>Topics</h3>
            <ul className="topic-list">
              <li>
                <a onClick={() => setActiveTopic(null)} style={{ cursor: 'pointer' }}>
                  All questions
                </a>
              </li>
              {TOPICS.map((t) => (
                <li key={t.slug}>
                  <a onClick={() => setActiveTopic(t.slug)} style={{ cursor: 'pointer' }}>
                    {t.name_en} <span className="hi">{t.name_hi}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="side-block">
            <h3>Are you a scholar?</h3>
            <p style={{ fontSize: 13.5, color: '#C9B8A6' }}>
              Register, then contact the site admin to have your account
              verified so your answers carry a scholar badge.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
