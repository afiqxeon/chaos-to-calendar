# Chaos-to-Calendar

A micro-app that transforms chaotic meeting notes, brain dumps, and voice transcripts into prioritized actionable tasks and one-click downloadable RFC 5545 `.ics` calendar events.

Built for the **Devpost Learn: Build With AI: Basics** hackathon.

---

## Features
- **Deterministic Date Resolution:** Anchors relative date/time terms ("tomorrow 2 PM", "Friday evening", "Monday 10 AM") using client reference timestamps and timezone.
- **Spec-Compliant Calendar Generation:** Zero external calendar packages; pure client-side RFC 5545 `.ics` generator with CRLF (`\r\n`) endings, all-day `VALUE=DATE` formatting, and multi-event bundling.
- **Prioritized Action Items:** Automatically groups tasks by priority (`High`, `Medium`, `Low`) with 1-click "Copy as Markdown" for task trackers (Jira, Linear, GitHub issues).
- **Zero OAuth Friction:** No third-party accounts, calendar API keys, or permissions required. Generates standard `.ics` files that import natively into Google Calendar, Apple Calendar, and Outlook.
- **Fast Mode UI:** Responsive, distraction-free dark interface with instant 1-click sample loader for rapid testing.

---

## Tech Stack
- **Runtime:** [Bun](https://bun.sh/)
- **Frontend:** [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend API:** Native `Bun.serve` on port 3001
- **Validation:** [Zod](https://zod.dev/)
- **Test Runner:** Bun Test (`bun test`)

---

## Quickstart

### Prerequisites
- [Bun](https://bun.sh/) installed (v1.0+)

### 1. Install Dependencies
```bash
bun install
```

### 2. Start the Backend API Server
```bash
bun run server.ts
```
API server runs on `http://localhost:3001`.

### 3. Start the Frontend Dev Server
In a separate terminal:
```bash
bun run dev --host
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 4. Run Automated Unit Tests
Verify RFC 5545 calendar compliance:
```bash
bun test
```

---

## Architecture & Planning Artifacts
All course planning documents and design artifacts are located under `devpost/`:
- `devpost/scope.md`: Proof-of-concept boundaries and core kernel definition
- `devpost/prd.md`: Product requirements, user journey, and edge cases
- `devpost/spec.md`: Technical specification and data schemas
- `devpost/checklist.md`: Verified incremental build slices and progress state
- `devpost/app-map.html`: Standalone architecture map and code tour snapshot
