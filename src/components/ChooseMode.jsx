import { documents } from '../data/documents'
import { popIn } from '../lib/motion'
import { asset } from '../utils/assets'
import { RefHeader, RibbonTitle } from './RefChrome'

export function ChooseMode({ profile, onChange, onBack, onStart }) {
  const ready = Boolean(profile.documentMode)
  return <section className="ref-screen ref-blue setup-screen"><RefHeader avatar={profile.avatar} back={onBack} /><img className="ref-logo setup-logo" src={asset('Logo.png')} alt="Spot the Mistake" /><RibbonTitle>Choose the type you want to challenge</RibbonTitle><div className="setup-options document-options">{Object.values(documents).map((doc) => <button key={doc.id} className={`setup-card document-card ${profile.documentMode === doc.id ? 'selected' : ''}`} type="button" aria-pressed={profile.documentMode === doc.id} onClick={(event) => { onChange('documentMode', doc.id); popIn(event.currentTarget.querySelector('img')) }}><img src={doc.choice} alt={`Choose ${doc.label}`} /><i className="setup-radio" /></button>)}</div>{ready && <button className="ref-next setup-next" type="button" onClick={onStart}>Next <span>›</span></button>}</section>
}
