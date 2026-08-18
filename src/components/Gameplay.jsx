import { useEffect, useState } from 'react'
import { asset } from '../utils/assets'
import { RefHeader } from './RefChrome'
import { ScoreBar } from './shared'

export function Gameplay({ doc, avatar, section, index, status, tapped, done, revealed, feedback, score, combo, onLine, onNone, onSubmitSelections, onRetry, onDone, onReveal }) {
  const [showHint, setShowHint] = useState(false)
  const [pending, setPending] = useState(null)
  const [selectedLines, setSelectedLines] = useState([])
  const [selectionTouched, setSelectionTouched] = useState(false)
  const isMultiSelect = doc.id === 'linkedin'

  useEffect(() => {
    setShowHint(false)
    setPending(null)
    setSelectedLines([])
    setSelectionTouched(false)
  }, [index])

  useEffect(() => {
    const dismissOnEscape = (event) => { if (event.key === 'Escape') setShowHint(false) }
    if (showHint) window.addEventListener('keydown', dismissOnEscape)
    return () => window.removeEventListener('keydown', dismissOnEscape)
  }, [showHint])

  const submit = () => {
    if (isMultiSelect) {
      onSubmitSelections(selectedLines)
      setSelectedLines([])
      setSelectionTouched(false)
    }
    else if (pending === 'none') onNone()
    else if (Number.isInteger(pending)) onLine(pending)
    setPending(null)
  }

  const toggleLine = (lineIndex) => {
    if (!isMultiSelect) {
      setPending(lineIndex)
      return
    }
    setSelectionTouched(true)
    setSelectedLines((previous) => previous.includes(lineIndex)
      ? previous.filter((selectedIndex) => selectedIndex !== lineIndex)
      : [...previous, lineIndex])
  }

  const chooseNone = () => {
    if (!isMultiSelect) {
      setPending('none')
      return
    }
    setSelectionTouched(true)
    setSelectedLines([])
  }

  const retry = () => {
    setPending(null)
    setSelectedLines([])
    setSelectionTouched(false)
    onRetry()
  }

  const reveal = () => {
    setPending(null)
    setSelectedLines([])
    setSelectionTouched(false)
    onReveal()
  }

  const canSubmit = isMultiSelect ? selectionTouched : pending !== null
  const confirmedMistakes = tapped.filter((lineIndex) => section.lines[lineIndex]?.[1]).length
  const remainingMistakes = section.lines.filter(([, isMistake]) => isMistake === true).length - confirmedMistakes
  const instruction = isMultiSelect
    ? `Select every line that contains a mistake. Correct answers stay checked after you submit.${confirmedMistakes ? ` ${remainingMistakes} mistake${remainingMistakes === 1 ? '' : 's'} left to find.` : ' You can choose more than one answer before submitting.'}`
    : 'Tap the line containing a mistake. If nothing is wrong, tap None — this section looks fine.'

  return <section className="screen gameplay-screen ref-gameplay">
    <RefHeader avatar={avatar} back={onDone} />
    <button className="game-help" type="button" aria-label={`Show how to play ${doc.label}`} aria-expanded={showHint} onClick={() => setShowHint(true)}>?</button>
    <article className={`review-card ref-review-card ${doc.id}`}>
      <h1>{section.title}</h1>
      <span className="section-rule" />
      {section.question && <div className="question-box"><span>Interviewer</span><p>“{section.question}”</p></div>}
      <p id="section-instruction" className="section-instruction">{instruction}</p>
      <div className="line-list">
        {section.lines.map(([text, mistake], lineIndex) => {
          if (mistake === 'header') return <p key={`${lineIndex}-${text}`} className="answer-line-header">{text}</p>

          const submitted = tapped.includes(lineIndex)
          const selected = isMultiSelect ? selectedLines.includes(lineIndex) : pending === lineIndex
          const state = submitted
            ? revealed ? 'revealed' : mistake ? 'correct' : 'wrong'
            : selected ? 'pending' : ''

          return <button
            key={`${lineIndex}-${text}`}
            type="button"
            disabled={done || submitted || Boolean(feedback)}
            onClick={() => toggleLine(lineIndex)}
            aria-pressed={selected}
            aria-describedby="section-instruction"
            className={`answer-line ${state}`}
          >
            <b>{text}</b>
          </button>
        })}
      </div>
      <button
        className={`none-button ${(isMultiSelect ? selectionTouched && selectedLines.length === 0 : pending === 'none') ? 'pending' : ''}`}
        type="button"
        disabled={done || Boolean(feedback)}
        onClick={chooseNone}
      >
        None — this section looks fine.
      </button>
      {isMultiSelect && <p className="selection-count" aria-live="polite">{selectionTouched ? `${selectedLines.length} answer${selectedLines.length === 1 ? '' : 's'} selected` : 'Choose every answer that applies.'}</p>}
      {!feedback && !done && <button className="section-submit" type="button" disabled={!canSubmit} onClick={submit}>{isMultiSelect ? 'Submit selected answers' : 'Submit'} <span>›</span></button>}
      {feedback && <div className={`feedback ${feedback.kind}`} role="status"><strong>{feedback.title}</strong><p>{feedback.text}</p></div>}
      {feedback && !done && <div className="feedback-actions">
        <button type="button" onClick={retry}>{isMultiSelect ? `Keep looking${remainingMistakes ? ` (${remainingMistakes} left)` : ''}` : 'Try another answer'}</button>
      </div>}
      {!done && <button className="show-answer" type="button" onClick={reveal}>Show answer <small>(no points for this section)</small></button>}
      {revealed && done && <p className="revealed-note">Answer revealed — no points earned for this section.</p>}
      {done && <button className="done-button" type="button" onClick={onDone}><img src={asset('Done button.png')} alt="Done — return to document overview" /></button>}
    </article>
    <ScoreBar doc={doc} status={status} score={score} combo={combo} />
    {showHint && <div className="gameplay-hint" role="dialog" aria-modal="true" aria-label={`How to play ${doc.label}`}>
      <button className="hint-dismiss" type="button" autoFocus onClick={() => setShowHint(false)}>Close <span aria-hidden="true">×</span></button>
      <div className="hint-art"><img src={doc.character} alt="" /><img src={doc.instructionArt} alt={doc.rule} /></div>
    </div>}
  </section>
}
