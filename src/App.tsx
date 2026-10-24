import React, { useState } from "react";
import { Header } from "./components/Header";
import { NoteInputArea } from "./components/NoteInputArea";
import { ActionItemsList } from "./components/ActionItemsList";
import { CalendarEventsList } from "./components/CalendarEventsList";
import { ActionTask, CalendarEvent } from "./types";
import { AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

export const App: React.FC = () => {
  const [notes, setNotes] = useState<string>("");
  const [tasks, setTasks] = useState<ActionTask[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState<boolean>(false);
  const [source, setSource] = useState<string | null>(null);

  const handleProcessNotes = async () => {
    const trimmed = notes.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;

    if (words < 5) {
      setValidationError("Please paste some meeting notes or click 'Load Sample' to test (minimum 5 words).");
      return;
    }

    setValidationError(null);
    setServerError(null);
    setIsLoading(true);

    try {
      const anchorTimestamp = new Date().toISOString();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: trimmed,
          anchorTimestamp,
          timezone
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();
      setTasks(data.tasks || []);
      setEvents(data.events || []);
      setSource(data.source || null);
      setHasProcessed(true);
    } catch (err: any) {
      console.error("Processing failed:", err);
      setServerError(err.message || "Failed to process notes. Make sure the local server is running on port 3001.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Intro Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-1.5 pb-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Turn meeting chaos into calendar clarity
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Paste unstructured notes or voice transcripts. Get prioritized action checklists and importable <span className="font-mono text-emerald-400">.ics</span> events with zero OAuth setup.
          </p>
        </div>

        {/* Input Area */}
        <NoteInputArea
          notes={notes}
          setNotes={setNotes}
          onProcess={handleProcessNotes}
          isLoading={isLoading}
          validationError={validationError}
          setValidationError={setValidationError}
        />

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
            <button
              onClick={handleProcessNotes}
              className="text-xs font-medium text-rose-300 underline hover:text-rose-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Results Section */}
        {hasProcessed && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-zinc-200">Processing Complete</span>
                {source && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    engine: {source}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-zinc-500">
                Extracted {tasks.length} {tasks.length === 1 ? "task" : "tasks"} & {events.length} {events.length === 1 ? "event" : "events"}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[380px]">
              <ActionItemsList tasks={tasks} />
              <CalendarEventsList events={events} />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-900 py-4 text-center text-xs text-zinc-500">
        <p>Built for Devpost Learn: Build With AI: Basics — Proof of Concept</p>
      </footer>
    </div>
  );
};
