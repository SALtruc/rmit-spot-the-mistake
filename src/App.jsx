import { useEffect, useRef } from 'react'
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
import { useScreenMotion } from './lib/motion'
import { logGameResult } from './lib/resultLogger'

export function App() {
  const game = useGame()
  const shellRef = useRef(null)
  useScreenMotion(shellRef, `${game.screen}:${game.doc?.id}:${game.active}`)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [game.screen])

  useEffect(() => {
    if (game.screen !== 'result' || !game.doc) return

    const resultKey = [game.doc.id, game.profile.sid, game.score, game.completed].join(':')
    if (logGameResult.loggedKey === resultKey) return
    logGameResult.loggedKey = resultKey

    logGameResult({
      studentId: game.profile.sid || '',
      playMode: 'individual',
      documentMode: game.doc.id,
      score: game.score,
      sectionsCompleted: game.completed,
      sectionsTotal: game.doc.sections.length,
      recruiterBadge: game.badge,
    }).catch((error) => console.warn('Could not log game result:', error))
  }, [game.screen, game.doc, game.profile.sid, game.score, game.completed, game.badge])

  return <main ref={shellRef} className="app-shell">
    {game.screen === 'home' && <Home onStart={() => game.setScreen('verify')} />}
    {game.screen === 'verify' && <VerifyStudent sid={game.profile.sid} onChange={(value) => game.setProfileField('sid', value)} onBack={() => game.setScreen('home')} onNext={() => game.setScreen('avatar')} />}
    {game.screen === 'avatar' && <ChooseAvatar selected={game.profile.avatar} onSelect={(value) => game.setProfileField('avatar', value)} onBack={() => game.setScreen('verify')} onNext={() => game.setScreen('profile')} />}
    {game.screen === 'profile' && <ProfileInfo profile={game.profile} onChange={game.setProfileField} onBack={() => game.setScreen('avatar')} onNext={() => game.setScreen('choose')} />}
    {game.screen === 'choose' && <ChooseMode profile={game.profile} onChange={game.setProfileField} onBack={() => game.setScreen('profile')} onStart={() => game.chooseMode(game.profile.documentMode)} />}
    {game.screen === 'intro' && <Intro doc={game.doc} avatar={game.profile.avatar} mistakes={game.totalMistakes} onBack={game.backToChoose} onReview={() => game.setScreen('overview')} />}
    {game.screen === 'overview' && <Overview doc={game.doc} avatar={game.profile.avatar} status={game.status} score={game.score} combo={game.combo} onBack={game.backToChoose} onOpen={game.openSection} onFinish={() => game.setScreen('result')} />}
    {game.screen === 'play' && <Gameplay doc={game.doc} avatar={game.profile.avatar} section={game.section} index={game.active} status={game.status} tapped={game.tappedLines} done={game.isSectionDone} revealed={game.isSectionRevealed} feedback={game.feedback} score={game.score} combo={game.combo} completed={game.completed} onLine={game.tapLine} onNone={game.chooseNone} onSubmitSelections={game.submitSelections} onRetry={game.clearFeedback} onDone={game.leaveSection} onReveal={game.revealSection} />}
    {game.screen === 'result' && <Result doc={game.doc} avatar={game.profile.avatar} score={game.score} badge={game.badge} onAgain={game.backToChoose} />}
  </main>
}
