import { asset } from '../utils/assets'
import { RefHeader } from './RefChrome'
import { ScoreBar } from './shared'

export function Overview({ doc, avatar, status, score, combo, onBack, onOpen, onFinish }) {
  const allDone = doc.sections.every((_, index) => status[index] === 'done')

  return <section className="screen overview-screen">
    <RefHeader avatar={avatar} back={onBack} />
    <img className="overview-logo" src={asset('Logo.png')} alt="Spot the Mistake" decoding="async" />
    {doc.sectionPreviews
      ? <div className="interview-section-list">{doc.sections.map((section, index) => <button key={section.title} className={status[index] || ''} type="button" onClick={() => onOpen(index)}><img src={doc.sectionPreviews[index]} alt={`${section.title}, tap to review`} /><i /></button>)}</div>
      : <div className={`interactive-document ${doc.id}`}><img src={doc.overview} alt={`Overview of the candidate's ${doc.label}`} decoding="sync" fetchPriority="high" /><div className="document-hotspots">{doc.sections.map((section, index) => <button key={section.title} className={status[index] || ''} type="button" onClick={() => onOpen(index)} aria-label={`Review ${section.title}`}><span>{status[index] === 'done' ? 'Done' : section.title}</span></button>)}</div></div>}
    {allDone && <button className="primary-button overview-finish" type="button" onClick={onFinish}>Show result <span>›</span></button>}
    <ScoreBar doc={doc} status={status} score={score} combo={combo} />
  </section>
}
