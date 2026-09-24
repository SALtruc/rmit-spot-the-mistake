import { asset } from '../utils/assets'
import { avatars } from '../data/avatars'
import { popIn } from '../lib/motion'
import { AvatarSprite, BrandMark } from './RefChrome'

export function ChooseAvatar({ selected, onSelect, onBack, onNext }) {
  return <section className="ref-screen ref-red avatar-screen">
    <header className="avatar-header">
      <BrandMark onClick={onBack} />
      <h1>But first, let’s<br />choose your <em>avatar</em></h1>
    </header>
    <div className="avatar-choice-grid">
      {avatars.map((avatar, index) => {
        const isSelected = selected === index
        return <button key={avatar.id} className={isSelected ? 'selected' : ''} type="button" onClick={(event) => { onSelect(index); popIn(event.currentTarget.querySelector('img')) }} aria-label={`Choose ${avatar.name} avatar`} aria-pressed={isSelected}>
          <img src={asset(isSelected ? avatar.selected : avatar.idle)} alt="" decoding="async" />
        </button>
      })}
    </div>
    <button className="ref-next avatar-next" type="button" onClick={onNext} disabled={selected === null}>
      Next <span>›</span>
    </button>
    <AvatarSprite index={selected ?? 0} className="avatar-selection-preview" />
  </section>
}
