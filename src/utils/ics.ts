import { CalendarEvent } from "../types";

/**
 * Formats a Date object to RFC 5545 UTC timestamp format: YYYYMMDDTHHMMSSZ
 */
export function formatIcsUtc(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Formats a Date object to RFC 5545 Date-only format: YYYYMMDD
 */
export function formatIcsDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  return `${year}${month}${day}`;
}

/**
 * Escapes characters per RFC 5545 specification:
 * Backslashes, commas, semicolons, and newlines must be escaped.
 */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Builds RFC 5545 compliant VCALENDAR content string with strict \r\n line endings.
 */
export function buildIcsContent(events: CalendarEvent[]): string {
  const CRLF = "\r\n";
  const nowUtc = formatIcsUtc(new Date());

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Chaos-to-Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  for (const event of events) {
    const startDate = new Date(event.startIso);
    const endDate = new Date(event.endIso);
    const uid = event.id.includes("@") ? event.id : `${event.id}@chaos-to-calendar.local`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowUtc}`);
    lines.push(`SUMMARY:${escapeIcsText(event.title)}`);

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
    }

    if (event.location) {
      lines.push(`LOCATION:${escapeIcsText(event.location)}`);
    }

    if (event.isAllDay) {
      lines.push(`DTSTART;VALUE=DATE:${formatIcsDate(startDate)}`);
      // For all-day events in RFC 5545, DTEND is exclusive (next day) or matching date
      lines.push(`DTEND;VALUE=DATE:${formatIcsDate(endDate)}`);
    } else {
      lines.push(`DTSTART:${formatIcsUtc(startDate)}`);
      lines.push(`DTEND:${formatIcsUtc(endDate)}`);
    }

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  lines.push(""); // Trailing CRLF

  return lines.join(CRLF);
}

/**
 * Triggers a client-side .ics file download in the browser.
 */
export function downloadIcs(filename: string, events: CalendarEvent[]): void {
  const icsContent = buildIcsContent(events);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".ics") ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

