import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Videos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('videos').select('*').order('display_order').then(({ data }) => {
      setVideos(data || [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="wrap" style={{ paddingTop: 48, paddingBottom: 60 }}>
      <h1>Videos</h1>
      {loading && <p className="empty-state">Loading…</p>}
      {!loading && videos.length === 0 && <p className="empty-state">No videos yet.</p>}
      {videos.map((v) => (
        <div className="q-card" key={v.id} style={{ marginBottom: 24 }}>
          <h3>{v.title}</h3>
          {v.description && <p>{v.description}</p>}
          <video controls style={{ width: '100%', borderRadius: 4, marginTop: 10 }}>
            <source src={v.video_url} />
          </video>
        </div>
      ))}
    </div>
  )
}
