import { useEffect, useRef, useState } from 'react'
import { asset } from '../utils/assets'
import { RefHeader } from './RefChrome'

function RuleDialog({ label, onClose }) {
  const closeButton = useRef(null)

  useEffect(() => {
    closeButton.current?.focus()
    const onKeyDown = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const trapFocus = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      closeButton.current?.focus()
    }
  }

  return <div className="intro-rule-modal" role="dialog" aria-modal="true" aria-label={`How to play ${label}`} onPointerDown={(event) => { if (event.target === event.currentTarget) onClose() }} onKeyDown={trapFocus}>
    <button ref={closeButton} className="intro-rule-close" type="button" onClick={onClose}>Close <span aria-hidden="true">×</span></button>
    <div className="intro-rule-sheet"><img src={asset('How to play.png')} alt={`How to play ${label}: tap mistakes, build combos, and avoid incorrect taps.`} /></div>
  </div>
}

export function Intro({ doc, avatar, mistakes, onBack, onReview }) {
  const [showRule, setShowRule] = useState(false)
  const helpButton = useRef(null)
  const closeRule = () => {
    setShowRule(false)
    requestAnimationFrame(() => helpButton.current?.focus())
  }

  return <section className="ref-screen ref-blue ref-intro"><RefHeader avatar={avatar} back={onBack} /><img className="ref-logo intro-logo" src={asset('Logo.png')} alt="Spot the Mistake" /><button ref={helpButton} className="intro-help" type="button" aria-label={`Show how to play ${doc.label}`} aria-expanded={showRule} onClick={() => setShowRule(true)}><img src={doc.introAssets.help} alt="" /></button><div className="intro-stage"><img className="intro-ref-character" src={doc.character} alt="Illustrated recruiter" decoding="async" /><img className="intro-ref-card" src={doc.introAssets.card} alt={doc.introTitle} decoding="async" /></div><div className="intro-stats"><img src={doc.introAssets.mistakes} alt={`${mistakes} mistakes hidden`} /><img src={doc.introAssets.time} alt="Time limit: 1 minute" /></div><button className="image-button intro-review" type="button" onClick={onReview}><img src={doc.introAssets.review} alt={`Review ${doc.label}`} /></button>{showRule && <RuleDialog label={doc.label} onClose={closeRule} />}</section>
}
