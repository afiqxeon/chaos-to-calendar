---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Scaffold project and verify RFC 5545 .ics generator with unit tests**
  Becomes usable: Running project foundation with an RFC 5545 `.ics` generator in `src/utils/ics.ts` verified by automated unit tests asserting proper CRLF endings, VCALENDAR wrapping, ISO/UTC timestamps, and all-day event formatting.
  Why now: Directly addresses the core risk and primary learning intention (zero drift on calendar specs) before investing in UI or API layers.
  PRD ref: `prd.md > Client-Side RFC 5545 .ics Generation`
  Spec ref: `spec.md > Components > IcsGeneratorService`, `spec.md > Stack`
  Build: Initialize Bun Vite + React TypeScript scaffold, install dependencies (`zod`, `lucide-react`, `clsx`, `tailwind-merge`, `tailwindcss`), configure TypeScript and Tailwind, write `src/types.ts` and `src/utils/ics.ts`, write `tests/ics.test.ts`.
  Verify (mechanical): Run `bun test tests/ics.test.ts` and confirm all RFC 5545 assertions pass.
  Learner check: Inspect the passing test suite output to confirm RFC 5545 calendar compliance.
  Commit: `Scaffold project and implement verified RFC 5545 calendar generator`

- [x] **2. Backend API with Anchor Timestamp and Zod Structured Schema Validation**
  Becomes usable: A running local server on port 3001 exposing `POST /api/process` that accepts notes, anchors relative dates with client timestamps, prompts the LLM for structured JSON, and strictly validates outputs with Zod.
  Why now: Establishes the AI extraction pipeline and validates schema adherence before frontend integration.
  PRD ref: `prd.md > Note Ingestion & Validation`, `prd.md > Action Item Extraction & Prioritization`, `prd.md > Calendar Event Extraction & Normalization`
  Spec ref: `spec.md > Components > NotesProcessingApi`, `spec.md > Data Model`
  Build: Create `server.ts` with `Bun.serve`, construct prompt injecting current ISO timestamp and timezone, call Anthropic endpoint, parse and validate with Zod `ExtractionResponseSchema`, handle partial and error states.
  Verify (mechanical): Run `bun run tests/api-check.ts` sending sample meeting notes to `http://localhost:3001/api/process` and assert HTTP 200 with valid parsed tasks and events.
  Learner check: Review the extracted JSON payload to confirm accurate relative date resolution.
  Commit: `Add Bun API server with Zod structured output extraction`

- [x] **3. Complete Interactive UI with Sample Loader, Task List, and Calendar Cards**
  Becomes usable: Full single-page web app at `http://localhost:5173`. Users can load sample notes, run extraction, view prioritized task checklist with 1-click Markdown copy, view event cards, and download individual or bundled `.ics` files.
  Why now: Assembles the verified components and backend into the final user experience with the dark Linear/Raycast aesthetic.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Screens and Layout`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Components`, `spec.md > Look and Feel`
  Build: Implement `NoteInputArea.tsx`, `ActionItemsList.tsx`, `CalendarEventsList.tsx`, `Header.tsx`, and `App.tsx` with Tailwind CSS; configure Vite proxy to backend; implement 1-click sample loader, markdown clipboard copying, and `.ics` blob download triggers.
  Verify (mechanical): Run `bun run build` to confirm zero TypeScript or bundling errors; verify dev server starts on port 5173.
  Learner check: Open `http://localhost:5173`, click "Load Sample", click "Process Notes", copy markdown tasks, and download `.ics` file into your calendar.
  Commit: `Implement interactive Chaos-to-Calendar web UI with live exports`

## Hands-on Checkpoints

- [x] Early usable behavior explored — Slice 1 RFC 5545 calendar generator test verification
- [x] Final kick-the-tires exploration and feedback completed

## Final Review

- [x] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [x] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [x] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Focused alternative verifying spec-driven RFC 5545 alignment (tests/ics.test.ts) and Zod schema validation (server.ts), resolving network binding and proxy failover during final testing.
Route and stops: src/utils/ics.ts (buildIcsContent), server.ts (/api/process & extractWithRuleEngine), src/App.tsx (handleProcessNotes)
Edit outcome: Resolved host exposure on 0.0.0.0 and client failover route; verified passing by learner.
Reflection: Already addressed — isolated verification of format-critical kernel before UI prevents drift.
Activity mode: Live app verified in browser and standalone app map snapshot.

## Revisions

- Local server network binding and dual-route API resilience — Vite proxy ECONNREFUSED was caused by localhost resolving to IPv6 while Bun.serve was bound without explicit host, and the background server was in an isolated network namespace. Configured hostname "0.0.0.0", updated proxy target to 127.0.0.1, added a 3s timeout to external LLM calls to prevent hanging, and added direct backend fallback in App.tsx.

