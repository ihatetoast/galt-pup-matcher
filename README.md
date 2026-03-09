# 🐾 Pup Matcher — GALT Adoption Matching Tool

A lightweight browser-based tool for matching available greyhounds with adoption applicants. Built for internal use by GALT coordinators.

---

## What It Does

Pup Matcher scores each applicant against each available dog using a set of compatibility rules — fencing, cats, other dogs, apartment living, kids, age and sex preferences, coordinator notes, and more. Applicants are ranked by match score so coordinators can quickly see who the strongest candidates are for each dog.

---

## Using the Tool

The tool loads with seed data built in. To use current data, upload fresh CSVs using the buttons in the bottom left panel.

### Dogs CSV

Expected columns (order doesn't matter, headers are matched by keyword):

| Column | Values |
|---|---|
| Hound | Dog's name |
| Sex | M or F |
| Age | Number |
| Location | City |
| Foster | Foster's name |
| Only | yes / no / must be |
| Needs Less Time Away | yes (or blank) |
| High Fence? | yes (or blank) |
| Experienced Only | yes (or blank) |
| Kids? | yes / no (or blank for unknown) |
| Cats? | yes / no (or blank for unknown) |
| Small Dogs? | yes / no / maybe (or blank) |
| Apt? | yes / no (or blank for unknown) |
| Stairs? | yes / no (or blank for unknown) |
| Possible Matches | Applicant initials, comma-separated |
| Notes | Free text |

### Applications CSV

Expected columns:

| Column | Values |
|---|---|
| Coordinator | Coordinator name |
| Submitted Date | Date |
| Applicant Name | Initials or name |
| Status | Approved / Submitted / Reference Checking / Waiting / Under Review |
| City | City |
| State | State/province |
| Cat (Y/N) | Y or N |
| Small Dogs (Y/N) | Y or N |
| Apt (Y/N) | Y or N |
| Dog Count | Number of current dogs |
| Kids | Y or N |
| Stairs (Y/N) | Y or N |
| Fence | Y or N |
| Experience | Y or N |
| GALT Adopter | Y or N |
| Time Away | 0-2 / 2-6 / 6-9 / 10+ |
| Sex Pref | Male / Female / Either (or combinations) |
| Age Preference | Puppy / Young / Adult / Senior / Super Senior / No Preference |
| Notes | Free text |

---

## How Scoring Works

Each applicant starts at 50 points. Points are added or subtracted based on compatibility. The final score is capped between 0 and 100.

**Hard constraints** (large point swings):
- Cats, small dogs, apartment, fence, stairs
- Whether the dog needs to be an only dog or requires a canine companion
- Kids, if the dog is known to be unsuitable

**Soft bonuses:**
- Applicant named the dog specifically in their notes
- GALT or greyhound experience for dogs that need it
- Age and sex preference matches
- Coordinator-flagged possible matches
- Low time away for dogs that need company

**Score bands:**
- 68%+ → Strong match (green)
- 45–67% → Good match (amber)
- Below 45% → Needs review (red)

---

## About the Data

This is a private repository. The applicant and dog data loaded by default is real and confidential — please do not share the repository link or data outside of authorized GALT coordinators.

If you want to use this tool with your own data, you can upload your own CSVs at any time using the upload buttons. The seed data is never modified — uploading a CSV only affects the current session.

---

## Tech Stack

Built with React, TypeScript, and Vite. No backend, no database. Everything runs in the browser.

---

## Status

Currently in testing. If something looks wrong with a match score or you notice a bug, please flag it to the developer.