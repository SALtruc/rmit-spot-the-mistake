import { asset } from '../utils/assets'
import { BrandMark } from './RefChrome'

export function Home({ onStart }) {
  return <section className="ref-screen ref-red ref-home"><BrandMark /><img className="ref-home-logo" src={asset('Logo.png')} alt="Spot the Mistake" decoding="async" /><img className="ref-home-bubble" src={asset('Start Screen/Bubble Chat.png')} alt="Can you outsmart the recruiter?" decoding="async" /><img className="ref-home-character" src={asset('Start Screen/Character.png')} alt="Illustrated recruiter holding a magnifying glass" decoding="async" fetchPriority="high" /><button className="image-button ref-home-start" type="button" onClick={onStart}><img src={asset('Start Screen/Frame 280.png')} alt="Start the game" decoding="async" /></button></section>
}
