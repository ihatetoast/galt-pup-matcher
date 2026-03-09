import type { Dog, Applicant, ScoredApplicant } from '../types';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
export function dogAgeCategory(age: number): string[] {
  if (age < 2) return ['Puppy', 'Young'];
  if (age <= 4) return ['Young', 'Adult'];
  if (age <= 7) return ['Adult'];
  if (age <= 9) return ['Senior', 'Adult'];
  return ['Super Senior', 'Senior'];
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
  let pts = 50;
  const good: string[] = [];
  const bad: string[] = [];

  const notesL = (applicant.notes || '').toLowerCase();

  // ── HARD constraints ──────────────────────

  // Fence — if a dog needs a high fence, flag 4ft fences
  if (dog.highFence) {
    if (!applicant.fence) {
      pts -= 35;
      bad.push('No fence — dog needs high fence');
    } else if (notesL.includes('4') && notesL.includes('foot')) {
      pts -= 20;
      bad.push('4-ft fence may not be enough');
    } else {
      pts += 15;
      good.push('Fenced yard ✓');
    }
  } else {
    if (applicant.fence) {
      pts += 10;
      good.push('Fenced yard ✓');
    }
  }

  // Apartment
  if (dog.apt === false && applicant.apt) {
    pts -= 30;
    bad.push('Apartment — dog needs house');
  }
  if (dog.apt === true && applicant.apt) {
    pts += 8;
    good.push('Apt-friendly match ✓');
  }

  // Cats
  if (!dog.cats && applicant.cats) {
    pts -= 30;
    bad.push('Has cats — not cat-safe');
  }
  if (dog.cats && applicant.cats) {
    pts += 12;
    good.push('Cat-friendly match ✓');
  }

  // Small dogs
  if (dog.smallDogs === false && applicant.smallDogs) {
    pts -= 25;
    bad.push('Has small dogs — incompatible');
  }
  if (dog.smallDogs === 'maybe' && applicant.smallDogs) {
    pts -= 8;
    bad.push('Has small dogs — use caution');
  }
  if (dog.smallDogs === true && applicant.smallDogs) {
    pts += 10;
    good.push('Small dogs OK ✓');
  }

  // Only dog
  if (dog.only === 'mustbe' && applicant.dogCount > 0) {
    pts -= 40;
    bad.push('Has dogs — this dog cannot live with other dogs');
  }
  if (dog.only === 'no' && applicant.dogCount === 0) {
    pts -= 20;
    bad.push('No other dogs — this dog needs a canine companion');
  }
  if (dog.only === 'no' && applicant.dogCount > 0) {
    pts += 15;
    good.push('Has canine companion ✓');
  }
  if (dog.only === 'yes' && applicant.dogCount === 0) {
    pts += 5;
    good.push('Only dog placement fine ✓');
  }

  // Stairs
  if (dog.stairs === false && applicant.stairs) {
    pts -= 12;
    bad.push('Has stairs — dog struggles');
  }
  if (dog.stairs === true && applicant.stairs) {
    pts += 5;
  }

  // Kids —
  if (dog.kids === false && applicant.kids) {
    pts -= 20;
    bad.push('Has kids — not suitable for this dog');
  }

  // ── SOFT bonuses ──────────────────────────

  // Applicant named this dog specifically
  if (notesL.includes(dog.name.toLowerCase())) {
    pts += 35;
    good.push(`Named ${dog.name} specifically ✓`);
  }

  // GALT/experience bonus for complex dogs
  if (dog.experiencedOnly && applicant.galt) {
    pts += 12;
    good.push('GALT adopter experience ✓');
  }
  if (dog.experiencedOnly && applicant.exp) {
    pts += 10;
    good.push('Experienced adopter ✓');
  }

  // ── Sex preference ────────────────────────
  if (dog.sex) {
    const sexTokens = (applicant.sexPref || '')
      .toLowerCase()
      .split(',')
      .map((s) => s.trim());
    const wantsFemale = sexTokens.includes('female');
    const wantsMale = sexTokens.includes('male');
    const wantsEither = sexTokens.length === 0 || sexTokens.includes('either');

    if (!wantsEither) {
      if (dog.sex === 'F' && wantsFemale && !wantsMale) {
        pts += 12;
        good.push('Sex preference match: Female ✓');
      }
      if (dog.sex === 'M' && wantsMale && !wantsFemale) {
        pts += 12;
        good.push('Sex preference match: Male ✓');
      }
      if (dog.sex === 'F' && wantsMale && !wantsFemale) {
        pts -= 20;
        bad.push('Prefers male — this dog is female');
      }
      if (dog.sex === 'M' && wantsFemale && !wantsMale) {
        pts -= 20;
        bad.push('Prefers female — this dog is male');
      }
      if (dog.sex === 'F' && wantsFemale && sexTokens.includes('either')) {
        pts += 6;
        good.push('Prefers female (flexible) ✓');
      }
      if (dog.sex === 'M' && wantsMale && sexTokens.includes('either')) {
        pts += 6;
        good.push('Prefers male (flexible) ✓');
      }
      if (dog.sex === 'F' && wantsMale && sexTokens.includes('either')) {
        pts -= 5;
      }
    }
  }

  // ── Age preference ────────────────────────
  if (dog.age != null) {
    const appAgePrefs = (applicant.agePref || '').toLowerCase();
    if (appAgePrefs && !appAgePrefs.includes('no preference')) {
      const dogCategories = dogAgeCategory(dog.age).map((c) => c.toLowerCase());
      const appWants = appAgePrefs.split(',').map((s) => s.trim());
      const anyMatch = appWants.some((w) =>
        dogCategories.some((c) => c.includes(w) || w.includes(c)),
      );
      if (anyMatch) {
        pts += 12;
        good.push(`Age match: ${dogAgeCategory(dog.age)[0]} (${dog.age} yr) ✓`);
      } else {
        pts -= 18;
        bad.push(
          `Age mismatch: dog is ${dog.age} yr (${dogAgeCategory(dog.age)[0]}), applicant wants ${applicant.agePref}`,
        );
      }
    }
  }

  // Coordinator notes should also make sure there is a dog name in a col
  if (dog.possibleMatches.includes(applicant.name)) {
    pts += 30;
    good.push('Coordinator flagged as possible match ✓');
  }
  // Time away
  if (dog.needsLessTimeAway && applicant.timeAway === '0-2') {
    pts += 8;
    good.push('Low time away ✓');
  }
  if (dog.needsLessTimeAway && applicant.timeAway === '10+') {
    pts -= 10;
    bad.push('High time away — may be difficult');
  }

  return {
    applicant,
    pts: Math.max(0, Math.min(100, pts)),
    good: [...new Set(good)],
    bad: [...new Set(bad)],
  };
}
