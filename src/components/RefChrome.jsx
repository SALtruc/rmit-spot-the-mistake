import { asset } from '../utils/assets'
import { avatars } from '../data/avatars'

export function BrandMark({ onClick, label = 'Back' }) {
  const Tag = onClick ? 'button' : 'div'
  return <Tag className="ref-brand-mark" type={onClick ? 'button' : undefined} onClick={onClick} aria-label={onClick ? label : 'RMIT University'}><svg viewBox="0 0 110 107" aria-hidden="true"><path d="M55.843,0 L41.59,0 L41.59,11.569 L17.848,11.569 L17.848,35.683 L0,35.683 L0,71.352 L18.074,71.352 L18.074,94.825 L41.59,94.825 L41.59,106.79 L54.143,106.79 C83.468,106.79 109.36,83.157 109.36,53.518 C109.36,24.184 85.195,0 55.843,0" /></svg></Tag>
}

export function AvatarSprite({ index = 0, className = '' }) {
  const selectedAvatar = avatars[index] ?? avatars[0]
  return <span className={`avatar-sprite ${className}`} style={{ backgroundImage: `url("${asset(selectedAvatar.character)}")` }} aria-hidden="true" />
}

export function RefHeader({ avatar, back }) {
  return <header className="ref-header"><BrandMark onClick={back} /><AvatarSprite index={avatar ?? 0} className="ref-header-avatar" /></header>
}

export function RibbonTitle({ children }) {
  return <div className="ribbon-shadow"><div className="ribbon-title">{children}</div></div>
}
