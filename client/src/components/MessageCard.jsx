import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  User,
  Zap,
  Copy,
  Check,
  Trash2,
  Edit2,
  Clock,
  Gauge,
  Cpu,
  Sparkles,
  ChevronDown,
  Brain,
} from 'lucide-react';

function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-groq-border bg-[#111317]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#171a20] border-b border-groq-border/80 text-xs text-gray-400 font-mono">
        <span className="uppercase tracking-wider text-[11px] text-gray-300 font-semibold">
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-white px-2 py-0.5 rounded hover:bg-groq-panel transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
        <pre>
          <code className={language ? `language-${language}` : ''}>{value}</code>
        </pre>
      </div>
    </div>
  );
}

export default function MessageCard({
  message,
  index,
  isStreaming,
  isLast,
  onUpdateMessage,
  onDeleteMessage,
  onKeyDown,
}) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReasoning, setShowReasoning] = useState(true);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    onUpdateMessage(index, editContent);
    setIsEditing(false);
  };

  return (
    <div className="rounded-xl border border-groq-border bg-groq-panel shadow-sm overflow-hidden transition-all duration-150">
      {/* Header bar of message card */}
      <div className="px-4 py-2 bg-groq-panel/90 border-b border-groq-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isUser ? (
            <div className="w-5 h-5 rounded bg-gray-700/80 border border-gray-600/50 flex items-center justify-center">
              <User className="w-3 h-3 text-gray-300" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded bg-groq-accent/20 border border-groq-accent/40 flex items-center justify-center shadow-glow-subtle">
              <Zap className="w-3 h-3 text-groq-accent fill-groq-accent" />
            </div>
          )}
          <span className="text-xs font-bold uppercase tracking-wider font-mono text-gray-300">
            {isUser ? 'User' : 'Assistant'}
          </span>
          {isStreaming && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-groq-accent bg-groq-accent-subtle px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-groq-accent animate-ping" />
              Streaming...
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {isUser && !isStreaming && !isEditing && (
            <button
              onClick={() => {
                setEditContent(message.content);
                setIsEditing(true);
              }}
              className="text-gray-400 hover:text-gray-200 p-1 rounded hover:bg-groq-panel-secondary transition-colors"
              title="Edit message"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {!isStreaming && message.content && (
            <button
              onClick={handleCopyMessage}
              className="text-gray-400 hover:text-gray-200 p-1 rounded hover:bg-groq-panel-secondary transition-colors"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {!isStreaming && (
            <button
              onClick={() => onDeleteMessage(index)}
              className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-groq-panel-secondary transition-colors"
              title="Delete message"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Body content */}
      <div className="p-4">
        {isUser ? (
          isEditing || (isLast && !message.content) ? (
            <div className="space-y-2">
              <textarea
                value={isEditing ? editContent : message.content}
                onChange={(e) => {
                  if (isEditing) {
                    setEditContent(e.target.value);
                  } else {
                    onUpdateMessage(index, e.target.value);
                  }
                }}
                onKeyDown={onKeyDown}
                placeholder="Enter user message... (Press ⌘+Enter to submit)"
                rows={Math.max(3, (message.content.match(/\n/g) || []).length + 2)}
                className="w-full bg-transparent text-sm sm:text-base text-gray-100 placeholder-gray-500 resize-y focus:outline-none focus:ring-0 leading-relaxed font-sans"
                autoFocus={isLast}
              />
              {isEditing && (
                <div className="flex justify-end gap-2 pt-1 border-t border-groq-border/40">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2.5 py-1 text-xs rounded bg-groq-panel-secondary text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-2.5 py-1 text-xs rounded bg-groq-accent text-white font-medium hover:bg-groq-accent-hover"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className="text-sm sm:text-base text-gray-100 whitespace-pre-wrap leading-relaxed cursor-pointer"
              onClick={() => {
                setEditContent(message.content);
                setIsEditing(true);
              }}
              title="Click to edit"
            >
              {message.content}
            </div>
          )
        ) : (
          /* Assistant rendered output */
          <div className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-none">
            {/* Thinking / Reasoning Process accordion for reasoning models */}
            {message.reasoning && (
              <div className="mb-3 rounded-lg border border-groq-border/80 bg-[#14161b] overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="w-full px-3 py-2 bg-[#181a20] flex items-center justify-between text-gray-400 hover:text-gray-200 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-semibold text-gray-300">Thought Process</span>
                    {isStreaming && !message.content && (
                      <span className="text-[10px] text-purple-400 bg-purple-950/50 px-1.5 py-0.2 rounded border border-purple-500/30 animate-pulse font-sans">
                        Reasoning...
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                      showReasoning ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>
                {showReasoning && (
                  <div className="p-3 text-gray-400 whitespace-pre-wrap leading-relaxed border-t border-groq-border/40 font-mono text-[11px] max-h-60 overflow-y-auto bg-[#101216]">
                    {message.reasoning}
                  </div>
                )}
              </div>
            )}

            {message.content ? (
              <>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      if (!inline && match) {
                        return <CodeBlock language={match[1]} value={codeString} />;
                      }
                      if (!inline && codeString.includes('\n')) {
                        return <CodeBlock language="" value={codeString} />;
                      }
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded bg-[#131519] border border-groq-border text-xs font-mono text-orange-300"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    p({ children }) {
                      return <p className="mb-3 last:mb-0">{children}</p>;
                    },
                    ul({ children }) {
                      return <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>;
                    },
                    h1({ children }) {
                      return <h1 className="text-xl font-bold mb-2 mt-4 text-white">{children}</h1>;
                    },
                    h2({ children }) {
                      return <h2 className="text-lg font-bold mb-2 mt-3 text-white">{children}</h2>;
                    },
                    h3({ children }) {
                      return <h3 className="text-base font-semibold mb-2 mt-2 text-white">{children}</h3>;
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-3 rounded-lg border border-groq-border">
                          <table className="w-full text-xs text-left text-gray-300 border-collapse">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="border-b border-groq-border bg-groq-panel-secondary px-3 py-2 font-semibold text-white">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="border-b border-groq-border/40 px-3 py-2">
                          {children}
                        </td>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-groq-accent cursor-blink align-middle" />
                )}
              </>
            ) : isStreaming ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-1">
                <span className="w-2 h-4 bg-groq-accent cursor-blink" />
                <span className="italic">Thinking on Groq LPU...</span>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No response generated.</div>
            )}
          </div>
        )}
      </div>

      {/* Assistant metadata footer: Token usage, response time & Speed */}
      {isAssistant && (message.metrics || isStreaming) && (
        <div className="px-4 py-2 bg-groq-panel/60 border-t border-groq-border/40 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-gray-400">
          {message.metrics?.completionTokens !== undefined && (
            <div className="flex items-center gap-1.5" title="Total completion tokens">
              <Cpu className="w-3.5 h-3.5 text-gray-400" />
              <span>{message.metrics.completionTokens} tokens</span>
            </div>
          )}

          {message.metrics?.durationSeconds !== undefined && (
            <div className="flex items-center gap-1.5" title="Response latency">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{message.metrics.durationSeconds.toFixed(2)}s</span>
            </div>
          )}

          {message.metrics?.tokensPerSecond !== undefined && (
            <div
              className="flex items-center gap-1.5 text-groq-accent font-semibold"
              title="Inference speed"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{message.metrics.tokensPerSecond.toFixed(1)} T/s</span>
            </div>
          )}

          {isStreaming && !message.metrics && (
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles className="w-3 h-3 text-groq-accent animate-spin" />
              <span>Generating tokens...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
