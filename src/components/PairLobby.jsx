import { useEffect, useState } from 'react'
import { asset } from '../utils/assets'
import { createPairRoom, joinPairRoom } from '../lib/pairRooms'
import { isSupabaseConfigured } from '../lib/supabase'
import { RefHeader } from './RefChrome'

const friendlyError = (error) => error?.message || 'We could not connect to the room. Please try again.'

export function PairLobby({ avatar, documentMode, onBack, onJoined }) {
  const [step, setStep] = useState('intro')
  const [displayName, setDisplayName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [createdRoom, setCreatedRoom] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  const resetError = () => { setError(''); setNotice('') }

  const createRoom = async () => {
    if (!displayName.trim()) return setError('Enter the name your partner should see.')
    setLoading(true)
    resetError()
    try {
      const room = await createPairRoom({ documentMode, displayName: displayName.trim(), avatar })
      setCreatedRoom(room)
      setStep('code')
    } catch (nextError) {
      setError(friendlyError(nextError))
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = async () => {
    if (!displayName.trim()) return setError('Enter the name your partner should see.')
    if (joinCode.length !== 5) return setError('Enter the 5-digit invitation code.')
    setLoading(true)
    resetError()
    try {
      const room = await joinPairRoom({ roomCode: joinCode, displayName: displayName.trim(), avatar })
      onJoined({ ...room, avatar })
    } catch (nextError) {
      setError(friendlyError(nextError))
    } finally {
      setLoading(false)
    }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard?.writeText(createdRoom.code)
      setNotice('Invitation code copied.')
    } catch {
      setNotice('Copy the code manually and send it to your partner.')
    }
  }

  if (!isSupabaseConfigured) {
    return <section className="ref-screen ref-blue pair-screen"><RefHeader avatar={avatar} back={onBack} /><div className="pair-paper pair-setup-note"><div className="pair-color-tabs" /><h1>Pair Comparison needs Supabase</h1><p>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> to <code>.env.local</code>, then restart the app.</p><button className="pair-change" type="button" onClick={onBack}>Back to mode selection</button></div></section>
  }

  const nameField = <label className="pair-code-input"><span>Your display name</span><input maxLength="32" autoComplete="nickname" value={displayName} onChange={(event) => { setDisplayName(event.target.value); resetError() }} placeholder="e.g. Minh Anh" autoFocus /></label>

  return <section className="ref-screen ref-blue pair-screen"><RefHeader avatar={avatar} back={onBack} /><span className="pair-back-label">&lt; Back</span><div className="pair-paper"><div className="pair-color-tabs" /><h1>Pair Comparison</h1>{step === 'intro' && <div className="pair-choice"><button type="button" onClick={() => { setStep('create'); resetError() }}>Create invitation code</button><button type="button" onClick={() => { setStep('join'); resetError() }}>Enter invitation code</button></div>}{step === 'create' && <><p>Create a room, then send the 5-digit code to your partner.</p>{nameField}<button className="pair-start pair-paper-action" type="button" disabled={loading} onClick={createRoom}>{loading ? 'Creating…' : 'Create room'} <span>›</span></button><button className="pair-change" type="button" onClick={() => setStep('intro')}>Choose another option</button></>}{step === 'code' && <><p>Share this invitation code with your partner.</p><div className="invite-code" aria-label={`Invitation code ${createdRoom.code}`}>{createdRoom.code.split('').map((digit, index) => <span key={`${digit}-${index}`}>{digit}</span>)}</div>{notice && <p className="pair-notice" role="status">{notice}</p>}<button className="pair-change pair-copy" type="button" onClick={copyCode}>Copy invitation code</button><button className="pair-start pair-paper-action" type="button" onClick={() => onJoined({ ...createdRoom, avatar })}>Enter waiting room <span>›</span></button></>}{step === 'join' && <><p>Enter the invitation code from your partner.</p><div className="invite-code" aria-label={`Invitation code ${joinCode || 'empty'}`}>{Array.from({ length: 5 }, (_, index) => <span key={index}>{joinCode[index] ?? ''}</span>)}</div><label className="pair-code-input"><span>Invitation code</span><input inputMode="numeric" autoComplete="one-time-code" maxLength="5" value={joinCode} onChange={(event) => { setJoinCode(event.target.value.replace(/\D/g, '').slice(0, 5)); resetError() }} autoFocus /></label>{nameField}<button className="pair-start pair-paper-action" type="button" disabled={loading} onClick={joinRoom}>{loading ? 'Joining…' : 'Join room'} <span>›</span></button><button className="pair-change" type="button" onClick={() => setStep('intro')}>Choose another option</button></>}{error && <p className="pair-error" role="alert">{error}</p>}</div><div className="pair-message"><img src={asset('Collecting information/Frame 483.png')} alt="Illustrated recruiter" /><p>Let’s do this challenge with a partner. Learn together, discuss together.</p></div></section>
}
