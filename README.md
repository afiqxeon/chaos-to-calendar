# Chaos-to-Calendar 🗓️⚡

A privacy-first micro-app that transforms chaotic meeting notes, unstructured brain dumps, and messy chat transcripts into prioritized actionable task checklists and one-click downloadable RFC 5545 `.ics` calendar events.

Built for the **Devpost Learn: Build With AI: Basics** hackathon using a plan-first, spec-driven development methodology.

---

## ✨ Features

- **Deterministic Relative Date Anchoring:** Injects the client's current ISO reference timestamp (`new Date().toISOString()`) and local timezone (`Intl.DateTimeFormat`) into the extraction pipeline so relative expressions (_"tomorrow 2 PM"_, _"due Friday 5 PM"_, _"Monday 10 AM sync"_) calculate into accurate absolute calendar timestamps.
- **Spec-Compliant Calendar Generation (RFC 5545):** Zero external calendar libraries. Features a pure TypeScript generator (`src/utils/ics.ts`) strictly enforcing CRLF (`\r\n`) line breaks, `VCALENDAR` and `VEVENT` boundaries, special character escaping (`\,`, `\;`, `\\`, `\n`), UTC time formatting, and all-day `VALUE=DATE` syntax.
- **Dual-Mode Extraction Engine (LLM + Offline Rule Parser):**
  - **AI Mode:** Connects to Anthropic-compatible endpoints (`/v1/messages`) with strict JSON schema instructions. Features a 3-second abort signal timeout (`AbortSignal.timeout(3000)`) to prevent hanging if external gateways are unreachable.
  - **Zero-Key Offline Mode:** If no API key is provided, the gateway is offline, or parsing fails, the system automatically falls back to an internal deterministic natural-language extraction engine. Both sources are validated through Zod before reaching the client.
- **Intelligent Header & Noise Filtering:** Automatically detects and strips document titles, meeting headers, section separators, metadata lines, and trailing colons (e.g. *"Team Sync & Sprint Wrap-up Notes:"*, *"Agenda:"*), ensuring only true actionable tasks are extracted.
- **Interactive Checklist & GFM Markdown Export:** Clicking a task row or checkbox toggles its completed state with immediate visual feedback (emerald checkmark, strikethrough, muted text, and active `X/Y` counter). The **"Copy Markdown"** button exports standard GitHub Flavored Markdown checklists (`- [x]` or `- [ ]`) ready for pasting into GitHub Issues, Linear, or Jira.
- **Multi-Scenario Quick Selectors:** Built-in dropdown selector supporting 3 real-world test scenarios:
  1. **Engineering Sync (Default):** Structured sprint notes with explicit deadlines.
  2. **Messy Chat (WhatsApp/Slack):** Conversational chat messages without bullets or line breaks.
  3. **Brain Dump / Voice Memo:** Continuous stream-of-consciousness tasks without dates (demonstrating task-only empty calendar state).
- **Single & Bundled `.ICS` Exports:** Download individual `.ics` files per event or click **"Export All (.ics)"** to bundle all events into a single file that imports natively into Apple Calendar, Google Calendar, Outlook, and desktop calendar clients.
- **Dual-Route API Resilience:** The frontend routes `/api` calls through the Vite dev server proxy to `http://127.0.0.1:3001` and includes automatic client-side failover to connect directly to the backend if proxy errors occur.

---

## 🛠️ Tech Stack & Dependencies

### Runtime & Tooling
- **Runtime & Package Manager:** [Bun](https://bun.sh/) (`v1.3+`)
- **Frontend Framework:** [React 18](https://react.dev/) (`18.3.1`) & [React DOM](https://react.dev/) (`18.3.1`)
- **Bundler & Dev Server:** [Vite 5](https://vitejs.dev/) (`5.4.11`) with [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react) (`4.3.3`)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (`5.6.3`)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (`3.4.15`), [PostCSS](https://postcss.org/) (`8.4.49`), [Autoprefixer](https://github.com/postcss/autoprefixer) (`10.4.20`)
- **UI Composition & Icons:** [lucide-react](https://lucide.dev/) (`0.460.0`), [clsx](https://github.com/lukeed/clsx) (`2.1.1`), [tailwind-merge](https://github.com/dcastil/tailwind-merge) (`2.5.4`)
- **Schema Validation:** [Zod](https://zod.dev/) (`3.23.8`)
- **Test Runner:** Bun Test (`bun:test`)

---

## ⚙️ Environment Variables

An `.env` file is **optional**. Chaos-to-Calendar runs out-of-the-box in offline mode without any API keys.

To enable live LLM extraction with an Anthropic-compatible provider, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `ANTHROPIC_AUTH_TOKEN` | No | _(None)_ | Anthropic API key or authentication token. If omitted or invalid, the app runs the deterministic NLP parser. |
| `ANTHROPIC_BASE_URL` | No | `https://api.anthropic.com` | Custom API gateway or proxy base URL. |

---

## 📜 Available Scripts

| Command | Action |
|---|---|
| `bun run dev` | Starts the Vite frontend dev server on port `5173` (proxies `/api` to `3001`). |
| `bun run dev --host` | Starts Vite with `0.0.0.0` host exposure for local network or browser testing. |
| `bun run server` | Starts the Bun backend API micro-server on `http://localhost:3001`. |
| `bun run build` | Runs TypeScript compilation (`tsc`) and generates the production bundle via Vite. |
| `bun run preview` | Previews the production build locally. |
| `bun test` | Runs the RFC 5545 calendar unit test suite via Bun Test. |
| `bun run tests/api-check.ts` | Runs the automated backend API verification check against `POST /api/process`. |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
Ensure [Bun](https://bun.sh/) is installed:
```bash
bun --version # v1.0.0 or higher
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Start the Backend API Server
```bash
bun run server
```
Server listens on `http://localhost:3001`.

### 4. Start the Frontend Dev Server
In a separate terminal window:
```bash
bun run dev --host
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 5. Run Verification Tests
```bash
# Run unit tests
bun test

# Run API integration check (while server is running)
bun run tests/api-check.ts
```

Expected unit test output:
```text
tests/ics.test.ts:
✓ RFC 5545 Calendar Generation Verification > escapes special characters correctly according to RFC 5545
✓ RFC 5545 Calendar Generation Verification > formats UTC and Date-only timestamps correctly
✓ RFC 5545 Calendar Generation Verification > generates a strictly compliant single timed event with CRLF line endings
✓ RFC 5545 Calendar Generation Verification > generates valid All-Day events with VALUE=DATE parameters
✓ RFC 5545 Calendar Generation Verification > bundles multiple events in a single VCALENDAR document

5 pass, 0 fail (27 assertions)
```

---

## 📂 Project Structure

```text
chaos-to-calendar/
├── devpost/                         # Course documentation & planning artifacts
│   ├── learner-profile.md           # Learner onboarding profile (git-ignored)
│   ├── scope.md                     # Approved proof-of-concept scope & kernel
│   ├── prd.md                       # Product requirements document
│   ├── spec.md                      # Technical blueprint & Zod schemas
│   ├── checklist.md                 # Verified build slices & revision log
│   └── app-map.html                 # Visual architecture map & code tour
├── src/
│   ├── components/
│   │   ├── Header.tsx               # Minimal navbar & status indicators
│   │   ├── NoteInputArea.tsx        # Textarea with 3-scenario sample selector
│   │   ├── ActionItemsList.tsx      # Prioritized task checklist & Markdown copy
│   │   └── CalendarEventsList.tsx   # Event cards & single/bulk .ics exports
│   ├── utils/
│   │   ├── ics.ts                   # Pure RFC 5545 .ics generator & downloader
│   │   └── samples.ts               # Scenario presets (Sync, Chat, Brain Dump)
│   ├── types.ts                     # Zod schemas & TypeScript definitions
│   ├── App.tsx                      # Root state coordination & failover handler
│   ├── main.tsx                     # React client DOM mount
│   └── index.css                    # Tailwind CSS directives & theme styles
├── tests/
│   ├── ics.test.ts                  # RFC 5545 compliance unit tests
│   └── api-check.ts                 # Integration check for POST /api/process
├── server.ts                        # Native Bun HTTP server (port 3001)
├── vite.config.ts                   # Vite config with proxy & 0.0.0.0 host binding
├── tailwind.config.js               # Dark Linear/Raycast theme palette
├── postcss.config.js                # PostCSS configuration
├── tsconfig.json                    # TypeScript compiler options
├── package.json                     # Bun package definitions & scripts
├── .env.example                     # Environment variable template
├── .gitignore                       # Git ignore rules (secrets & learner profile)
└── LICENSE                          # MIT License (2026 afiqxeon)
```

---

## 📋 Hackathon Planning Artifacts

All course artifacts developed during the Devpost Learn curriculum are preserved under `devpost/`:
- [`devpost/scope.md`](./devpost/scope.md) — Unique kernel definition and PoC boundaries.
- [`devpost/prd.md`](./devpost/prd.md) — Product requirements, user journey, and edge cases.
- [`devpost/spec.md`](./devpost/spec.md) — Technical blueprint, component boundaries, and data models.
- [`devpost/checklist.md`](./devpost/checklist.md) — Incremental build slices, verification notes, and revisions.
- [`devpost/app-map.html`](./devpost/app-map.html) — Interactive architecture map and code route.

---

## 📄 License

This project is open-source and licensed under the [MIT License](./LICENSE) — Copyright (c) 2026 afiqxeon.
