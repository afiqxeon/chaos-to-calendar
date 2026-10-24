---
doc: scope
status: approved
---

# Chaos-to-Calendar

A micro-app that transforms chaotic meeting notes and voice brain dumps into prioritized actionable tasks and one-click downloadable `.ics` calendar events.

## The Unique Kernel
Reliable, context-aware relative date/time parsing that converts natural language deadlines directly into syntactically valid RFC 5545 `.ics` calendar files client-side, enabling zero-friction, zero-OAuth calendar integration.

## Who It's For
Freelancers, software engineers, and busy knowledge workers processing messy meeting fragments, raw slack discussions, or unformatted voice transcripts who currently manually read through notes and retype dates into calendar apps.

## The Core Loop
1. User pastes raw text notes (or clicks "Load Sample" for an instant demo).
2. User clicks "Process Notes".
3. App parses the chaos into a structured two-column dashboard:
   - Prioritized task checklist (High / Medium / Low) with 1-click "Copy as Markdown".
   - Detected calendar event cards (Date, Time, Duration) with instant individual "Download .ics" buttons and an "Export All (.ics)" button.
4. User clicks to import directly into Apple Calendar, Google Calendar, or Outlook without manual typing or API sign-in friction.

## Inspiration & Identity
- Clean, focused, productivity utility vibe (Linear / Raycast aesthetic: sleek dark/light modern typography, crisp badges, minimal distraction).
- High speed, deterministic feeling, immediate feedback.

## Why This Matters to the Learner
- Validates spec-driven alignment and zero-drift LLM structured outputs.
- Demonstrates building a complete, high-utility proof of concept in hours with zero backend lock-in or OAuth complexity.

## What "Working" Looks Like
In under 60 seconds on screen:
1. Click "Load Sample" containing varied relative deadlines ("by tomorrow 2 PM", "Friday evening", "sync call Monday 10 AM").
2. Click "Process Notes" and see prioritized action items with badges alongside extracted event cards.
3. Click "Download .ics", double-click the file, and observe it natively opening in a system calendar with the correct date, time, title, and alert.

## The POC Boundary
- Single-page responsive web interface.
- 1-click sample note loader for rapid judge/user testing.
- AI-driven structured JSON parsing for tasks and events, passing an explicit anchor timestamp (`new Date().toISOString()`) and client timezone into prompt for accurate relative date resolution.
- Pure client-side RFC 5545 `.ics` file generator (single and bundled events).
- Copy-to-clipboard for prioritized action tasks in Markdown format.

## Later
- Direct calendar sync integrations (Google Calendar / Microsoft 365 OAuth).
- Recurring event pattern detection ("every Tuesday").
- Direct audio voice-memo transcription in-browser (Whisper integration).

## Explicitly Cut
- **OAuth Login / Direct Calendar API Integrations:** Bypassed in favor of universal, privacy-friendly `.ics` downloads to avoid complex token flows, developer consoles, and third-party credential dependencies during the hackathon.
- **User Accounts & Database Persistence:** Not needed to prove the core note-to-calendar transformation loop.

