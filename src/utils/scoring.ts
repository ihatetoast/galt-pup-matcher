import type { Dog, Applicant, ScoredApplicant } from '../types';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
export function dogAgeCategory(age: number): string[] {
  if (age < 1)  return ['Puppy'];
  if (age < 2)  return ['Puppy', 'Young'];
  if (age < 3)  return ['Young'];
  if (age < 7)  return ['Adult'];
  if (age < 10) return ['Senior'];
  return ['Super Senior'];
}

export function scoreClass(pts: number): 'strong' | 'good' | 'weak' {
  return pts >= 68 ? 'strong' : pts >= 45 ? 'good' : 'weak';
}

export function scoreLabel(pts: number): string {
  return pts >= 68 ? 'Strong match' : pts >= 45 ? 'Good match' : 'Needs review';
}

export function fillClass(pts: number): string {
  return pts >= 68 ? 'sf-strong' : pts >= 45 ? 'sf-good' : 'sf-weak';
}

// ─────────────────────────────────────────────
// MAIN SCORING FUNCTION
// ─────────────────────────────────────────────
export function score(dog: Dog, applicant: Applicant): ScoredApplicant {
  const notesL = (applicant.notes || '').toLowerCase();

  // ── HARD dealbreakers — score 0, skip all other logic ──

  // Cats: not cat-safe OR unknown = no risk taken
  if (dog.cats === false && applicant.cats) {
    return { applicant, pts: 0, good: [], bad: ['Has cats — dog is not cat-safe'] };
  }
  if (dog.cats === null && applicant.cats) {
    return { applicant, pts: 0, good: [], bad: ['Has cats — cat compatibility unknown'] };
  }

  // Small dogs: not small-dog-safe OR unknown = no risk taken
  if (dog.smallDogs === false && applicant.smallDogs) {
    return { applicant, pts: 0, good: [], bad: ['Has small dogs — incompatible'] };
  }
  if (dog.smallDogs === null && applicant.smallDogs) {
    return { applicant, pts: 0, good: [], bad: ['Has small dogs — compatibility unknown'] };
  }

  // Only dog: hard match required both ways
  if (dog.only === 'yes' && applicant.onlyDog === false) {
    return { applicant, pts: 0, good: [], bad: ['Has other dogs — this dog must be the only dog'] };
  }
  if (dog.only === 'no' && applicant.onlyDog === true) {
    return { applicant, pts: 0, good: [], bad: ['No other dogs — this dog needs a canine companion'] };
  }

  // ── Start scoring ──────────────────────────
  let pts = 50;
  const good: string[] = [];
  const bad:  string[] = [];

  // Apartment
  if (dog.apt === false && applicant.apt) {
    pts -= 30; bad.push('Apartment — dog needs a house');
  }
  if (dog.apt === true && applicant.apt) {
    pts += 8; good.push('Apt-friendly match ✓');
  }

  // Cats bonus (only reaches here if no mismatch)
  if (dog.cats === true && applicant.cats) {
    pts += 12; good.push('Cat-friendly match ✓');
  }

  // Small dogs bonus (only reaches here if no mismatch)
  if (dog.smallDogs === true && applicant.smallDogs) {
    pts += 10; good.push('Small dogs OK ✓');
  }

  // Only dog soft bonuses (hard cases already returned above)
  if (dog.only === 'no' && applicant.onlyDog === false) {
    pts += 15; good.push('Has canine companion ✓');
  }
  if (dog.only === 'yes' && applicant.onlyDog === true) {
    pts += 5; good.push('Only dog placement fine ✓');
  }

  // Stairs
  if (dog.stairs === false && applicant.stairs) {
    pts -= 12; bad.push('Has stairs — dog struggles');
  }
  if (dog.stairs === true && applicant.stairs) {
    pts += 5;
  }

  // ── SOFT bonuses ──────────────────────────

  // Applicant named this dog specifically in their notes
  if (notesL.includes(dog.name.toLowerCase())) {
    pts += 35; good.push(`Named ${dog.name} specifically ✓`);
  }

  // GALT/experience bonus for dogs that need experienced adopters
  if (dog.experiencedOnly && applicant.galt) {
    pts += 12; good.push('GALT adopter experience ✓');
  }
  if (dog.experiencedOnly && applicant.exp) {
    pts += 10; good.push('Experienced adopter ✓');
  }

  // Coordinator flagged as possible match — last name check
  if (dog.possibleMatches.some(lastName =>
    applicant.name.toLowerCase().includes(lastName.toLowerCase())
  )) {
    pts += 30; good.push('Coordinator flagged as possible match ✓');
  }

  // Time away — dogs that need someone home
  const timeTokens = (applicant.timeAway || '').split(',').map(s => s.trim());
  if (dog.needsLessTimeAway && timeTokens.includes('0-2')) {
    pts += 8; good.push('Low time away ✓');
  }
if (dog.needsLessTimeAway && (timeTokens.includes('10+') || timeTokens.includes('6-9'))) {
  pts -= 10; bad.push('High time away — may be difficult');
}

  // ── Sex preference ────────────────────────
  if (dog.sex) {
    const sexTokens = (applicant.sexPref || '')
      .toLowerCase()
      .split(',')
      .map(s => s.trim());
    const wantsFemale = sexTokens.includes('female');
    const wantsMale   = sexTokens.includes('male');
    const wantsEither = sexTokens.length === 0 || sexTokens.includes('either');

    if (!wantsEither) {
      if (dog.sex === 'F' && wantsFemale && !wantsMale)  { pts += 12; good.push('Sex preference match: Female ✓'); }
      if (dog.sex === 'M' && wantsMale   && !wantsFemale){ pts += 12; good.push('Sex preference match: Male ✓'); }
      if (dog.sex === 'F' && wantsMale   && !wantsFemale){ pts -= 20; bad.push('Prefers male — this dog is female'); }
      if (dog.sex === 'M' && wantsFemale && !wantsMale)  { pts -= 20; bad.push('Prefers female — this dog is male'); }
      if (dog.sex === 'F' && wantsFemale && sexTokens.includes('either')) { pts += 6; good.push('Prefers female (flexible) ✓'); }
      if (dog.sex === 'M' && wantsMale   && sexTokens.includes('either')) { pts += 6; good.push('Prefers male (flexible) ✓'); }
      if (dog.sex === 'F' && wantsMale   && sexTokens.includes('either')) { pts -= 5; }
      if (dog.sex === 'M' && wantsFemale && sexTokens.includes('either')) { pts -= 5; }
    }
  }

  // ── Age preference ────────────────────────
  if (dog.age != null) {
    const appAgePrefs = (applicant.agePref || '').toLowerCase();
    if (appAgePrefs && !appAgePrefs.includes('no preference')) {
      const dogCategories = dogAgeCategory(dog.age).map(c => c.toLowerCase());
      const appWants      = appAgePrefs.split(',').map(s => s.trim());
      const anyMatch      = appWants.some(w =>
        dogCategories.some(c => c.includes(w) || w.includes(c))
      );
      if (anyMatch) {
        pts += 12; good.push(`Age match: ${dogAgeCategory(dog.age)[0]} (${dog.age} yr) ✓`);
      } else {
        pts -= 18; bad.push(`Age mismatch: dog is ${dog.age} yr (${dogAgeCategory(dog.age)[0]}), applicant wants ${applicant.agePref}`);
      }
    }
  }

  return {
    applicant,
    pts:  Math.max(0, Math.min(100, pts)),
    good: [...new Set(good)],
    bad:  [...new Set(bad)],
  };
}