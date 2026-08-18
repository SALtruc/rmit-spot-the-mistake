import { useEffect, useRef, useState } from 'react'
import { RefHeader } from './RefChrome'

function CorrectedViewer({ doc, onClose }) {
  const backButton = useRef(null)
  useEffect(() => {
    backButton.current?.focus()
    const onKeyDown = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return <section className="corrected-viewer" role="dialog" aria-modal="true" aria-label={`Corrected ${doc.label}`}>
    <div className="corrected-viewer-actions"><button ref={backButton} type="button" onClick={onClose}>← Back</button><a href={doc.corrected} download={`spot-the-mistake-${doc.id}-corrected.webp`}>Save to device <span aria-hidden="true">↓</span></a></div>
    <img src={doc.corrected} alt={`Corrected ${doc.label}`} decoding="async" />
  </section>
}

export function Result({ doc, avatar, score, badge, onAgain }) {
  const [showCorrect, setShowCorrect] = useState(false)
  const [showReflection, setShowReflection] = useState(false)
  const resultDocumentName = doc.id === 'cv' ? 'CV' : doc.label

  useEffect(() => { window.scrollTo(0, 0) }, [])

  return <section className="ref-screen ref-blue ref-result">
    <RefHeader avatar={avatar} back={onAgain} />
    <div className="result-board-wrap"><img src={doc.resultAssets.board} alt="Spot the Mistake score board" /><strong>{score}</strong><span>{doc.sections.length} out of {doc.sections.length} sections cleared!</span></div>
    {showCorrect
      ? <CorrectedViewer doc={doc} onClose={() => setShowCorrect(false)} />
      : <>
        <button className="reflection-toggle" type="button" onClick={() => setShowReflection((value) => !value)} aria-expanded={showReflection}><span>Tap here to see reflection questions</span><b>{showReflection ? '⌃' : '⌄'}</b></button>
        {showReflection && <img className="reflection-panel" src={doc.resultAssets.reflection} alt="Reflection questions" />}
        <div className="result-question"><img src={doc.resultAssets.character} alt="Illustrated recruiter" /><p>Would you like to see the correct version of this {resultDocumentName}?</p></div>
        <div className="result-actions"><button className="image-button" type="button" onClick={() => setShowCorrect(true)}><img src={doc.resultAssets.yes} alt="Of course, let's go" /></button><button className="image-button" type="button" onClick={onAgain}><img src={doc.resultAssets.no} alt="No, back to mode selection" /></button></div>
      </>}
  </section>
}
