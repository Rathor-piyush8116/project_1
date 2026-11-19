import React, { useState } from 'react';
import { Cpu, ChevronDown, ChevronRight, X } from 'lucide-react';

export default function SystemPromptCard({ systemPrompt, setSystemPrompt }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-groq-border bg-groq-panel shadow-sm overflow-hidden transition-all duration-200">
      {/* Header bar */}
      <div
        className="px-4 py-2.5 bg-groq-panel/80 border-b border-groq-border/60 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle system message"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-groq-accent" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-gray-300">
              System
            </span>
          </div>
          {!isExpanded && systemPrompt && (
            <span className="text-xs text-gray-500 truncate max-w-md ml-2 font-mono">
              "{systemPrompt}"
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {systemPrompt && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSystemPrompt('');
              }}
              className="text-[11px] text-gray-500 hover:text-gray-300 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-groq-panel-secondary transition-colors"
              title="Clear system prompt"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-groq-bg border border-groq-border text-gray-400">
            Optional
          </span>
        </div>
      </div>

      {/* Textarea body */}
      {isExpanded && (
        <div className="p-3">
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Enter system message (Optional)... e.g. 'You are a helpful coding assistant who writes clean, idiomatic code.'"
            rows={2}
            className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-500 resize-y focus:outline-none focus:ring-0 leading-relaxed font-sans"
          />
        </div>
      )}
    </div>
  );
}
