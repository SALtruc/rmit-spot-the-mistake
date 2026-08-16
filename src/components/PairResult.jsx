import { useEffect, useState } from 'react'
import { subscribeToPairRoom } from '../lib/pairRooms'
import { RefHeader } from './RefChrome'
import { Result } from './Result'

export function PairResult({ room, avatar, doc, score, badge, onAgain }) {
  const [state, setState] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => subscribeToPairRoom(room.id, setState, (nextError) => setError(nextError.message || 'We could not refresh your pair result.')), [room.id])

  const participants = state?.participants ?? []
  const bothComplete = participants.length === 2 && participants.every((participant) => participant.is_complete)

  if (!bothComplete) {
    const partner = participants.find((participant) => participant.id !== room.participantId)
    return <section className="ref-screen ref-blue pair-screen pair-result-wait"><RefHeader avatar={avatar} back={onAgain} /><div className="pair-paper pair-waiting-paper"><div className="pair-color-tabs" /><p className="pair-kicker">Pair comparison</p><h1>Waiting for your partner</h1><p>Your score is saved. {partner ? `${partner.display_name} is still reviewing the document.` : 'Your partner has not reconnected yet.'}</p><div className="pair-progress-list"><div><strong>You</strong><span>Complete · {score} points</span></div><div><strong>{partner?.display_name || 'Your partner'}</strong><span>{partner?.is_complete ? `Complete · ${partner.score} points` : 'In progress'}</span></div></div>{error && <p className="pair-error" role="alert">{error}</p>}</div></section>
  }

  return <Result doc={doc} avatar={avatar} playMode="pair" score={score} badge={badge} onAgain={onAgain} pairParticipants={participants} />
}
