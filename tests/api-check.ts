import { ExtractionResponseSchema } from "../src/types";

async function runCheck() {
  const sampleNotes = `
Need to fix the auth bug by tomorrow 2 PM.
Send client proposal by Friday evening.
Schedule sync call on Monday 10 AM.
Review PR backlog and update Jira tickets.
  `.trim();

  const anchorTimestamp = new Date("2026-10-24T12:00:00.000Z").toISOString();

  console.log("Sending POST /api/process to http://localhost:3001/api/process...");

  const response = await fetch("http://localhost:3001/api/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      notes: sampleNotes,
      anchorTimestamp,
      timezone: "UTC"
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Check Failed! HTTP ${response.status}:`, errorText);
    process.exit(1);
  }

  const data = await response.json();
  console.log("Response received:", JSON.stringify(data, null, 2));

  // Validate using Zod schema
  const parsed = ExtractionResponseSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Zod Schema Validation Failed:", parsed.error.format());
    process.exit(1);
  }

  if (parsed.data.tasks.length === 0) {
    console.error("Assertion Failed: Expected at least 1 task.");
    process.exit(1);
  }

  if (parsed.data.events.length === 0) {
    console.error("Assertion Failed: Expected at least 1 event.");
    process.exit(1);
  }

  console.log(`\nSUCCESS! API Check Passed:`);
  console.log(`- Tasks extracted: ${parsed.data.tasks.length}`);
  console.log(`- Events detected: ${parsed.data.events.length}`);
  console.log(`- Extraction source: ${data.source}`);
  process.exit(0);
}

runCheck().catch(err => {
  console.error("Error running api-check:", err);
  process.exit(1);
});
