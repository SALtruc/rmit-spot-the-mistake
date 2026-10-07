import { useLayoutEffect } from 'react'
import gsap from 'gsap'

// All motion lives here so screens only say *what* to animate. Everything tweens opacity/transform
// only (never layout), and entrance tweens use plain opacity rather than visibility so buttons stay
// tappable mid-animation. Entrance tweens clear their inline transform when done — otherwise GSAP's
// leftover `transform` would override CSS states like `.selected { transform: scale(1.06) }`.

export const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const LOGOS = '.ref-home-logo, .ref-logo, .overview-logo, .verify-card > img, .result-board-wrap'
const CARDS = '.verify-card, .intro-ref-card, .ref-review-card, .interactive-document, .ribbon-shadow'
const STAGGER = '.avatar-choice-grid button, .document-card, .ref-field, .interview-section-list button, .intro-card-extras > *, .intro-review, .answer-line, .none-button, .result-actions button, .reflection-toggle, .result-question p'
const CHARACTERS = '.ref-home-character, .verify-character-wrap, .info-character, .intro-ref-character, .result-question > img'
const FLOATERS = '.ref-home-bubble, .info-bubble, .ref-home-character, .verify-character-wrap, .info-character, .intro-ref-character, .result-question > img'
const BUTTONS = '.ref-next, .ref-home-start, .setup-next, .section-submit, .overview-finish'

/** Screen entrance + idle "alive" motion. Re-runs whenever `key` changes (a new screen/section). */
export function useScreenMotion(rootRef, key) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || reduceMotion()) return undefined
    const ctx = gsap.context(() => {
      const screen = root.querySelector(':scope > section')
      if (!screen) return
      const q = (selector) => screen.querySelectorAll(selector)
      const done = { clearProps: 'transform,opacity' }

      // Opacity only: a transform on the screen would re-anchor its position:fixed score bar mid-tween.
      gsap.fromTo(screen, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power1.out', clearProps: 'opacity' })
      gsap.fromTo(q(LOGOS), { scale: 0.9, rotate: -2 }, { scale: 1, rotate: 0, duration: 0.7, ease: 'elastic.out(1, 0.6)', ...done })
      gsap.fromTo(q(CARDS), { opacity: 0, y: 22, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.3)', delay: 0.05, ...done })
      gsap.fromTo(q(STAGGER), { opacity: 0, y: 16, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.36, ease: 'back.out(1.6)', stagger: 0.05, delay: 0.1, ...done })
      gsap.fromTo(q(BUTTONS), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', delay: 0.25, ...done })

      // Characters slide up into place, then everything "alive" bobs gently forever.
      const characters = q(CHARACTERS)
      gsap.fromTo(characters, { opacity: 0, y: 30, rotate: -3 }, { opacity: 1, y: 0, rotate: 0, duration: 0.65, ease: 'back.out(1.2)', delay: 0.12, clearProps: 'opacity' })
      gsap.to(q(FLOATERS), { y: '-=8', duration: 1.8, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: 0.18, delay: 0.8 })

      // START breathes to invite the first tap; the header avatar waves once.
      gsap.to(q('.ref-home-start img'), { scale: 1.06, duration: 0.9, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.9 })
      gsap.fromTo(q('.ref-header-avatar'), { rotate: 0 }, { keyframes: { rotate: [0, -14, 10, -6, 0] }, duration: 0.9, ease: 'none', delay: 0.35 })
      gsap.fromTo(q('.ref-brand-mark svg'), { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(2)', ...done })
    }, root)
    return () => ctx.revert()
  }, [rootRef, key])

  // Springy press feedback on every enabled button.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || reduceMotion()) return undefined
    const press = (event) => {
      const button = event.target.closest?.('button:not(:disabled)')
      if (!button || !root.contains(button) || button.closest('.avatar-choice-grid, .document-hotspots')) return
      gsap.fromTo(button, { y: 3 }, { y: 0, duration: 0.35, ease: 'elastic.out(1, 0.5)', clearProps: 'transform' })
    }
    root.addEventListener('pointerdown', press)
    return () => root.removeEventListener('pointerdown', press)
  }, [rootRef])
}

/** Pop a freshly selected element (animate its inner image so CSS .selected transforms stay intact). */
export function popIn(element) {
  if (!element || reduceMotion()) return
  gsap.fromTo(element, { scale: 0.85, rotate: -6 }, { scale: 1, rotate: 0, duration: 0.55, ease: 'elastic.out(1, 0.5)', clearProps: 'transform' })
}

/** Right/wrong reaction inside the gameplay card. */
export function playFeedback(card, kind) {
  if (!card) return
  if (kind === 'wrong') navigator.vibrate?.([60, 40, 90])
  if (reduceMotion()) return
  const feedback = card.querySelector('.feedback')
  gsap.fromTo(feedback, { opacity: 0, y: 16, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.5)', clearProps: 'transform,opacity' })
  if (kind === 'wrong') {
    gsap.to(card, { keyframes: { x: [0, -12, 11, -9, 7, -4, 0] }, duration: 0.5, ease: 'none', clearProps: 'transform' })
    const flash = document.createElement('div')
    flash.className = 'risk-flash'
    card.closest('section')?.appendChild(flash)
    gsap.fromTo(flash, { opacity: 0.45 }, { opacity: 0, duration: 0.7, ease: 'power2.out', onComplete: () => flash.remove() })
  } else {
    gsap.fromTo(card.querySelectorAll('.answer-line.correct'), { scale: 0.96 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)', clearProps: 'transform' })
    burst(feedback, 14)
  }
}

/** Bounce a number when it changes (score / combo in the score bar). */
export function bump(element, good = true) {
  if (!element || reduceMotion()) return
  gsap.fromTo(element, { scale: good ? 1.5 : 0.7, rotate: good ? -8 : 8 }, { scale: 1, rotate: 0, duration: 0.6, ease: 'elastic.out(1, 0.45)', clearProps: 'transform' })
}

/** Count a number up from 0 into `element.textContent`. */
export function countUp(element, value) {
  if (!element) return
  if (reduceMotion()) { element.textContent = value; return }
  // Write the text node React rendered (not textContent) so React keeps its reference to it.
  const text = element.firstChild ?? element.appendChild(document.createTextNode(''))
  const state = { n: 0 }
  text.nodeValue = '0'
  gsap.to(state, { n: value, duration: 1.2, ease: 'power2.out', delay: 0.35, onUpdate: () => { text.nodeValue = String(Math.round(state.n)) } })
  gsap.fromTo(element, { scale: 0.4 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.5)', delay: 0.35, clearProps: 'transform' })
}

const CONFETTI_COLORS = ['#ffcf00', '#45d2df', '#ef1b2d', '#ffffff', '#ff7ae6', '#2855d5']

/** Brand-coloured confetti burst from the centre of `origin`. */
export function burst(origin, count = 36) {
  if (!origin || reduceMotion()) return
  const host = origin.closest('section') || document.body
  const hostRect = host.getBoundingClientRect()
  const rect = origin.getBoundingClientRect()
  const x = rect.left + rect.width / 2 - hostRect.left
  const y = rect.top + rect.height / 2 - hostRect.top
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement('i')
    piece.className = 'confetti-piece'
    piece.style.left = `${x}px`
    piece.style.top = `${y}px`
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
    host.appendChild(piece)
    const angle = Math.random() * Math.PI * 2
    const distance = 60 + Math.random() * (count > 20 ? 170 : 90)
    gsap.timeline({ onComplete: () => piece.remove() })
      .fromTo(piece, { x: 0, y: 0, rotate: 0, scale: 0.6 + Math.random() * 0.8, opacity: 1 }, { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance - 40, rotate: Math.random() * 540 - 270, duration: 0.7, ease: 'power3.out' })
      .to(piece, { y: '+=120', opacity: 0, duration: 0.9, ease: 'power1.in' })
  }
}
