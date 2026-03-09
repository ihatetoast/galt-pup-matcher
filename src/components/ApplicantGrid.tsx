import { useState } from 'react';
import type { Dog, Applicant, ScoredApplicant } from '../types';
import { score } from '../utils/scoring';
import DogProfile from './DogProfile';
import FilterBar from './FilterBar';
import ApplicantCard from './ApplicantCard';
import styles from './ApplicantGrid.module.css';

interface Props {
  dog: Dog | null;
  applicants: Applicant[];
}

export default function ApplicantGrid({ dog, applicants }: Props) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [coordFilter, setCoordFilter] = useState('all');

  if (!dog) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🐕</div>
          <p className={styles.emptyText}>
            Select a dog from the left panel
            <br />
            to view matched applicants
          </p>
        </div>
      </div>
    );
  }

  // Filter applicants
  let filtered = applicants;
  if (statusFilter !== 'all') {
    filtered = filtered.filter((a) =>
      a.status.toLowerCase().includes(statusFilter),
    );
  }
  if (coordFilter !== 'all') {
    filtered = filtered.filter((a) => a.coord === coordFilter);
  }

  // Score and sort
  const scored: ScoredApplicant[] = filtered
    .map((a) => score(dog, a))
    .sort((a, b) => b.pts - a.pts);

  // Derive coordinator list from all applicants (not filtered)
  const coordinators = [...new Set(applicants.map((a) => a.coord))].sort();

  return (
    <div className={styles.panel}>
      <DogProfile dog={dog} />

      <FilterBar
        coordinators={coordinators}
        statusFilter={statusFilter}
        coordFilter={coordFilter}
        resultCount={scored.length}
        onStatusChange={setStatusFilter}
        onCoordChange={setCoordFilter}
      />

      <div className={styles.secTitle}>
        Matched Applicants <div className={styles.line} />
      </div>

      {scored.length === 0 ? (
        <div className={styles.noMatch}>
          No applicants match the current filters.
        </div>
      ) : (
        <div className={styles.grid}>
          {scored.map((s) => (
            <ApplicantCard key={s.applicant.name} scored={s} />
          ))}
        </div>
      )}
    </div>
  );
}
