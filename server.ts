import { ActionTask, CalendarEvent, ExtractionResponseSchema } from "./src/types";

const PORT = 3001;

/**
 * Smart natural language date & task extraction fallback
 * Resolves relative dates anchored to a specific reference date
 */
function extractWithRuleEngine(
  notes: string,
  anchorDate: Date,
  timezone: string
): { tasks: ActionTask[]; events: CalendarEvent[] } {
  const lines = notes.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const tasks: ActionTask[] = [];
  const events: CalendarEvent[] = [];

  // Helper to get next day of week (0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday)
  const getNextDayOfWeek = (targetDay: number, baseDate: Date): Date => {
    const result = new Date(baseDate.getTime());
    const currentDay = result.getDay();
    let distance = targetDay - currentDay;
    if (distance <= 0) distance += 7;
    result.setDate(result.getDate() + distance);
    return result;
  };

  let idCounter = 1;

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Determine priority
    let priority: "High" | "Medium" | "Low" = "Medium";
    if (lower.includes("urgent") || lower.includes("asap") || lower.includes("bug") || lower.includes("auth") || lower.includes("critical") || lower.includes("tomorrow")) {
      priority = "High";
    } else if (lower.includes("sync") || lower.includes("discuss") || lower.includes("proposal") || lower.includes("review")) {
      priority = "Medium";
    } else {
      priority = "Low";
    }

    // Add as action task
    const cleanTitle = line.replace(/^[-*•\d\.]+\s*/, "").trim();
    if (cleanTitle) {
      tasks.push({
        id: `task-${idCounter++}`,
        title: cleanTitle,
        priority,
        reasoning: priority === "High" ? "Urgent timeline or critical item" : "Actionable task from notes"
      });
    }

    // Detect Calendar Events
    // 1. Tomorrow detection
    if (lower.includes("tomorrow")) {
      const tomorrow = new Date(anchorDate.getTime());
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Check for time: e.g. "2 pm", "14:00"
      let hours = 14; // Default to 2 PM if mentioned or afternoon
      const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
      if (timeMatch) {
        let h = parseInt(timeMatch[1], 10);
        const isPm = timeMatch[3] === "pm" || lower.includes("pm");
        if (isPm && h < 12) h += 12;
        if (!isPm && timeMatch[3] === "am" && h === 12) h = 0;
        hours = h;
      }

      tomorrow.setHours(hours, 0, 0, 0);
      const end = new Date(tomorrow.getTime() + 30 * 60 * 1000);

      events.push({
        id: `evt-${idCounter++}`,
        title: cleanTitle.length > 40 ? `${cleanTitle.slice(0, 37)}...` : cleanTitle,
        startIso: tomorrow.toISOString(),
        endIso: end.toISOString(),
        isAllDay: false,
        durationMinutes: 30,
        type: lower.includes("bug") || lower.includes("due") ? "deadline" : "meeting",
        description: `Extracted from notes: ${line}`
      });
    }
    // 2. Day of week detection (e.g. Friday, Monday)
    else if (lower.includes("friday")) {
      const friday = getNextDayOfWeek(5, anchorDate);
      const isDeadline = lower.includes("due") || lower.includes("by friday") || lower.includes("proposal");

      if (isDeadline) {
        // 30 min block ending at 5 PM (16:30 - 17:00) per PRD
        friday.setHours(16, 30, 0, 0);
        const endFriday = new Date(friday.getTime() + 30 * 60 * 1000);
        events.push({
          id: `evt-${idCounter++}`,
          title: `[Deadline] ${cleanTitle.replace(/due|by\s+friday/gi, "").trim() || "Client Proposal"}`,
          startIso: friday.toISOString(),
          endIso: endFriday.toISOString(),
          isAllDay: false,
          durationMinutes: 30,
          type: "deadline",
          description: `Deadline from notes: ${line}`
        });
      } else {
        // All-day event
        const dateStr = friday.toISOString().split("T")[0];
        events.push({
          id: `evt-${idCounter++}`,
          title: cleanTitle,
          startIso: dateStr,
          endIso: dateStr,
          isAllDay: true,
          durationMinutes: 1440,
          type: "event",
          description: line
        });
      }
    }
    else if (lower.includes("monday")) {
      const monday = getNextDayOfWeek(1, anchorDate);
      let hours = 10; // Default 10 AM for Monday sync per PRD
      monday.setHours(hours, 0, 0, 0);
      const endMonday = new Date(monday.getTime() + 30 * 60 * 1000);

      events.push({
        id: `evt-${idCounter++}`,
        title: cleanTitle.includes("sync") ? cleanTitle : `Sync: ${cleanTitle}`,
        startIso: monday.toISOString(),
        endIso: endMonday.toISOString(),
        isAllDay: false,
        durationMinutes: 30,
        type: "meeting",
        description: `Meeting sync: ${line}`
      });
    }
  }

  return { tasks, events };
}

/**
 * Main Bun Server
 */
const server = Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);

    // Standard CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (url.pathname === "/api/health") {
      return Response.json({ status: "ok", port: PORT }, { headers: corsHeaders });
    }

    // Main notes processing endpoint
    if (url.pathname === "/api/process" && req.method === "POST") {
      try {
        const body = await req.json() as {
          notes?: string;
          anchorTimestamp?: string;
          timezone?: string;
          apiKey?: string;
        };

        const notes = body.notes?.trim() || "";
        const anchorTimestamp = body.anchorTimestamp || new Date().toISOString();
        const timezone = body.timezone || "UTC";
        const anchorDate = new Date(anchorTimestamp);

        // Validation per PRD: minimum 5 words
        const words = notes.split(/\s+/).filter(Boolean);
        if (words.length < 5) {
          return Response.json(
            { error: "Please paste some meeting notes or click 'Load Sample' to test." },
            { status: 400, headers: corsHeaders }
          );
        }

        const apiKey = body.apiKey || process.env.ANTHROPIC_AUTH_TOKEN || "";
        const baseUrl = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";

        let extractionResult: { tasks: ActionTask[]; events: CalendarEvent[] } | null = null;
        let source: "llm" | "parser" = "parser";

        // Attempt LLM Extraction if API key is provided
        if (apiKey && !apiKey.includes("inactive")) {
          try {
            const systemPrompt = `You are Chaos-to-Calendar, an expert task extractor and calendar normalizer.
You extract action items with priorities and normalize dates/times relative to the given reference anchor timestamp.

CRITICAL CONTEXT:
- Anchor Timestamp (NOW): ${anchorTimestamp}
- User Timezone: ${timezone}

RULES:
1. Extract all actionable tasks. Assign priority: "High" (urgent, bugs, near-term deadlines), "Medium" (standard tasks, reviews, syncs), "Low" (backlog, nice-to-haves).
2. Extract calendar events:
   - For meetings without end time (e.g. "Monday 10 AM"): set duration to 30 minutes.
   - For deadlines (e.g. "due Friday 5 PM"): set 30-minute block ending at the deadline, with title prefixed with "[Deadline]".
   - For date-only items (no time specified): set isAllDay: true and startIso/endIso to "YYYY-MM-DD".
   - For timed events: output full ISO 8601 strings in UTC (e.g. "2026-10-26T10:00:00.000Z").
3. OUTPUT FORMAT: Respond ONLY with a valid JSON object matching this schema with NO markdown codeblocks or extra text:
{
  "tasks": [
    { "id": "t1", "title": "string", "priority": "High" | "Medium" | "Low", "reasoning": "string" }
  ],
  "events": [
    {
      "id": "e1",
      "title": "string",
      "startIso": "ISO 8601 string or YYYY-MM-DD",
      "endIso": "ISO 8601 string or YYYY-MM-DD",
      "isAllDay": boolean,
      "durationMinutes": number,
      "type": "meeting" | "deadline" | "event",
      "description": "optional notes",
      "location": "optional location or link"
    }
  ]
}`;

            const response = await fetch(`${baseUrl}/v1/messages`, {
              method: "POST",
              signal: AbortSignal.timeout(3000),
              headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "Authorization": `Bearer ${apiKey}`,
                "anthropic-version": "2023-06-01"
              },
              body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 1500,
                system: systemPrompt,
                messages: [{ role: "user", content: notes }]
              })
            });

            if (response.ok) {
              const data = await response.json();
              const text = data.content?.[0]?.text || "";
              const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
              const parsed = JSON.parse(cleanJson);
              const validated = ExtractionResponseSchema.safeParse(parsed);
              if (validated.success) {
                extractionResult = validated.data;
                source = "llm";
              }
            }
          } catch (err) {
            console.warn("LLM extraction failed or timed out, falling back to deterministic parser:", err);
          }
        }

        // If LLM was not used or failed validation, use the deterministic rule engine
        if (!extractionResult) {
          extractionResult = extractWithRuleEngine(notes, anchorDate, timezone);
          source = "parser";
        }

        // Validate final result schema
        const finalValidation = ExtractionResponseSchema.safeParse(extractionResult);
        if (!finalValidation.success) {
          return Response.json(
            { error: "Validation error parsing structured data.", details: finalValidation.error.format() },
            { status: 502, headers: corsHeaders }
          );
        }

        return Response.json({
          tasks: finalValidation.data.tasks,
          events: finalValidation.data.events,
          source,
          anchorTimestamp
        }, { headers: corsHeaders });

      } catch (err) {
        return Response.json(
          { error: "Server error processing notes.", details: String(err) },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
});

console.log(`Chaos-to-Calendar API server listening on http://localhost:${PORT}`);

