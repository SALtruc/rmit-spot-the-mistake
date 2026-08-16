import { useEffect, useRef, useState } from 'react'
import { subscribeToPairRoom } from '../lib/pairRooms'
import { RefHeader } from './RefChrome'

export function PairRoom({ room, avatar, onBack, onPlay }) {
  const [state, setState] = useState(null)
  const [error, setError] = useState('')
  const hasStarted = useRef(false)
  const participantCount = state?.participants.length ?? 0

  useEffect(() => subscribeToPairRoom(room.id, setState, (nextError) => setError(nextError.message || 'We could not refresh this room.')), [room.id])

  useEffect(() => {
    if (participantCount === 2 && !hasStarted.current) {
      hasStarted.current = true
      const timer = window.setTimeout(() => onPlay(room.documentMode), 700)
      return () => window.clearTimeout(timer)
    }
  }, [participantCount, onPlay, room.documentMode])

  const participants = state?.participants ?? []
  const partner = participants.find((participant) => participant.id !== room.participantId)

  return <section className="ref-screen ref-blue pair-screen pair-room-screen"><RefHeader avatar={avatar} back={onBack} /><div className="pair-paper pair-waiting-paper"><div className="pair-color-tabs" /><p className="pair-kicker">Pair room</p><h1>{participantCount >= 2 ? 'Your partner joined' : 'Waiting for your partner'}</h1><p>{participantCount >= 2 ? 'Starting your shared challenge…' : 'Send this invitation code. The game will begin as soon as your partner joins.'}</p><div className="invite-code" aria-label={`Invitation code ${room.code}`}>{room.code.split('').map((digit, index) => <span key={`${digit}-${index}`}>{digit}</span>)}</div><div className="pair-participants" aria-live="polite"><div><i className="pair-presence online" /><strong>{participants.find((participant) => participant.id === room.participantId)?.display_name || 'You'}</strong><span>You’re in</span></div><div><i className={`pair-presence ${partner ? 'online' : ''}`} /><strong>{partner?.display_name || 'Your partner'}</strong><span>{partner ? 'Joined' : 'Waiting to join'}</span></div></div>{error && <p className="pair-error" role="alert">{error}</p>}</div></section>
}
