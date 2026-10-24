---
doc: prd
status: approved
---

# Chaos-to-Calendar — Product Requirements

A single-page utility for freelancers, engineers, and knowledge workers to turn unstructured meeting notes and brain dumps into prioritized tasks and exportable `.ics` calendar events.
Source: `scope.md > Who It's For`, `scope.md > The Core Loop`.

## The Core Journey
1. **Arrival & Input:** User opens the application in a browser. They see a clean, distraction-free input workspace.
2. **One-Click Trial:** User can click the "Load Sample" button to immediately populate realistic meeting notes with mixed deadlines and action items. Alternatively, they paste their own raw notes.
3. **Execution:** User clicks "Process Notes". The button switches to a loading state ("Analyzing & extracting...").
4. **Output Dashboard:** The results area reveals a responsive two-column dashboard:
   - **Left Column (Action Items):** Prioritized list of tasks categorized into High, Medium, and Low badges with a 1-click "Copy as Markdown" button.
   - **Right Column (Calendar Events):** Extracted event cards displaying event title, calculated date/time, and duration.
5. **Calendar Export:**
   - User can click "Download .ics" on any individual event card for a single-event file.
   - User can click "Export All (.ics)" to download a combined bundle of all detected events.
6. **Native Import:** User opens the downloaded `.ics` file; their OS calendar (Google Calendar, Apple Calendar, Outlook) opens natively with valid event parameters pre-filled.

## Screens and Layout
- **Single-Page Application (SPA):**
  - **Header:** Minimal bar with title "Chaos-to-Calendar", tag line, and GitHub link.
  - **Input Section:** Wide text input area with word counter, a secondary "Load Sample" button, and a primary "Process Notes" call-to-action button.
  - **Results Section (Dual-Column / Responsive Stack):**
    - Column 1: Action Items Card with header actions ("Copy Markdown", task count).
    - Column 2: Calendar Events Card with header actions ("Export All .ics", event count).

## Look and Feel
- **Aesthetic:** Dark-mode first, inspired by Linear and Raycast.
- **Palette:** Deep neutral dark slate/zinc background (`#090d16` / `#0f172a`), muted card borders (`#1e293b`), high-contrast crisp text (`#f8fafc`), with emerald (`#10b981`) and cyan (`#06b6d4`) accents for success states, priorities, and download actions.
- **Typography:** Modern, clean sans-serif (Inter / Geist system fonts) with monospace accents for dates, timestamps, and `.ics` file names.
- **Micro-interactions:** Smooth hover effects, subtle loading shimmer/spinners, copy feedback toasts ("Copied to clipboard!").

## Features and Behavior

### Note Ingestion & Validation
Source: `scope.md > The Core Loop`.
- The input textarea accepts arbitrary plain text.
- If input has fewer than 5 words or is empty, clicking "Process Notes" triggers an inline alert/toast: *"Please paste some meeting notes or click 'Load Sample' to test."*
- Clicking "Load Sample" replaces current input with a multi-item note covering relative dates ("tomorrow at 2 PM", "Friday evening", "Monday 10 AM sync") and non-dated action items.

### Action Item Extraction & Prioritization
Source: `scope.md > The Core Loop`.
- Extracts distinct action items from notes.
- Classifies each task by priority (`High`, `Medium`, `Low`) based on urgency, explicit words, or deadline proximity.
- Displays priority badge styling: High (red/rose), Medium (amber/yellow), Low (slate/blue).
- "Copy as Markdown" generates clean GFM task list syntax (`- [ ] **[HIGH]** Fix auth bug`).

### Calendar Event Extraction & Normalization
Source: `scope.md > The Unique Kernel`.
- Detects implicit and explicit dates/times relative to the current local timestamp (`new Date().toISOString()`) and client timezone.
- **Default Meeting Duration:** When a start time is given with no end time (e.g. "Monday 10 AM"), assigns 30 minutes (10:00 AM – 10:30 AM).
- **Deadlines:** For explicit due dates/times (e.g. "due Friday 5 PM"), assigns a 30-minute block ending at the deadline (4:30 PM – 5:00 PM) prefixed with `[Deadline]`.
- **Date-Only Items:** When only a date is mentioned with no time (e.g. "submit report by Friday"), creates an RFC 5545 All-Day Event (`VALUE=DATE`).

### Client-Side RFC 5545 .ics Generation
Source: `scope.md > The Unique Kernel`.
- Formats dates in UTC or local timezone compatible with RFC 5545 standard (`BEGIN:VCALENDAR`, `VERSION:2.0`, `PRODID:...`, `BEGIN:VEVENT`, etc.).
- Includes summary, description, start time (`DTSTART`), end time (`DTEND`), and unique `UID`.
- Generates valid `.ics` blob and triggers direct browser download without server storage.
- Supports individual event download and bundled all-events download (`chaos-events.ics`).

## States and Boundaries
- **Initial / Empty State:** Clean textarea ready for text or sample click. Results section is hidden or shows a subtle prompt.
- **Loading State:** "Process Notes" button is disabled with a spinner and label "Analyzing & extracting...". Textarea is read-only while processing.
- **Success State:** Displays both task items and calendar cards.
- **Partial / Empty Column States:**
  - Tasks found, but no dated events: Shows tasks on left; right column displays a friendly muted card: *"No dated events detected in these notes — action items listed on the left."*
  - Dated events found, but no generic tasks: Left column displays muted card: *"No standalone tasks detected — calendar events listed on the right."*
- **No-Match / Gibberish State:** If valid length text contains no extractable tasks or dates, displays: *"No actionable tasks or dates found. Try adding more context or specific deadlines."*
- **Error State:** If LLM processing fails (timeout, network error, parsing error), displays a clear error alert with a "Retry" button.

## Product Decisions
- **Client-Side .ics Generation:** Eliminates OAuth credential complexity and privacy friction; users get instant calendar integration across all calendar providers.
- **Relative Date Anchoring:** Passes client ISO timestamp and timezone into the prompt to guarantee deterministic resolution of "tomorrow", "next Monday", etc.
- **Deadline Scheduling:** Uses a 30-minute pre-deadline block prefixed with `[Deadline]` to make deadlines visible and actionable on calendar grids rather than zero-duration markers.
- **Dark Mode Default:** Delivers high visual contrast and modern dev tool aesthetic suitable for demo videos and daily use.

## What We're Building
- Single-page responsive web app with dark Linear/Raycast UI.
- Sample note loader button.
- LLM prompt & structured schema returning prioritized tasks and normalized events.
- Pure client-side `.ics` generator with single and batch export.
- Copy Markdown checklist action.
- Friendly partial and empty state handling.

## Deferred From the POC
- Direct Google / Outlook Calendar API sync via OAuth (planned for Later).
- Editable event modal to customize fields before downloading.
- In-browser microphone audio transcription (Whisper).

## Non-Goals
- User authentication and cloud account storage.
- Direct synchronization back to note-taking apps (Notion, Obsidian).
- Two-way calendar sync or event deletion.

## Open Questions
- None blocking product definition. Technical implementation details (LLM provider API key handling, client framework) will be resolved in `4-spec`.

