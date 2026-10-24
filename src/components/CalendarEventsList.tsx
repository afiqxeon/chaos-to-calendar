import React from "react";
import { Calendar, Download, Clock, MapPin, CalendarDays, ExternalLink } from "lucide-react";
import { CalendarEvent } from "../types";
import { downloadIcs } from "../utils/ics";

interface CalendarEventsListProps {
  events: CalendarEvent[];
}

export const CalendarEventsList: React.FC<CalendarEventsListProps> = ({ events }) => {
  const handleDownloadSingle = (event: CalendarEvent) => {
    const safeTitle = event.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    downloadIcs(`${safeTitle}.ics`, [event]);
  };

  const handleExportAll = () => {
    if (events.length === 0) return;
    downloadIcs("chaos-events.ics", events);
  };

  const formatEventDateTime = (event: CalendarEvent) => {
    if (event.isAllDay) {
      // Date only: YYYY-MM-DD
      const date = new Date(event.startIso);
      return {
        dateStr: date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
        timeStr: "All Day"
      };
    }

    const start = new Date(event.startIso);
    const end = new Date(event.endIso);

    const dateStr = start.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric"
    });

    const startTime = start.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit"
    });

    const endTime = end.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit"
    });

    return {
      dateStr,
      timeStr: `${startTime} – ${endTime}`
    };
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-zinc-800/70">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Detected Calendar Events</h3>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
            {events.length}
          </span>
        </div>

        {events.length > 0 && (
          <button
            type="button"
            onClick={handleExportAll}
            className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-cyan-600/15 hover:bg-cyan-600/25 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 transition-all cursor-pointer shadow-sm"
            title="Download all events into a single .ics calendar file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All (.ics)</span>
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-zinc-800/80 rounded-lg bg-zinc-950/40">
          <CalendarDays className="w-8 h-8 text-zinc-600 mb-2" />
          <p className="text-xs text-zinc-400 font-medium">
            No dated events detected in these notes
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Action items are listed on the left.
          </p>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {events.map((event, idx) => {
            const { dateStr, timeStr } = formatEventDateTime(event);
            const isDeadline = event.type === "deadline" || event.title.startsWith("[Deadline]");

            return (
              <div
                key={event.id || idx}
                className={`p-3.5 rounded-lg border transition-all ${
                  isDeadline
                    ? "bg-zinc-950/80 border-rose-900/30 hover:border-rose-700/50"
                    : "bg-zinc-950/80 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-zinc-100">
                        {event.title}
                      </span>
                      {isDeadline && (
                        <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          DEADLINE
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400 font-mono">
                      <span className="flex items-center space-x-1 text-cyan-300/90">
                        <Calendar className="w-3 h-3" />
                        <span>{dateStr}</span>
                      </span>

                      <span className="flex items-center space-x-1 text-zinc-400">
                        <Clock className="w-3 h-3" />
                        <span>{timeStr}</span>
                      </span>

                      <span className="px-1.5 py-0.2 rounded bg-zinc-850 text-zinc-400 text-[10px]">
                        {event.isAllDay ? "All Day" : `${event.durationMinutes}m`}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center space-x-1 text-[11px] text-zinc-400 pt-0.5">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(event)}
                    className="flex-shrink-0 flex items-center space-x-1 text-xs font-mono text-zinc-300 hover:text-emerald-300 bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 hover:border-emerald-500/40 px-2.5 py-1.5 rounded-md transition-all cursor-pointer shadow-sm"
                    title="Download this event as .ics"
                  >
                    <Download className="w-3 h-3 text-emerald-400" />
                    <span>.ics</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

