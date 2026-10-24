import React, { useState } from "react";
import { Sparkles, FileText, ArrowRight, RotateCcw, AlertCircle } from "lucide-react";
import { SAMPLE_NOTES } from "../utils/samples";

interface NoteInputAreaProps {
  notes: string;
  setNotes: (notes: string) => void;
  onProcess: () => void;
  isLoading: boolean;
  validationError: string | null;
  setValidationError: (err: string | null) => void;
}

export const NoteInputArea: React.FC<NoteInputAreaProps> = ({
  notes,
  setNotes,
  onProcess,
  isLoading,
  validationError,
  setValidationError
}) => {
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  const handleLoadSample = () => {
    setNotes(SAMPLE_NOTES);
    setValidationError(null);
  };

  const handleClear = () => {
    setNotes("");
    setValidationError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    if (validationError) setValidationError(null);
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-zinc-200">Input Notes or Brain Dump</h2>
          <span className="text-xs font-mono text-zinc-500">
            ({wordCount} {wordCount === 1 ? "word" : "words"})
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {notes && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded-md hover:bg-zinc-800/60 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleLoadSample}
            disabled={isLoading}
            className="flex items-center space-x-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={notes}
          onChange={handleChange}
          disabled={isLoading}
          rows={6}
          placeholder="Paste messy meeting fragments, voice notes, or chat threads with deadlines (e.g. 'Fix auth bug by tomorrow 2 PM, proposal due Friday 5 PM, sync call Monday 10 AM')..."
          className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-lg p-3.5 text-sm text-zinc-100 placeholder-zinc-500 font-sans resize-y focus:outline-none transition-all leading-relaxed"
        />
      </div>

      {validationError && (
        <div className="mt-3 flex items-center space-x-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800/60">
        <p className="text-xs text-zinc-400">
          Relative deadlines (<span className="text-zinc-300 font-mono">tomorrow</span>, <span className="text-zinc-300 font-mono">Friday</span>) are anchored to your local system time.
        </p>

        <button
          type="button"
          onClick={onProcess}
          disabled={isLoading}
          className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg ${
            isLoading
              ? "bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-700"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 hover:shadow-emerald-500/30 cursor-pointer active:scale-[0.99]"
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing & extracting...</span>
            </>
          ) : (
            <>
              <span>Process Notes</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
