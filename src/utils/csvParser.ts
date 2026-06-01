import type { Dog, Applicant } from "../types";

// ─────────────────────────────────────────────
// LOW-LEVEL CSV LINE PARSER
// Handles quoted fields containing commas
// ─────────────────────────────────────────────
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += line[i];
    }
  }
  result.push(current.trim());
  return result;
}

// ─────────────────────────────────────────────
// FIELD PARSERS
// allow for yes/y and no/n because volunteers have habits
// ─────────────────────────────────────────────

// "yes"/"y" → true, "no"/"n" → false, anything else → null
function parseYN(val: string): boolean | null {
  const v = val.toLowerCase().trim();
  if (v === "yes" || v === "y") return true;
  if (v === "no"  || v === "n") return false;
  return null;
}

// "yes"/"y" → true, blank/unknown → false (boolean flags default to false)
function parseFlag(val: string): boolean {
  const v = val.toLowerCase().trim();
  return v === "yes" || v === "y";
}

// "yes"/"no" → OnlyDog, blank/unknown → null
function parseOnly(val: string): "yes" | "no" | null {
  const v = val.toLowerCase().trim();
  if (v === "yes" || v === "y") return "yes";
  if (v === "no"  || v === "n") return "no";
  return null;
}

// "Smith | Andrew" → ["Smith", "Andrew"], blank → []
function parsePossibleMatches(val: string): string[] {
  if (!val.trim()) return [];
  return val.split("|").map(s => s.trim()).filter(Boolean);
}

// Pick an emoji based on sex
function pickEmoji(sex: string): string {
  const female = ["\uD83E\uDDB8", "\uD83D\uDC29", "\uD83D\uDC3E"]; // 🦮 🐩 🐾
  const male   = ["\uD83D\uDC15", "\uD83E\uDDB4", "\uD83D\uDC36", "\uD83D\uDC15\u200D\uD83E\uDDBA", "\uD83C\uDF1F"]; // 🐕 🦴 🐶 🐕‍🦺 🌟
  if (sex === "F") return female[Math.floor(Math.random() * female.length)];
  if (sex === "M") return male[Math.floor(Math.random() * male.length)];
  return "\uD83D\uDC3E"; // 🐾
}

// ─────────────────────────────────────────────
// DOGS CSV PARSER
// Row 1: headers
// Row 2: description (skipped — Hound cell is empty)
// Row 3+: data
//
// Expected headers (matched by keyword, order doesn't matter):
// Hound, Eyes On, Possible Matches, Location, Coordinator,
// Foster, Sex, Age, Only, Cats, Small Dogs, Apt, Stairs,
// Experienced, Needs Less Time Away, Notes
// ─────────────────────────────────────────────
export function parseDogsCSV(raw: string): Dog[] {
  const lines = raw.trim().split(/\r?\n/);
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

  const col = (keyword: string): number =>
    headers.findIndex(h => h.includes(keyword));

  const iName     = col("hound");
  const iEyesOn   = col("eyes");
  const iMatches  = col("possible");
  const iLoc      = col("location");
  const iCoord    = col("coordinator");
  const iFoster   = col("foster");
  const iSex      = col("sex");
  const iAge      = col("age");
  const iOnly     = col("only");
  const iCats     = col("cats");
  const iSmall    = col("small");
  const iApt      = col("apt");
  const iStairs   = col("stairs");
  const iExp      = col("experienced");
  const iLowTime  = col("needs less");
  const iNotes    = col("notes");

  return lines.slice(1).map(line => {
    const v = parseCSVLine(line);

    // skip description row and any blank rows
    if (!v[iName]?.trim()) return null;

    const sex = (v[iSex] || "").trim().toUpperCase() as "M" | "F" | null;

    return {
      name:              v[iName].trim(),
      eyesOn:            iEyesOn  >= 0 ? v[iEyesOn].trim()              : "",
      emoji:             pickEmoji(sex ?? ""),
      location:          iLoc     >= 0 ? v[iLoc].trim()                 : "",
      foster:            iFoster  >= 0 ? v[iFoster].trim()              : "",
      coordinator:       iCoord   >= 0 ? v[iCoord].trim()               : "",
      sex:               sex || null,
      age:               iAge     >= 0 ? parseInt(v[iAge]) || null      : null,
      only:              iOnly    >= 0 ? parseOnly(v[iOnly])            : null,
      needsLessTimeAway: iLowTime >= 0 ? parseFlag(v[iLowTime])         : false,
      cats:              iCats    >= 0 ? parseYN(v[iCats])              : null,
      smallDogs:         iSmall   >= 0 ? parseYN(v[iSmall])             : null,
      apt:               iApt     >= 0 ? parseYN(v[iApt])               : null,
      stairs:            iStairs  >= 0 ? parseYN(v[iStairs])            : null,
      experiencedOnly:   iExp     >= 0 ? parseFlag(v[iExp])             : false,
      possibleMatches:   iMatches >= 0 ? parsePossibleMatches(v[iMatches]) : [],
      notes:             iNotes   >= 0 ? v[iNotes].trim()               : "",
    } as Dog;
  }).filter((d): d is Dog => d !== null)
    .filter(d => !d.eyesOn); // hide dogs with eyes on — any content = unavailable
}

// ─────────────────────────────────────────────
// APPS CSV PARSER
// Row 1: headers
// Row 2: description (skipped — Submitted Date cell is empty, this is for volu to know what to do while training)
// eventually row 2 of scription will be removed, so code looks for rows with submitted date field filled.
// Row 3+: data
//
// Expected headers (matched by keyword, order doesn't matter):
// Dog - Pending, Adoption Coordinator, Submitted Date, Approved,
// First Name, Last Name, City, State, Cat, Small Dogs, Apt,
// Only Dog, Kids, Stairs, Fence, Experienced, GALT Adopter,
// Time Away, Sex, Age Preference, Notes
// ─────────────────────────────────────────────
export function parseAppsCSV(raw: string): Applicant[] {
  const lines = raw.trim().split(/\r?\n/);
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

  const col = (keyword: string): number =>
    headers.findIndex(h => h.includes(keyword));

  const iPending  = col("pending");
  const iCoord    = col("coordinator");
  const iDate     = col("submitted");
  const iStatus   = col("approved");
  const iFirst    = col("first");
  const iLast     = col("last");
  const iCity     = col("city");
  const iState    = col("state");
  const iCat      = col("cat");
  const iSmall    = col("small");
  const iApt      = col("apt");
  const iOnlyDog  = col("only");
  const iKids     = col("kids");
  const iStairs   = col("stairs");
  const iFence    = col("fence");
  const iExp      = col("experienced");
  const iGalt     = col("galt");
  const iTime     = col("time");
  const iSex      = col("sex");
  const iAge      = col("age");
  const iNotes    = col("notes");

  return lines.slice(1).map(line => {
    const v = parseCSVLine(line);

    // skip description row and any blank rows
    if (!v[iDate]?.trim()) return null;

    const firstName = iFirst >= 0 ? v[iFirst].trim() : "";
    const lastName  = iLast  >= 0 ? v[iLast].trim()  : "";
    const fullName  = [firstName, lastName].filter(Boolean).join(" ");

    return {
      dogPending: iPending >= 0 ? v[iPending].trim()     : "",
      coord:      iCoord   >= 0 ? v[iCoord].trim()       : "",
      date:       iDate    >= 0 ? v[iDate].trim()         : "",
      status:     iStatus  >= 0 ? v[iStatus].trim()       : "",
      name:       fullName,
      city:       iCity    >= 0 ? v[iCity].trim()         : "",
      state:      iState   >= 0 ? v[iState].trim()        : "",
      cats:       iCat     >= 0 ? parseFlag(v[iCat])      : false,
      smallDogs:  iSmall   >= 0 ? parseFlag(v[iSmall])    : false,
      apt:        iApt     >= 0 ? parseFlag(v[iApt])      : false,
      onlyDog:    iOnlyDog >= 0 ? parseYN(v[iOnlyDog])   : null,
      kids:       iKids    >= 0 ? parseFlag(v[iKids])     : false,
      stairs:     iStairs  >= 0 ? parseYN(v[iStairs])     : null,
      fence:      iFence   >= 0 ? parseYN(v[iFence])      : null,
      exp:        iExp     >= 0 ? parseFlag(v[iExp])       : false,
      galt:       iGalt    >= 0 ? parseFlag(v[iGalt])      : false,
      timeAway:   iTime    >= 0 ? v[iTime].trim()          : "",
      sexPref:    iSex     >= 0 ? v[iSex].trim()           : "",
      agePref:    iAge     >= 0 ? v[iAge].trim()           : "",
      notes:      iNotes   >= 0 ? v[iNotes].trim()         : "",
    } as Applicant;
  }).filter((a): a is Applicant => a !== null)
    .filter(a => !a.dogPending); // exclude apps with a dog already pending
}