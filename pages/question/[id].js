import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

const LANGUAGES = [
  { code: 'hi', label: 'Hindi' },
  { code: 'en', label: 'English' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'mr', label: 'Marathi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'ur', label: 'Urdu' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'de', label: 'German' },
]

export default function QuestionPage() {
  const router = useRouter()
  const { id } = router.query

  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  const [session, setSession] = useState(null)
  const [answerText, setAnswerText] = useState('')
  const [isScientific, setIsScientific] = useState(false)
  const [error, setError] = useState('')
  const [posting, setPosting] = useState(false)

  const [voices, setVoices] = useState([])
  const [selectedLang, setSelectedLang] = useState('hi')
  const [showListen, setShowListen] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [loadingAudio, setLoadingAudio] = useState(false)
  const [audioError, setAudioError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [])

  useEffect(() => {
    if (!id) return
    loadQuestion()
    loadAnswers()
  }, [id])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    function loadVoices() {
      setVoices(window.speechSynthesis.getVoices())
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  async function loadQuestion() {
    const { data } = await supabase
      .from('questions')
      .select('id, title, body, topic, created_at, profiles(username)')
      .eq('id', id)
      .single()
    setQuestion(data)
  }

  async function loadAnswers() {
    const { data } = await supabase
      .from('answers')
      .select('id, body, is_scientific_approach, created_at, profiles(username, is_scholar)')
      .eq('question_id', id)
      .order('created_at', { ascending: true })
    setAnswers(data || [])
  }

  async function handleSubmitAnswer(e) {
    e.preventDefault()
    setError('')

    if (!session) {
      router.push('/login')
      return
    }

    setPosting(true)
    const { error: insertError } = await supabase.from('answers').insert({
      question_id: id,
      user_id: session.user.id,
      body: answerText,
      is_scientific_approach: isScientific,
    })
    setPosting(false)

    if (insertError) {
      setError(insertError.message)
      return
    }
    setAnswerText('')
    setIsScientific(false)
    loadAnswers()
  }

  async function speak() {
    if (!question || typeof window === 'undefined' || !window.speechSynthesis) return
    setAudioError('')
    setLoadingAudio(true)

    try {
      const textParts = [question.title, question.body || '']
      answers.forEach((a) => textParts.push(a.body))
      const fullText = textParts.join('. ').slice(0, 3000)

      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${selectedLang}&dt=t&q=${encodeURIComponent(fullText)}`
      )
      const data = await res.json()
      const translatedText = data[0].map((chunk) => chunk[0]).join(' ')

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(translatedText)
      utterance.lang = selectedLang
      const matchingVoice = voices.find((v) => v.lang.toLowerCase().startsWith(selectedLang))
      if (matchingVoice) utterance.voice = matchingVoice
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)

      setSpeaking(true)
      window.speechSynthesis.speak(utterance)
    } catch (err) {
      setAudioError('Could not translate or play audio right now. Please try again.')
    } finally {
      setLoadingAudio(false)
    }
  }

  function stopSpeaking() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  if (!question) return <div className="wrap" style={{ paddingTop: 48 }}>Loading…</div>

  return (
    <div className="wrap" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="topic-tag">{question.topic}</span>
        <div style={{ position: 'relative' }}>
          <button className="btn btn-outline" type="button" onClick={() => setShowListen(!showListen)}>
            Listen
          </button>
          {showListen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                background: '#2E181C',
                border: '1px solid #3A2126',
                borderRadius: 4,
                padding: 12,
                width: 240,
                zIndex: 50,
              }}
            >
              <label style={{ fontSize: 12 }}>Language</label>
              <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {!speaking ? (
                  <button className="btn" type="button" onClick={speak} disabled={loadingAudio}>
                    {loadingAudio ? 'Preparing…' : 'Play'}
                  </button>
                ) : (
                  <button className="btn btn-outline" type="button" onClick={stopSpeaking}>Stop</button>
                )}
              </div>
              {audioError && <p className="error-msg" style={{ marginTop: 8 }}>{audioError}</p>}
              <p style={{ fontSize: 11, color: '#C9B8A6', margin: '8px 0 0 0' }}>
                Text is auto-translated, then read aloud. Voice quality depends on your device.
              </p>
            </div>
          )}
        </div>
      </div>

      <h1 style={{ marginTop: 12 }}>{question.title}</h1>
      {question.body && <p style={{ color: '#C9B8A6' }}>{question.body}</p>}
      <p style={{ color: '#8A7A68', fontSize: 13 }}>
        asked by {question.profiles?.username || 'a visitor'}
      </p>

      <h2 style={{ fontSize: 18, marginTop: 36, marginBottom: 14 }}>
        {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
      </h2>

      {answers.length === 0 && <p className="empty-state">No answers yet. Be the first to respond.</p>}

      {answers.map((a) => (
        <div className="answer" key={a.id}>
          <div className="answer-author">
            <strong>{a.profiles?.username || 'A visitor'}</strong>
            {a.profiles?.is_scholar && <span className="scholar-badge">Scholar</span>}
            {a.is_scientific_approach && <span className="science-badge">Scientific approach</span>}
          </div>
          <p style={{ margin: 0 }}>{a.body}</p>
        </div>
      ))}

      <div className="form-card" style={{ marginTop: 30, maxWidth: '100%' }}>
        <h3 style={{ fontSize: 16 }}>Your answer</h3>
        {session ? (
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Share your understanding, with references where you can…"
              required
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <input
                type="checkbox"
                style={{ width: 'auto' }}
                checked={isScientific}
                onChange={(e) => setIsScientific(e.target.checked)}
              />
              This answer takes a scientific approach
            </label>
            {error && <p className="error-msg">{error}</p>}
            <div className="form-actions">
              <button className="btn" type="submit" disabled={posting}>
                {posting ? 'Posting…' : 'Post answer'}
              </button>
            </div>
          </form>
        ) : (
          <p className="hint">
            <a href="/login">Log in</a> or <a href="/register">register</a> to answer this question.
          </p>
        )}
      </div>
    </div>
  )
}
