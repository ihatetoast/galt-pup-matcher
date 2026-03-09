import styles from './FilterBar.module.css';

interface Props {
  coordinators: string[];
  statusFilter: string;
  coordFilter: string;
  resultCount: number;
  onStatusChange: (val: string) => void;
  onCoordChange: (val: string) => void;
}

const STATUS_OPTIONS = [
  { val: 'all', label: 'All Statuses' },
  { val: 'approved', label: 'Approved' },
  { val: 'submitted', label: 'Submitted' },
  { val: 'reference', label: 'Reference Checking' },
  { val: 'waiting', label: 'Waiting' },
  { val: 'under', label: 'Under Review' },
];

export default function FilterBar({
  coordinators,
  statusFilter,
  coordFilter,
  resultCount,
  onStatusChange,
  onCoordChange,
}: Props) {
  return (
    <div className={styles.bar}>
      <label>Status:</label>
      <select
        className={styles.select}
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.val} value={s.val}>
            {s.label}
          </option>
        ))}
      </select>

      <label>Coordinator:</label>
      <select
        className={styles.select}
        value={coordFilter}
        onChange={(e) => onCoordChange(e.target.value)}
      >
        <option value='all'>All Coordinators</option>
        {coordinators.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className={styles.count}>
        {resultCount} applicant{resultCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
