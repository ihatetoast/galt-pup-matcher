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

// yes/no/maybe/unknown → true/false/"maybe"/null
function parseYNMaybe(val: string): true | false | "maybe" | null {
  const v = val.toLowerCase().trim();
  if (v === "yes" || v === "y") return true;
  if (v === "no"  || v === "n") return false;
  if (v === "maybe")            return "maybe";
  return null;
}

// "yes"/"no"/"mustbe" → OnlyDog, blank/unknown → null
function parseOnly(val: string): "yes" | "no" | "mustbe" | null {
  const v = val.toLowerCase().trim();
  if (v === "yes")                    return "yes";
  if (v === "no")                     return "no";
  if (v.includes("must"))             return "mustbe";
  return null;
}

// "JH,MM" → ["JH", "MM"], blank → []
function parsePossibleMatches(val: string): string[] {
  if (!val.trim()) return [];
  return val.split(",").map(s => s.trim()).filter(Boolean);
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
// Expected headers (case-insensitive matching):
// Hound, Sex, Age, Location, Foster, Only,
// Needs Less Time Away, High Fence?, Experienced Only, Kids?,
// Cats?, Small Dogs?, Apt?, Stairs?, Possible Matches, Notes
// ─────────────────────────────────────────────
export function parseDogsCSV(raw: string): Dog[] {
  const lines = raw.trim().split(/\r?\n/);
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

  const col = (keyword: string): number =>
    headers.findIndex(h => h.includes(keyword));

  const iName     = col("hound");
  const iSex      = col("sex");
  const iAge      = col("age");
  const iLoc      = col("location");
  const iFoster   = col("foster");
  const iOnly     = col("only");
  const iLowTime  = col("needs less");
  const iHighF    = col("high fence");
  const iExpOnly  = col("experienced");
  const iKids     = col("kids");
  const iCats     = col("cats");
  const iSmall    = col("small");
  const iApt      = col("apt");
  const iStairs   = col("stairs");
  const iMatches  = col("possible");
  const iNotes    = col("notes");

  return lines.slice(1).map(line => {
    const v = parseCSVLine(line);
    if (!v[iName]?.trim()) return null;

    const sex = (v[iSex] || "").trim().toUpperCase() as "M" | "F" | null;

    return {
      name:              v[iName].trim(),
      emoji:             pickEmoji(sex ?? ""),
      location:          iLoc     >= 0 ? v[iLoc].trim()              : "",
      foster:            iFoster  >= 0 ? v[iFoster].trim()           : "",
      sex:               sex || null,
      age:               iAge     >= 0 ? parseInt(v[iAge]) || null   : null,
      only:              iOnly    >= 0 ? parseOnly(v[iOnly])         : null,
      needsLessTimeAway: iLowTime >= 0 ? parseFlag(v[iLowTime])      : false,
      highFence:         iHighF   >= 0 ? parseFlag(v[iHighF])        : false,
      experiencedOnly:   iExpOnly >= 0 ? parseFlag(v[iExpOnly])      : false,
      kids:              iKids    >= 0 ? parseYN(v[iKids])           : null,
      cats:              iCats    >= 0 ? parseYN(v[iCats])           : null,
      smallDogs:         iSmall   >= 0 ? parseYNMaybe(v[iSmall])     : null,
      apt:               iApt     >= 0 ? parseYN(v[iApt])            : null,
      stairs:            iStairs  >= 0 ? parseYN(v[iStairs])         : null,
      possibleMatches:   iMatches >= 0 ? parsePossibleMatches(v[iMatches]) : [],
      notes:             iNotes   >= 0 ? v[iNotes].trim()            : "",
    } as Dog;
  }).filter((d): d is Dog => d !== null);
}

// ─────────────────────────────────────────────
// APPS CSV PARSER
// Expected headers (case-insensitive matching):
// Coodinator, Submitted Date, Applicant Name, Status,
// City, State, Cat (Y/N), Small Dogs (Y/N), Apt (Y/N),
// Dog Count, Kids, Stairs (Y/N), Fence, Experience,
// GALT Adopter, Time Away, Sex Pref, Age Preference, Notes
// ─────────────────────────────────────────────
export function parseAppsCSV(raw: string): Applicant[] {
  const lines = raw.trim().split(/\r?\n/);
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

  const col = (keyword: string): number =>
    headers.findIndex(h => h.includes(keyword));

const iCoord = col("coordinator");
  const iDate    = col("date");
  const iName    = col("applicant");
  const iStatus  = col("status");
  const iCity    = col("city");
  const iState   = col("state");
  const iCat     = col("cat");
  const iSmall   = col("small");
  const iApt     = col("apt");
  const iDogC    = col("dog count");
  const iKids    = col("kids");
  const iStairs  = col("stairs");
  const iFence   = col("fence");
  const iExp     = col("experience");
  const iGalt    = col("galt");
  const iTime    = col("time");
  const iSex     = col("sex");
  const iAge     = col("age");
  const iNotes   = col("notes");

  return lines.slice(1).map(line => {
    const v = parseCSVLine(line);
    if (!v[iName]?.trim()) return null;

    return {
      coord:      iCoord  >= 0 ? v[iCoord].trim()              : "",
      date:       iDate   >= 0 ? v[iDate].trim()               : "",
      name:       v[iName].trim(),
      status:     iStatus >= 0 ? v[iStatus].trim()             : "",
      city:       iCity   >= 0 ? v[iCity].trim()               : "",
      state:      iState  >= 0 ? v[iState].trim()              : "",
      cats:       iCat    >= 0 ? parseFlag(v[iCat])            : false,
      smallDogs:  iSmall  >= 0 ? parseFlag(v[iSmall])          : false,
      apt:        iApt    >= 0 ? parseFlag(v[iApt])            : false,
      dogCount:   iDogC   >= 0 ? parseInt(v[iDogC]) || 0       : 0,
      kids:       iKids   >= 0 ? parseFlag(v[iKids])           : false,
      stairs:     iStairs >= 0 ? parseYN(v[iStairs])           : null,
      fence:      iFence  >= 0 ? parseYN(v[iFence])            : null,
      exp:        iExp    >= 0 ? parseFlag(v[iExp])             : false,
      galt:       iGalt   >= 0 ? parseFlag(v[iGalt])           : false,
      timeAway:   iTime   >= 0 ? v[iTime].trim()               : "",
      sexPref:    iSex    >= 0 ? v[iSex].trim()                : "",
      agePref:    iAge    >= 0 ? v[iAge].trim()                : "",
      notes:      iNotes  >= 0 ? v[iNotes].trim()              : "",
    } as Applicant;
  }).filter((a): a is Applicant => a !== null);
}