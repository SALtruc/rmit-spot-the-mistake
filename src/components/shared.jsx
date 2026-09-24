import { useEffect, useRef } from 'react'
import { bump } from '../lib/motion'
import { asset, initials } from '../utils/assets'

export function Topbar({ back }) {
  return <header className="topbar"><img src={asset('Logo.png')} alt="Spot the Mistake" /><button className="back-button" type="button" onClick={back}>← Back</button></header>
}

export function DocumentMark({ id }) {
  return <span className={`document-mark ${id}`}>{initials[id]}</span>
}

export function ScoreBar({ doc, status, score, combo }) {
  const scoreRef = useRef(null)
  const comboRef = useRef(null)
  const previous = useRef({ score, combo })
  useEffect(() => {
    if (score !== previous.current.score) bump(scoreRef.current, score > previous.current.score)
    if (combo !== previous.current.combo) bump(comboRef.current, combo > previous.current.combo)
    previous.current = { score, combo }
  }, [score, combo])
  const completed = Object.values(status).filter((value) => value === 'done').length
  return <footer className="score-bar" aria-label="Challenge progress"><div className="score-metric"><span>Score</span><strong ref={scoreRef}>{score}</strong></div><div className="score-progress"><span>Sections</span><div className="progress-dots" aria-label={`${completed} of ${doc.sections.length} sections completed`}>{doc.sections.map((section, index) => <i key={section.title} className={status[index] || ''} />)}</div><b>{completed}/{doc.sections.length}</b></div><div className="score-metric"><span>Combo</span><strong ref={comboRef}>×{Math.max(0, combo - 1)}</strong></div></footer>
}
