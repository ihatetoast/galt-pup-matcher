import type { Dog, Applicant } from "../types";
import { score } from "../utils/scoring";
import Tag from "./Tag";
import styles from "./DogCard.module.css";

interface Props {
  dog: Dog;
  applicants: Applicant[];
  isActive: boolean;
  onClick: (name: string) => void;
}

export default function DogCard({ dog, applicants, isActive, onClick }: Props) {
  const strongMatches = applicants.filter(a => {
    const s = score(dog, a);
    return s.pts >= 68 && s.bad.length === 0;
  }).length;

  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : ""}`}
      onClick={() => onClick(dog.name)}
    >
      {strongMatches > 0 && (
        <div className={styles.matchPill}>{strongMatches} strong</div>
      )}
      <div className={styles.top}>
        <div className={styles.icon}>{dog.emoji}</div>
        <div>
          <div className={styles.name}>{dog.name}</div>
          <div className={styles.location}>📍 {dog.location} · {dog.foster}</div>
        </div>
      </div>
      <div className={styles.tags}>
        {dog.sex === "F" && <Tag type="neutral">♀ Female</Tag>}
        {dog.sex === "M" && <Tag type="neutral">♂ Male</Tag>}
        {dog.age != null && <Tag type="neutral">{dog.age} yr</Tag>}
        {dog.only === "no"  && <Tag type="yes">Needs Dog Companion</Tag>}
        {dog.only === "yes" && <Tag type="neutral">Can Be Only Dog</Tag>}
        {dog.cats === true  && <Tag type="yes">Cats OK</Tag>}
        {dog.cats === false && <Tag type="no">No Cats</Tag>}
        {dog.apt === false  && <Tag type="no">House Only</Tag>}
        {dog.apt === true   && <Tag type="yes">Apt OK</Tag>}
        {dog.smallDogs === true  && <Tag type="yes">Small Dogs OK</Tag>}
        {dog.smallDogs === false && <Tag type="no">No Small Dogs</Tag>}
      </div>
    </div>
  );
}