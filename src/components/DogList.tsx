import type { Dog, Applicant } from "../types";
import { parseDogsCSV, parseAppsCSV } from "../utils/csvParser";
import DogCard from "./DogCard";
import styles from "./DogList.module.css";

interface Props {
  dogs: Dog[];
  applicants: Applicant[];
  activeDogName: string | null;
  onSelectDog: (name: string) => void;
  onDogsLoaded: (dogs: Dog[]) => void;
  onAppsLoaded: (apps: Applicant[]) => void;
}

export default function DogList({
  dogs,
  applicants,
  activeDogName,
  onSelectDog,
  onDogsLoaded,
  onAppsLoaded,
}: Props) {

  function handleDogsFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = parseDogsCSV(ev.target?.result as string);
        if (parsed.length === 0) {
          alert("No dogs found — check that your CSV has a Hound column.");
          return;
        }
        onDogsLoaded(parsed);
      } catch (err) {
        alert("Dogs CSV parse error — check column headers.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  }

  function handleAppsFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = parseAppsCSV(ev.target?.result as string);
        if (parsed.length === 0) {
          alert("No applicants found — check that your CSV has an Applicant Name column.");
          return;
        }
        onAppsLoaded(parsed);
      } catch (err) {
        alert("Apps CSV parse error — check column headers.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2>Available Hounds</h2>
        <p>Click a dog to see matched applicants</p>
      </div>

      <div className={styles.list}>
        {dogs.map(dog => (
          <DogCard
            key={`${dog.name}-${dog.foster}`}
            dog={dog}
            applicants={applicants}
            isActive={activeDogName === dog.name}
            onClick={onSelectDog}
          />
        ))}
      </div>

      <div className={styles.upload}>
        <h2>Reload Data</h2>
        <div className={styles.uploadRow}>
          <button className={styles.uploadBtn} onClick={() => document.getElementById("dogsFile")?.click()}>
            🐾 Upload Dogs CSV
          </button>
          <input type="file" id="dogsFile" accept=".csv" style={{ display: "none" }} onChange={handleDogsFile} />
          <div className={styles.uploadLabel}>or use seed data</div>

          <button className={styles.uploadBtn} style={{ marginTop: "6px" }} onClick={() => document.getElementById("appsFile")?.click()}>
            📋 Upload Applications CSV
          </button>
          <input type="file" id="appsFile" accept=".csv" style={{ display: "none" }} onChange={handleAppsFile} />
          <div className={styles.uploadLabel}>or use seed data</div>
        </div>
      </div>
    </div>
  );
}