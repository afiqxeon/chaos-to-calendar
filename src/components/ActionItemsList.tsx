import React, { useState } from "react";
import { CheckSquare, Copy, Check, ListFilter } from "lucide-react";
import { ActionTask } from "../types";

interface ActionItemsListProps {
  tasks: ActionTask[];
  onToggleTask?: (id: string) => void;
}

export const ActionItemsList: React.FC<ActionItemsListProps> = ({ tasks, onToggleTask }) => {
  const [copied, setCopied] = useState(false);

  const completedCount = tasks.filter(t => t.completed).length;

  const handleCopyMarkdown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tasks.length === 0) return;
    const markdown = tasks
      .map(t => `- [${t.completed ? "x" : " "}] **[${t.priority.toUpperCase()}]** ${t.title}`)
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
            {completedCount > 0 ? `${completedCount}/${tasks.length}` : tasks.length}
          </span>
        </div>

        {tasks.length > 0 && (
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-zinc-100 border border-zinc-700/60 transition-all cursor-pointer"
            title="Copy tasks as Markdown checklist (preserves completed state)"
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
          {tasks.map((task, idx) => {
            const isCompleted = !!task.completed;

            return (
              <li
                key={task.id || idx}
                onClick={() => onToggleTask?.(task.id)}
                className={`group p-3 rounded-lg border transition-all flex items-start justify-between gap-3 cursor-pointer select-none ${
                  isCompleted
                    ? "bg-zinc-950/30 border-zinc-900 opacity-60"
                    : "bg-zinc-950/60 border-zinc-850 hover:border-zinc-700/80"
                }`}
              >
                <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                  <div
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                      isCompleted
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "border-zinc-700 bg-zinc-900 group-hover:border-zinc-500"
                    }`}
                  >
                    {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-xs leading-relaxed font-medium block transition-all ${
                        isCompleted ? "line-through text-zinc-500" : "text-zinc-200"
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.reasoning && (
                      <span
                        className={`block text-[11px] font-normal mt-0.5 truncate transition-all ${
                          isCompleted ? "text-zinc-600 line-through" : "text-zinc-500"
                        }`}
                      >
                        {task.reasoning}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border flex-shrink-0 transition-opacity ${
                    isCompleted ? "opacity-40" : ""
                  } ${getPriorityBadge(task.priority)}`}
                >
                  {task.priority}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
