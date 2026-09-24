import { useEffect, useRef, useState } from 'react'
import { RefHeader } from './RefChrome'
import { downloadAsPdf, downloadAsPng } from '../utils/exportImage'
import { burst, countUp } from '../lib/motion'

// Used to be a plain <a download> straight at the .webp source — one click, one fixed format,
// no say in the matter. This lets the user pick PNG or PDF before anything downloads.
function SaveMenu({ doc }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event) => { if (!menuRef.current?.contains(event.target)) setOpen(false) }
    const onKeyDown = (event) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const save = async (format) => {
    setOpen(false)
    setBusy(true)
    try {
      const filename = `spot-the-mistake-${doc.id}-corrected.${format}`
      if (format === 'png') await downloadAsPng(doc.corrected, filename)
      else await downloadAsPdf(doc.corrected, filename)
    } catch (error) {
      console.warn('Could not export corrected document:', error)
    } finally {
      setBusy(false)
    }
  }

  return <div className="save-menu" ref={menuRef}>
    <button type="button" className="save-menu-toggle" aria-haspopup="true" aria-expanded={open} disabled={busy} onClick={() => setOpen((value) => !value)}>{busy ? 'Saving…' : 'Save to device'} <span aria-hidden="true">↓</span></button>
    {open && <div className="save-menu-options" role="menu">
      <button type="button" role="menuitem" onClick={() => save('png')}>Save as PNG</button>
      <button type="button" role="menuitem" onClick={() => save('pdf')}>Save as PDF</button>
    </div>}
  </div>
}

function CorrectedViewer({ doc, onClose }) {
  const backButton = useRef(null)
  useEffect(() => {
    backButton.current?.focus()
    const onKeyDown = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return <section className="corrected-viewer" role="dialog" aria-modal="true" aria-label={`Corrected ${doc.label}`}>
    <div className="corrected-viewer-actions"><button ref={backButton} type="button" onClick={onClose}>← Back</button><SaveMenu doc={doc} /></div>
    <img src={doc.corrected} alt={`Corrected ${doc.label}`} decoding="async" />
  </section>
}

export function Result({ doc, avatar, score, badge, onAgain }) {
  const [showCorrect, setShowCorrect] = useState(false)
  const [showReflection, setShowReflection] = useState(false)
  const resultDocumentName = doc.id === 'cv' ? 'CV' : doc.label

  const scoreRef = useRef(null)
  const boardRef = useRef(null)

  useEffect(() => { window.scrollTo(0, 0) }, [])
  useEffect(() => {
    countUp(scoreRef.current, score)
    const timer = setTimeout(() => burst(boardRef.current, 40), 900)
    return () => clearTimeout(timer)
  }, [score])

  return <section className="ref-screen ref-blue ref-result">
    <RefHeader avatar={avatar} back={onAgain} />
    <div ref={boardRef} className="result-board-wrap"><img src={doc.resultAssets.board} alt="Spot the Mistake score board" /><strong ref={scoreRef}>{score}</strong><span>{doc.sections.length} out of {doc.sections.length} sections cleared!</span></div>
    {showCorrect
      ? <CorrectedViewer doc={doc} onClose={() => setShowCorrect(false)} />
      : <>
        <button className="reflection-toggle" type="button" onClick={() => setShowReflection((value) => !value)} aria-expanded={showReflection}><span>Tap here to see reflection questions</span><b>{showReflection ? '⌃' : '⌄'}</b></button>
        {showReflection && <img className="reflection-panel" src={doc.resultAssets.reflection} alt="Reflection questions" />}
        <div className="result-question">
          <img src={doc.resultAssets.character} alt="Illustrated recruiter" />
          <div className="result-question-body">
            <p>Would you like to see the correct version of this {resultDocumentName}?</p>
            <div className="result-actions"><button className="image-button" type="button" onClick={() => setShowCorrect(true)}><img src={doc.resultAssets.yes} alt="Of course, let's go" /></button><button className="image-button" type="button" onClick={onAgain}><img src={doc.resultAssets.no} alt="No, back to mode selection" /></button></div>
          </div>
        </div>
      </>}
  </section>
}
