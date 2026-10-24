---
doc: spec
status: approved
---

# Chaos-to-Calendar — Technical Spec

## How This Works, In Plain Language
Chaos-to-Calendar consists of a single-page React interface running on a local Bun development server, backed by a lightweight Bun API endpoint (`/api/process`).

When the user enters raw notes (or loads a sample), the client sends the text along with the client's current ISO timestamp and timezone to the Bun backend. The backend constructs a targeted prompt for an Anthropic-compatible LLM endpoint requiring a strict JSON response conforming to our task and event schema. The backend validates the response using Zod to prevent malformed data from ever reaching the frontend.

Once the frontend receives the validated data, it renders two coordinated panels: a prioritized task list with 1-click Markdown copying, and an event timeline showing extracted calendar dates. When the user clicks to download single or all events, a pure TypeScript utility formats the events into an RFC 5545 compliant `.ics` text file entirely in the browser and triggers an instant native file download.

## The Core Journey Through the System
Implements `prd.md > The Core Journey`.

1. **User input / Load Sample:** The user enters text into `NoteInputArea` or clicks "Load Sample", populating the text state.
2. **Submission:** User clicks "Process Notes". The client calls `POST /api/process` with `{ notes, anchorTimestamp, timezone }`.
3. **Backend Parsing & Extraction:** `server.ts` calls the LLM endpoint using the configured `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL`.
4. **Validation:** The LLM's response is parsed and checked against `ExtractionSchema` via Zod. If valid, it returns `{ tasks, events }` to the client.
5. **Display:** React state updates:
   - `ActionItemsList` renders priority badges and provides a "Copy as Markdown" button.
   - `CalendarEventsList` renders event cards with date/time, duration, and download triggers.
6. **Export:** Clicking "Download .ics" or "Export All (.ics)" calls `generateIcs(events)`, constructing an RFC 5545 Blob with `text/calendar;charset=utf-8` MIME type and initiating a native download.

## Stack
- **Runtime & Package Manager:** **Bun** (v1.3.14) — high performance TypeScript runtime and package manager.
  - Rationale: Pre-installed in the environment, runs TypeScript natively, zero compilation delays.
- **Frontend Framework:** **React 18 / 19** with **Vite** & TypeScript.
  - Docs: [Vite](https://vitejs.dev/), [React](https://react.dev/)
  - Rationale: Instant HMR, minimal overhead, standard fullstack developer ergonomics.
- **Styling:** **Tailwind CSS** (dark Linear/Raycast theme).
  - Docs: [Tailwind CSS](https://tailwindcss.com/)
- **Backend API:** Native **Bun.serve** on port 3001, proxied by Vite (`/api -> http://localhost:3001`).
  - Rationale: Single-file micro-server, no heavy backend framework required.
- **Schema Validation:** **Zod**.
  - Docs: [Zod](https://zod.dev/)
  - Rationale: Strict runtime type checking on LLM structured JSON output.
- **Testing & Verification:** **Bun Test** (`bun test`).
  - Rationale: Native test runner used to verify RFC 5545 calendar compliance prior to UI assembly.

## Where It Runs and How Someone Tries It
- **Runtime:** Local development environment.
- **Environment Requirements:**
  - `bun` (available at `/home/afiqxeon/.bun/bin/bun`).
  - Environment variables: `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL` (configured in shell environment).
- **Start Command:**
  - Backend: `bun run server.ts` (runs API on `http://localhost:3001`).
  - Frontend: `bun run dev` (runs Vite UI on `http://localhost:5173`).
  - Or a unified script: `bun run start`.
- **Demo Recording Workflow:**
  1. Open browser to `http://localhost:5173`.
  2. Click "Load Sample".
  3. Click "Process Notes".
  4. View extracted tasks and calendar cards.
  5. Click "Export All (.ics)" and open downloaded `.ics` file in system calendar.

## Look and Feel
Carried forward from `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`:
- **Palette:** Deep dark zinc background (`bg-zinc-950`), border accents (`border-zinc-800`), crisp white headings (`text-zinc-100`), muted body text (`text-zinc-400`).
- **Accents:** Emerald (`bg-emerald-500/10 text-emerald-400 border-emerald-500/20`) for positive actions/downloads; Cyan (`bg-cyan-500/10 text-cyan-400 border-cyan-500/20`) for calendar events; Rose/Amber/Slate for High/Medium/Low priority badges.
- **Typography:** Clean sans-serif with monospace font for dates, durations, and `.ics` file badges.

## Components

### `NoteInputArea`
Implements `prd.md > Note Ingestion & Validation`.
- Controlled textarea for notes.
- Word counter indicator.
- "Load Sample" button injecting test text with relative dates.
- "Process Notes" primary button with loading spinner state and client-side validation (< 5 words alert).

### `ActionItemsList`
Implements `prd.md > Action Item Extraction & Prioritization`.
- Displays list of parsed tasks with `High`, `Medium`, and `Low` priority badges.
- "Copy as Markdown" button that writes formatted GFM checklists to the system clipboard with toast feedback.
- Empty state message if no tasks are found.

### `CalendarEventsList`
Implements `prd.md > Calendar Event Extraction & Normalization`.
- Renders extracted events as clean cards showing title, time window, duration badge, and optional location.
- Individual "Download .ics" button on each card.
- Global "Export All (.ics)" action in card header.
- Empty state message if no dated items are detected.

### `IcsGeneratorService` (`src/utils/ics.ts`)
Implements `prd.md > Client-Side RFC 5545 .ics Generation`.
- Formats dates to RFC 5545 UTC / local strings (`YYYYMMDDTHHMMSSZ` or `VALUE=DATE:YYYYMMDD`).
- Injects `BEGIN:VCALENDAR`, `VERSION:2.0`, `PRODID:-//Chaos-to-Calendar//EN`, `CALSCALE:GREGORIAN`, `BEGIN:VEVENT`, `UID`, `SUMMARY`, `DESCRIPTION`, `DTSTART`, `DTEND`, `END:VEVENT`, `END:VCALENDAR`.
- Enforces proper `\r\n` line endings.
- Wraps output into a downloadable `Blob` and triggers automatic browser download link.

### `NotesProcessingApi` (`server.ts`)
Implements `prd.md > Note Ingestion & Validation`.
- Exposes `POST /api/process`.
- Injects anchor date/time (`anchorTimestamp`) and user timezone into system prompt.
- Sends request to LLM using `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN`.
- Parses and strictly validates response against Zod schema before sending JSON to client.

## Data Model

```typescript
import { z } from "zod";

export const ActionTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: z.enum(["High", "Medium", "Low"]),
  reasoning: z.string().optional()
});

export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  startIso: z.string(),
  endIso: z.string(),
  isAllDay: z.boolean(),
  durationMinutes: z.number(),
  description: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["meeting", "deadline", "event"])
});

export const ExtractionResponseSchema = z.object({
  tasks: z.array(ActionTaskSchema),
  events: z.array(CalendarEventSchema)
});

export type ActionTask = z.infer<typeof ActionTaskSchema>;
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>;
```

## File Structure

```
poc-basics-hackathon/
├── devpost/                         # Course documentation
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   ├── spec.md
│   └── checklist.md                 # Generated in 5-build
├── src/
│   ├── components/
│   │   ├── Header.tsx               # App branding & links
│   │   ├── NoteInputArea.tsx        # Text input & sample loader
│   │   ├── ActionItemsList.tsx      # Task list & copy-markdown
│   │   └── CalendarEventsList.tsx   # Event cards & .ics downloads
│   ├── utils/
│   │   ├── ics.ts                   # Pure RFC 5545 generator
│   │   └── samples.ts               # Sample test notes
│   ├── types.ts                     # TypeScript interfaces & Zod schemas
│   ├── App.tsx                      # Main container & state management
│   ├── main.tsx                     # React root mount
│   └── index.css                    # Tailwind CSS imports & base styles
├── tests/
│   └── ics.test.ts                  # Dedicated RFC 5545 unit validation tests
├── server.ts                        # Bun micro-server calling LLM & validating schema
├── vite.config.ts                   # Vite bundler config with API proxy
├── tailwind.config.js               # Tailwind CSS theme configuration
├── postcss.config.js                # PostCSS config
├── package.json                     # Bun / Node package definitions
├── tsconfig.json                    # TypeScript compiler options
└── .gitignore                       # Git ignore rules
```

## External Services and Dependencies
- **LLM API Service:**
  - Endpoint: `${ANTHROPIC_BASE_URL}/v1/messages`
  - Authentication: `Bearer ${ANTHROPIC_AUTH_TOKEN}`
  - Payload: Model instruction with anchor date and strict JSON system prompt.
  - Fallback: Graceful error response with descriptive message if endpoint fails or network drops.
- **Client Dependencies:**
  - `react`, `react-dom`
  - `lucide-react` (clean icons for copy, calendar, download, checkmarks)
  - `clsx`, `tailwind-merge` (clean CSS class composition)
- **Backend Dependencies:**
  - `zod` (runtime schema validation)

## Important Failure Modes
1. **LLM Output Malformed / Non-JSON:** Server catches JSON parse errors and Zod validation failures; returns clean `502 Bad Gateway` with `"Unable to parse structured tasks from AI response. Please retry."`
2. **Invalid Date Calculations from LLM:** Client checks `isNaN(Date.parse(startIso))`. If invalid, falls back to raw date string or flags event safely rather than generating a broken `.ics` timestamp.
3. **Network / Server Down:** Frontend displays an inline dismissible alert banner with a "Retry" button.

## What Was Simplified and Why
- **Native Bun Server + Vite Proxy** instead of a full Next.js fullstack framework: avoids heavy build churn, complex routing, and deployment baggage while remaining blazing fast on Bun.
- **Pure Client-Side RFC 5545 Generator** instead of server calendar packages: removes server dependencies, enables instant local downloads, and keeps calendar data 100% private.
- **Single-File Server (`server.ts`)** instead of complex multi-layered backend: satisfies PoC size while isolating API keys and schema validation.

## Decisions and Open Issues
- **Explicit RFC 5545 Unit Verification:** Confirmed that prior to building the full UI in `5-build`, we will write and pass `tests/ics.test.ts` verifying RFC 5545 CRLF endings, calendar wrapping, date formatting, and all-day flags to ensure zero drift.
- **No Unresolved Consequential Issues:** Stack, architecture, schemas, and verification plan are fully determined.

