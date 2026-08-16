import { useState } from 'react'
import { asset } from '../utils/assets'
import { RefHeader } from './RefChrome'

function RefField({ labelAsset, alt, value, onChange, placeholder, required = false, showInfo = false }) {
  const [infoOpen, setInfoOpen] = useState(false)
  const inputId = `profile-${labelAsset.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`
  const hintId = `${inputId}-hint`

  return <div className="ref-field"><img src={asset(labelAsset)} alt={alt} />{showInfo && <button className="access-info" type="button" aria-label="What is an access code?" aria-expanded={infoOpen} aria-controls={hintId} onClick={() => setInfoOpen((open) => !open)}>i</button>}<span className="ref-input-shell"><label className="sr-only" htmlFor={inputId}>{alt}</label><input id={inputId} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} aria-describedby={showInfo ? hintId : undefined} /></span>{showInfo && infoOpen && <p id={hintId} className="access-info-message" role="status">Access code is optional. Leave it blank if you were not given one.</p>}</div>
}

export function ProfileInfo({ profile, onChange, onBack, onNext }) {
  const submit = (event) => { event.preventDefault(); onNext() }
  const ready = profile.year.trim() && profile.program.trim()
  return <section className="ref-screen ref-blue info-screen"><RefHeader avatar={profile.avatar} back={onBack} /><img className="ref-logo" src={asset('Logo.png')} alt="Spot the Mistake" /><div className="info-hero"><img className="info-character" src={asset('Collecting information/Frame 483.png')} alt="Illustrated recruiter" /><img className="info-bubble" src={asset('Collecting information/Bubble Chat.png')} alt="Tell us more about yourself" /></div><form className="info-form" onSubmit={submit}><RefField labelAsset="Collecting information/Group 203.png" alt="What year of study are you in?" value={profile.year} onChange={(value) => onChange('year', value)} placeholder="e.g. Year 3" required /><RefField labelAsset="Collecting information/Group 209.png" alt="What is your current program?" value={profile.program} onChange={(value) => onChange('program', value)} placeholder="e.g. Digital Marketing" required /><RefField labelAsset="Collecting information/Frame 467.png" alt="Access code, optional" value={profile.accessCode} onChange={(value) => onChange('accessCode', value)} placeholder="e.g. CXVED" showInfo />{ready && <button className="ref-next info-next" type="submit">Next <span>›</span></button>}</form></section>
}
