import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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

// The rule card, badges, and character are all flat art (no live text), so this positions them
// from real measured geometry instead of hard-coded CSS — a formula tuned against one screen
// width/height silently breaks on every other phone. All three docs' art shares near-identical
// proportions, so one set of constants (measured from the CV assets) covers every document.
const CARD_ASPECT = 1.294 // card art height / width
const CARD_TEXT_FRACTION = 0.667 // how far down the card the rule text ends, as a fraction of its height
const STATS_ASPECT_SUM = 0.256 + 0.247 // the two badge images' combined height / their shared width
const STATS_GAP = 11
const GAP_ABOVE_STATS = 32
const GAP_BELOW_STATS = 24
const MIN_SCALE = 0.45

export function Intro({ doc, avatar, mistakes, onBack, onReview }) {
  const [showRule, setShowRule] = useState(false)
  const helpButton = useRef(null)
  const screenRef = useRef(null)
  const stageRef = useRef(null)
  const reviewRef = useRef(null)
  const closeRule = () => {
    setShowRule(false)
    requestAnimationFrame(() => helpButton.current?.focus())
  }

  useLayoutEffect(() => {
    const screenEl = screenRef.current
    const stageEl = stageRef.current
    const reviewEl = reviewRef.current
    if (!screenEl || !stageEl || !reviewEl) return

    const layout = () => {
      screenEl.style.height = '' // measure against the natural 100dvh, not a previous pass's fix-up
      const width = screenEl.clientWidth
      if (!width) return
      const screenTop = screenEl.getBoundingClientRect().top
      const cardTop = stageEl.getBoundingClientRect().top - screenTop
      const reviewRect = reviewEl.getBoundingClientRect()
      const reviewTop = reviewRect.top - screenTop
      // The review button's own height comes from its <img>'s intrinsic aspect ratio — before it
      // decodes, the button collapses to ~0 height and reviewTop reads far too low. Skip that pass.
      if (reviewRect.height < 4) return

      // Solve the largest scale (capped at 1) at which the rule text, the badge stack below it,
      // and the review button below that all fit without overlapping.
      const perScaleHeight = 0.94 * width * CARD_ASPECT * CARD_TEXT_FRACTION + 0.43 * width * STATS_ASPECT_SUM + STATS_GAP
      const budget = reviewTop - cardTop - GAP_ABOVE_STATS - GAP_BELOW_STATS
      const scale = Math.min(1, Math.max(MIN_SCALE, perScaleHeight > 0 ? budget / perScaleHeight : 1))

      const cardHeight = 0.94 * scale * width * CARD_ASPECT
      const statsHeight = 0.43 * scale * width * STATS_ASPECT_SUM + STATS_GAP * scale
      const statsTop = cardTop + cardHeight * CARD_TEXT_FRACTION + GAP_ABOVE_STATS
      const statsBottom = statsTop + statsHeight

      // Last resort: an unusually short and/or wide viewport (e.g. landscape) where even the
      // minimum readable scale still doesn't leave enough room. Grow the screen instead of letting
      // anything overlap — the review button is bottom-anchored, so it moves down by the same
      // amount, and the page scrolls the rest of the way instead of cramming or clipping.
      const deficit = statsBottom + GAP_BELOW_STATS - reviewTop
      if (deficit > 0) screenEl.style.height = `calc(100dvh + ${Math.ceil(deficit)}px)`

      screenEl.style.setProperty('--intro-scale', String(scale))
      screenEl.style.setProperty('--intro-stats-top', `${statsTop}px`)
    }

    layout()
    const images = screenEl.querySelectorAll('img')
    images.forEach((image) => { if (!image.complete) image.addEventListener('load', layout) })
    const observer = new ResizeObserver(layout)
    observer.observe(screenEl)
    window.addEventListener('orientationchange', layout)
    return () => {
      observer.disconnect()
      window.removeEventListener('orientationchange', layout)
      images.forEach((image) => image.removeEventListener('load', layout))
    }
  }, [doc])

  return <section ref={screenRef} className="ref-screen ref-blue ref-intro"><RefHeader avatar={avatar} back={onBack} /><img className="ref-logo intro-logo" src={asset('Logo.png')} alt="Spot the Mistake" /><button ref={helpButton} className="intro-help" type="button" aria-label={`Show how to play ${doc.label}`} aria-expanded={showRule} onClick={() => setShowRule(true)}><img src={doc.introAssets.help} alt="" /></button><div ref={stageRef} className="intro-stage"><img className="intro-ref-character" src={doc.character} alt="Illustrated recruiter" decoding="async" /><img className="intro-ref-card" src={doc.introAssets.card} alt={doc.introTitle} decoding="async" /></div><div className="intro-stats"><img src={doc.introAssets.mistakes} alt={`${mistakes} mistakes hidden`} /><img src={doc.introAssets.time} alt="Time limit: 1 minute" /></div><button ref={reviewRef} className="image-button intro-review" type="button" onClick={onReview}><img src={doc.introAssets.review} alt={`Review ${doc.label}`} /></button>{showRule && <RuleDialog label={doc.label} onClose={closeRule} />}</section>
}
