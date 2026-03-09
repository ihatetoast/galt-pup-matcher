// note: data needs to be mindful of case. if yes, then yes, not Yes
export type OnlyDog = 'yes' | 'no' | 'mustbe' | null; // yes means can be and must be means ... must be. y
export type YesNoMaybe = true | false | 'maybe' | null;

export interface Dog {
  name: string;
  emoji: string;
  location: string;
  foster: string;
  sex: 'M' | 'F' | null;
  age: number | null;
  only: OnlyDog; // has to be only. not good with others
  needsLessTimeAway: boolean;  // true = dog needs someone home a lot
  cats: boolean | null;
  smallDogs: YesNoMaybe;
  kids: boolean | null;
  highFence: boolean;
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
  dogCount: number;
  kids: boolean;
  stairs: boolean | null;
  fence: boolean | null;
  exp: boolean;
  galt: boolean;
  timeAway: string;
  sexPref: string;
  agePref: string;
  notes: string;
}

export interface ScoredApplicant {
  applicant: Applicant;
  pts: number;
  good: string[];
  bad: string[];
}
