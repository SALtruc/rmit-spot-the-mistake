import { documents } from '../data/documents'
import { asset } from '../utils/assets'
import { RefHeader, RibbonTitle } from './RefChrome'

const playModes = [
  { id: 'solo', title: 'Individual challenge', description: 'Play solo against the clock. Find as many mistakes as you can before time runs out.', icon: 'Icons/user-fill.svg' },
  { id: 'pair', title: 'Pair comparison', description: 'Play with a partner. Compare what you each spotted, then discuss with no right or wrong, just reflection and dialogue.', icon: 'Icons/users-fill.svg' },
]

export function ChooseMode({ profile, onChange, onBack, onStart }) {
  const ready = profile.playMode && profile.documentMode
  return <section className="ref-screen ref-blue setup-screen"><RefHeader avatar={profile.avatar} back={onBack} /><img className="ref-logo setup-logo" src={asset('Logo.png')} alt="Spot the Mistake" /><RibbonTitle>First, choose the mode you want to challenge</RibbonTitle><div className="setup-options play-mode-options">{playModes.map((mode) => <button key={mode.id} className={`setup-card ${profile.playMode === mode.id ? 'selected' : ''}`} type="button" aria-pressed={profile.playMode === mode.id} onClick={() => onChange('playMode', mode.id)}><img className="setup-icon" src={asset(mode.icon)} alt="" /><span className="setup-copy"><strong>{mode.title}</strong><small>{mode.description}</small></span><i className="setup-radio" /></button>)}</div><RibbonTitle>Then, choose the type you want to challenge</RibbonTitle><div className="setup-options document-options">{Object.values(documents).map((doc) => <button key={doc.id} className={`setup-card document-card ${profile.documentMode === doc.id ? 'selected' : ''}`} type="button" aria-pressed={profile.documentMode === doc.id} onClick={() => onChange('documentMode', doc.id)}><img src={doc.choice} alt={`Choose ${doc.label}`} /><i className="setup-radio" /></button>)}</div>{ready && <button className="ref-next setup-next" type="button" onClick={onStart}>Next <span>›</span></button>}</section>
}
