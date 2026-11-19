import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, CheckCheck } from 'lucide-react';
import {
  generateCurlCode,
  generatePythonCode,
  generateJsCode,
} from '../utils/codeGenerators';

export default function ViewCodeModal({
  isOpen,
  onClose,
  model,
  systemPrompt,
  messages,
  parameters,
}) {
  const [activeTab, setActiveTab] = useState('curl');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeData = {
    curl: generateCurlCode({ model, systemPrompt, messages, parameters }),
    python: generatePythonCode({ model, systemPrompt, messages, parameters }),
    javascript: generateJsCode({ model, systemPrompt, messages, parameters }),
  };

  const currentCode = codeData[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl rounded-2xl border border-groq-border bg-groq-panel shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-groq-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-groq-accent/20 border border-groq-accent/40 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-groq-accent" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">View Code</h3>
              <p className="text-xs text-gray-400">Equivalent code for current playground setup</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-groq-panel-secondary transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector and copy button */}
        <div className="px-6 py-2.5 bg-groq-panel-secondary/50 border-b border-groq-border flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-groq-bg border border-groq-border text-xs font-mono">
            <button
              onClick={() => setActiveTab('curl')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'curl'
                  ? 'bg-groq-panel text-white font-semibold border border-groq-border/80'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'python'
                  ? 'bg-groq-panel text-white font-semibold border border-groq-border/80'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setActiveTab('javascript')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'javascript'
                  ? 'bg-groq-panel text-white font-semibold border border-groq-border/80'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              JavaScript
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-groq-bg border border-groq-border hover:border-groq-border-light text-xs font-mono text-gray-300 hover:text-white transition-all shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0f1115]">
          <pre className="text-xs sm:text-sm font-mono text-gray-200 leading-relaxed overflow-x-auto whitespace-pre">
            <code>{currentCode}</code>
          </pre>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-groq-border bg-groq-panel/80 flex items-center justify-between text-xs text-gray-400">
          <span>
            API Key: Replace <code className="text-orange-400 font-mono font-semibold">$GROQ_API_KEY</code> with your real key.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-groq-panel-secondary hover:bg-groq-border text-white text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
