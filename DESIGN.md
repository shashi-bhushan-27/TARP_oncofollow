# OncoFollow design system

Audience: people in cancer follow-up care (often older, tired, anxious, or reading in a second language), their family caregivers, and busy oncology care teams. The interface should feel like a calm, well-run clinic: warm, legible, and plain-spoken.

## Principles

1. **One job per screen.** Each page leads with the single thing the user most needs (the next visit, the alert queue), then supporting detail.
2. **Depth from tone, not decoration.** Three surface planes (canvas → card → plane) create hierarchy. No shadows on resting surfaces, no gradients, no glass.
3. **One accent.** Pine is reserved for actions, links, focus and selection. Status colours appear only on routing states.
4. **Status is never colour alone.** Every routing tag pairs colour with a word and a shape (dot, square, triangle).
5. **Words over icons.** Icons appear only where they aid scanning (navigation, inline actions). No emoji, no decorative icon tiles.
6. **Calm motion.** 150–180 ms fades and colour transitions only. No looping or attention animations; `prefers-reduced-motion` is respected.

## Tokens

### Colour — neutrals (warm)
| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` / `bg-canvas` | `#f6f5f1` | `#141311` | Page |
| `--card-bg` | `#ffffff` | `#1d1c19` | Primary content plane |
| `--plane` / `bg-plane` | `#eeece6` | `#262420` | Inset panels, sidebar, secondary buttons |
| `--plane-strong` | `#e4e1d9` | `#302e29` | Hover on plane |
| `--card-border` | `#e7e4dd` | `#2e2c28` | Hairline dividers inside cards |
| `--foreground` | `#1d1c19` | `#ecebe6` | Primary text |
| `--text-muted` / `text-muted` | `#5c5851` | `#bab5ab` | Secondary text (≥ 6:1) |
| `--text-subtle` / `text-subtle` | `#6f6a62` | `#979188` | Meta text, captions (≥ 4.5:1 on every surface) |

### Colour — accent and status
| Role | Token | Key values |
|---|---|---|
| Action (pine) | `primary` | 600 `#1f6a5b` (white text 6.4:1) · 300 `#80c2b2` (dark-mode action) |
| Information (ink) | `accent` | 600 `#365482` |
| Routine queue | `chip-routine` | pine 50/800 |
| Slot this week | `chip-soon` | `caution` 50/800 |
| Coordinator SMS | `chip-urgent` | `urgent` 50/800 |
| Emergency | `chip-emergency` | solid `emergency` 600 `#b42d24`, white text |

### Type
- UI: **Inter** (`font-sans`), page titles: **Source Serif 4** (`font-display`, weight 500). Loaded with `next/font`.
- Scale (size/line-height): 11/16 · 12/18 · 14/22 · **16/26 body** · 18/28 · 22/30 · 28/36 · 34/42 · 42/50 · 52/60 · 60/68.
- `.page-title` (serif 28→34), `.eyebrow` (12, semibold, uppercase, 0.08em tracking), `.section-title` (16 semibold sans).
- Bold is used sparingly; the serif carries emphasis through size.

### Radius (4 / 8 / 12)
`rounded` 4px — tags, checkboxes, count badges · `rounded-lg` 8px — buttons, inputs, list rows · `rounded-xl` 12px — cards and panels. `rounded-2xl`/`3xl` are capped at 12px. `rounded-full` is only for true circles (the record button, status dots).

### Spacing
4 px base (Tailwind scale). Page gutter 16 / 32 / 48 px by breakpoint; section gap 32 px; card padding 24 px (32 px on hero cards); list row padding 12–20 px.

### Elevation
Resting surfaces: none. `shadow-elevated` (1 px) for sticky or floating bars; `shadow-modal` only for dialogs.

## Components (`src/app/globals.css`, `src/components`)
- **Surfaces:** `.card`, `.panel`, `.evidence-card`, `.divider`
- **Buttons:** `.btn-primary` (one per view), `.btn-secondary` (tonal), `.btn-ghost` (inline actions), `.btn-danger`
- **Form:** `.input-field`, `.label`
- **Status:** `<RoutingChip priority audience="patient|care_team" full?>` with `<RoutingMarker>`; `.chip-*`
- **Navigation:** `.sidebar-link`, `.sidebar-link-active` (card-coloured row on the plane), `.tab`, `.tab-active` (underline)
- **Brand:** `<Wordmark size subtitle>`
- **Loading:** `.skeleton` (shimmer between plane tones)

## Screen structure

### Landing (`/`)
```
Header        Wordmark ........................ Guide · theme · [Sign in]
Hero (2 col)  eyebrow · serif H1 · lead · [I am a patient or caregiver] [I work on a care team]
              └ Real check-in result: quote → routed tag → "Before your visit" checklist
Routing       H2 + intro · table: Queue | What the patient sees | What the care team does
Audiences     2 columns of definition lists (patients & caregivers / care teams)
Boundaries    plane panel: "What OncoFollow will not do" (6 items)
Emergency     left-ruled notice
Footer
```

### App shell (all signed-in pages)
```
Sidebar (plane)  Wordmark · grouped nav (Overview/Notifications · Your care · Help) · user + theme + sign out
Main (canvas)    max-w-6xl, 48 px gutters on desktop
```

### Patient overview (`/dashboard/patient`)
```
eyebrow date · serif greeting · centre / caregiver context
[ Next follow-up visit (card, 2/3)            ] [ From your care team (plane, 1/3) ]
[   date (serif) + status tag · type · advice ] [   3 latest, unread dot, all link  ]
[   ─────────────────────────────             ] [                                   ]
[   How are you doing? [Check-in][Voice][Upload]]
[ At a glance: Last check-in | Reports on file | Current medicines ]  (one card, 3 cells)
[ Recent activity (dated rows, 2/3) ] [ Medicines (1/3) ]
```
Empty states: no visit scheduled, nothing new from the team, no check-ins yet, no activity, no medicines.

### Check-in (`/symptoms`)
Labelled 3-step progress → symptom list (checkbox rows with plain-language descriptions; emergency-list items explain they alert the team) → voice note (states: idle, recording, transcribing skeleton, transcript, error) → details as fieldsets → free text → result: "Where your check-in went", "What happens next" (numbered), "Before your visit". Emergency overlay is a solid, calm full-screen instruction list.

### Care-team overview (`/dashboard/clinician`)
Count strip (one card, 4 cells) → underline tabs with counts → alerts as rows in one surface with a status rule on the left, inline ghost actions, expandable note form → patients as a table → recent check-ins as rows quoting the patient's words.
