import React, { useRef, useEffect } from 'react';
import SystemPromptCard from './SystemPromptCard';
import MessageCard from './MessageCard';
import {
  Plus,
  RotateCcw,
  Square,
  ArrowUp,
  Loader2,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';

export default function ChatArea({
  systemPrompt,
  setSystemPrompt,
  messages,
  setMessages,
  onUpdateMessage,
  onDeleteMessage,
  onAddTurn,
  onClearChat,
  onSubmit,
  onStop,
  isGenerating,
  streamingMessageId,
}) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when new streaming tokens arrive or turns are added
  useEffect(() => {
    if (isGenerating) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating]);

  // Handle Cmd+Enter or Ctrl+Enter in text inputs
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isGenerating) {
        onSubmit();
      }
    }
  };

  // Check if the last turn has any non-whitespace content or is ready
  const lastUserTurn = [...messages].reverse().find(m => m.role === 'user');
  const hasUserContent = messages.some(m => m.role === 'user' && m.content.trim().length > 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-groq-bg">
      {/* Scrollable messages container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* SYSTEM prompt card */}
          <SystemPromptCard
            systemPrompt={systemPrompt}
            setSystemPrompt={setSystemPrompt}
          />

          {/* Stacked Conversation Cards */}
          {messages.map((message, index) => {
            const isStreaming = isGenerating && message.id === streamingMessageId;
            const isLast = index === messages.length - 1;

            return (
              <MessageCard
                key={message.id || index}
                message={message}
                index={index}
                isStreaming={isStreaming}
                isLast={isLast}
                onUpdateMessage={onUpdateMessage}
                onDeleteMessage={onDeleteMessage}
                onKeyDown={handleKeyDown}
              />
            );
          })}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="border-t border-groq-border bg-groq-panel/90 backdrop-blur-md px-4 sm:px-8 py-3 select-none">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Bottom-left: "+" button and "Clear" button */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button
                type="button"
                onClick={() => onAddTurn('user')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-groq-panel border border-groq-border hover:border-groq-border-light text-xs font-medium text-gray-300 hover:text-white transition-all shadow-sm"
                title="Add another turn"
              >
                <Plus className="w-4 h-4 text-groq-accent" />
                <span className="hidden sm:inline">Add Turn</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClearChat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-groq-panel border border-groq-border hover:border-groq-border-light hover:text-red-400 text-xs font-medium text-gray-400 transition-all shadow-sm"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          {/* Bottom-right: Stop & Submit ⌘+↵ buttons */}
          <div className="flex items-center gap-2.5">
            {isGenerating && (
              <button
                type="button"
                onClick={onStop}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-950/40 border border-red-500/50 hover:bg-red-900/40 text-red-300 text-xs sm:text-sm font-semibold transition-all shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            )}

            <button
              type="button"
              disabled={isGenerating || !hasUserContent}
              onClick={onSubmit}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white transition-all duration-200 select-none ${
                isGenerating
                  ? 'bg-groq-panel-secondary border border-groq-border text-gray-400 cursor-not-allowed'
                  : !hasUserContent
                  ? 'bg-groq-accent/40 border border-groq-accent/20 text-white/50 cursor-not-allowed'
                  : 'bg-groq-accent hover:bg-groq-accent-hover active:scale-[0.98] shadow-glow-accent cursor-pointer'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-groq-accent" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>Submit</span>
                  <kbd className="hidden sm:inline-block text-[10px] font-mono uppercase bg-black/30 border border-white/20 rounded px-1.5 py-0.5 text-white/90">
                    ⌘+↵
                  </kbd>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
