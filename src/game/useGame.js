import { useMemo, useState } from 'react'
import { documents, getMistakeCount } from '../data/documents'

const getBadge = (doc, score) => {
  const thresholds = doc.id === 'linkedin' ? [1200, 800, 500] : [500, 300, 100]
  if (score >= thresholds[0]) return 'Recruiter Approved'
  if (score >= thresholds[1]) return 'Detective'
  if (score >= thresholds[2]) return 'Spotter'
  return 'Rookie'
}

export function useGame() {
  const [screen, setScreen] = useState('home')
  const [mode, setMode] = useState(null)
  const [active, setActive] = useState(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(1)
  const [status, setStatus] = useState({})
  const [tapped, setTapped] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [revealed, setRevealed] = useState({})
  const [profile, setProfile] = useState({ sid: '', avatar: null, year: '', program: '', accessCode: '', documentMode: null })

  const doc = mode ? documents[mode] : null
  const section = active === null || !doc ? null : doc.sections[active]
  const activeKey = active === null ? '' : `${mode}-${active}`
  const tappedLines = tapped[activeKey] || []
  const mistakeCount = section ? section.lines.filter(([, isMistake]) => isMistake === true).length : 0
  const foundMistakes = section ? tappedLines.filter((index) => section.lines[index][1]).length : 0
  const isSectionDone = section ? status[active] === 'done' : false
  const isSectionRevealed = section ? Boolean(revealed[active]) : false
  const completed = doc ? Object.values(status).filter((state) => state === 'done').length : 0
  const badge = useMemo(() => doc ? getBadge(doc, score) : '', [doc, score])

  const setProfileField = (field, value) => setProfile((previous) => ({ ...previous, [field]: value }))
  const resetGame = () => { setScreen('home'); setMode(null); setActive(null); setScore(0); setCombo(1); setStatus({}); setTapped({}); setFeedback(null); setRevealed({}); setProfile({ sid: '', avatar: null, year: '', program: '', accessCode: '', documentMode: null }) }
  // Return to the mode/type picker without losing what the student already entered (SID, avatar,
  // year, program), so replaying with a different document doesn't mean filling the form again.
  const backToChoose = () => { setScreen('choose'); setMode(null); setActive(null); setScore(0); setCombo(1); setStatus({}); setTapped({}); setFeedback(null); setRevealed({}) }
  const chooseMode = (nextMode) => { setMode(nextMode); setScreen('intro'); setActive(null); setScore(0); setCombo(1); setStatus({}); setTapped({}); setFeedback(null); setRevealed({}) }
  const openSection = (index) => { setActive(index); setStatus((previous) => previous[index] === 'done' ? previous : { ...previous, [index]: 'active' }); setFeedback(null); setScreen('play') }
  const leaveSection = () => { setFeedback(null); setScreen('overview') }
  const clearFeedback = () => setFeedback(null)
  const awardCorrect = (message, finishSection) => { const points = 100 * combo; setScore((value) => value + points); setCombo((value) => value + 1); if (finishSection) setStatus((previous) => ({ ...previous, [active]: 'done' })); setFeedback({ kind: 'correct', title: `Correct! +${points} points`, text: message }) }
  const awardWrong = (message) => { setScore((value) => Math.max(0, value - 20)); setCombo(1); setFeedback({ kind: 'wrong', title: 'Not quite. −20 points', text: message }) }
  const submitSelections = (selections) => {
    if (doc?.id !== 'linkedin' || isSectionDone) return

    const selected = [...new Set(selections)].filter((index) => Number.isInteger(index) && index >= 0 && index < section.lines.length)
    const mistakes = section.lines.flatMap(([, isMistake], index) => isMistake === true ? [index] : [])
    const confirmed = tappedLines.filter((index) => mistakes.includes(index))
    const newlyConfirmed = selected.filter((index) => mistakes.includes(index) && !confirmed.includes(index))
    const incorrectSelections = selected.filter((index) => !mistakes.includes(index))

    if (mistakes.length === 0 && selected.length === 0) {
      return awardCorrect('Sharp eye! This section is clean and professionally written.', true)
    }

    if (newlyConfirmed.length === 0) {
      awardWrong('Those selected lines are fine. The green checks stay saved, so try a different line.')
      return
    }

    const points = newlyConfirmed.reduce((total, _, index) => total + 100 * (combo + index), 0)
    const savedAnswers = [...confirmed, ...newlyConfirmed]
    const remaining = mistakes.length - savedAnswers.length
    setTapped((previous) => ({ ...previous, [activeKey]: savedAnswers }))
    setScore((value) => value + points)
    setCombo((value) => incorrectSelections.length ? 1 : value + newlyConfirmed.length)

    if (remaining === 0) {
      setStatus((previous) => ({ ...previous, [active]: 'done' }))
      setFeedback({
        kind: 'correct',
        title: `All mistakes found! +${points} points`,
        text: incorrectSelections.length
          ? 'Every real mistake is now saved in green. One extra selected line was fine, so your combo reset.'
          : 'Every mistake in this section is now saved in green.',
      })
      return
    }

    setFeedback({
      kind: 'progress',
      title: `${newlyConfirmed.length} correct answer${newlyConfirmed.length === 1 ? '' : 's'} saved! +${points} points`,
      text: `${remaining} mistake${remaining === 1 ? '' : 's'} left to find.${incorrectSelections.length ? ' One selected line was fine, so the combo reset.' : ''}`,
    })
  }
  const tapLine = (index) => {
    if (isSectionDone || tappedLines.includes(index)) return
    const [, isMistake, explanation] = section.lines[index]
    if (!isMistake) return awardWrong(explanation)
    setTapped((previous) => ({ ...previous, [activeKey]: [...(previous[activeKey] || []), index] }))
    awardCorrect(explanation, foundMistakes + 1 === mistakeCount)
  }
  const chooseNone = () => {
    if (isSectionDone) return
    if (mistakeCount === 0) return awardCorrect('Sharp eye! This section is clean. The details are complete and professionally formatted.', true)
    awardWrong('There is at least one mistake in this section. Keep looking carefully!')
  }
  // Reveals every mistake line without scoring it, for students who just want to see the answer.
  // The section is still marked done so they can move on, but no points are awarded for it.
  const revealSection = () => {
    if (!section || isSectionDone) return
    const mistakeIndexes = section.lines.flatMap(([, isMistake], index) => isMistake === true ? [index] : [])
    setTapped((previous) => ({ ...previous, [activeKey]: mistakeIndexes }))
    setRevealed((previous) => ({ ...previous, [active]: true }))
    setStatus((previous) => ({ ...previous, [active]: 'done' }))
    setFeedback(null)
  }

  return { screen, setScreen, doc, section, active, score, combo, status, tappedLines, feedback, isSectionDone, isSectionRevealed, completed, badge, profile, setProfileField, totalMistakes: doc ? getMistakeCount(doc) : 0, resetGame, backToChoose, chooseMode, openSection, leaveSection, clearFeedback, tapLine, chooseNone, submitSelections, revealSection }
}
