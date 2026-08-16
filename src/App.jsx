import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ChooseMode } from './components/ChooseMode'
import { Gameplay } from './components/Gameplay'
import { Home } from './components/Home'
import { Intro } from './components/Intro'
import { Overview } from './components/Overview'
import { ChooseAvatar } from './components/ChooseAvatar'
import { ProfileInfo } from './components/ProfileInfo'
import { Result } from './components/Result'
import { VerifyStudent } from './components/VerifyStudent'
import { useGame } from './game/useGame'
import { logGameResult } from './lib/resultLogger'

const pairRoomStorageKey = 'spot-the-mistake:pair-room'
const PairLobby = lazy(() => import('./components/PairLobby').then((module) => ({ default: module.PairLobby })))
const PairRoom = lazy(() => import('./components/PairRoom').then((module) => ({ default: module.PairRoom })))
const PairResult = lazy(() => import('./components/PairResult').then((module) => ({ default: module.PairResult })))

const getStoredPairRoom = () => {
  try {
    const value = window.sessionStorage.getItem(pairRoomStorageKey)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function App() {
  const game = useGame()
  const [pairRoom, setPairRoom] = useState(getStoredPairRoom)
  const loggedResultKey = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [game.screen])

  useEffect(() => {
    if (pairRoom && game.screen === 'home') game.setScreen('pair-room')
  }, [pairRoom, game.screen, game.setScreen])

  const pairGameScreen = pairRoom && ['intro', 'overview', 'play', 'result'].includes(game.screen)
  useEffect(() => {
    if (!pairGameScreen || !game.doc) return undefined
    const timer = window.setTimeout(() => {
      import('./lib/pairRooms')
        .then(({ savePairProgress }) => savePairProgress({
          participantId: pairRoom.participantId,
          score: game.score,
          isComplete: game.screen === 'result',
          progress: { screen: game.screen, completedSections: game.completed, totalSections: game.doc.sections.length },
        }))
        .catch((error) => console.error('Could not save pair progress:', error))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [pairGameScreen, pairRoom, game.screen, game.doc, game.score, game.completed, game.status])

  useEffect(() => {
    if (game.screen !== 'result' || !game.doc) return

    const resultKey = [game.doc.id, game.profile.playMode, game.profile.sid, game.score, game.completed].join(':')
    if (loggedResultKey.current === resultKey) return
    loggedResultKey.current = resultKey

    logGameResult({
      studentId: game.profile.sid || '',
      playMode: game.profile.playMode || 'individual',
      documentMode: game.doc.id,
      score: game.score,
      sectionsCompleted: game.completed,
      sectionsTotal: game.doc.sections.length,
      recruiterBadge: game.badge,
    }).catch((error) => console.warn('Could not log game result:', error))
  }, [game.screen, game.doc, game.profile.playMode, game.profile.sid, game.score, game.completed, game.badge])

  useEffect(() => {
    if (game.screen === 'home') loggedResultKey.current = null
  }, [game.screen])

  const enterPairRoom = (room) => {
    setPairRoom(room)
    window.sessionStorage.setItem(pairRoomStorageKey, JSON.stringify(room))
    game.setScreen('pair-room')
  }

  const leavePairRoom = () => {
    setPairRoom(null)
    window.sessionStorage.removeItem(pairRoomStorageKey)
    game.setScreen('choose')
  }

  const startPairGame = (documentMode) => {
    game.setProfileField('documentMode', documentMode)
    game.chooseMode(documentMode)
  }

  const resetPairGame = () => {
    setPairRoom(null)
    window.sessionStorage.removeItem(pairRoomStorageKey)
    game.resetGame()
  }

  return <main className="app-shell">
    {game.screen === 'home' && <Home onStart={() => game.setScreen('verify')} />}
    {game.screen === 'verify' && <VerifyStudent sid={game.profile.sid} onChange={(value) => game.setProfileField('sid', value)} onBack={() => game.setScreen('home')} onNext={() => game.setScreen('avatar')} />}
    {game.screen === 'avatar' && <ChooseAvatar selected={game.profile.avatar} onSelect={(value) => game.setProfileField('avatar', value)} onBack={() => game.setScreen('verify')} onNext={() => game.setScreen('profile')} />}
    {game.screen === 'profile' && <ProfileInfo profile={game.profile} onChange={game.setProfileField} onBack={() => game.setScreen('avatar')} onNext={() => game.setScreen('choose')} />}
    {game.screen === 'choose' && <ChooseMode profile={game.profile} onChange={game.setProfileField} onBack={() => game.setScreen('profile')} onStart={() => game.profile.playMode === 'pair' ? game.setScreen('pair') : game.chooseMode(game.profile.documentMode)} />}
    {game.screen === 'pair' && <Suspense fallback={null}><PairLobby avatar={game.profile.avatar} documentMode={game.profile.documentMode} onBack={() => game.setScreen('choose')} onJoined={enterPairRoom} /></Suspense>}
    {game.screen === 'pair-room' && pairRoom && <Suspense fallback={null}><PairRoom room={pairRoom} avatar={pairRoom.avatar ?? game.profile.avatar} onBack={leavePairRoom} onPlay={startPairGame} /></Suspense>}
    {game.screen === 'intro' && <Intro doc={game.doc} avatar={game.profile.avatar} mistakes={game.totalMistakes} onBack={() => game.setScreen('choose')} onReview={() => game.setScreen('overview')} />}
    {game.screen === 'overview' && <Overview doc={game.doc} avatar={game.profile.avatar} status={game.status} score={game.score} combo={game.combo} onBack={() => game.setScreen('intro')} onOpen={game.openSection} onFinish={() => game.setScreen('result')} />}
    {game.screen === 'play' && <Gameplay doc={game.doc} avatar={game.profile.avatar} section={game.section} index={game.active} status={game.status} tapped={game.tappedLines} done={game.isSectionDone} feedback={game.feedback} score={game.score} combo={game.combo} completed={game.completed} onLine={game.tapLine} onNone={game.chooseNone} onSubmitSelections={game.submitSelections} onRetry={game.clearFeedback} onDone={game.leaveSection} />}
    {game.screen === 'result' && pairRoom ? <Suspense fallback={null}><PairResult room={pairRoom} doc={game.doc} avatar={pairRoom.avatar ?? game.profile.avatar} score={game.score} badge={game.badge} onAgain={resetPairGame} /></Suspense> : game.screen === 'result' && <Result doc={game.doc} avatar={game.profile.avatar} playMode={game.profile.playMode} score={game.score} badge={game.badge} onAgain={game.resetGame} />}
  </main>
}
