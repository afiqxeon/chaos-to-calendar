import React, { useState } from "react";
import { CheckSquare, Copy, Check, ListFilter, AlertCircle } from "lucide-react";
import { ActionTask } from "../types";

interface ActionItemsListProps {
  tasks: ActionTask[];
}

export const ActionItemsList: React.FC<ActionItemsListProps> = ({ tasks }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    if (tasks.length === 0) return;
    const markdown = tasks
      .map(t => `- [ ] **[${t.priority.toUpperCase()}]** ${t.title}`)
      .join("\n");

    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const getPriorityBadge = (priority: ActionTask["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "Medium":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "Low":
      default:
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-zinc-800/70">
        <div className="flex items-center space-x-2">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Prioritized Action Items</h3>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
            {tasks.length}
          </span>
        </div>

        {tasks.length > 0 && (
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-zinc-100 border border-zinc-700/60 transition-all cursor-pointer"
            title="Copy tasks as Markdown checklist"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-zinc-800/80 rounded-lg bg-zinc-950/40">
          <ListFilter className="w-8 h-8 text-zinc-600 mb-2" />
          <p className="text-xs text-zinc-400 font-medium">
            No standalone tasks detected
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Dated calendar events are listed on the right.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5 flex-1 overflow-y-auto pr-1">
          {tasks.map((task, idx) => (
            <li
              key={task.id || idx}
              className="group p-3 rounded-lg bg-zinc-950/60 border border-zinc-850 hover:border-zinc-700/80 transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start space-x-2.5">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-zinc-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-zinc-900 cursor-pointer"
                  id={`chk-${task.id}`}
                />
                <label
                  htmlFor={`chk-${task.id}`}
                  className="text-xs text-zinc-200 leading-relaxed font-medium select-none cursor-pointer"
                >
                  {task.title}
                  {task.reasoning && (
                    <span className="block text-[11px] text-zinc-500 font-normal mt-0.5">
                      {task.reasoning}
                    </span>
                  )}
                </label>
              </div>

              <span
                className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${getPriorityBadge(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

