// note: data needs to be mindful of case. if yes, then yes, not Yes
export type OnlyDog = 'yes' | 'no'  | null; 
export type YesNoMaybe = true | false | null;

export interface Dog {
  name: string;
  eyesOn: string;
  emoji: string;
  location: string;
  foster: string;
  coordinator: string;
  sex: 'M' | 'F' | null;
  age: number | null;
  only: OnlyDog;
  needsLessTimeAway: boolean;
  cats: boolean | null;
  smallDogs: YesNoMaybe;
  apt: boolean | null
  stairs: boolean | null;
  experiencedOnly: boolean;
  possibleMatches: string[];
  notes: string;
}

export interface Applicant {
  coord: string;
  date: string;
  name: string;
  status: string;
  city: string;
  state: string;
  cats: boolean;
  smallDogs: boolean;
  apt: boolean;
  onlyDog: boolean | null;
  kids: boolean;
  stairs: boolean | null;
  fence: boolean | null;
  exp: boolean;
  galt: boolean;
  timeAway: string;
  sexPref: string;
  agePref: string;
  notes: string;
  dogPending: string;
}

export interface ScoredApplicant {
  applicant: Applicant;
  pts: number;
  good: string[];
  bad: string[];
}
