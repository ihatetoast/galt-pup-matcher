import { useState } from "react";
import type { Dog, Applicant } from "./types";
import { DOGS } from "./data/dogs";
import { APPS } from "./data/apps";
import DogList from "./components/DogList";
import ApplicantGrid from "./components/ApplicantGrid";
import styles from "./App.module.css";

export default function App() {
  const [dogs, setDogs]               = useState<Dog[]>(DOGS);
  const [applicants, setApplicants]   = useState<Applicant[]>(APPS);
  const [activeDogName, setActiveDogName] = useState<string | null>(null);

  const activeDog = dogs.find(d => d.name === activeDogName) ?? null;

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>🐾 Pup Matcher</h1>
          <p className={styles.subtitle}>GALT Adoption Matching Tool</p>
        </div>
        <div className={styles.pills}>
          <span className={styles.pill}>{dogs.length} Dogs</span>
          <span className={styles.pill}>{applicants.length} Apps</span>
        </div>
      </header>

      <div className={styles.layout}>
        <DogList
          dogs={dogs}
          applicants={applicants}
          activeDogName={activeDogName}
          onSelectDog={setActiveDogName}
          onDogsLoaded={newDogs => {
            setDogs(newDogs);
            setActiveDogName(null);
          }}
          onAppsLoaded={setApplicants}
        />
        <ApplicantGrid
          dog={activeDog}
          applicants={applicants}
        />
      </div>
    </div>
  );
}