# Chaos-to-Calendar 🗓️⚡

A privacy-first micro-app that transforms messy meeting notes, brain dumps, and transcripts into prioritized actionable checklists and one-click downloadable RFC 5545 `.ics` calendar events.

Built for the **Devpost Learn: Build With AI: Basics** hackathon using a plan-first, spec-driven development methodology.

---

## ✨ Features

- **Deterministic Date Resolution:** Anchors relative date/time terms (_"tomorrow 2 PM"_, _"Friday evening"_, _"Monday 10 AM"_) to the client's current timestamp and local timezone.
- **Spec-Compliant Calendar Generation:** Zero external calendar packages. Features a pure client-side RFC 5545 `.ics` generator with CRLF (`\r\n`) line endings, UTC/local date formatting, all-day `VALUE=DATE` syntax, and multi-event bundling.
- **Prioritized Action Items:** Automatically filters out document headers/meeting titles and classifies true actionable items into `High`, `Medium`, and `Low` priority badges.
- **Interactive Checklists & Markdown Export:** Interactive checkboxes allow toggling task completion status, with a 1-click **Copy as Markdown** button formatted with `- [x]` or `- [ ]` for Jira, Linear, or GitHub issues.
- **Zero OAuth Friction:** No third-party accounts, calendar API keys, or permissions required. Generates standard `.ics` files that import natively into Google Calendar, Apple Calendar, Outlook, and desktop Linux calendars (KOrganizer, GNOME Calendar).
- **Multi-Scenario Sample Presets:** Built-in quick selectors for diverse real-world formats: structured **Engineering Syncs** (sprint deadlines), unstructured **Messy Chats** (WhatsApp/Slack conversation dumps), and streaming **Brain Dumps** (long-term untimed tasks).
- **Fast Mode UI:** Distraction-free, responsive dark interface inspired by Linear and Raycast with instant sample loading and zero-friction note processing.

---

## 🛠️ Tech Stack

- **Runtime:** [Bun](https://bun.sh/)
- **Frontend:** [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend API:** Native `Bun.serve` on port 3001
- **Validation:** [Zod](https://zod.dev/)
- **Test Runner:** Bun Test (`bun test`)

---

## 🚀 Quickstart

### Prerequisites

- [Bun](https://bun.sh/) installed (`v1.0+`)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/afiqxeon/chaos-to-calendar.git
cd chaos-to-calendar
bun install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
ANTHROPIC_AUTH_TOKEN=your_token_here
# Optional: ANTHROPIC_BASE_URL if using a custom gateway
```

### 3. Start the Backend API Server

```bash
bun run server.ts
```

The API server runs on `http://localhost:3001` (handling `/api/process` requests with Zod schema validation).

### 4. Start the Frontend Dev Server

In a separate terminal tab:

```bash
bun run dev --host
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 5. Run Automated Unit Tests

Verify strict RFC 5545 calendar compliance:

```bash
bun test tests/ics.test.ts
```

Expected output:

```text
✓ escapes special characters correctly according to RFC 5545
✓ formats UTC and Date-only timestamps correctly
✓ generates a strictly compliant single timed event with CRLF line endings
✓ generates valid All-Day events with VALUE=DATE parameters
✓ bundles multiple events in a single VCALENDAR document
5 pass, 0 fail
```

---

## 📋 Architecture & Planning Artifacts

All course planning documents, architecture boundaries, and design artifacts are located under `devpost/`:

- `devpost/scope.md`: Proof-of-concept boundaries and core kernel definition
- `devpost/prd.md`: Product requirements, user journey, and edge cases
- `devpost/spec.md`: Technical specification and data schemas
- `devpost/checklist.md`: Verified incremental build slices and progress state
- `devpost/app-map.html`: Standalone architecture map and code tour snapshot
