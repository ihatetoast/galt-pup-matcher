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

function getShortDate(dateStr: string): string {
  if (!dateStr) return '00-00-00'; // check for empty. should be ignored by parser, but in case...

  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return '00-00-00';
  return `${month}-${day}-${year.slice(2)}`;
}

function getAppAge(submittedDate: string): string {
  if (!submittedDate) return 'new';
  const [year, month, day] = submittedDate.split('-').map(Number);
  if (!year || !month || !day) return 'new';

  const appUtc = Date.UTC(year, month - 1, day);
  const diffInDays = Math.ceil((Date.now() - appUtc) / (1000 * 3600 * 24));

  if (diffInDays > 150) return 'old';
  if (diffInDays > 90) return 'sitting';
  return 'new';
}

export default function ApplicantCard({ scored }: Props) {
  const { applicant, pts, good, bad } = scored;
  const sc = scoreClass(pts);
  console.log('i am the dude');
  const ageClass = getAppAge(applicant.date);

  return (
    <div className={`${styles.card} ${styles[sc]}`}>
      <div className={styles.top}>
        <div className={styles.name}>
          {applicant.name}{' '}
          <span className={`${styles.date} ${styles[ageClass]}`}>
            ({getShortDate(applicant.date)})
          </span>
        </div>
        <span className={`${styles.status} ${statusClass(applicant.status)}`}>
          {applicant.status}
        </span>
      </div>

      <div className={styles.location}>
        📍 {applicant.city}, {applicant.state} &nbsp;·&nbsp; AC:{' '}
        {applicant.coord}
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
        {/* fence — only show if NO fence, having one is unremarkable */}
        {applicant.fence === false && <Tag type='no'>No Fence</Tag>}

        {/* cats and small dogs — info only, hard mismatches already scored 0 */}
        {applicant.cats && <Tag type='no'>Has Cats</Tag>}
        {applicant.smallDogs && <Tag type='maybe'>Has Small Dogs</Tag>}

        {/* apartment */}
        {applicant.apt && <Tag type='neutral'>Apartment</Tag>}

        {/* kids — info only if present */}
        {applicant.kids && <Tag type='maybe'>Has Kids &lt;7</Tag>}

        {/* experience */}
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
