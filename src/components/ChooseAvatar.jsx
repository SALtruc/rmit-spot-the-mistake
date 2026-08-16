import { asset } from '../utils/assets'
import { avatars } from '../data/avatars'
import { AvatarSprite, BrandMark } from './RefChrome'

export function ChooseAvatar({ selected, onSelect, onBack, onNext }) {
  return <section className="ref-screen ref-red avatar-screen"><BrandMark onClick={onBack} /><h1>But first, let’s<br />choose your <em>avatar</em></h1><div className="avatar-choice-grid">{avatars.map((avatar, index) => { const isSelected = selected === index; return <button key={avatar.id} className={isSelected ? 'selected' : ''} type="button" onClick={() => onSelect(index)} aria-label={`Choose ${avatar.name} avatar`} aria-pressed={isSelected}><img src={asset(isSelected ? avatar.selected : avatar.idle)} alt="" decoding="async" /></button> })}</div><button className="ref-next avatar-next" type="button" onClick={onNext} disabled={selected === null}>Next <span>›</span></button><AvatarSprite index={selected ?? 0} className="avatar-selection-preview" /></section>
}
