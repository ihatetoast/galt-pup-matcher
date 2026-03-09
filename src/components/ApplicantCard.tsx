import type { ScoredApplicant } from '../types';
import { scoreClass, scoreLabel, fillClass } from '../utils/scoring';
import Tag from './Tag';
import styles from './ApplicantCard.module.css';

interface Props {
  scored: ScoredApplicant;
}

function statusClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('approved')) return styles.sApproved;
  if (s.includes('submitted')) return styles.sSubmitted;
  if (s.includes('reference') || s.includes('checking'))
    return styles.sReference;
  if (s.includes('waiting') || s.includes('under')) return styles.sWaiting;
  return styles.sOther;
}

function scoreFillClass(pts: number): string {
  const fc = fillClass(pts);
  if (fc === 'sf-strong') return styles.sfStrong;
  if (fc === 'sf-good') return styles.sfGood;
  return styles.sfWeak;
}

export default function ApplicantCard({ scored }: Props) {
  const { applicant, pts, good, bad } = scored;
  const sc = scoreClass(pts);

  return (
    <div className={`${styles.card} ${styles[sc]}`}>
      <div className={styles.top}>
        <div className={styles.name}>{applicant.name}</div>
        <span className={`${styles.status} ${statusClass(applicant.status)}`}>
          {applicant.status}
        </span>
      </div>

      <div className={styles.location}>
        📍 {applicant.city}, {applicant.state} &nbsp;·&nbsp; {applicant.coord}
      </div>

      <div className={styles.scoreWrap}>
        <div className={styles.scoreBar}>
          <div
            className={`${styles.scoreFill} ${scoreFillClass(pts)}`}
            style={{ width: `${pts}%` }}
          />
        </div>
        <div className={styles.scoreMeta}>
          <span>{scoreLabel(pts)}</span>
          <span>{pts}%</span>
        </div>
      </div>

      <div className={styles.tags}>
        {applicant.fence ? (
          <Tag type='yes'>Fenced</Tag>
        ) : (
          <Tag type='no'>No Fence</Tag>
        )}
        {applicant.cats && <Tag type='no'>Has Cats</Tag>}
        {applicant.smallDogs && <Tag type='maybe'>Has Small Dogs</Tag>}
        {applicant.apt && <Tag type='neutral'>Apartment</Tag>}
        {applicant.kids && <Tag type='maybe'>Has Kids</Tag>}
        {applicant.exp && <Tag type='yes'>Experienced</Tag>}
        {applicant.galt && <Tag type='yes'>GALT Adopter</Tag>}
      </div>

      {(applicant.agePref || applicant.sexPref) && (
        <div className={styles.prefs}>
          🎂 {applicant.agePref || '—'} &nbsp;·&nbsp; ⚥{' '}
          {applicant.sexPref || '—'} &nbsp;·&nbsp; ⏱ {applicant.timeAway || '—'}{' '}
          hrs away
        </div>
      )}

      {bad.length > 0 && (
        <div className={styles.reasons}>
          {bad.map((r, i) => (
            <div key={i} className={styles.rBad}>
              ⚠ {r}
            </div>
          ))}
        </div>
      )}

      {good.length > 0 && (
        <div className={styles.reasons}>
          {good.map((r, i) => (
            <div key={i} className={styles.rGood}>
              {r}
            </div>
          ))}
        </div>
      )}

      {applicant.notes && <div className={styles.note}>{applicant.notes}</div>}
    </div>
  );
}
