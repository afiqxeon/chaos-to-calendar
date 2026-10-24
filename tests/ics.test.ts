import { describe, it, expect } from "bun:test";
import { buildIcsContent, escapeIcsText, formatIcsUtc, formatIcsDate } from "../src/utils/ics";
import { CalendarEvent } from "../src/types";

describe("RFC 5545 Calendar Generation Verification", () => {
  it("escapes special characters correctly according to RFC 5545", () => {
    const raw = "Meeting, with client; notes:\nNext line with \\ backslash";
    const escaped = escapeIcsText(raw);
    expect(escaped).toBe("Meeting\\, with client\\; notes:\\nNext line with \\\\ backslash");
  });

  it("formats UTC and Date-only timestamps correctly", () => {
    const sampleDate = new Date("2026-10-25T14:30:00.000Z");
    expect(formatIcsUtc(sampleDate)).toBe("20261025T143000Z");
    expect(formatIcsDate(sampleDate)).toBe("20261025");
  });

  it("generates a strictly compliant single timed event with CRLF line endings", () => {
    const event: CalendarEvent = {
      id: "evt-123",
      title: "Team Sync & Planning",
      startIso: "2026-10-26T10:00:00.000Z",
      endIso: "2026-10-26T10:30:00.000Z",
      isAllDay: false,
      durationMinutes: 30,
      description: "Discuss quarterly deliverables; review PRs.",
      location: "Zoom Room 4B",
      type: "meeting"
    };

    const ics = buildIcsContent([event]);

    // RFC 5545 requirement: line endings must be \r\n
    expect(ics.includes("\r\n")).toBe(true);
    expect(ics).toContain("BEGIN:VCALENDAR\r\n");
    expect(ics).toContain("VERSION:2.0\r\n");
    expect(ics).toContain("PRODID:-//Chaos-to-Calendar//EN\r\n");
    expect(ics).toContain("CALSCALE:GREGORIAN\r\n");
    expect(ics).toContain("BEGIN:VEVENT\r\n");
    expect(ics).toContain("UID:evt-123@chaos-to-calendar.local\r\n");
    expect(ics).toContain("SUMMARY:Team Sync & Planning\r\n");
    expect(ics).toContain("DESCRIPTION:Discuss quarterly deliverables\\; review PRs.\r\n");
    expect(ics).toContain("LOCATION:Zoom Room 4B\r\n");
    expect(ics).toContain("DTSTART:20261026T100000Z\r\n");
    expect(ics).toContain("DTEND:20261026T103000Z\r\n");
    expect(ics).toContain("END:VEVENT\r\n");
    expect(ics).toContain("END:VCALENDAR\r\n");

    // Must not have bare \n without \r
    const withoutCrlf = ics.replace(/\r\n/g, "");
    expect(withoutCrlf.includes("\n")).toBe(false);
  });

  it("generates valid All-Day events with VALUE=DATE parameters", () => {
    const allDayEvent: CalendarEvent = {
      id: "deadline-456",
      title: "[Deadline] Submit Proposal",
      startIso: "2026-10-30T00:00:00.000Z",
      endIso: "2026-10-31T00:00:00.000Z",
      isAllDay: true,
      durationMinutes: 1440,
      type: "deadline"
    };

    const ics = buildIcsContent([allDayEvent]);

    expect(ics).toContain("DTSTART;VALUE=DATE:20261030\r\n");
    expect(ics).toContain("DTEND;VALUE=DATE:20261031\r\n");
    expect(ics).toContain("SUMMARY:[Deadline] Submit Proposal\r\n");
    expect(ics).toContain("END:VEVENT\r\n");
  });

  it("bundles multiple events in a single VCALENDAR document", () => {
    const events: CalendarEvent[] = [
      {
        id: "evt-1",
        title: "Call Alice",
        startIso: "2026-10-27T09:00:00.000Z",
        endIso: "2026-10-27T09:30:00.000Z",
        isAllDay: false,
        durationMinutes: 30,
        type: "meeting"
      },
      {
        id: "evt-2",
        title: "[Deadline] Fix Bug",
        startIso: "2026-10-27T16:30:00.000Z",
        endIso: "2026-10-27T17:00:00.000Z",
        isAllDay: false,
        durationMinutes: 30,
        type: "deadline"
      }
    ];

    const ics = buildIcsContent(events);

    const beginVcalendarCount = (ics.match(/BEGIN:VCALENDAR/g) || []).length;
    const endVcalendarCount = (ics.match(/END:VCALENDAR/g) || []).length;
    const veventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;

    expect(beginVcalendarCount).toBe(1);
    expect(endVcalendarCount).toBe(1);
    expect(veventCount).toBe(2);
    expect(ics).toContain("SUMMARY:Call Alice");
    expect(ics).toContain("SUMMARY:[Deadline] Fix Bug");
  });
});
