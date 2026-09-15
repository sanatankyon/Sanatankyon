import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Admin() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [topics, setTopics] = useState([])
  const [questions, setQuestions] = useState([])
  const [entries, setEntries] = useState([])
  const [newEntry, setNewEntry] = useState({ title: '', article_text: '', image_url: '', pdf_url: '', display_order: 0 })

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user
    if (!user) {
      router.push('/login')
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    if (!profile?.is_admin) {
      setChecking(false)
      setAuthorized(false)
      return
    }
    setAuthorized(true)
    setChecking(false)
    loadTopics()
    loadQuestions()
    loadEntries()
  }

  async function loadTopics() {
    const { data } = await supabase.from('topics').select('*').order('slug')
    setTopics(data || [])
  }

  async function loadQuestions() {
    const { data } = await supabase
      .from('questions')
      .select('id, title, body, topic, answers(id, body, profiles(username))')
      .order('created_at', { ascending: false })
    setQuestions(data || [])
  }

  async function loadEntries() {
    const { data } = await supabase
      .from('puranas_entries')
      .select('*')
      .order('display_order')
    setEntries(data || [])
  }

  async function saveTopicDescription(slug, description) {
    await supabase.from('topics').update({ description }).eq('slug', slug)
    loadTopics()
  }

  async function saveQuestion(id, title, body) {
    await supabase.from('questions').update({ title, body }).eq('id', id)
    loadQuestions()
  }

  async function deleteQuestion(id) {
    if (!confirm('Delete this question and all its answers?')) return
    await supabase.from('questions').delete().eq('id', id)
    loadQuestions()
  }

  async function deleteAnswer(id) {
    if (!confirm('Delete this answer?')) return
    await supabase.from('answers').delete().eq('id', id)
    loadQuestions()
  }

  async function addEntry() {
    await supabase.from('puranas_entries').insert(newEntry)
    setNewEntry({ title: '', article_text: '', image_url: '', pdf_url: '', display_order: 0 })
    loadEntries()
  }

  async function deleteEntry(id) {
    if (!confirm('Delete this Puranas entry?')) return
    await supabase.from('puranas_entries').delete().eq('id', id)
    loadEntries()
  }

  if (checking) return <div className="wrap" style={{ paddingTop: 48 }}>Checking access…</div>
  if (!authorized) return <div className="wrap" style={{ paddingTop: 48 }}>You don't have admin access.</div>

  return (
    <div className="wrap" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <h1>Admin</h1>

      <h2 style={{ marginTop: 40 }}>Topic descriptions</h2>
      {topics.map((t) => (
        <div className="form-card" key={t.slug} style={{ marginBottom: 16, maxWidth: '100%' }}>
          <label>{t.name_en}</label>
          <textarea
            defaultValue={t.description || ''}
            onBlur={(e) => saveTopicDescription(t.slug, e.target.value)}
          />
          <p className="hint">Saves automatically when you tap away from the box.</p>
        </div>
      ))}

      <h2 style={{ marginTop: 40 }}>Questions & answers</h2>
      {questions.map((q) => (
        <div className="form-card" key={q.id} style={{ marginBottom: 20, maxWidth: '100%' }}>
          <label>Title</label>
          <input defaultValue={q.title} onBlur={(e) => saveQuestion(q.id, e.target.value, q.body)} />
          <label>Body</label>
          <textarea defaultValue={q.body || ''} onBlur={(e) => saveQuestion(q.id, q.title, e.target.value)} />
          <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={() => deleteQuestion(q.id)}>
            Delete question
          </button>

          {q.answers?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p className="hint">Answers:</p>
              {q.answers.map((a) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid var(--surface-2)' }}>
                  <span style={{ fontSize: 14 }}>{a.profiles?.username}: {a.body.slice(0, 60)}</span>
                  <button className="btn btn-outline" onClick={() => deleteAnswer(a.id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <h2 style={{ marginTop: 40 }}>Puranas entries</h2>
      {entries.map((e) => (
        <div className="form-card" key={e.id} style={{ marginBottom: 16, maxWidth: '100%' }}>
          <strong>{e.title}</strong>
          <button className="btn btn-outline" style={{ marginTop: 10, display: 'block' }} onClick={() => deleteEntry(e.id)}>
            Delete
          </button>
        </div>
      ))}

      <div className="form-card" style={{ maxWidth: '100%' }}>
        <h3 style={{ fontSize: 16 }}>Add new Puranas entry</h3>
        <label>Title</label>
        <input value={newEntry.title} onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })} />
        <label>Article text</label>
        <textarea value={newEntry.article_text} onChange={(e) => setNewEntry({ ...newEntry, article_text: e.target.value })} />
        <label>Image URL (optional)</label>
        <input value={newEntry.image_url} onChange={(e) => setNewEntry({ ...newEntry, image_url: e.target.value })} />
        <label>PDF URL (optional)</label>
        <input value={newEntry.pdf_url} onChange={(e) => setNewEntry({ ...newEntry, pdf_url: e.target.value })} />
        <label>Display order</label>
        <input type="number" value={newEntry.display_order} onChange={(e) => setNewEntry({ ...newEntry, display_order: Number(e.target.value) })} />
        <div className="form-actions">
          <button className="btn" onClick={addEntry}>Add entry</button>
        </div>
      </div>
    </div>
  )
}
