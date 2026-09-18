import { useEffect, useState } from 'react'
import * as Astronomy from 'astronomy-engine'

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
]

const RASHIS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena']

const TITHI_NAMES = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi']

const DELHI = { lat: 28.6139, lon: 77.2090, elevation: 0 }

function ayanamsaFor(date) {
  const year = date.getFullYear() + date.getMonth() / 12
  return 23.85 + 0.0139 * (year - 2000)
}

function computePanchang(date) {
  const observer = new Astronomy.Observer(DELHI.lat, DELHI.lon, DELHI.elevation)

  const sunLon = Astronomy.EclipticLongitude(Astronomy.Body.Sun, date)
  const moonLon = Astronomy.EclipticLongitude(Astronomy.Body.Moon, date)

  const elong = (moonLon - sunLon + 360) % 360
  const tithiIndex = Math.floor(elong / 12)
  const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna'
  const isPurnima = tithiIndex === 14
  const isAmavasya = tithiIndex === 29
  const tithiName = isPurnima ? 'Purnima' : isAmavasya ? 'Amavasya' : TITHI_NAMES[tithiIndex % 15]

  const ayanamsa = ayanamsaFor(date)
  const siderealMoonLon = (moonLon - ayanamsa + 360) % 360
  const nakshatra = NAKSHATRAS[Math.floor(siderealMoonLon / (360 / 27)) % 27]

  const siderealSunLon = (sunLon - ayanamsa + 360) % 360
  const rashi = RASHIS[Math.floor(siderealSunLon / 30) % 12]

  let sunrise = null
  let sunset = null
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const riseResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, startOfDay, 2)
    const setResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, startOfDay, 2)
    sunrise = riseResult ? riseResult.date : null
    sunset = setResult ? setResult.date : null
  } catch (e) {
    sunrise = null
    sunset = null
  }

  const vikramSamvat = date.getFullYear() + 57

  return { tithiName, paksha, isPurnima, isAmavasya, nakshatra, rashi, sunrise, sunset, vikramSamvat }
}

function formatTime(d) {
  if (!d) return '—'
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export default function PanchangWidget() {
  const [offset, setOffset] = useState(0)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const date = new Date()
      date.setDate(date.getDate() + offset)
      const result = computePanchang(date)
      setData({ ...result, date })
      setError('')
    } catch (e) {
      setError('Panchang error: ' + (e && e.message ? e.message : String(e)))
    }
  }, [offset])

  return (
    <div className="side-block panchang-block">
      <h3>आज का पंचांग · Panchang</h3>

      <div className="panchang-nav">
        <button className="btn btn-outline" type="button" onClick={() => setOffset(offset - 1)}>◀ Prev</button>
        <button className="btn btn-outline" type="button" onClick={() => setOffset(0)}>Today</button>
        <button className="btn btn-outline" type="button" onClick={() => setOffset(offset + 1)}>Next ▶</button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {data && (
        <div className="panchang-details">
          <p className="panchang-date">
            {data.date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p><span>Vikram Samvat</span><strong>{data.vikramSamvat}</strong></p>
          <p><span>Tithi</span><strong>{data.paksha} {data.tithiName}</strong></p>
          <p><span>Nakshatra</span><strong>{data.nakshatra}</strong></p>
          <p><span>Sun Rashi</span><strong>{data.rashi}</strong></p>
          <p><span>Sunrise</span><strong>{formatTime(data.sunrise)}</strong></p>
          <p><span>Sunset</span><strong>{formatTime(data.sunset)}</strong></p>
          {data.isPurnima && <p className="panchang-flag">🌕 Purnima today</p>}
          {data.isAmavasya && <p className="panchang-flag">🌑 Amavasya today</p>}
        </div>
      )}

      <p className="hint" style={{ fontSize: 11 }}>
        Calculated for New Delhi. Approximate — for muhurat or ritual timing, please verify with a scholar.
      </p>
    </div>
  )
}
